import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { StockManagementHistory } from '../../models';
import { StockManagementHistoryActions } from '../../store/actions';
import * as fromStockManagements from '../../store/reducers';
import { StockManagementHistorySelectors } from '../../store/selectors';

@Component({
    selector: 'app-stock-management-detail-history',
    templateUrl: './stock-management-detail-history.component.html',
    styleUrls: ['./stock-management-detail-history.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementDetailHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'date', // createdAt
        'sku-id', // warehouseCatalogue.catalogue.externalId
        'sku-name', // warehouseCatalogue.catalogue.name
        'value-add', // addition
        'value-subtraction', // subtraction
        'reason' // warehouseCatalogueReason.reason
    ];

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'History'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     this.search.setValue(value);
            //     setTimeout(() => this._onRefreshTable(), 100);
            // }
        },
        add: {
            // permissions: []
        },
        export: {
            // permissions: ['OMS.EXPORT']
        },
        import: {
            // permissions: ['OMS.IMPORT'],
            // useAdvanced: true,
            // pageType: ''
        }
    };

    search: FormControl = new FormControl('');
    dataSource$: Observable<Array<StockManagementHistory>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Stock Management'
        },
        {
            title: 'Stock Detail'
        }
    ];

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromStockManagements.FeatureState>
    ) {}

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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state stock management histories
                this.store.dispatch(StockManagementHistoryActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true
                });

                this.dataSource$ = this.store.select(StockManagementHistorySelectors.selectAll);
                this.totalDataSource$ = this.store.select(
                    StockManagementHistorySelectors.getTotalItem
                );
                this.isLoading$ = this.store.select(StockManagementHistorySelectors.getIsLoading);

                this.search.valueChanges
                    .pipe(
                        distinctUntilChanged(),
                        debounceTime(1000),
                        filter(v => {
                            if (v) {
                                return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                            }

                            return true;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(v => {
                        this._onRefreshTable();
                    });

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const { id } = this.route.snapshot.params;

            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            }

            this.store.dispatch(
                StockManagementHistoryActions.fetchStockManagementHistoriesRequest({
                    payload: { params: data, warehouseId: id }
                })
            );
        }
    }

    private _onRefreshTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
