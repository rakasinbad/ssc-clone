import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IBreadcrumbs, IQueryParams, LifecyclePlatform } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { JourneyPlan } from './models';
import { JourneyPlanActions } from './store/actions';
import * as fromJourneyPlans from './store/reducers';
import { JourneyPlanSelectors } from './store/selectors';

@Component({
    selector: 'app-journey-plans',
    templateUrl: './journey-plans.component.html',
    styleUrls: ['./journey-plans.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlansComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    search: FormControl = new FormControl('');

    displayedColumns = [
        'checkbox',
        'date',
        'sales-rep-id',
        'sales-rep-name',
        'num-of-store',
        'mandatory-action',
        'last-visit',
        'actions'
    ];

    dataSource: MatTableDataSource<JourneyPlan>;
    selection: SelectionModel<JourneyPlan> = new SelectionModel<JourneyPlan>(true, []);

    dataSource$: Observable<Array<JourneyPlan>>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Rep Management'
        },
        {
            title: 'Journey Plan'
        }
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;

        return numSelected === numRows;
    }

    showInfo(): void {
        this._$helper.infoNotice();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state sales reps
                this.store.dispatch(JourneyPlanActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true
                });

                this._initTable();

                this.dataSource$ = this.store.select(JourneyPlanSelectors.selectAll).pipe(
                    tap(source => {
                        this.dataSource = new MatTableDataSource(source);
                        this.selection.clear();
                    })
                );
                this.totalDataSource$ = this.store.select(JourneyPlanSelectors.getTotalItem);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(JourneyPlanSelectors.getIsLoading);
                break;
        }
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
                localStorage.setItem('filter.search.journeyplans', query);

                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            } else {
                localStorage.removeItem('filter.search.journeyplans');
            }

            this.store.dispatch(JourneyPlanActions.fetchJourneyPlansRequest({ payload: data }));
        }
    }
}
