import { animate, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
    ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IQueryParams, LifecyclePlatform } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, flatMap, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { SalesRep } from './models';
import { SalesRepActions } from './store/actions';
import * as fromSalesReps from './store/reducers';
import { SalesRepSelectors } from './store/selectors';

@Component({
    selector: 'app-sales-reps',
    templateUrl: './sales-reps.component.html',
    styleUrls: ['./sales-reps.component.scss'],
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
export class SalesRepsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    search: FormControl;
    displayedColumns = [
        'checkbox',
        'sales-rep-name',
        'phone-number',
        'sales-rep-target',
        'actual-sales',
        'area',
        'joining-date',
        'status',
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
    selection: SelectionModel<SalesRep>;

    dataSource$: Observable<Array<SalesRep>>;
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
            title: 'Sales Rep'
        }
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject();
        this.paginator.pageSize = this.defaultPageSize;
        this.search = new FormControl('');
        this.selection = new SelectionModel<SalesRep>(true, []);

        this._initPage();

        this._initTable();

        this.dataSource$ = this.store.select(SalesRepSelectors.selectAll);
        this.totalDataSource$ = this.store.select(SalesRepSelectors.getTotalItem);
        this.isLoading$ = this.store.select(SalesRepSelectors.getIsLoading);

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

        this.store.dispatch(SalesRepActions.resetState());

        this._unSubs$.next();
        this._unSubs$.complete();
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

    safeValue(value: any): any {
        console.log(typeof value);

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
     * @memberof SalesRepsComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
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

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                localStorage.setItem('filter.search.salesreps', query);

                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            } else {
                localStorage.removeItem('filter.search.salesreps');
            }

            this.store.dispatch(SalesRepActions.fetchSalesRepsRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }
}
