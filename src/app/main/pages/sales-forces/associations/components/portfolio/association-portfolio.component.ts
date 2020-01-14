import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    SecurityContext
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { PageEvent, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// NgRx's Libraries
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IQueryParams, LifecyclePlatform, Portfolio } from 'app/shared/models';
import { UiSelectors } from 'app/shared/store/selectors';
import { UiActions } from 'app/shared/store/actions';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    flatMap,
    takeUntil,
    tap
} from 'rxjs/operators';
// Environment variables.
import { environment } from 'environments/environment';
// Entity model.
import { Association } from '../../models/';
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
import { AssociationSelectors } from '../../store/selectors';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-associations-portfolio',
    templateUrl: './association-portfolio.component.html',
    styleUrls: ['./association-portfolio.component.scss'],
    host: {
        class: 'content-card'
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
export class AssociationPortfolioComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;

    activeTab: string = 'all';

    displayedColumns = [
        'checkbox',
        'portfolio-code',
        'portfolio-name',
        'store-qty',
        'sales-target',
        'sales-rep',
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

    constructor(
        private route: ActivatedRoute,
        private domSanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private ngxPermissionsService: NgxPermissionsService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
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
        this.store.dispatch(AssociationActions.clearState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    clickTab(action: 'all' | 'associated' | 'not-associated'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'associated':
                this.activeTab = 'associated';
                break;
            case 'not-associated':
                this.activeTab = 'not-associated';
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

    private updatePrivileges(): void {
        this.ngxPermissionsService.hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE']).then(result => {
            // Jika ada permission-nya.
            if (result) {
                this.displayedColumns = [
                    // 'checkbox',
                    'portfolio-code',
                    'portfolio-name',
                    'store-qty',
                    'sales-target',
                    'sales-rep',
                    'actions'
                ];
            } else {
                this.displayedColumns = [
                    // 'checkbox',
                    'portfolio-code',
                    'portfolio-name',
                    'store-qty',
                    'sales-target',
                    'sales-rep',
                    // 'actions'
                ];
            }
        });
    }
}
