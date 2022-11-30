import {
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    SecurityContext,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { IButtonImportConfig } from 'app/shared/components/import-advanced/models';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams, IQuerySearchParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, withLatestFrom, tap, catchError } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { OrderStatusFacadeService } from './services/order-status-facade.service';
import { PaymentStatusFacadeService } from './services/payment-status-facade.service';
import { statusOrder } from './status';
import { OrderActions } from './store/actions';
import { fromOrder } from './store/reducers';
import { OrderSelectors } from './store/selectors';
import { isMoment } from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { AuthSelectors } from '../core/auth/store/selectors';
import { Warehouse } from './models';
import { OrderHelperService, WarehousesApiService } from './services';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    readonly defaultPageSize = this.route.snapshot.queryParams.limit || 25;
    readonly defaultPageOpts = environment.pageSizeTable;
    private form: FormGroup;

    // allOrder: Observable<number>;
    // newOrder: Observable<number>;
    // packedOrder: Observable<number>;
    // shippedOrder: Observable<number>;
    // deliveredOrder: Observable<number>;
    // completedOrder: Observable<number>;
    // pendingOrder: Observable<number>;
    // canceledOrder: Observable<number>;
    // pendingPayment: Observable<number>;
    // pendingPartial: Observable<number>;
    selectedTab: string;

    defaultStartDate: moment.Moment = moment().subtract(30, 'days');
    defaultEndDate: moment.Moment = moment();

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Order Management',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(), 100);
            },
        },
        add: {
            label: 'Create Order',
            permissions: ['OMS.CREATE'],
            onClick: () => {
                this.orderHelperService.resetFormCreateOrder()
                this.router.navigateByUrl('/pages/orders/add');
            }
        },
        filter: {
            permissions: [],
            onClick: () => {this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();}
        },
        export: {
            permissions: ['OMS.EXPORT'],
            useAdvanced: true,
            pageType: 'orders',
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: 'orders',
        },
    };

    filterConfig: SinbadFilterConfig = {
        by: {
            date: {
                title: 'Order Date',
                sources: null,
                minDate:  this.defaultStartDate,
            },
            basePrice: {
                title: 'Order Value',
                sources: null,
            },
            orderStatus: {
                title: 'Order Status',
                sources: null
            },
            paymentStatus: {
                title: 'Payment Status',
                sources: null,
            },
            warehouses: {
                title: 'Warehouse',
                sources: null,
            },
            orderSource: {
                title: 'Order Source',
                sources: [
                    { id: 'agent-app', label: 'Agent', checked: false },
                    { id: 'mobile', label: 'Mobile', checked: false },
                    { id: 'SC', label: 'Seller Center', checked: false },
                ],
            }
        },
        showFilter: true,
    };

    search: FormControl = new FormControl('');
    total: number;
    displayedColumns = [
        // 'checkbox',
        'order-code',
        'order-ref',
        'order-date',
        'store-name',
        'trx-amount',
        'warehouse',
        'payment-method',
        'paylater-type',
        'status',
        'payment-status',
        'total-product',
        // 'deliveredOn',
        // 'actual-amount-delivered',
        'delivered-date',
        'order-source',
        'actions',
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-oms',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg',
        },
        title: 'IMPORT',
        type: ButtonDesignType.MAT_STROKED_BUTTON,
    };
    hasSelected = false;
    statusOrder: any;
    firstOne: boolean;

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    globalFilterDto: IQuerySearchParams[];
    isRequestingExport$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<any> = new Subject<any>();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromOrder.FeatureState>,
        private exportStore: Store<fromExport.State>,
        public translate: TranslateService,
        private orderStatusFacade: OrderStatusFacadeService,
        private paymentStatusFacade: PaymentStatusFacadeService,
        private fuseSidebarService: FuseSidebarService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private sinbadFilterService: SinbadFilterService,
        private warehousesApiService: WarehousesApiService,
        private orderHelperService: OrderHelperService,
        private cd: ChangeDetectorRef
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Order Managements',
                        translate: 'BREADCRUMBS.ORDER_MANAGEMENTS',
                    },
                ],
            })
        );

        this.statusOrder = statusOrder;
    }
    ngOnChanges(changes: SimpleChanges): void {
        for (const key in changes) {
            if (changes.hasOwnProperty(key)) {
                switch (key) {
                    case 'globalFilter':
                        if (!changes['globalFilter'].isFirstChange()) {
                            this.paginator.pageIndex = 0;
                            this._initTable();
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.form = this.fb.group({
            startDate: this.defaultStartDate,
            endDate: this.defaultEndDate,
            minAmount: null,
            maxAmount: null,
            orderStatus: null,
            paymentStatus: null,
            warehouses: null,
            orderSource: null
        });

        this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });

        // Handle action in filter
        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this._unSubs$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    this.form.reset({
                        startDate: this.defaultStartDate,
                        endDate: this.defaultEndDate
                    });
                    this.globalFilterDto = null;

                    this.cardHeaderConfig = {
                        ...this.cardHeaderConfig,
                        title: {
                            label: `Order Management (${this.defaultStartDate.format('DD MMM YYYY')} - ${this.defaultEndDate.format('DD MMM YYYY')})`
                        },
                    };
                    this.cd.detectChanges();
                    this.cd.markForCheck();
                } else {
                    this.applyFilter();
                }

                this._onRefreshTable();

                HelperService.debug('[OrdesComponent] ngOnInit getClickAction$()', {
                    form: this.form,
                    filterConfig: this.filterConfig,
                });

                window.scrollTo({top: 0, behavior: 'smooth'});
            });

        this.filterSource();

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

    private _initParams(): void {
        this.paginator.pageSize =  this.defaultPageSize;
        this.paginator.pageIndex = this.route.snapshot.queryParams.page ? this.route.snapshot.queryParams.page-1 : 0;

        if (this.route.snapshot.queryParams.keyword){
            this.cardHeaderConfig.search.value = this.route.snapshot.queryParams.keyword;
            this.search.setValue(this.route.snapshot.queryParams.keyword);
        }

        this.form.patchValue({
            startDate: this.route.snapshot.queryParams.startOrderDate
                ? this.route.snapshot.queryParams.startOrderDate
                : this.defaultStartDate,
            endDate: this.route.snapshot.queryParams.endOrderDate
                ? this.route.snapshot.queryParams.endOrderDate
                : this.defaultEndDate,
            minAmount: this.route.snapshot.queryParams.minOrderValue,
            maxAmount: this.route.snapshot.queryParams.maxOrderValue,
            orderStatus: this.route.snapshot.queryParams['statuses'] ? this.route.snapshot.queryParams['statuses'].split("~") : null,
            paymentStatus: this.route.snapshot.queryParams['paymentStatuses'] ? this.route.snapshot.queryParams['paymentStatuses'].split("~") : null,
            warehouses: this.route.snapshot.queryParams['warehouses'] ? this.route.snapshot.queryParams['warehouses'].split("~") : null,
            orderSource: this.route.snapshot.queryParams['sources'] ? this.route.snapshot.queryParams['sources'].split("~") : null,
        });

        this.applyFilter();
    }

    get searchOrder(): string {
        return localStorage.getItem('filter.search.order') || '';
    }

    get searchStatus(): string {
        return localStorage.getItem('filter.order') || '';
    }

    onSelectedTab(index: number): void {
        this.filterConfig.by.orderStatus.sources = [];
        this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });
        this.globalFilterDto = null;
        this.search.reset();
        this.form.reset({
            startDate: this.defaultStartDate,
            endDate: this.defaultEndDate
        });
        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            title: {
                label: `Order Management (${this.defaultStartDate.format('DD MMM YYYY')} - ${this.defaultEndDate.format('DD MMM YYYY')})`
            },
        };
        this.cd.detectChanges();
        this.cd.markForCheck();
        this.router.navigate(['.'], {relativeTo: this.route});

        switch (index) {
            case 1:
                this.selectedTab = 'pending';
                break;

            case 2:
                this.selectedTab = 'pending_payment';
                break;

            case 3:
                this.selectedTab = 'pending_partial';
                break;

            case 4:
                this.selectedTab = 'confirm';
                break;

            case 5:
                this.selectedTab = 'packing';
                break;

            case 6:
                this.selectedTab = 'shipping';
                break;

            case 7:
                this.selectedTab = 'delivered';
                break;

            case 8:
                this.selectedTab = 'done';
                break;

            case 9:
                this.selectedTab = 'cancel';
                break;

            default:
                this.selectedTab = '';
                this.filterSource();
                break;
        }

        this._onRefreshTable();
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onChangeCancelStatus(item: any): void {
        if (!item || !item.id || (item.status !== 'confirm' && item.status !== 'pending_payment')) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeCancelStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onChangeStatus(item: any): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
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
                        : null,
            };
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
                                payload: { file, type: 'update_order_status' },
                            })
                        );
                        break;

                    default:
                        break;
                }
            }
        }
    }

    onRemoveSearchStatus(): void {
        // this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
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

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:

                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

                canUpdate.then((hasAccess) => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            // 'checkbox',
                            'order-code',
                            'order-ref',
                            'order-date',
                            'store-name',
                            'trx-amount',
                            'warehouse',
                            'payment-method',
                            'paylater-type',
                            'status',
                            'payment-status',
                            'total-product',
                            // 'deliveredOn',
                            // 'actual-amount-delivered',
                            'delivered-date',
                            'order-source',
                            'actions',
                        ];
                    } else {
                        this.displayedColumns = [
                            // 'checkbox',
                            'order-code',
                            'order-ref',
                            'order-date',
                            'store-name',
                            'trx-amount',
                            'warehouse',
                            'payment-method',
                            'paylater-type',
                            'status',
                            'payment-status',
                            'total-product',
                            // 'deliveredOn',
                            // 'actual-amount-delivered',
                            'delivered-date',
                            'order-source',
                        ];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                localStorage.removeItem('filter.order');
                localStorage.removeItem('filter.search.order');

                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset custom toolbar state
                this.store.dispatch(UiActions.hideCustomToolbar());

                // Unregister navigation [FuseNavigation]
                this.store.dispatch(
                    UiActions.unregisterNavigation({ payload: 'customNavigation' })
                );

                // Reset orders state
                this.store.dispatch(OrderActions.resetOrders());

                this.sinbadFilterService.resetConfig();

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.firstOne = true;
                this._initParams();

                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true,
                });

                localStorage.removeItem('filter.order');

                this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
                this.totalDataSource$ = this.store.select(OrderSelectors.getTotalOrder);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

                this.isLoading$ = this.store.select(OrderSelectors.getIsLoading);
                this.isRequestingExport$ = this.exportStore.select(
                    ExportSelector.getRequestingState
                );

                this._initStatusOrder();

                this._initTable();

                this.store
                    .select(OrderSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe((isRefresh) => {
                        if (isRefresh) {
                            this._onRefreshTable();
                        }
                    });
                break;
        }
    }

    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };
        data['startOrderDate'] = this.defaultStartDate.format('YYYY-MM-DD');
        data['endOrderDate'] = this.defaultEndDate.format('YYYY-MM-DD');

        data['paginate'] = true;
        data['listEndpoint'] = true;

        const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

        if (query) {
            if (data['search'] && data['search'].length > 0) {
                data['search'].push({
                    fieldName: 'keyword',
                    keyword: query,
                });
            } else {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            }
        }

        if (this.selectedTab) {
            if (data['search'] && data['search'].length > 0) {
                data['search'].push({
                    fieldName: 'status',
                    keyword: this.selectedTab,
                });
            } else {
                data['search'] = [
                    {
                        fieldName: 'status',
                        keyword: this.selectedTab,
                    },
                ];
            }
        }

        if (this.globalFilterDto) {
            data['search'] = data['search'] ? [...data['search'], ...this.globalFilterDto] : [...this.globalFilterDto];
        }

        if (!this.firstOne) {
            this._handleQueryParam(data);
        }

        this.store.dispatch(OrderActions.fetchOrdersRequest({ payload: data }));
        this.firstOne = false;
    }

    private _handleQueryParam(params: IQueryParams) : void {
        var qParam = {
            limit: this.paginator.pageSize,
            page: this.paginator.pageIndex+1
        }

        !!params.search ? params.search.forEach((e) => {
            switch (e.fieldName) {
                case 'statuses[]':
                    qParam['statuses'] = !!qParam['statuses'] ? `${qParam['statuses']}~${e.keyword}` : e.keyword;
                    break;
                case 'paymentStatuses[]':
                    qParam['paymentStatuses'] = !!qParam['paymentStatuses'] ? `${qParam['paymentStatuses']}~${e.keyword}` : e.keyword;
                    break;
                case 'warehouses[]':
                    qParam['warehouses'] = !!qParam['warehouses'] ? `${qParam['warehouses']}~${e.keyword}` : e.keyword;
                    break;
                case 'sources[]':
                    qParam['sources'] = !!qParam['sources'] ? `${qParam['sources']}~${e.keyword}` : e.keyword;
                    break;
                default:
                    qParam[e.fieldName] = !!qParam[e.fieldName] ? `${qParam[e.fieldName]}~${e.keyword}` : e.keyword;
                    break;
            }
        }):null;

        this.router.navigate(['.'], {relativeTo: this.route, queryParams: qParam});
    }

    private applyFilter(): void {
        this.globalFilterDto = null;
        var data: IQuerySearchParams[] = [];

        const {
            startDate,
            endDate,
            minAmount,
            maxAmount,
            orderStatus,
            paymentStatus,
            warehouses,
            orderSource
        } = this.form.value;

        const nStartDate = startDate && isMoment(startDate) ? startDate.format('YYYY-MM-DD') : null;
        const nEndDate = endDate && isMoment(endDate) ? endDate.format('YYYY-MM-DD') : null;

        const newOrderStatus = orderStatus && orderStatus.length > 0 ? orderStatus.filter((v) => v) : [];
        const newPaymentStatus = paymentStatus && paymentStatus.length > 0 ? paymentStatus.filter((v) => v) : [];
        const newWarehouses = warehouses && warehouses.length > 0 ? warehouses.filter((v) => v) : [];
        const newOrderSource = orderSource && orderSource.length > 0 ? orderSource.filter((v) => v) : [];

        if (!!nStartDate) {
            data = [
                ...data,
                {
                    fieldName: 'startOrderDate',
                    keyword: nStartDate,
                }
            ];
        }

        if (!!nEndDate) {
            data = [
                ...data,
                {
                    fieldName: 'endOrderDate',
                    keyword: nEndDate,
                }
            ];
        }

        if(!!minAmount){
            data = [
                ...data,
                {
                    fieldName: 'minOrderValue',
                    keyword: minAmount,
                }
            ];
        }

        if(!!maxAmount){
            data = [
                ...data,
                {
                    fieldName: 'maxOrderValue',
                    keyword: maxAmount,
                }
            ];
        }

        if(!!newOrderStatus && !!newOrderStatus.length){
            for (const value of newOrderStatus) {
                data = [
                    ...data,
                    {
                        fieldName: 'statuses[]',
                        keyword: value,
                    }
                ];
            }
        }

        if(!!newPaymentStatus && !!newPaymentStatus.length){
            for (const value of newPaymentStatus) {
                data = [
                    ...data,
                    {
                        fieldName: 'paymentStatuses[]',
                        keyword: value,
                    }
                ];
            }
        }

        if(!!newWarehouses && !!newWarehouses.length){
            for (const value of newWarehouses) {
                data = [
                    ...data,
                    {
                        fieldName: 'warehouses[]',
                        keyword: value,
                    }
                ];
            }
        }

        if(!!newOrderSource && !!newOrderSource.length){
            for (const value of newOrderSource) {
                data = [
                    ...data,
                    {
                        fieldName: 'sources[]',
                        keyword: value,
                    }
                ];
            }
        }

        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            title: {
                label: `Order Management (${moment(this.form.get('startDate').value).format('DD MMM YYYY')} - ${moment(this.form.get('endDate').value).format('DD MMM YYYY')})`
            },
        };
        this.cd.detectChanges();
        this.cd.markForCheck();

        this.globalFilterDto = data;
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;

        // this.store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        this._initTable();
    }

    private _initStatusOrder(): void {
        // this.store.dispatch(OrderActions.fetchCalculateOrdersRequest());

        // this.allOrder = this.store.select(OrderSelectors.getTotalAllOrder);
        // this.newOrder = this.store.select(OrderSelectors.getTotalNewOrder);
        // this.packedOrder = this.store.select(OrderSelectors.getTotalPackedOrder);
        // this.shippedOrder = this.store.select(OrderSelectors.getTotalShippedOrder);
        // this.deliveredOrder = this.store.select(OrderSelectors.getTotalDeliveredOrder);
        // this.completedOrder = this.store.select(OrderSelectors.getTotalCompletedOrder);
        // this.pendingOrder = this.store.select(OrderSelectors.getTotalPendingOrder);
        // this.canceledOrder = this.store.select(OrderSelectors.getTotalCanceledOrder);
        // this.pendingPayment = this.store.select(OrderSelectors.getTotalPendingPayment);
        // this.pendingPartial = this.store.select(OrderSelectors.getTotalPendingPartialOrder);

    }



    filterSource(): void {
        this.orderStatusFacade.getWithQuery({ search: [{ fieldName: 'web', keyword: 'true' }] });
        this.paymentStatusFacade.getWithQuery();
        this.requestWarehouses({ paginate: false });

        this.orderStatusFacade.collections$
                .pipe(
                    filter((sources) => sources && sources.length > 0),
                    map((sources) => {
                        return sources.map((source) => ({ id: source.status, label: source.title }));
                    }),
                    takeUntil(this._unSubs$)
                )
                .subscribe((orderStatus) => {
                    this.filterConfig.by.orderStatus.sources = orderStatus;
                    this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });
                });

        this.paymentStatusFacade.collections$
                .pipe(
                    filter((sources) => sources && sources.length > 0),
                    map((sources) => {
                        return sources.map((source) => {
                            var label = source.status.replaceAll("_", " ");

                            return {
                                id: source.status, label: label
                            }
                        }).filter(e => !!e.id);
                    }),
                    takeUntil(this._unSubs$)
                )
                .subscribe((paymentStatus) => {
                    this.filterConfig.by.paymentStatus.sources = paymentStatus;
                    this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });
                });
    }

    private requestWarehouses(params: IQueryParams): void {
        of(null)
        .pipe(
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => console.log('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<any>>(([_, userSupplier]) => {
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                const { supplierId } = userSupplier;

                return this.warehousesApiService.getWithQuery({
                    ...params,
                    search: [{ fieldName: 'supplierId', keyword: supplierId }]
                })
            }),
            catchError(err => { throw err; }),
        )
        .subscribe((warehouses: Warehouse[]) => {
            this.filterConfig.by.warehouses.sources = warehouses
                .map(warehouse => ({ id: warehouse.id, label: `${warehouse.code} - ${warehouse.name}` }));
            this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });
        });
    }
}
