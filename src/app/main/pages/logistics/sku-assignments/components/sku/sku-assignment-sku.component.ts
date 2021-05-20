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
import { SkuAssignmentsSku } from '../../models/sku-assignments-sku.model';
import { SkuAssignmentsSkuActions } from '../../store/actions';
import { FeatureState as skuAssignmentCoreState } from '../../store/reducers';
import * as SkuAssignmentsSkuSelectors from '../../store/selectors/sku-assignments-sku.selectors';

@Component({
    selector: 'app-sku-assignments-sku',
    templateUrl: './sku-assignment-sku.component.html',
    styleUrls: ['./sku-assignment-sku.component.scss'],
    host: {
        class: 'content-card mx-16 sinbad-black-10-border',
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkuAssignmentSkuComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        // 'checkbox',
        'sku-id',
        'sku-name',
        'brand',
        'total-warehouse',
        // 'actions'
    ];

    activeTab: string = 'all';
    search: FormControl;
    selection: SelectionModel<SkuAssignmentsSku>;
    pageSize: number;

    dataSource$: Observable<SkuAssignmentsSku[]>;
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
        private readonly router: Router,
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
        this.selection = new SelectionModel<SkuAssignmentsSku>(true, []);

        this.SkuAssignmentsStore.select(SkuAssignmentsSkuSelectors.getSearchValue)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((val) => {
                this._initTable(val);
            });

        this.dataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSkuSelectors.selectAll
        ).pipe(takeUntil(this._unSubs$));

        this.totalDataSource$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSkuSelectors.getTotalItem
        ).pipe(takeUntil(this._unSubs$));

        this.isLoading$ = this.SkuAssignmentsStore.select(
            SkuAssignmentsSkuSelectors.getLoadingState
        ).pipe(takeUntil(this._unSubs$));

        this.updatePrivileges();

        this.route.queryParams
            .pipe(
                filter((params) => {
                    const { limit, page_index: pageIndex } = params;

                    HelperService.debug(
                        '[SkuAssignmentSkuComponent] ngOnInit queryParamMap filter',
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
                        '[SkuAssignmentSkuComponent] ngOnInit queryParams subscribe',
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
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                HelperService.debug('[SkuAssignmentSkuComponent] ngAfterViewInit merge');
                this.table.nativeElement.scrollTop = 0;
                this._initTable();
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
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

        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { tab: this.activeTab, limit: null, page_index: null },
            queryParamsHandling: 'merge',
        });

        // this._initTable();
    }

    loadTab(activeTab): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
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

            if (this.activeTab === 'assign-to-warehouse') {
                data['assigned'] = 'true';
            } else if (this.activeTab === 'not-assign-to-warehouse') {
                data['assigned'] = 'false';
            } else {
                data['assigned'] = 'all';
            }

            this.SkuAssignmentsStore.dispatch(SkuAssignmentsSkuActions.resetSkuAssignmentsSku());

            this.SkuAssignmentsStore.dispatch(
                SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuRequest({
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
                        'sku-id',
                        'sku-name',
                        'brand',
                        'total-warehouse',
                        // 'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'sku-id',
                        'sku-name',
                        'brand',
                        'total-warehouse',
                        // 'actions'
                    ];
                }
            });
    }
}
