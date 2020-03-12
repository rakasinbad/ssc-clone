import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { SkuAssignmentsActions, SkuAssignmentsWarehouseActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { UiActions } from 'app/shared/store/actions';
import { SelectionModel } from '@angular/cdk/collections';
import { SkuAssignmentsWarehouse } from '../../models/sku-assignments-warehouse.model';
import * as SkuAssignmentsWarehouseSelectors from '../../store/selectors/sku-assignments-warehouse.selectors';
import { FeatureState as skuAssignmentCoreState } from '../../store/reducers';
import { IQueryParams } from 'app/shared/models/query.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { Warehouse } from '../../../warehouse-coverages/models/warehouse-coverage.model';

@Component({
    selector: 'app-sku-assignments-warehouse',
    templateUrl: './sku-assignment-warehouse.component.html',
    styleUrls: ['./sku-assignment-warehouse.component.scss'],
    host: {
        class: 'content-card mx-16 sinbad-black-10-border'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentWarehouseComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    search: FormControl;

    displayedColumns = [
        // 'checkbox',
        'wh-id',
        'wh-name',
        'total-sku',
        'actions'
    ];

    selection: SelectionModel<SkuAssignmentsWarehouse>;

    dataSource$: Observable<Array<SkuAssignmentsWarehouse>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private readonly sanitizer: DomSanitizer,
        private ngxPermissionsService: NgxPermissionsService,
        private SkuAssignmentsStore: NgRxStore<skuAssignmentCoreState>
    ) {}

    onChangePage($event: PageEvent): void {}

    ngOnInit(): void {
        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<SkuAssignmentsWarehouse>(true, []);

        this._initTable();

        this.SkuAssignmentsStore.select(SkuAssignmentsWarehouseSelectors.getSearchValue).subscribe(
            val => {
                this._initTable(val);
            }
        );

        this.dataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.selectAll
        );
        this.totalDataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.getTotalItem
        );
        this.isLoading$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.getLoadingState
        );

        this.updatePrivileges();
    }

    onSkuAssignmentDetail(row: SkuAssignmentsWarehouse): void {
        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsActions.selectWarehouse({
                payload: (row as Warehouse)
            })
        );

        this.router.navigate(['/pages/logistics/sku-assignments/' + row.id + '/detail']);
    }

    onEditSkuAssignment(item: Warehouse): void {
        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsActions.selectWarehouse({
                payload: (item as Warehouse)
            })
        );

        this.router.navigate(['/pages/logistics/sku-assignments/' + item.id + '/edit']);
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
                this._initTable();
            });
    }

    clickTab(action: 'all' | 'assigned-to-sku' | 'not-assigned-to-sku'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'assigned-to-sku':
                this.activeTab = 'assigned-to-sku';
                break;
            case 'not-assigned-to-sku':
                this.activeTab = 'not-assigned-to-sku';
                break;

            default:
                return;
        }

        this._initTable();
    }

    loadTab(activeTab): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (activeTab === 'assigned-to-sku') {
            data['assigned'] = 'true';
        } else if (activeTab === 'not-assigned-to-sku') {
            data['assigned'] = 'false';
        } else {
            data['assigned'] = 'all';
        }

        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseRequest({ payload: data })
        );
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource$.pipe(flatMap(v => v)).forEach(row => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        console.log('IS ALL SELECTED', numSelected, numRows);

        return numSelected === numRows;
    }

    onSelectedActions(action: 'active' | 'inactive' | 'delete'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'active':
                console.log('Set Active', this.selection.selected);
                break;

            default:
                return;
        }
    }

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SkuAssignmentsWarehousesComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        // this.SkuAssignmentsStore.dispatch(
        //     UiActions.createBreadcrumb({
        //         payload: this._breadCrumbs
        //     })
        // );
    }

    private _initTable(searchText?: string): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            if (this.activeTab === 'assigned-to-sku') {
                data['assigned'] = 'true';
            } else if (this.activeTab === 'not-assigned-to-sku') {
                data['assigned'] = 'false';
            } else {
                data['assigned'] = 'all';
            }

            if (searchText) {
                data['search'] = [
                    {
                        fieldName: 'name',
                        keyword: searchText
                    }
                ];
            }

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsWarehouseActions.resetSkuAssignmentsWarehouse()
            );

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseRequest({
                    payload: data
                })
            );
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then(result => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        // 'checkbox',
                        'wh-id',
                        'wh-name',
                        'total-sku',
                        'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'wh-id',
                        'wh-name',
                        'total-sku',
                        'actions'
                    ];
                }
            });
    }
}
