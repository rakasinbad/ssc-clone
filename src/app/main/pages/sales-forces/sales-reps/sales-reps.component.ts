import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IBreadcrumbs, IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { SalesRepActions } from './store/actions';
import * as fromSalesReps from './store/reducers';
import { SalesRepSelectors } from './store/selectors';

@Component({
    selector: 'app-sales-reps',
    templateUrl: './sales-reps.component.html',
    styleUrls: ['./sales-reps.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    displayedColumns = [
        'sales-rep-name',
        'phone-number',
        'sales-rep-target',
        'actual-sales',
        'area',
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

    dataSource$: Observable<Array<any>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

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

        this._initPage();

        this._initTable();

        this.dataSource$ = this.store.select(SalesRepSelectors.selectAll);
        this.totalDataSource$ = this.store.select(SalesRepSelectors.getTotalItem);
        this.isLoading$ = this.store.select(SalesRepSelectors.getIsLoading);
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

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(SalesRepActions.resetState());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    /**
     *
     * Initialize current page
     * @private
     * @memberof SalesRepsComponent
     */
    private _initPage(): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
    }

    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        this.store.dispatch(SalesRepActions.fetchSalesRepsRequest({ payload: data }));
    }
}
