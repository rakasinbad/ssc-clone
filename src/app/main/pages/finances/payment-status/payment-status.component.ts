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
import { FormControl } from '@angular/forms';
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
import { IQueryParams } from 'app/shared/models/query.model';
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

@Component({
    selector: 'app-payment-status',
    templateUrl: './payment-status.component.html',
    styleUrls: ['./payment-status.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

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
        export: {
            permissions: ['FINANCE.PS.EXPORT'],
            useAdvanced: true,
            pageType: 'payments'
        },
        import: {
            permissions: ['FINANCE.PS.IMPORT'],
            useAdvanced: true,
            pageType: 'payments'
        }
    };

    search: FormControl = new FormControl('');
    filterStatus = '';
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
        'order-reference',
        'order-code',
        'store-name',
        'account-receivable',
        'status',
        // 'source',
        'payment-type',
        'paylater-type',
        'payment-method',
        'order-date',
        'due-date',
        'paid-on',
        'aging-day',
        'd',
        // 'proof-of-payment-status',
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
        private matDialog: MatDialog,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromPaymentStatus.FeatureState>,
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

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();
        // this.table.nativeElement.scrollTop = 0;
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
        // this.filterStatus = '';
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
                                    payload: { id: item.id, body: payload }
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

                // Register to navigation [FuseNavigation]
                this.store.dispatch(
                    UiActions.registerNavigation({
                        payload: {
                            key: 'customNavigation',
                            navigation: this.statusPayment
                        }
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
                        this._initTable();
                    });

                const canUpdate = this.ngxPermissions.hasPermission('FINANCE.PS.UPDATE');

                canUpdate.then(hasAccess => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            'order-reference',
                            'order-code',
                            'store-name',
                            'account-receivable',
                            'status',
                            'payment-type',
                            'paylater-type',
                            'payment-method',
                            'order-date',
                            'due-date',
                            'paid-on',
                            'aging-day',
                            'd',
                            'actions'
                        ];
                    } else {
                        this.displayedColumns = [
                            'order-reference',
                            'order-code',
                            'store-name',
                            'account-receivable',
                            'status',
                            'payment-type',
                            'paylater-type',
                            'payment-method',
                            'order-date',
                            'due-date',
                            'paid-on',
                            'aging-day',
                            'd'
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

                localStorage.removeItem('filter.payment.status');

                this.dataSource$ = this.store.select(PaymentStatusSelectors.getAllPaymentStatus);
                this.totalDataSource$ = this.store.select(
                    PaymentStatusSelectors.getTotalPaymentStatus
                );
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(PaymentStatusSelectors.getIsLoading);

                this._initStatusPayment();

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
                            if (typeof allPayment !== 'undefined') {
                                this._updateStatus(
                                    'all-status',
                                    { title: `All (${allPayment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof waitingPayment !== 'undefined') {
                                this._updateStatus(
                                    'waiting_for_payment',
                                    { title: `Waiting for Payment (${waitingPayment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof d7Payment !== 'undefined') {
                                this._updateStatus(
                                    'd-7',
                                    { title: `D-7 (${d7Payment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof d3Payment !== 'undefined') {
                                this._updateStatus(
                                    'd-3',
                                    { title: `D-3 (${d3Payment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof d0Payment !== 'undefined') {
                                this._updateStatus(
                                    'd-0',
                                    { title: `D-0 (${d0Payment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof paidPayment !== 'undefined') {
                                this._updateStatus(
                                    'paid',
                                    { title: `Paid (${paidPayment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof failPayment !== 'undefined') {
                                this._updateStatus(
                                    'payment_failed',
                                    { title: `Cancel (${failPayment})` },
                                    'customNavigation'
                                );
                            }

                            if (typeof overduePayment !== 'undefined') {
                                this._updateStatus(
                                    'overdue',
                                    { title: `Overdue (${overduePayment})` },
                                    'customNavigation'
                                );
                            }
                            if (typeof waitingRefundPayment !== 'undefined') {
                                this._updateStatus(
                                    'waiting_for_refund',
                                    { title: `Waiting for Refund (${waitingRefundPayment})` },
                                    'customNavigation'
                                );
                            }
                            if (typeof refundedPayment !== 'undefined') {
                                this._updateStatus(
                                    'refunded',
                                    { title: `Refunded (${refundedPayment})` },
                                    'customNavigation'
                                );
                            }
                        }
                    );

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
                            this.filterStatus = v;
                        } else {
                            localStorage.removeItem('filter.payment.status');
                            this.filterStatus = '';
                        }

                        if (this.filterStatus || (currFilter && currFilter !== this.filterStatus)) {
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
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
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

        if (this.filterStatus) {
            if (
                this.filterStatus === 'waiting_for_payment' ||
                this.filterStatus === 'paid' ||
                this.filterStatus === 'overdue' ||
                this.filterStatus === 'payment_failed' ||
                this.filterStatus === 'waiting_for_refund' ||
                this.filterStatus === 'refunded'
            ) {
                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'statusPayment',
                        keyword: this.filterStatus.replace(/-/g, ' ')
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'statusPayment',
                            keyword: this.filterStatus.replace(/-/g, ' ')
                        }
                    ];
                }
            } else if (
                this.filterStatus === 'd-7' ||
                this.filterStatus === 'd-3' ||
                this.filterStatus === 'd-0'
            ) {
                if (data['search'] && data['search'].length > 0) {
                    data['search'].push({
                        fieldName: 'dueDay',
                        keyword: String(this.filterStatus).split('-')[1]
                    });
                } else {
                    data['search'] = [
                        {
                            fieldName: 'dueDay',
                            keyword: String(this.filterStatus).split('-')[1]
                        }
                    ];
                }
            }
        }

        this.store.dispatch(PaymentStatusActions.fetchPaymentStatusesRequest({ payload: data }));
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }

    private _initStatusPayment(): void {
        this.store.dispatch(PaymentStatusActions.fetchCalculateOrdersByPaymentRequest());
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
}
