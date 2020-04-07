import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { FlexiComboActions, FlexiComboListActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { UiActions } from 'app/shared/store/actions';
import { SelectionModel } from '@angular/cdk/collections';
import { FlexiComboList } from '../../models/flexi-combo-list.model';
import * as FlexiComboListSelectors from '../../store/selectors/flexi-combo-list.selectors';
import { FeatureState as flexiComboCoreState } from '../../store/reducers';
import { IQueryParams } from 'app/shared/models/query.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';

@Component({
    selector: 'app-flexi-combo-list',
    templateUrl: './flexi-combo-list.component.html',
    styleUrls: ['./flexi-combo-list.component.scss'],
    // host: {
    //     class: 'content-card mx-16 sinbad-black-10-border'
    // },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboListComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    search: FormControl;

    displayedColumns = [
        'checkbox',
        'promo-seller-id',
        'promo-name',
        'base',
        'start-date',
        'end-date',
        'status',
        'actions',
    ];

    selection: SelectionModel<FlexiComboList>;

    dataSource$: Observable<Array<FlexiComboList>>;
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
        private FlexiComboStore: NgRxStore<flexiComboCoreState>
    ) {}

    onChangePage($event: PageEvent): void {}

    ngOnInit(): void {
        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<FlexiComboList>(true, []);

        this._initTable();

        this.FlexiComboStore.select(FlexiComboListSelectors.getSearchValue)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((val) => {
                this._initTable(val);
            });

        this.dataSource$ = this.FlexiComboStore.select(FlexiComboListSelectors.selectAll).pipe(
            takeUntil(this._unSubs$)
        );

        this.totalDataSource$ = this.FlexiComboStore.select(
            FlexiComboListSelectors.getTotalItem
        ).pipe(takeUntil(this._unSubs$));

        this.isLoading$ = this.FlexiComboStore.select(FlexiComboListSelectors.getLoadingState).pipe(
            takeUntil(this._unSubs$)
        );

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

    clickTab(action: 'all' | 'active' | 'inactive'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'active':
                this.activeTab = 'active';
                break;
            case 'inactive':
                this.activeTab = 'inactive';
                break;

            default:
                return;
        }

        this._initTable();
    }

    loadTab(activeTab): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };

        data['paginate'] = true;

        if (activeTab === 'active') {
            data['assigned'] = 'true';
        } else if (activeTab === 'inactive') {
            data['assigned'] = 'false';
        } else {
            data['assigned'] = 'all';
        }

        this.FlexiComboStore.dispatch(
            FlexiComboListActions.fetchFlexiComboListRequest({ payload: data })
        );
    }

    handleCheckbox(): void {
        // this.isAllSelected()
        //     ? this.selection.clear()
        //     : this.dataSource$
        //           .pipe(
        //               flatMap(v => v),
        //               takeUntil(this._unSubs$)
        //           )
        //           .forEach(row => this.selection.select(row));
    }

    // isAllSelected(): boolean {
    //     // const numSelected = this.selection.selected.length;
    //     const numRows = this.paginator.length;

    //     // console.log('IS ALL SELECTED', numSelected, numRows);

    //     // return numSelected === numRows;
    // }

    onSelectedActions(action: 'active' | 'inactive' | 'delete'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'active':
                // console.log('Set Active', this.selection.selected);
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
     * @memberof FlexiComboListComponent
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
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;
            data['keyword'] = searchText;

            if (this.activeTab === 'active') {
                data['assigned'] = 'true';
            } else if (this.activeTab === 'inactive') {
                data['assigned'] = 'false';
            } else {
                data['assigned'] = 'all';
            }

            this.FlexiComboStore.dispatch(FlexiComboListActions.resetFlexiComboList());

            this.FlexiComboStore.dispatch(
                FlexiComboListActions.fetchFlexiComboListRequest({
                    payload: data,
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
            .then((result) => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        'checkbox',
                        'promo-seller-id',
                        'promo-name',
                        'base',
                        'start-date',
                        'end-date',
                        'status',
                        'actions',
                    ];
                } else {
                    this.displayedColumns = [
                        'checkbox',
                        'promo-seller-id',
                        'promo-name',
                        'base',
                        'start-date',
                        'end-date',
                        'status',
                        'actions',
                    ];
                }
            });
    }
}
