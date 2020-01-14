import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
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
    readonly defaultPageSize = 50;
    readonly defaultPageOpts = environment.pageSizeTable;

    search: FormControl = new FormControl('');
    filterStatus: string;
    formConfig = {
        status: {
            label: 'Order Status',
            placeholder: 'Choose Order Status',
            sources: this._$helper.orderStatus(),
            rules: {
                required: true
            }
        },
        startDate: {
            label: 'Start Date',
            rules: {
                required: true
            }
        },
        endDate: {
            label: 'End Date',
            rules: {
                required: true
            }
        }
    };
    total: number;
    displayedColumns = [
        // 'checkbox',
        'order-code',
        'order-ref',
        'order-date',
        'store-name',
        'trx-amount',
        'payment-method',
        'total-product',
        'status',
        // 'deliveredOn',
        // 'actual-amount-delivered',
        'delivered-date',
        'actions'
    ];
    hasSelected: boolean;
    statusOrder: any;

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromOrder.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.filterStatus = '';
        this.hasSelected = false;
        this.paginator.pageSize = this.defaultPageSize;
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

        // Filter by search column
        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                // filter(v => {
                //     if (v) {
                //         return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                //     }

                //     return true;
                // }),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                if (v) {
                    // localStorage.setItem('filter.search.order', v);
                }

                this.onRefreshTable();
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

        // Set default first status active
        this.store.dispatch(
            UiActions.setCustomToolbarActive({
                payload: 'all-status'
            })
        );

        // Register to navigation [FuseNavigation]
        this.store.dispatch(
            UiActions.registerNavigation({
                payload: { key: 'customNavigation', navigation: this.statusOrder }
            })
        );

        // Show custom toolbar
        this.store.dispatch(UiActions.showCustomToolbar());

        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.initTable();
            });

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.displayedColumns = [
                    // 'checkbox',
                    'order-code',
                    'order-ref',
                    'order-date',
                    'store-name',
                    'trx-amount',
                    'payment-method',
                    'total-product',
                    'status',
                    // 'deliveredOn',
                    // 'actual-amount-delivered',
                    'delivered-date',
                    'actions'
                ];
            } else {
                this.displayedColumns = [
                    // 'checkbox',
                    'order-code',
                    'order-ref',
                    'order-date',
                    'store-name',
                    'trx-amount',
                    'payment-method',
                    'total-product',
                    'status',
                    // 'deliveredOn',
                    // 'actual-amount-delivered',
                    'delivered-date'
                ];
            }
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        localStorage.removeItem('filter.order');
        localStorage.removeItem('filter.search.order');

        // Reset breadcrumb state
        this.store.dispatch(UiActions.resetBreadcrumb());

        // Reset custom toolbar state
        this.store.dispatch(UiActions.hideCustomToolbar());

        // Unregister navigation [FuseNavigation]
        this.store.dispatch(UiActions.unregisterNavigation({ payload: 'customNavigation' }));

        // Reset orders state
        this.store.dispatch(OrderActions.resetOrders());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get searchOrder(): string {
        return localStorage.getItem('filter.search.order') || '';
    }

    get searchStatus(): string {
        return localStorage.getItem('filter.order') || '';
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onChangeCancelStatus(item: any): void {
        if (!item || !item.id || item.status !== 'confirm') {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeCancelStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onChangeStatus(item: any): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onDownload(): void {
        window.open(
            'https://sinbad-website-sg.s3-ap-southeast-1.amazonaws.com/dev/template_upload/Order+Status.zip',
            '_blank'
        );
    }

    onExport(ev: { action: string; payload: any }): void {
        if (!ev) {
            return;
        }

        const { action, payload } = ev;

        if (action === 'export') {
            const body = {
                status: payload.status,
                dateGte:
                    moment.isMoment(payload.start) && payload.start
                        ? (payload.start as moment.Moment).format('YYYY-MM-DD')
                        : payload.start
                        ? moment(payload.start).format('YYYY-MM-DD')
                        : null,
                dateLte:
                    moment.isMoment(payload.end) && payload.end
                        ? (payload.end as moment.Moment).format('YYYY-MM-DD')
                        : payload.end
                        ? moment(payload.end).format('YYYY-MM-DD')
                        : null
            };

            this.store.dispatch(OrderActions.exportRequest({ payload: body }));
        }
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'docs':
                        this.store.dispatch(
                            OrderActions.importRequest({
                                payload: { file, type: 'update_order_status' }
                            })
                        );
                        // {
                        //     const photoField = this.form.get('profileInfo.photos');
                        //     const fileReader = new FileReader();
                        //     fileReader.onload = () => {
                        //         photoField.patchValue(fileReader.result);
                        //         this.tmpPhoto.patchValue(file.name);
                        //     };
                        //     fileReader.readAsDataURL(file);
                        // }
                        break;

                    default:
                        break;
                }
            }
        }
    }

    onRemoveSearchStatus(): void {
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
    }

    onRemoveSearchOrder(): void {
        localStorage.removeItem('filter.search.order');
        this.search.reset();
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
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

        const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

        if (query) {
            if (data['search'] && data['search'].length > 0) {
                data['search'].push({
                    fieldName: 'keyword',
                    keyword: query
                });
            } else {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            }
        }

        if (this.filterStatus) {
            if (
                this.filterStatus === 'confirm' ||
                this.filterStatus === 'packing' ||
                this.filterStatus === 'shipping' ||
                this.filterStatus === 'delivered' ||
                this.filterStatus === 'done' ||
                this.filterStatus === 'cancel'
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
        }

        this.store.dispatch(OrderActions.fetchOrdersRequest({ payload: data }));
    }
}
