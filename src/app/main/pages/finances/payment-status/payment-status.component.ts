import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseNavigation } from '@fuse/types';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IButtonImportConfig } from 'app/shared/components/import-advanced/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams, IQuerySearchParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { PaymentStatusFormComponent } from './payment-status-form/payment-status-form.component';
import { ProofOfPaymentFormComponent } from './proof-of-payment-form/proof-of-payment-form.component';
import { statusPayment } from './status';
import { PaymentStatusActions } from './store/actions';
import { fromPaymentStatus } from './store/reducers';
import { PaymentStatusSelectors } from './store/selectors';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { isMoment } from 'moment';
import { cloneDeep } from 'lodash';
import { EPaymentChannel, EPaymentStatus, EPaymentType } from './models';

@Component({
    selector: 'app-payment-status',
    templateUrl: './payment-status.component.html',
    styleUrls: ['./payment-status.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = this.route.snapshot.queryParams.limit || 25;
    readonly defaultPageOpts = environment.pageSizeTable;
    private formFilter: FormGroup;

    allPayment: number;
    waitingPayment: number;
    d7Payment: number;
    d3Payment: number;
    d0Payment: number;
    overduePayment: number;
    paidPayment: number;
    waitingRefundPayment: number;
    refundedPayment: number;
    failPayment: number;
    selectedTab: string;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Payment Status'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(), 100);
            }
        },
        add: {
            // permissions: ['INVENTORY.ISI.CREATE'],
        },
        filter: {
            permissions: [],
            onClick: () => {this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen(); }
        },
        export: {
            permissions: ['FINANCE.PS.EXPORT'],
            useAdvanced: false,
            pageType: 'payments'
        },
        import: {
            permissions: ['FINANCE.PS.IMPORT'],
            useAdvanced: true,
            pageType: 'payments'
        }
    };

    private sourcesPaymentType = cloneDeep(this._$helper.paymentTypesV2());
    private sourcesPayLaterType = cloneDeep(this._$helper.payLaterTypesV2());
    private sourcesOrderStatus = cloneDeep(this._$helper.orderStatusV2());
    private sourcesPaymentStatus = cloneDeep(this._$helper.paymentStatusV2());

    filterConfig: SinbadFilterConfig = {
        by: {
            paymentOrderDate: {
                title: 'Order Date',
                sources: null
            },
            paymentDueDate: {
                title: 'Payment Due Date',
                sources: null
            },
            paymentDate: {
                title: 'Payment Date',
                sources: null
            },
            storeOrderTotal: {
                title: 'Store Order Total',
                sources: null,
                numberLimitMax: 999999999999
            },
            supplierDeliveredTotal: {
                title: 'Supplier Delivered Total',
                sources: null,
                numberLimitMax: 999999999999
            },
            paymentType: {
                title: 'Payment Type',
                sources: this.sourcesPaymentType
            },
            payLaterType: {
                title: 'Pay Later Type',
                sources: this.sourcesPayLaterType
            },
            orderStatus: {
                title: 'Order Status',
                sources: this.sourcesOrderStatus
            },
            paymentStatus: {
                title: 'Payment Status',
                sources: this.sourcesPaymentStatus
            }
        },
        showFilter: true
    };

    search: FormControl = new FormControl('');
    formConfig = {
        status: {
            label: 'Payment Status',
            placeholder: 'Choose Payment Status',
            sources: this._$helper.paymentStatus(),
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
        'order-code',
        'order-reference',
        'store-name',
        'owner-name',
        'store-order-total',
        'supplier-delivered-total',
        'order-status',
        'status',
        'payment-type',
        'paylater-type',
        'payment-method',
        'order-date',
        'due-date',
        'paid-on',
        'd',
        'aging-day',
        'actions'
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-payment-status',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg'
        },
        title: 'IMPORT',
        type: ButtonDesignType.MAT_STROKED_BUTTON
    };
    hasSelected = false;
    statusPayment: any;
    today = new Date();

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    invoiceFetching$: Observable<boolean>;
    globalFilterDto: IQuerySearchParams[];

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private matDialog: MatDialog,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromPaymentStatus.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private route: ActivatedRoute,
        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Finance',
                        translate: 'BREADCRUMBS.FINANCE'
                    },
                    {
                        title: 'Payment Status',
                        translate: 'BREADCRUMBS.PAYMENT_STATUS',
                        active: true
                    }
                ]
            })
        );

        this.statusPayment = statusPayment;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.formFilter = this.fb.group({
            startDate: null, // order date
            endDate: null, // order date
            startPaymentDueDate: null,
            endPaymentDueDate: null,
            startPaymentDate: null,
            endPaymentDate: null,
            minStoreOrderTotal: null,
            maxStoreOrderTotal: null,
            minSupplierDeliveredTotal: null,
            maxSupplierDeliveredTotal: null,
            paymentType: null,
            payLaterType: null,
            orderStatus: null,
            paymentStatus: null
        });

        this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.formFilter });

        // Handle action in filter
        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this._unSubs$)
            )
            .subscribe((action) => {

                if (action === 'reset') {
                    this.formFilter.reset();
                    this.globalFilterDto = null;
                } else {
                    this.applyFilter();
                }

                this._onRefreshTable();
            });

        this.invoiceFetching$ = this.store.select(PaymentStatusSelectors.getInvoiceLoading);
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

    get searchPaymentStatus(): string {
        return localStorage.getItem('filter.payment.status') || '';
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 1:
                this.selectedTab = 'waiting_for_payment';
                this._onRefreshTable();
                break;

            case 2:
                this.selectedTab = 'd-7';
                this._onRefreshTable();
                break;

            case 3:
                this.selectedTab = 'd-3';
                this._onRefreshTable();
                break;

            case 4:
                this.selectedTab = 'd-0';
                this._onRefreshTable();
                break;

            case 5:
                this.selectedTab = 'overdue';
                this._onRefreshTable();
                break;

            case 6:
                this.selectedTab = 'paid';
                this._onRefreshTable();
                break;

            case 7:
                this.selectedTab = 'waiting_for_refund';
                this._onRefreshTable();
                break;

            case 8:
                this.selectedTab = 'refunded';
                this._onRefreshTable();
                break;
            case 9:
                this.selectedTab = 'payment_failed';
                this._onRefreshTable();
                break;
            default:
                this.selectedTab = '';
                this._onRefreshTable();
                break;
        }
    }

    agingDate(date): any {
        return date < 0 ? '-' : date;
    }

    countDownDueDate(date): any {
        if (!date) {
            return '-';
        }

        const dueDate = moment.utc(date).local();
        const dateNow = moment.utc();
        const diffDate = dueDate.diff(dateNow, 'days');

        return diffDate <= 0 ? '-' : diffDate;
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    checkStatus = (status: string): boolean => {
        const arr = ['cancel', 'delivered'];
        return arr.includes(status);
    };

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollTop = 0;
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onDownload(): void {
        window.open(
            'https://sinbad-website-sg.s3-ap-southeast-1.amazonaws.com/dev/template_upload/Payment+Status.zip',
            '_blank'
        );
    }

    onViewInvoice(id): void {
        this.store.dispatch(PaymentStatusActions.fetchInvoiceOrder({ payload: id }));
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

            this.store.dispatch(PaymentStatusActions.exportRequest({ payload: body }));
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
                            PaymentStatusActions.importRequest({
                                payload: { file, type: 'update_payment_status' }
                            })
                        );
                        break;

                    default:
                        break;
                }
            }
        }
    }

    onProofPayment(): void {
        this.matDialog.open(ProofOfPaymentFormComponent, {
            data: {
                title: 'Proof of Payment'
            },
            disableClose: true
        });
    }

    onRemoveSearchPaymentStatus(): void {
        // localStorage.removeItem('filter.payment.status');
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
    }

    onUpdate(item: any): void {
        const canUpdate = this.ngxPermissions.hasPermission('FINANCE.PS.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                if (!item || !item.id) {
                    return;
                }

                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));

                const dialogRef = this.matDialog.open<
                    PaymentStatusFormComponent,
                    any,
                    { action: string; payload: any }
                >(PaymentStatusFormComponent, {
                    data: {
                        title: 'Review',
                        id: item.id,
                        item: item
                    },
                    disableClose: true
                });

                dialogRef
                    .afterClosed()
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(({ action, payload }) => {
                        if (action === 'edit' && payload) {
                            this.store.dispatch(
                                PaymentStatusActions.updatePaymentStatusRequest({
                                    payload: { id: item.id, body: payload, opts: { header_X_Type: 'payment' } }
                                })
                            );
                        } else {
                            this.store.dispatch(UiActions.resetHighlightRow());
                        }
                    });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    isShowMenuItemUpdateStatus(item: any): boolean {
        let result = false;

        switch (item.paymentType.id) {
            case EPaymentType.PAY_NOW:
                break;
            case EPaymentType.PAY_LATER:
                
                if (
                    item.paymentChannel.paymentChannelTypeId === EPaymentChannel.CHANNEL_TUNAI &&
                    (
                        item.statusPayment === EPaymentStatus.WAITING_FOR_PAYMENT ||
                        item.statusPayment === EPaymentStatus.OVERDUE
                    )
                ) {
                    result = true;
                }

                break;
            case EPaymentType.PAY_ON_DELIVERY:

                if (
                    item.paymentChannel.paymentChannelTypeId === EPaymentChannel.CHANNEL_TUNAI &&
                    (
                        item.statusPayment === EPaymentStatus.WAITING_FOR_PAYMENT ||
                        item.statusPayment === EPaymentStatus.OVERDUE
                    )
                ) {
                    result = true;
                }
                
                break;
            default:
                console.warn(`[PAYMENT STATUS] Payment Type "${item.paymentType.name}" is unknown`);
                break;
        }

        return result;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Set default first status active
                this.store.dispatch(
                    UiActions.setCustomToolbarActive({
                        payload: 'all-status'
                    })
                );

                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                const canUpdate = this.ngxPermissions.hasPermission('FINANCE.PS.UPDATE');

                canUpdate.then(hasAccess => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            'order-code',
                            'order-reference',
                            'store-name',
                            'owner-name',
                            'store-order-total',
                            'supplier-delivered-total',
                            'order-status',
                            'status',
                            'payment-type',
                            'paylater-type',
                            'payment-method',
                            'order-date',
                            'due-date',
                            'paid-on',
                            'd',
                            'aging-day',
                            'actions'
                        ];
                    } else {
                        this.displayedColumns = [
                            'order-code',
                            'order-reference',
                            'store-name',
                            'owner-name',
                            'store-order-total',
                            'supplier-delivered-total',
                            'order-status',
                            'status',
                            'payment-type',
                            'paylater-type',
                            'payment-method',
                            'order-date',
                            'due-date',
                            'paid-on',
                            'd',
                            'aging-day',
                        ];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                localStorage.removeItem('filter.payment.status');

                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset custom toolbar state
                this.store.dispatch(UiActions.hideCustomToolbar());

                // Unregister navigation [FuseNavigation]
                this.store.dispatch(
                    UiActions.unregisterNavigation({ payload: 'customNavigation' })
                );

                // Reset payment statuses state
                this.store.dispatch(PaymentStatusActions.resetPaymentStatuses());

                this.sinbadFilterService.resetConfig();

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;
                this.paginator.pageIndex = this.route.snapshot.queryParams.page ? this.route.snapshot.queryParams.page - 1 : 0;

                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true
                });

                localStorage.removeItem('filter.payment.status');

                this.dataSource$ = this.store.select(PaymentStatusSelectors.getAllPaymentStatus);
                this.totalDataSource$ = this.store.select(
                    PaymentStatusSelectors.getTotalPaymentStatus
                );
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(PaymentStatusSelectors.getIsLoading);

                this._initStatusPayment();

                this._initTable();

                this.store
                    .select(UiSelectors.getCustomToolbarActive)
                    .pipe(
                        distinctUntilChanged(),
                        debounceTime(1000),
                        filter(v => !!v),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(v => {
                        const currFilter = localStorage.getItem('filter.payment.status');

                        if (v !== 'all-status') {
                            localStorage.setItem('filter.payment.status', v);
                            this.selectedTab = v;
                        } else {
                            localStorage.removeItem('filter.payment.status');
                            this.selectedTab = '';
                        }

                        if (this.selectedTab || (currFilter && currFilter !== this.selectedTab)) {
                            this.store.dispatch(
                                PaymentStatusActions.filterStatusPayment({ payload: v })
                            );
                        }
                    });

                this.store
                    .select(PaymentStatusSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(isRefresh => {
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
            skip: this.paginator.pageIndex + 1
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        if (this.search.value) {
            const query = this.search.value;

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

        if (this.selectedTab) {
            if (
                this.selectedTab === 'waiting_for_payment' ||
                this.selectedTab === 'paid' ||
                this.selectedTab === 'overdue' ||
                this.selectedTab === 'payment_failed' ||
                this.selectedTab === 'waiting_for_refund' ||
                this.selectedTab === 'refunded'
            ) {
                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'statusPayment',
                        keyword: this.selectedTab.replace(/-/g, ' ')
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'statusPayment',
                            keyword: this.selectedTab.replace(/-/g, ' ')
                        }
                    ];
                }
            } else if (
                this.selectedTab === 'd-7' ||
                this.selectedTab === 'd-3' ||
                this.selectedTab === 'd-0'
            ) {
                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'dueDay',
                        keyword: String(this.selectedTab).split('-')[1]
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'dueDay',
                            keyword: String(this.selectedTab).split('-')[1]
                        }
                    ];
                }
            }
        }

        if (this.globalFilterDto) { 
            data['search'] = data['search'] ? [...data['search'], ...this.globalFilterDto] : [...this.globalFilterDto];
        }

        this.store.dispatch(PaymentStatusActions.fetchPaymentStatusesRequest({ payload: data }));
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;

        this.store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        this._initTable();
    }

    private _initStatusPayment(): void {
        this.store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
        
        combineLatest([
            this.store.select(PaymentStatusSelectors.getTotalAllPayment),
            this.store.select(PaymentStatusSelectors.getTotalWaitingPayment),
            this.store.select(PaymentStatusSelectors.getTotalD7Payment),
            this.store.select(PaymentStatusSelectors.getTotalD3Payment),
            this.store.select(PaymentStatusSelectors.getTotalD0Payment),
            this.store.select(PaymentStatusSelectors.getTotalPaidPayment),
            this.store.select(PaymentStatusSelectors.getTotalFailPayment),
            this.store.select(PaymentStatusSelectors.getTotalOverduePayment),
            this.store.select(PaymentStatusSelectors.getTotalWaitingForRefund),
            this.store.select(PaymentStatusSelectors.getTotalRefunded)
        ])
            .pipe(takeUntil(this._unSubs$))
            .subscribe(
                ([
                    allPayment,
                    waitingPayment,
                    d7Payment,
                    d3Payment,
                    d0Payment,
                    paidPayment,
                    failPayment,
                    overduePayment,
                    waitingRefundPayment,
                    refundedPayment
                ]) => {
                    this.allPayment = + allPayment;
                    this.waitingPayment = + waitingPayment;
                    this.d7Payment = + d7Payment;
                    this.d3Payment = + d3Payment;
                    this.d0Payment = + d0Payment;
                    this.paidPayment = + paidPayment;
                    this.failPayment = + failPayment;
                    this.overduePayment = + overduePayment;
                    this.waitingRefundPayment = + waitingRefundPayment;
                    this.refundedPayment = + refundedPayment;
                }
            );
    }

    private _updateStatus(id: string, properties: Partial<FuseNavigation>, key?: string): void {
        this.store.dispatch(
            UiActions.updateItemNavigation({
                payload: {
                    id,
                    properties,
                    key
                }
            })
        );
    }

    private applyFilter(): void {
        let querySearchParams: IQuerySearchParams[] = [];
        this.globalFilterDto = null;

        const {
            startDate,
            endDate,
            startPaymentDueDate,
            endPaymentDueDate,
            startPaymentDate,
            endPaymentDate,
            minStoreOrderTotal,
            maxStoreOrderTotal,
            minSupplierDeliveredTotal,
            maxSupplierDeliveredTotal,
            paymentType,
            payLaterType,
            orderStatus,
            paymentStatus,
        } = this.formFilter.value;

        const nStartDate = startDate && isMoment(startDate) ? startDate.format('YYYY-MM-DD') : null;
        const nEndDate = endDate && isMoment(endDate) ? endDate.format('YYYY-MM-DD') : null;
        const nStartPaymentDueDate = startPaymentDueDate && isMoment(startPaymentDueDate) ? startPaymentDueDate.format('YYYY-MM-DD') : null;
        const nEndPaymentDueDate = endPaymentDueDate && isMoment(endPaymentDueDate) ? endPaymentDueDate.format('YYYY-MM-DD') : null;
        const nStartPaymentDate = startPaymentDate && isMoment(startPaymentDate) ? startPaymentDate.format('YYYY-MM-DD') : null;
        const nEndPaymentDate = endPaymentDate && isMoment(endPaymentDate) ? endPaymentDate.format('YYYY-MM-DD') : null;

        // checkbox
        const nPaymentType = paymentType && paymentType.length > 0 ? paymentType.filter((v) => v.checked === true) : [];
        const nPayLaterType = payLaterType && payLaterType.length > 0 ? payLaterType.filter((v) => v.checked === true) : [];

        // dropdown - checkbox
        const nOrderStatus = orderStatus && orderStatus.length > 0 ? orderStatus.filter((v) => v) : [];
        const nPaymentStatus = paymentStatus && paymentStatus.length > 0 ? paymentStatus.filter((v) => v) : [];

        if (!!nStartDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'startOrderDate',
                    keyword: nStartDate,
                }
            ];
        }

        if (!!nEndDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'endOrderDate',
                    keyword: nEndDate,
                }
            ];
        }

        if (!!nStartPaymentDueDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'startDueDate',
                    keyword: nStartPaymentDueDate,
                }
            ];
        }

        if (!!nEndPaymentDueDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'endDueDate',
                    keyword: nEndPaymentDueDate,
                }
            ];
        }

        if (!!nStartPaymentDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'startPaymentDate',
                    keyword: nStartPaymentDate,
                }
            ];
        }

        if (!!nEndPaymentDate) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'endPaymentDate',
                    keyword: nEndPaymentDate,
                }
            ];
        }

        if (!!minStoreOrderTotal) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'minStoreOrderTotal',
                    keyword: minStoreOrderTotal,
                }
            ];
        }

        if (!!maxStoreOrderTotal) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'maxStoreOrderTotal',
                    keyword: maxStoreOrderTotal,
                }
            ];
        }
        
        if (!!minSupplierDeliveredTotal) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'minDeliveredTotal',
                    keyword: minSupplierDeliveredTotal,
                }
            ];
        }

        if (!!maxSupplierDeliveredTotal) {
            querySearchParams = [
                ...querySearchParams,
                {
                    fieldName: 'maxDeliveredTotal',
                    keyword: maxSupplierDeliveredTotal,
                }
            ];
        }

        if (!!nPaymentType && !!nPaymentType.length) {
            for (const value of nPaymentType) {
                querySearchParams = [
                    ...querySearchParams,
                    {
                        fieldName: 'paymentTypes[]',
                        keyword: value.id,
                    }
                ];    
            }
        }

        if (!!nPayLaterType && !!nPayLaterType.length) {
            for (const value of nPayLaterType) {
                querySearchParams = [
                    ...querySearchParams,
                    {
                        fieldName: 'paylaterTypes[]',
                        keyword: value.id,
                    }
                ];    
            }
        }

        if (!!nOrderStatus && !!nOrderStatus.length) {
            for (const value of nOrderStatus) {
                querySearchParams = [
                    ...querySearchParams,
                    {
                        fieldName: 'statuses[]',
                        keyword: value,
                    }
                ];    
            }
        }

        if (!!nPaymentStatus && !!nPaymentStatus.length) {
            for (const value of nPaymentStatus) {
                querySearchParams = [
                    ...querySearchParams,
                    {
                        fieldName: 'statusPayments[]',
                        keyword: value,
                    }
                ];
            }
        }

        this.globalFilterDto = querySearchParams;
    }

}
