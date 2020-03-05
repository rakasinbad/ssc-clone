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

import { fromSkuAssignments } from '../../store/reducers';
import { FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { SkuAssignmentsSku } from '../../models/sku-assignments-sku.model';
import * as SkuAssignmentsSkuSelectors from '../../store/selectors/sku-assignments-sku.selectors';
import { FeatureState as skuAssignmentCoreState } from '../../store/reducers';
import { Observable, Subject, merge } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { SkuAssignmentsSkuActions } from '../../store/actions';
import { IQueryParams } from 'app/shared/models/query.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';

@Component({
    selector: 'app-sku-assignments-sku',
    templateUrl: './sku-assignment-sku.component.html',
    styleUrls: ['./sku-assignment-sku.component.scss'],
    host: {
        class: 'content-card mx-16 sinbad-black-10-border'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentSkuComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    search: FormControl;

    displayedColumns = [
        // 'checkbox',
        'sku-id',
        'sku-name',
        'brand',
        'total-warehouse',
        'actions'
    ];

    selection: SelectionModel<SkuAssignmentsSku>;

    dataSource$: Observable<Array<SkuAssignmentsSku>>;
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
        private readonly sanitizer: DomSanitizer,
        private ngxPermissionsService: NgxPermissionsService,
        private SkuAssignmentsStore: NgRxStore<skuAssignmentCoreState>
    ) {}

    onChangePage($event: PageEvent): void {}

    ngOnInit(): void {
        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<SkuAssignmentsSku>(true, []);

        this._initTable();

        this.SkuAssignmentsStore.select(SkuAssignmentsSkuSelectors.getSearchValue).subscribe(
            val => {
                this._initTable(val);
            }
        );

        this.dataSource$ = this.SkuAssignmentsStore.select(SkuAssignmentsSkuSelectors.selectAll);
        this.totalDataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSkuSelectors.getTotalItem
        );
        this.isLoading$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSkuSelectors.getLoadingState
        );

        this.updatePrivileges();
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

    clickTab(action: 'all' | 'assign-to-warehouse' | 'not-assign-to-warehouse'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'assign-to-warehouse':
                this.activeTab = 'assign-to-warehouse';
                break;
            case 'not-assign-to-warehouse':
                this.activeTab = 'not-assign-to-warehouse';
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

        if (activeTab === 'assign-to-warehouse') {
            data['assigned'] = 'true';
        } else if (activeTab === 'not-assign-to-warehouse') {
            data['assigned'] = 'false';
        } else {
            data['assigned'] = 'all';
        }

        this.SkuAssignmentsStore.dispatch(
            SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuRequest({ payload: data })
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

            if (this.activeTab === 'assign-to-warehouse') {
                data['assigned'] = 'true';
            } else if (this.activeTab === 'not-assign-to-warehouse') {
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

            this.SkuAssignmentsStore.dispatch(SkuAssignmentsSkuActions.resetSkuAssignmentsSku());

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuRequest({
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
                        'sku-id',
                        'sku-name',
                        'brand',
                        'total-warehouse',
                        'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'sku-id',
                        'sku-name',
                        'brand',
                        'total-warehouse',
                        'actions'
                    ];
                }
            });
    }
}
