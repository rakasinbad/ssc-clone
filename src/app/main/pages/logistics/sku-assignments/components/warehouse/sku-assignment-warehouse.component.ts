import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { filter, flatMap, takeUntil } from 'rxjs/operators';
import { Warehouse } from '../../../warehouse-coverages/models/warehouse-coverage.model';
import { SkuAssignmentsWarehouse } from '../../models/sku-assignments-warehouse.model';
import { SkuAssignmentsActions, SkuAssignmentsWarehouseActions } from '../../store/actions';
import { FeatureState as skuAssignmentCoreState } from '../../store/reducers';
import * as SkuAssignmentsWarehouseSelectors from '../../store/selectors/sku-assignments-warehouse.selectors';

@Component({
    selector: 'app-sku-assignments-warehouse',
    templateUrl: './sku-assignment-warehouse.component.html',
    styleUrls: ['./sku-assignment-warehouse.component.scss'],
    host: {
        class: 'content-card mx-16 sinbad-black-10-border',
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkuAssignmentWarehouseComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        // 'checkbox',
        'wh-id',
        'wh-name',
        'total-sku',
        'actions',
    ];

    activeTab: string = 'all';
    search: FormControl;
    selection: SelectionModel<SkuAssignmentsWarehouse>;
    pageSize: number;

    dataSource$: Observable<SkuAssignmentsWarehouse[]>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private readonly sanitizer: DomSanitizer,
        private ngxPermissionsService: NgxPermissionsService,
        private SkuAssignmentsStore: NgRxStore<skuAssignmentCoreState>
    ) {}

    onChangePage(ev: PageEvent): void {
        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { limit: ev.pageSize, page_index: ev.pageIndex },
            queryParamsHandling: 'merge',
        });
    }

    ngOnInit(): void {
        // this.paginator.pageSize = this.defaultPageSize;
        this.pageSize = this.defaultPageSize;
        this.paginator.pageSize = this.pageSize;
        this.selection = new SelectionModel<SkuAssignmentsWarehouse>(true, []);

        this.SkuAssignmentsStore.select(SkuAssignmentsWarehouseSelectors.getSearchValue)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((val) => {
                this._initTable(val);
            });

        this.dataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.selectAll
        ).pipe(takeUntil(this._unSubs$));

        this.totalDataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.getTotalItem
        ).pipe(takeUntil(this._unSubs$));

        this.isLoading$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsWarehouseSelectors.getLoadingState
        ).pipe(takeUntil(this._unSubs$));

        this.updatePrivileges();

        this.route.queryParams
            .pipe(
                filter((params) => {
                    const { limit, page_index: pageIndex } = params;

                    HelperService.debug(
                        '[SkuAssignmentWarehouseComponent] ngOnInit queryParamMap filter',
                        {
                            params,
                            hasParams:
                                typeof limit !== 'undefined' && typeof pageIndex !== 'undefined',
                            paginator: this.paginator,
                        }
                    );

                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        return true;
                    } else {
                        this._onRefreshTable();
                        return false;
                    }
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe({
                next: ({ limit, page_index: pageIndex, tab }) => {
                    HelperService.debug(
                        '[SkuAssignmentWarehouseComponent] ngOnInit queryParams subscribe',
                        {
                            limit,
                            pageIndex,
                        }
                    );

                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        this.paginator.pageSize = +limit;
                        this.paginator.pageIndex = +pageIndex;
                    }

                    if (typeof tab !== 'undefined') {
                        this.activeTab = tab;
                    }

                    this._initTable();
                },
            });
    }

    ngAfterViewInit(): void {
        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                HelperService.debug('[SkuAssignmentWarehouseComponent] ngAfterViewInit merge');
                this.table.nativeElement.scrollTop = 0;
                this._initTable();
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onSkuAssignmentDetail(row: SkuAssignmentsWarehouse): void {
        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsActions.selectWarehouse({
                payload: row as Warehouse,
            })
        );

        this.router.navigate(['/pages/logistics/sku-assignments/' + row.id + '/detail']);
    }

    onEditSkuAssignment(item: Warehouse): void {
        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsActions.selectWarehouse({
                payload: item as Warehouse,
            })
        );

        this.router.navigate(['/pages/logistics/sku-assignments/' + item.id + '/edit']);
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

        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { tab: this.activeTab, limit: null, page_index: null },
            queryParamsHandling: 'merge',
        });
    }

    loadTab(activeTab): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
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
            : this.dataSource$
                  .pipe(
                      flatMap((v) => v),
                      takeUntil(this._unSubs$)
                  )
                  .forEach((row) => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    onSelectedActions(action: 'active' | 'inactive' | 'delete'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'active':
                HelperService.debug('Set Active', this.selection.selected);
                break;

            default:
                return;
        }
    }

    private _initTable(searchText?: string): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.pageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;
            data['keyword'] = searchText;

            if (this.activeTab === 'assigned-to-sku') {
                data['assigned'] = 'true';
            } else if (this.activeTab === 'not-assigned-to-sku') {
                data['assigned'] = 'false';
            } else {
                data['assigned'] = 'all';
            }

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsWarehouseActions.resetSkuAssignmentsWarehouse()
            );

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseRequest({
                    payload: data,
                })
            );
        }
    }

    private _onRefreshTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.defaultPageSize;
        this._initTable();
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then((result) => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        // 'checkbox',
                        'wh-id',
                        'wh-name',
                        'total-sku',
                        'actions',
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'wh-id',
                        'wh-name',
                        'total-sku',
                    ];
                }
            });
    }
}
