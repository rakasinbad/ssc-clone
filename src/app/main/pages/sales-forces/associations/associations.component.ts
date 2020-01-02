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
import { Association } from './models/associations.model';
// State management's stuffs.
import * as fromAssociations from './store/reducers';
import { AssociationActions } from './store/actions';
import { AssociationSelectors } from './store/selectors';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-associations',
    templateUrl: './associations.component.html',
    styleUrls: ['./associations.component.scss'],
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
export class AssociationsComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    pageType: string;
    search: FormControl;
    displayedColumns = [
        'checkbox',
        'portfolio-code',
        'portfolio-name',
        'store-qty',
        'sales-target',
        'sales-rep',
        'actions'
    ];
    dataSource = [
        {
            name: 'Andi',
            phone: '081391348317',
            portofolio_code: 'Group01',
            portofolio_name: 'Baba',
            faktur: 'Danone',
            sales_target: 500000000,
            actual_sales: 500000000,
            area: 'DC - SOLO',
            status: 'active'
        },
        {
            name: 'Yusup',
            phone: '081391348317',
            portofolio_code: 'Group02',
            portofolio_name: 'Baba',
            faktur: 'Combine',
            sales_target: 0,
            actual_sales: 0,
            area: 'DC - SOLO',
            status: 'inactive'
        },
        {
            name: 'Pirmansyah',
            phone: '081391348317',
            portofolio_code: 'Group03',
            portofolio_name: 'Baba',
            faktur: 'Mars',
            sales_target: 200000000,
            actual_sales: 200000000,
            area: 'DC - SOLO',
            status: 'active'
        },
        {
            name: 'Sutisna',
            phone: '081391348317',
            portofolio_code: 'Group04',
            portofolio_name: 'Baba',
            faktur: 'Danone',
            sales_target: 350000000,
            actual_sales: 350000000,
            area: 'DC - SOLO',
            status: 'active'
        }
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
        this.search = new FormControl('');
        this.selection = new SelectionModel<Association>(true, []);
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        this._initPage();

        this._initTable();

        this.dataSource$ = this.store.select(AssociationSelectors.selectAll);
        this.totalDataSource$ = this.store.select(AssociationSelectors.getTotalItem);
        this.isLoading$ = this.store.select(AssociationSelectors.getIsLoading);

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(v => {
                    if (v) {
                        return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                    }

                    return true;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                this._onRefreshTable();
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

    joinPortfolios(value: Array<Portfolio>): string {
        if (value && value.length > 0) {
            return value.map(v => v.invoiceGroup.name).join(', ');
        }

        return '-';
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        console.log('IS ALL SELECTED', numSelected, numRows);

        return numSelected === numRows;
    }

    safeValue(value: any): any {
        if (typeof value === 'number') {
            return value;
        } else {
            return value ? value : '-';
        }
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
        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';

            // this._breadCrumbs = [
            //     {
            //         title: 'Home'
            //     },
            //     {
            //         title: 'Sales Rep Management'
            //     },
            //     {
            //         title: 'Edit Sales Rep'
            //     }
            // ];
        }

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
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
                localStorage.setItem('filter.search.associations', query);

                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            } else {
                localStorage.removeItem('filter.search.associations');
            }

            this.store.dispatch(AssociationActions.fetchAssociationsRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }
}
