import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { map, takeUntil, startWith, tap, delay, filter, withLatestFrom } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { BrandStore } from './models';
import { BrandStoreActions } from './store/actions';
import { fromMerchant } from './store/reducers';
import { BrandStoreSelectors } from './store/selectors';
import { MerchantApiService } from './services';

@Component({
    selector: 'app-merchants',
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantsComponent implements OnInit, AfterViewInit, OnDestroy {
    // dataSource: MatTableDataSource<any>; // Need for demo
    total: number;
    displayedColumns = [
        'id',
        'name',
        'city',
        'address',
        'owner-phone-no',
        'store-segment',
        'store-type',
        'status',
        'reason',
        'actions'
    ];

    dataSource$: Observable<BrandStore[]>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$merchantApi: MerchantApiService,
        public translate: TranslateService
    ) {
        // this.dataSource = new MatTableDataSource(); // Need for demo
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.paginator.pageSize = 5;

        this.dataSource$ = this.store.select(BrandStoreSelectors.getAllBrandStore).pipe(
            filter(source => source.length > 0),
            delay(1000),
            startWith(this._$merchantApi.initBrandStore())
        );
        this.totalDataSource$ = this.store.select(BrandStoreSelectors.getTotalBrandStore);
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);

        this.initTable();

        // Need for demo
        // this.store
        //     .select(BrandStoreSelectors.getAllBrandStore)
        //     .pipe(takeUntil(this._unSubs$))
        //     .subscribe(source => (this.dataSource = new MatTableDataSource(source)));
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Need for demo
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
    }

    private initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this.store.dispatch(
            BrandStoreActions.fetchBrandStoresRequest({
                payload: data
            })
        );
    }
}
