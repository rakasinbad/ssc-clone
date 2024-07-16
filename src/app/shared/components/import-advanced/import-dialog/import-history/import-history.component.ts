import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, MatSelectChange, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams, IQueryParamsHistoryList } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IConfigImportAdvanced, IConfigMode, IConfigTemplate, ImportLog } from '../../models';
import { ImportAdvancedActions, ImportHistroyActions } from '../../store/actions';
import { fromImportAdvanced } from '../../store/reducers';
import { ImportAdvancedSelectors } from '../../store/selectors';
import { FF_MUTE } from '@angular/cdk/keycodes';
import { flatMap } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';

@Component({
    selector: 'app-import-history',
    templateUrl: './import-history.component.html',
    styleUrls: ['./import-history.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = 25;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'user',
        'created',
        'file-name',
        'action',
        'processed',
        'status',
        'progress',
    ];

    dataSource$: Observable<Array<ImportLog>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    config$: Observable<IConfigImportAdvanced>;
    modes$: Observable<Array<IConfigMode>>;
    isLoadingConfig$: Observable<boolean>;

    @Input() pageType: string;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    searchValue: string;
    importMode: string;
    isShowImportMode: boolean;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store<fromImportAdvanced.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    convertStatus(type: string, status: string): string {
        if (!type) {
            return;
        }

        if (type === 'progress') {
            switch (status) {
                case 'done':
                    return 'Success';

                case 'error':
                    return 'Error';

                case 'on_process':
                    return 'On Process';

                case 'pending':
                    return 'Pending';

                case 'validating':
                    return 'Validating';

                default:
                    return;
            }
        }
    }

    onDownload(url: string): void {
        if (!url) {
            return;
        }

        window.open(url, '_blank');
    }

    onRefresh(): void {
        this._onRefreshTable();
    }

    onSearch(searchValue: string): void {
        this.searchValue = searchValue;
        this._initTable(this.searchValue, this.importMode);
    }

    onChangeMode(event: MatSelectChange): void {
        this.importMode = event.value;
        this._initTable(this.searchValue, this.importMode);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                if (this.sort) {
                    this.sort.sortChange
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe(() => (this.paginator.pageIndex = 0));
                }

                if (this.sort && this.paginator) {
                    merge(this.sort.sortChange, this.paginator.page)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe(() => {
                            this._initTable(this.searchValue, this.importMode);
                        });
                }
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset importLogs state
                this.store.dispatch(ImportHistroyActions.resetImportHistory());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true,
                });

                this.dataSource$ = this.store.select(ImportAdvancedSelectors.selectAllImportLogs);
                this.totalDataSource$ = this.store.select(
                    ImportAdvancedSelectors.getTotalImportLogs
                );

                this.isLoading$ = this.store.select(ImportAdvancedSelectors.getIsLoading);

                this._importModeCheck(this.pageType);

                this._initTable(this.searchValue, this.importMode);

                this.store.dispatch(ImportAdvancedActions.resetImportConfig());

                this.store.dispatch(
                    ImportAdvancedActions.importConfigRequest({
                        payload: this.pageType.toLowerCase(),
                    })
                );

                this.modes$ = this.store.select(ImportAdvancedSelectors.getMode);
                this.isLoadingConfig$ = this.store.select(ImportAdvancedSelectors.getIsLoading);
                break;
        }
    }

    private _initTable(keyword?: string, importMode?: string): void {
        if (this.paginator) {
            const data: IQueryParamsHistoryList = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort && this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            if (keyword) {
                data['search'] = [
                    {
                        fieldName: 'action',
                        keyword: keyword,
                    },
                    {
                        fieldName: 'fileName',
                        keyword: keyword,
                    },
                ];
            }

            if (importMode) {
                data.action = importMode == 'all' ? null : importMode;
            }

            if (this.pageType && typeof this.pageType === 'string') {
                this.store.dispatch(
                    ImportHistroyActions.importHistoryRequest({
                        payload: { params: data, page: this.pageType },
                    })
                );
            }
        }
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;

        this._initTable(this.searchValue, this.importMode);
    }

    private _importModeCheck(pageType?: string) {
        switch (pageType) {
            case 'orders':
                this.isShowImportMode = true;
                break;
            default:
                this.isShowImportMode = false;
                break;
        }
    }
}
