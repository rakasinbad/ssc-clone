import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { IOrderDemo } from './models';
import { statusOrder } from './status';
import { OrderActions } from './store/actions';
import { fromOrder } from './store/reducers';
import { OrderSelectors } from './store/selectors';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    filterStatus: string;
    total: number;
    displayedColumns = [
        // 'checkbox',
        'origins',
        'id',
        'orderDate',
        'storeName',
        'trxAmount',
        'paymentMethod',
        'totalProduct',
        'status',
        // 'deliveredOn',
        'actualAmountDelivered',
        'actions'
    ];
    hasSelected: boolean;
    statusOrder: any;

    dataSource$: Observable<IOrderDemo[]>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private store: Store<fromOrder.FeatureState>,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Order Managements',
                        translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
                    }
                ]
            })
        );
        this.statusOrder = statusOrder;

        // Set default first status active
        this.store.dispatch(
            UiActions.setCustomToolbarActive({
                payload: 'all-status'
            })
        );

        this._fuseNavigationService.register('customNavigation', this.statusOrder);

        // Show custom toolbar
        this.store.dispatch(UiActions.showCustomToolbar());
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.filterStatus = '';
        this.hasSelected = false;
        this.paginator.pageSize = 5;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        localStorage.removeItem('filter.order');

        this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
        this.totalDataSource$ = this.store.select(OrderSelectors.getTotalOrder);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(OrderSelectors.getIsLoading);

        this.initTable();

        this.store
            .select(UiSelectors.getCustomToolbarActive)
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                const currFilter = localStorage.getItem('filter.order');

                if (v !== 'all-status') {
                    localStorage.setItem('filter.order', v);
                    this.filterStatus = v;
                } else {
                    localStorage.removeItem('filter.order');
                    this.filterStatus = '';
                }

                if (this.filterStatus || (currFilter && currFilter !== this.filterStatus)) {
                    this.store.dispatch(OrderActions.filterOrder({ payload: v }));
                }
            });

        this.store
            .select(OrderSelectors.getIsRefresh)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe(isRefresh => {
                if (isRefresh) {
                    this.onRefreshTable();
                }
            });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        localStorage.removeItem('filter.order');

        this._fuseNavigationService.unregister('customNavigation');

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(UiActions.hideCustomToolbar());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get searchStatus(): string {
        return localStorage.getItem('filter.order') || '';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onRemoveSearchStatus(): void {
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this.initTable();
    }

    private initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        // if (this.search.value) {
        //     const query = this.search.value;

        //     if (data['search'] && data['search'].length > 0) {
        //         data['search'].push({
        //             fieldName: 'keyword',
        //             keyword: query
        //         });
        //     } else {
        //         data['search'] = [
        //             {
        //                 fieldName: 'keyword',
        //                 keyword: query
        //             }
        //         ];
        //     }
        // }

        if (this.filterStatus) {
            if (
                this.filterStatus === 'checkout' ||
                this.filterStatus === 'packing' ||
                this.filterStatus === 'confirm' ||
                this.filterStatus === 'delivery' ||
                this.filterStatus === 'arrived' ||
                this.filterStatus === 'done'
            ) {
                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'status',
                        keyword: this.filterStatus.replace(/-/g, ' ')
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'status',
                            keyword: this.filterStatus.replace(/-/g, ' ')
                        }
                    ];
                }
            }

            // else if (
            //     this.filterStatus === 'd-7' ||
            //     this.filterStatus === 'd-3' ||
            //     this.filterStatus === 'd-0'
            // ) {
            //     if (data['search'] && data['search'].length > 0) {
            //         data['search'].push({
            //             fieldName: 'dueDay',
            //             keyword: String(this.filterStatus).split('-')[1]
            //         });
            //     } else {
            //         data['search'] = [
            //             {
            //                 fieldName: 'dueDay',
            //                 keyword: String(this.filterStatus).split('-')[1]
            //             }
            //         ];
            //     }
            // }
        }

        this.store.dispatch(OrderActions.fetchOrdersRequest({ payload: data }));
    }
}
