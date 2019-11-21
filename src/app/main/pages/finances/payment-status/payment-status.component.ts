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
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
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
    search: FormControl;
    filterStatus: string;
    total: number;
    displayedColumns = [
        'order-reference',
        'store',
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
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$generate: GeneratorService,
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

        // Set default first status active
        this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));

        // this._fuseNavigationService.unregister('customNavigation');
        this._fuseNavigationService.register('customNavigation', this.statusPayment);

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
        this.search = new FormControl('');
        this.filterStatus = '';
        this.hasSelected = false;
        this.paginator.pageSize = 5;
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

        this._fuseNavigationService.unregister('customNavigation');

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(UiActions.hideCustomToolbar());
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

    onUpdate(): void {
        this.matDialog.open(PaymentStatusFormComponent, {
            data: {
                title: 'Review'
            },
            disableClose: true
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
                this.filterStatus === 'waiting-for-payment' ||
                this.filterStatus === 'paid' ||
                this.filterStatus === 'overdue'
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
