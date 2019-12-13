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
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { HelperService, LogService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { merge, Observable, Subject } from 'rxjs';
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
    search: FormControl;
    filterStatus: string;
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
        'payment-method',
        'order-date',
        'due-date',
        'paid-on',
        'aging-day',
        'd',
        // 'proof-of-payment-status',
        'actions'
    ];
    hasSelected: boolean;
    statusPayment: any;
    today = new Date();

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromPaymentStatus.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public translate: TranslateService,
        private _$helper: HelperService,
        private _$log: LogService
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

        this._unSubs$ = new Subject<void>();
        this.search = new FormControl('');
        this.filterStatus = '';
        this.hasSelected = false;
        this.paginator.pageSize = this.defaultPageSize;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        localStorage.removeItem('filter.payment.status');

        this.dataSource$ = this.store.select(PaymentStatusSelectors.getAllPaymentStatus);
        this.totalDataSource$ = this.store.select(PaymentStatusSelectors.getTotalPaymentStatus);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(PaymentStatusSelectors.getIsLoading);

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
                const currFilter = localStorage.getItem('filter.payment.status');

                if (v !== 'all-status') {
                    localStorage.setItem('filter.payment.status', v);
                    this.filterStatus = v;
                } else {
                    localStorage.removeItem('filter.payment.status');
                    this.filterStatus = '';
                }

                if (this.filterStatus || (currFilter && currFilter !== this.filterStatus)) {
                    this.store.dispatch(PaymentStatusActions.filterStatusPayment({ payload: v }));
                }
            });

        this.store
            .select(PaymentStatusSelectors.getIsRefresh)
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
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        localStorage.removeItem('filter.payment.status');

        // Reset breadcrumb state
        this.store.dispatch(UiActions.resetBreadcrumb());

        // Reset custom toolbar state
        this.store.dispatch(UiActions.hideCustomToolbar());

        // Unregister navigation [FuseNavigation]
        this.store.dispatch(UiActions.unregisterNavigation({ payload: 'customNavigation' }));

        // Reset payment statuses state
        this.store.dispatch(PaymentStatusActions.resetPaymentStatuses());

        this._unSubs$.next();
        this._unSubs$.complete();
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

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);

        this.table.nativeElement.scrollIntoView();
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
                this._$log.generateGroup(
                    '[AFTER CLOSED DIALOG] EDIT PAYMENT STATUS',
                    {
                        action: {
                            type: 'log',
                            value: action
                        },
                        payload: {
                            type: 'log',
                            value: payload
                        }
                    },
                    'groupCollapsed'
                );

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
                this.filterStatus === 'payment_failed'
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
}
