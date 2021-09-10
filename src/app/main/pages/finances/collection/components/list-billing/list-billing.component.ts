import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges,
    ChangeDetectorRef,
    SecurityContext,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { IQueryParams } from 'app/shared/models/query.model';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil, flatMap, filter } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Store as NgRxStore } from '@ngrx/store';
import { CollectionActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as BillingCoreState } from '../../store/reducers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { HelperService } from 'app/shared/helpers';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { BillingStatus, CollectionStatus } from '../../models';
import { BillingSelectors, CollectionSelectors } from '../../store/selectors';

@Component({
    selector: 'app-list-billing',
    templateUrl: './list-billing.component.html',
    styleUrls: ['./list-billing.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ListBillingComponent implements OnInit, OnChanges, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @Input() viewByType: string = 'bStatus';
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();
    selection: SelectionModel<BillingStatus>;
    dataSource$: Observable<Array<BillingStatus>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void> = new Subject<void>();

    public totalLength: number = 10;
    public size: number = 5;
    public totalDataSource: number;
    public totalDataSourceBilling: number;

    public dataSource = [
        {
            id: 501,
            supplierId: 'GGSTR000000203',
            supplierName: 'Tiga Raksa1',
            collectionCode: 'C00201202108000018',
            collectionMethodName: 'Tunai',
            referenceCode: '',
            totalAmount: 800000,
            createdAt: '2021-08-12 13:46:56',
            invalidDate: null,
            approvalStatus: 'approved',
            salesmanName: 'Test Owner1',
            storeExternalId: '101001010',
            storeName: 'Test Owner Store1',
            orderCode: ['SNB0010100011', 'SNB0010100012', 'SNB0010100013'],
            orderRef: ['A0010100011', 'A0010100022', 'A0010100033'],
            reason: null,
        },
        {
            id: 502,
            supplierId: 'GGSTR000000203',
            supplierName: 'Tiga Raksa2',
            collectionCode: 'C00201202108000018',
            collectionMethodName: 'Tunai',
            referenceCode: '',
            totalAmount: 800000,
            createdAt: '2021-08-12 13:46:56',
            invalidDate: null,
            approvalStatus: 'approved',
            salesmanName: 'Test Owner2',
            storeExternalId: '101001010',
            storeName: 'Test Owner Store2',
            orderCode: ['SNB0010100011', 'SNB0010100012', 'SNB0010100013'],
            orderRef: ['A0010100011', 'A0010100022', 'A0010100033'],
            reason: null,
        },
    ];

    public dataSourceBilling = [
        {
            id: 25,
            stampNominal: 3000,
            reason: 'males bayar',
            paidByCollectionMethod: 5000000,
            paidAmount: 50003000,
            billingPaymentCode: 'bpdf323233',
            createdAt: '2021-03-04 02:01:56',
            approvalStatus: 'pending',
            paymentCollectionMethod: {
                id: 232,
                collectionCode: 'csf3232',
                collectionRef: 'csf3232',
                amount: 50000000,
                balance: 300000,
                approvalStatus: 'pending',
                createdAt: '2021-03-04 02:01:56',
                user: {
                    id: 1,
                    fullName: 'ansor',
                },
                principal: {
                    id: 3,
                    externalId: '10302291',
                },
                stamp: {
                    id: 2,
                    nominal: 3000,
                },
            },
            billing: {
                id: 123,
                status: 'waiting',
                orderParcel: {
                    id: 34,
                    orderCode: 'snbd42323',
                    orderDueDate: '2021-03-04 02:01:56',
                    paymentStatus: 'waiting_for_payment',
                    orderRef: 'asfasd',
                    deliveredParcelFinalPriceBuyer: '400000',
                    order: {
                        id: 2,
                        store: {
                            id: 32,
                            name: 'store123',
                        },
                    },
                },
            },
        },
        {
            id: 26,
            stampNominal: 3000,
            reason: 'males bayar',
            paidByCollectionMethod: 5000000,
            paidAmount: 50003000,
            billingPaymentCode: 'bpdf323233',
            createdAt: '2021-03-04 02:01:56',
            approvalStatus: 'pending',
            paymentCollectionMethod: {
                id: 232,
                collectionCode: 'csf3232',
                collectionRef: 'csf3232',
                amount: 50000000,
                balance: 300000,
                approvalStatus: 'pending',
                createdAt: '2021-03-04 02:01:56',
                user: {
                    id: 1,
                    fullName: 'ansor',
                },
                principal: {
                    id: 3,
                    externalId: '10302291',
                },
                stamp: {
                    id: 2,
                    nominal: 3000,
                },
            },
            billing: {
                id: 123,
                status: 'waiting',
                orderParcel: {
                    id: 34,
                    orderCode: 'snbd42323',
                    orderDueDate: '2021-03-04 02:01:56',
                    paymentStatus: 'waiting_for_payment',
                    orderRef: 'asfasd',
                    deliveredParcelFinalPriceBuyer: '400000',
                    order: {
                        id: 2,
                        store: {
                            id: 32,
                            name: 'store123',
                        },
                    },
                },
            },
        },
    ];

    displayedColumnsCollection = [
        'finance-collection-code',
        'finance-collection-method',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-due-date',
        'finance-collection-status',
        'finance-sales-rep',
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-reason',
    ];

    displayedColumnsBilling = [
        'finance-external-id',
        'finance-store-name',
        'finance-order-code',
        'finance-order-ref',
        'finance-total-amount',
        'finance-order-due-date',
        'finance-payment-status',
        'finance-sales-rep',
        'finance-collect-code',
        'finance-collection-ref',
        'finance-collection-amount',
        'finance-collection-date',
        'finance-collection-status',
        'finance-billing-code',
        'finance-bill-amount',
        'finance-materai',
        'finance-total-bill-amount',
        'finance-bill-date',
        'finance-bill-status',
        'finance-reason',
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private BillingStore: NgRxStore<BillingCoreState>
    ) {}

    ngOnInit() {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<BillingStatus>(true, []);
        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        // Add '${implements OnChanges}' to the class.

        if (changes['searchValue']) {
            if (!changes['searchValue'].isFirstChange()) {
                this.search.setValue(changes['searchValue'].currentValue);
                setTimeout(() => this._initTable());
            }
        }

        // if (changes['selectedStatus']) {
        //     if (!changes['selectedStatus'].isFirstChange()) {
        //         this.selectedStatus = changes['selectedStatus'].currentValue;
        //         setTimeout(() => this._initTable());
        //     }
        // }

        if (changes['viewByType']) {
            if (!changes['viewByType'].isFirstChange()) {
                this.viewByType = changes['viewByType'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        this.cdRef.detectChanges();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }

        this.table.nativeElement.scrollTop = 0;
    }

    openDetailPage(row: any): void {
        let itemPromoHierarchy = { type: row.promoType };
        localStorage.setItem('item', JSON.stringify(itemPromoHierarchy));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    openDetailCollectionStatus(data) {
        // localStorage.setItem('detail collection', data);
        // console.log('detail collection', data);
    }

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
                // Reset core state Collection Action
                this.BillingStore.dispatch(CollectionActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.selection = new SelectionModel<any>(true, []);

                this.dataSource$ = this.BillingStore.select(BillingSelectors.selectAll);
                this.totalDataSource$ = this.BillingStore.select(
                    BillingSelectors.getTotalItem
                );
                this.isLoading$ = this.BillingStore.select(BillingSelectors.getLoadingState);

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            data['paginate'] = true;
            data['keyword'] = query;
            if (data['keyword'] !== null) {
                data['skip'] = 0;
            }
            data['type'] = this.viewByType;
            this.BillingStore.dispatch(
                CollectionActions.fetchBillingStatusRequest({
                    payload: data,
                })
            );
        }
    }

    getOrderCode(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderCodes = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderCodes.length > 0 ? orderCodes : '-';
        }

        return '-';
    }

    getOrderRef(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderRefs = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderRefs.length > 0 ? orderRefs : '-';
        }

        return '-';
    }

    numberFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }

    numberFormatFromString(num) {
        let value = parseInt(num);
        if (num) {
            return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }
}
