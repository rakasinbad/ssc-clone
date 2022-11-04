import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExportHistory } from '../../models';
import { ExportHistoryActions } from '../../store/actions';
import { ExportHistorySelector } from '../../store/selectors';
import { fromExportHistory } from '../../store/reducers';
import { ExportConfigurationPage } from '../../models/export-filter.model';
import { IExportHistoryPage, IExportHistoryRequest, TExportHistoryAction } from '../../models/export-history.model';

export const VIEW_HISTORY_DATA = 'history-data'
export const VIEW_HISTORY_INVOICE = 'history-invoice'

@Component({
    selector: 'app-export-history',
    templateUrl: './export-history.component.html',
    styleUrls: ['./export-history.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = 5;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'user',
        'type',
        'period',
        'date',
        'progress'
    ];

    exportPage$: Observable<IExportHistoryPage>;
    dataSource$: Observable<Array<ExportHistory>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    /**
     * Konfigurasi "View history".
     */
    selectedViewHistoryId = VIEW_HISTORY_DATA;
    selectedViewHistoryClasses = {
        'red-fg': true,
        'red-border': true,
    };
    notSelectedViewHistoryClasses = {
        'black-fg': true,
        'grey-300-border': true,
    };
    viewHistoryList = [
        {
            id: VIEW_HISTORY_DATA,
            label: 'Data',
        },
        {
            id: VIEW_HISTORY_INVOICE,
            label: 'Invoice',
        }
    ]

    pageType: ExportConfigurationPage;
    pageTab: TExportHistoryAction;
    useMedeaGo: boolean = false;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private exportHistoryStore: Store<fromExportHistory.State>
    ) { 
        this.exportPage$ = this.exportHistoryStore.select(ExportHistorySelector.getExportPage)
        this.exportPage$
            .pipe(takeUntil(this._unSubs$))
            .subscribe((data) => {
                if (data.tab === 'export_invoices') {
                    this.selectedViewHistoryId = VIEW_HISTORY_INVOICE
                } else {
                    this.selectedViewHistoryId = VIEW_HISTORY_DATA
                }

                if (data.page === '' || data.page === 'payments') {
                    this.pageType = 'payments'
                    this.pageTab = 'export_fms';
                } else {
                    this.pageType = data.page;
                    this.pageTab = data.tab;
                }
                this.useMedeaGo = data.useMedeaGo;
            });
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

    /**
     * Fungsi untuk meneruskan "event" ketika menekan pilih "View by" berubah.
     */
    onViewHistoryChanged(viewBy: { id: string; label: string }): void {
        this.selectedViewHistoryId = viewBy.id;
        this.paginator.pageIndex = 0;

        if (viewBy.id === VIEW_HISTORY_INVOICE) {
            this.pageType = 'invoices';
            this.pageTab = 'export_invoices';
        } else {
            this.pageType = 'payments';
            this.pageTab = 'export_fms';
        }
        this._initTable();
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
                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'created_at',
                    start: 'desc',
                    disableClear: true
                });

                this.dataSource$ = this.exportHistoryStore.select(ExportHistorySelector.getAllExportHistory);
                this.totalDataSource$ = this.exportHistoryStore.select(
                    ExportHistorySelector.getTotalExportHistory
                );

                this.isLoading$ = this.exportHistoryStore.select(ExportHistorySelector.getIsLoading);

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IExportHistoryRequest = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
                sort: 'desc',
                sortBy: 'created_at',
                page: this.pageType,
                paginate: true,
                action: this.pageTab,
                useMedaGo: this.useMedeaGo,
                pageIndex: this.paginator.pageIndex + 1,
                size: this.paginator.pageSize
            };

            if (this.pageType) {
                this.exportHistoryStore.dispatch(
                    ExportHistoryActions.fetchExportHistoryRequest({
                        payload: data
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
