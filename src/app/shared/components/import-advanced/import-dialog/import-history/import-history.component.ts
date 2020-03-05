import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ImportLog } from '../../models';
import { ImportHistroyActions } from '../../store/actions';
import { fromImportAdvanced } from '../../store/reducers';
import { ImportAdvancedSelectors } from '../../store/selectors';

@Component({
    selector: 'app-import-history',
    templateUrl: './import-history.component.html',
    styleUrls: ['./import-history.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
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
        'progress'
    ];

    dataSource$: Observable<Array<ImportLog>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @Input() pageType: string;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(private store: Store<fromImportAdvanced.FeatureState>) {}

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
        this._initTable(searchValue);
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
                            this._initTable();
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
                    disableClear: true
                });

                this.dataSource$ = this.store.select(ImportAdvancedSelectors.selectAllImportLogs);
                this.totalDataSource$ = this.store.select(
                    ImportAdvancedSelectors.getTotalImportLogs
                );

                this.isLoading$ = this.store.select(ImportAdvancedSelectors.getIsLoading);

                this._initTable();
                break;
        }
    }

    private _initTable(keyword?: string): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            if (this.sort && this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            if (keyword) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: keyword
                    }
                ];
            }

            if (this.pageType && typeof this.pageType === 'string') {
                this.store.dispatch(
                    ImportHistroyActions.importHistoryRequest({
                        payload: { params: data, page: this.pageType }
                    })
                );
            }
        }
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
