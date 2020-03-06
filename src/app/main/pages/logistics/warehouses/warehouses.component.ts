import { SelectionModel } from '@angular/cdk/collections';
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
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { WarehouseInvoiceGroup } from 'app/shared/models/warehouse-invoice-group.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { Warehouse } from './models';
import { WarehouseActions } from './store/actions';
import * as fromWarehouses from './store/reducers';
import { WarehouseSelectors } from './store/selectors';

@Component({
    selector: 'app-warehouses',
    templateUrl: './warehouses.component.html',
    styleUrls: ['./warehouses.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehousesComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse List'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        },
        add: {
            permissions: []
        },
        export: {
            // permissions: ['OMS.EXPORT']
        },
        import: {
            // permissions: ['OMS.IMPORT'],
            // useAdvanced: true,
            // pageType: 'oms'
        }
    };
    displayedColumns = [
        // 'checkbox',
        'wh-id',
        'wh-name',
        'lead-time',
        'invoice',
        'assigned-sku',
        'stock-available',
        'total-urban',
        // 'status',
        'actions'
    ];

    search: FormControl = new FormControl('');
    dataSource: MatTableDataSource<Warehouse>;
    selection: SelectionModel<Warehouse> = new SelectionModel<Warehouse>(true, []);

    dataSource$: Observable<Array<Warehouse>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Warehouse List'
        }
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private router: Router,
        private store: Store<fromWarehouses.FeatureState>
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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getInvoices(value: Array<WarehouseInvoiceGroup>): string {
        if (value && value.length > 0) {
            const invoiceGroup = value.map(v => v.invoiceGroup.name);

            return invoiceGroup.length > 0 ? invoiceGroup.join(', ') : '-';
        }

        return '-';
    }

    getLeadTime(day: number): string {
        return day > 1 ? `${day} Days` : `${day} Day`;
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    isAllSelected(): boolean {
        // const dataSource = this.matTable.dataSource as Array<SalesRep>;
        const numSelected = this.selection.selected.length;
        // const numRows = dataSource.length;
        const numRows = this.dataSource.data.length;
        // const numRows = this.paginator.length;

        return numSelected === numRows;
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/warehouses/new');
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
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state warehouses
                this.store.dispatch(WarehouseActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true
                });

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this.dataSource$ = this.store.select(WarehouseSelectors.selectAll).pipe(
                    tap(source => {
                        this.dataSource = new MatTableDataSource(source);
                        this.selection.clear();
                    })
                );
                this.totalDataSource$ = this.store.select(WarehouseSelectors.getTotalItem);
                this.isLoading$ = this.store.select(WarehouseSelectors.getIsLoading);

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

            this.store.dispatch(WarehouseActions.fetchWarehousesRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
