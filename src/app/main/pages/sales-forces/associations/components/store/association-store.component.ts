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
import { Association } from '../../models/';
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
import { AssociationSelectors } from '../../store/selectors';

@Component({
    selector: 'app-associations-store',
    templateUrl: './association-store.component.html',
    styleUrls: ['./association-store.component.scss'],
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

    activeTab: string = 'all';

    displayedColumns = [
        'checkbox',
        'store-code',
        'store-name',
        'portfolio-code',
        'portfolio-name',
        'sales-rep',
        'date-associate',
        'actions'
    ];

    selection: SelectionModel<Association>;

    dataSource$: Observable<Array<Association>>;
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
            title: 'Sales Rep Management'
        },
        {
            title: 'Association'
        }
    ];

    constructor(private store: Store<fromAssociations.FeatureState>) {}

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
        this.selection = new SelectionModel<Association>(true, []);
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        this._initPage();

        this._initTable();

        this.store.select(AssociationSelectors.getSearchValue).subscribe(val => {
            this._initTable(val);
        });

        this.dataSource$ = this.store.select(AssociationSelectors.selectAll);
        this.totalDataSource$ = this.store.select(AssociationSelectors.getTotalItem);
        this.isLoading$ = this.store.select(AssociationSelectors.getIsLoading);
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
        this.store.dispatch(AssociationActions.clearState());

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

        if (activeTab === 'associated') {
            data['associated'] = true;
        } else if (activeTab === 'not-associated') {
            data['associated'] = false;
        }

        this.store.dispatch(AssociationActions.fetchAssociationRequest({ payload: data }));
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

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            if (searchText) {
                data['search'] = [
                    {
                        fieldName: 'code',
                        keyword: searchText
                    },
                    {
                        fieldName: 'name',
                        keyword: searchText
                    }
                ];
            }

            this.store.dispatch(AssociationActions.fetchAssociationRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }
}
