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
import { IBreadcrumbs, IQueryParams, LifecyclePlatform, Portfolio, User } from 'app/shared/models';
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
import { Association } from '../../models/association.model';
// State management's stuffs.
import * as fromAssociations from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
import { AssociationSelectors } from '../../store/selectors';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-associations-sales-rep',
    templateUrl: './association-sales-rep.component.html',
    styleUrls: ['./association-sales-rep.component.scss'],
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
export class AssociationSalesRepComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    search: FormControl;

    displayedColumns = [
        'checkbox',
        'sales-rep-code',
        'sales-rep-name',
        'portfolio-code',
        'portfolio-name',
        // 'store-code',
        'store-qty',
        'sales-target',
        'date-associate',
        // 'actions'
    ];

    selection: SelectionModel<User>;

    dataSource$: Observable<Array<User>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

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
        private route: ActivatedRoute,
        private readonly sanitizer: DomSanitizer,
        private store: Store<fromAssociations.FeatureState>,
        private ngxPermissionsService: NgxPermissionsService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {}

    onChangePage($event: PageEvent): void {}

    ngOnInit(): void {
        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<User>(true, []);
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

    masterToggle(): void {
        // this.isAllSelected() ?
        //     this.selection.clear() :
        //     this.portfolios.forEach(row => this.selection.select(row));
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
                this.activeTab = 'non-associated';
                break;

            default:
                return;
        }

        this._initTable();
        // this.loadTab(this.activeTab);
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

    editAssociation(associatonId: string): void {}

    viewAssociation(associatonId: string): void {}

    generatePortfolioCode(portfolios: Array<Portfolio>): string {
        if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
            return '-';
        }

        return portfolios.map(portfolio => portfolio.code).join(',<br/>');
    }

    generatePortfolioName(portfolios: Array<Portfolio>): string {
        if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
            return '-';
        }

        return portfolios.map(portfolio => portfolio.name).join(',<br/>');
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
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            data['type'] = this.activeTab;

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
                    'sales-rep-code',
                    'sales-rep-name',
                    'portfolio-code',
                    'portfolio-name',
                    // 'store-code',
                    'store-qty',
                    'sales-target',
                    'date-associate',
                    // 'actions'
                ];
            } else {
                this.displayedColumns = [
                    // 'checkbox',
                    'sales-rep-code',
                    'sales-rep-name',
                    'portfolio-code',
                    'portfolio-name',
                    // 'store-code',
                    'store-qty',
                    'sales-target',
                    'date-associate',
                    // 'actions'
                ];
            }
        });
    }
}
