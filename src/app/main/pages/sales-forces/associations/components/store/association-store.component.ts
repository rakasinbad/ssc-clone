import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    ElementRef
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { fuseAnimations } from '@fuse/animations';
import { PageEvent, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// NgRx's Libraries
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IQueryParams, LifecyclePlatform, Portfolio } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
import { flatMap, takeUntil } from 'rxjs/operators';
// Environment variables.
import { environment } from 'environments/environment';
// Entity model.
import { AssociationStore } from '../../models/';
// State management's stuffs.
import * as fromAssociationStores from '../../store/reducers';
import { AssociationStoresActions } from '../../store/actions';
import { AssociationSelectors, AssociationStoreSelectors } from '../../store/selectors';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-associations-store',
    templateUrl: './association-store.component.html',
    styleUrls: ['./association-store.component.scss'],
    host: {
        class: 'content-card mx-16 sinbad-black-10-border'
    },
    animations: [
        fuseAnimations,
        trigger('enterAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationStoreComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    displayedColumns = [
        'checkbox',
        'store-code',
        'store-name',
        'owner-name',
        'owner-phone-number',
        'portfolio-code',
        'portfolio-name',
        'sales-rep',
        'date-associate'
        // 'actions'
    ];

    selection: SelectionModel<AssociationStore>;

    dataSource$: Observable<Array<AssociationStore>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void>;

    private readonly _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Management'
        },
        {
            title: 'Association'
        }
    ];

    constructor(
        private ngxPermissionsService: NgxPermissionsService,
        private store: Store<fromAssociationStores.FeatureState>
    ) {}

    /**
     * PRIVATE FUNCTIONS
     */

    /**
     * PUBLIC FUNCTIONS
     */

    onChangePage($event: PageEvent): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<AssociationStore>(true, []);
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        // this._initPage();

        this._initTable();

        this.store.select(AssociationSelectors.getSearchValue).subscribe(val => {
            this._initTable(val);
        });

        this.dataSource$ = this.store.select(AssociationStoreSelectors.selectAll);
        this.totalDataSource$ = this.store.select(AssociationStoreSelectors.getTotalItem);
        this.isLoading$ = this.store.select(AssociationStoreSelectors.getIsLoading);

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
                // this.table.nativeElement.scrollIntoView(true);
                // this.table.nativeElement.scrollTop = 0;
                this._initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationStoresActions.clearStoreState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource$.pipe(flatMap(v => v)).forEach(row => this.selection.select(row));
    }

    clickTab(
        action:
            | 'all'
            | 'associated-portfolio'
            | 'associated-direct'
            | 'not-associated-portfolio'
            | 'not-associated-direct'
    ): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'associated-portfolio':
                this.activeTab = 'associated-portfolio';
                break;
            case 'associated-direct':
                this.activeTab = 'associated-direct';
                break;
            case 'not-associated-portfolio':
                this.activeTab = 'not-associated-portfolio';
                break;
            case 'not-associated-direct':
                this.activeTab = 'not-associated-direct';
                break;

            default:
                return;
        }

        this.loadTab(this.activeTab);
    }

    loadTab(activeTab): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (activeTab === 'all') {
            data['portfolio'] = 'all';
        } else if (activeTab === 'associated-portfolio') {
            data['portfolio'] = 'group';
            data['associated'] = true;
        } else if (activeTab === 'associated-direct') {
            data['portfolio'] = 'direct';
            data['associated'] = true;
        } else if (activeTab === 'not-associated-portfolio') {
            data['portfolio'] = 'group';
            data['associated'] = false;
        } else if (activeTab === 'not-associated-direct') {
            data['portfolio'] = 'direct';
            data['associated'] = false;
        } else {
            data['portfolio'] = 'all';
        }

        this.store.dispatch(
            AssociationStoresActions.fetchAssociationStoresRequest({ payload: data })
        );
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

    masterToggle(): void {
        // this.isAllSelected() ?
        //     this.selection.clear() :
        //     this.portfolios.forEach(row => this.selection.select(row));
    }

    editAssociation(associatonId: string): void {}

    viewAssociation(associatonId: string): void {}

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof AssociationsComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
    }

    private _initTable(searchText?: string): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            data['portfolio'] = 'all';

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            if (searchText) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: searchText
                    }
                ];
            }

            this.store.dispatch(
                AssociationStoresActions.fetchAssociationStoresRequest({ payload: data })
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
                        'store-code',
                        'store-name',
                        'owner-name',
                        'owner-phone-number',
                        'portfolio-code',
                        'portfolio-name',
                        'sales-rep',
                        'date-associate'
                        // 'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'store-code',
                        'store-name',
                        'owner-name',
                        'owner-phone-number',
                        'portfolio-code',
                        'portfolio-name',
                        'sales-rep',
                        'date-associate'
                        // 'actions'
                    ];
                }
            });
    }
}
