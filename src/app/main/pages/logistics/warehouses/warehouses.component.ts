import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectionStrategy,
    Component,
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
import {
    IBreadcrumbs,
    IQueryParams,
    LifecyclePlatform,
    WarehouseInvoiceGroup
} from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
export class WarehousesComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse List'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     this.search.setValue(value);
            //     setTimeout(() => this._onRefreshTable(), 100);
            // }
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
        'checkbox',
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

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

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

        // this.dataSource = new MatTableDataSource([
        //     {
        //         id: '1',
        //         code: 'WH001',
        //         name: 'DC Cibinong',
        //         invoice: 'Danone, Combine, Mars',
        //         total: 58
        //     },
        //     {
        //         id: '2',
        //         code: 'WH002',
        //         name: 'DC Pulogebang 1',
        //         invoice: 'Danone, Combine, Mars',
        //         total: 51
        //     },
        //     {
        //         id: '3',
        //         code: 'WH003',
        //         name: 'DC Pulogebang 2',
        //         invoice: 'Danone, Combine, Mars',
        //         total: 34
        //     },
        //     {
        //         id: '4',
        //         code: 'WH004',
        //         name: 'DC Cikampek',
        //         invoice: 'Danone, Combine, Mars',
        //         total: 100
        //     }
        // ]);

        this._initPage();
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
            default:
                this.paginator.pageSize = this.defaultPageSize;

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
