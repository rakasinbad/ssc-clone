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
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { VoucherActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
// import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as VoucherCoreState } from '../../store/reducers';
import { IQueryParamsVoucher } from 'app/shared/models/query.model';
// import { LifecyclePlatform } from 'app/shared/models/global.model';
import { SupplierVoucher } from '../../models';
import { VoucherSelectors } from '../../store/selectors';
import { HelperService } from 'app/shared/helpers';

type PromoStatus = 'all' | 'active' | 'inactive';
@Component({
    selector: 'voucher-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    // host: {
    //     class: 'content-card mx-16 sinbad-black-10-border'
    // },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: PromoStatus = 'all';
    // tslint:disable-next-line: no-inferrable-types
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();

    displayedColumns = [
        'supplier-voucher-id',
        'voucher-name',
        'eligible-product',
        'voucher-type',
        'allocation-type',
        'allocation-value',
        'total-order-value',
        'collected',
        'used',
        'start-date',
        'end-date',
        'status',
        'actions',
    ];

    selection: SelectionModel<SupplierVoucher>;

    dataSource$: Observable<Array<SupplierVoucher>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private subs$: Subject<void> = new Subject<void>();

    constructor(
        // private route: ActivatedRoute,
        // private readonly sanitizer: DomSanitizer,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private VoucherStore: NgRxStore<VoucherCoreState>
    ) {}

    ngOnInit(): void {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<SupplierVoucher>(true, []);

        this.dataSource$ = this.VoucherStore.select(VoucherSelectors.getAllVoucher).pipe(
            takeUntil(this.subs$)
        );

        this.totalDataSource$ = this.VoucherStore.select(VoucherSelectors.getTotalItem);

        this.isLoading$ = this.VoucherStore.select(VoucherSelectors.getLoadingState).pipe(
            takeUntil(this.subs$)
        );

        this._initTable();
        this.updatePrivileges();
    }

    // onSkuAssignmentDetail(row: SkuAssignmentsWarehouse): void {
    //     this.SkuAssignmentsStore.dispatch(
    //         SkuAssignmentsActions.selectWarehouse({
    //             payload: row as Warehouse
    //         })
    //     );

    //     this.router.navigate(['/pages/logistics/sku-assignments/' + row.id + '/detail']);
    // }

    // onEditSkuAssignment(item: Warehouse): void {
    //     this.SkuAssignmentsStore.dispatch(
    //         SkuAssignmentsActions.selectWarehouse({
    //             payload: item as Warehouse
    //         })
    //     );

    //     this.router.navigate(['/pages/logistics/sku-assignments/' + item.id + '/edit']);
    // }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['searchValue']) {
            if (!changes['searchValue'].isFirstChange()) {
                this.search.setValue(changes['searchValue'].currentValue);
                setTimeout(() => this._initTable());
            }
        }

        if (changes['selectedStatus']) {
            if (!changes['selectedStatus'].isFirstChange()) {
                this.selectedStatus = changes['selectedStatus'].currentValue;
                setTimeout(() => this._initTable());
            }
        }
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this.subs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                this._initTable();
            });

        this.VoucherStore.select(VoucherSelectors.getRefreshStatus)
            .pipe(takeUntil(this.subs$))
            .subscribe((needRefresh) => {
                if (needRefresh) {
                    this._initTable();
                }

                this.VoucherStore.dispatch(VoucherActions.setRefreshStatus({ payload: false }));
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParamsVoucher = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            // data['sortBy'] = this.sort.active;
        }
        // this.table.nativeElement.scrollTop = 0;
    }

    // onTrackBy(index: number, item: any): string {
    //     return !item ? null : item.id;
    // }

    openDetailPage(promoId: string): void {
        // this.VoucherStore.dispatch(
        //     VoucherActions.fetchVoucherRequest({
        //         payload: promoId
        //     })
        // );

        this.router.navigate([`/pages/promos/voucher/view/${promoId}`]);
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource$
                  .pipe(
                      flatMap((v) => v),
                      takeUntil(this.subs$)
                  )
                  .forEach((row) => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    onDelete(item: SupplierVoucher): void {
        if (!item) {
            return;
        }

        this.VoucherStore.dispatch(VoucherActions.confirmRemoveSupplierVoucher({ payload: item }));
    }

    setActive(item: SupplierVoucher): void {
        if (!item) {
            return;
        }

        this.VoucherStore.dispatch(
            VoucherActions.confirmSetActiveSupplierVoucher({ payload: item })
        );
    }

    setInactive(item: SupplierVoucher): void {
        if (!item) {
            return;
        }

        this.VoucherStore.dispatch(
            VoucherActions.confirmSetInactiveSupplierVoucher({ payload: item })
        );
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParamsVoucher = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            if (this.sort.direction) {
                if (this.sort.active === 'total-order-value') {
                    data['totalOrderValue'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                } else if (this.sort.active === 'collected') {
                    data['collected'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                }  else if (this.sort.active === 'used') {
                    data['used'] = this.sort.direction === 'desc' ? 'DESC' : 'ASC';
                } 
                
            } 

            data['paginate'] = true;
            data['keyword'] = this.search.value;

            if (this.selectedStatus !== 'all') {
                data['status'] = this.selectedStatus;
            }

            this.VoucherStore.dispatch(VoucherActions.resetSupplierVoucher());
            this.VoucherStore.dispatch(
                VoucherActions.fetchSupplierVoucherRequest({
                    payload: data,
                })
            );
        }
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then((result) => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        'supplier-voucher-id',
                        'voucher-name',
                        'eligible-product',
                        'voucher-type',
                        'allocation-type',
                        'allocation-value',
                        'total-order-value',
                        'collected',
                        'used',
                        'start-date',
                        'end-date',
                        'status',
                        'actions',
                    ];
                } else {
                    this.displayedColumns = [
                        'supplier-voucher-id',
                        'voucher-name',
                        'eligible-product',
                        'voucher-type',
                        'allocation-type',
                        'allocation-value',
                        'total-order-value',
                        'collected',
                        'used',
                        'start-date',
                        'end-date',
                        'status'
                    ];
                }
            });
    }
}
