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
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { BrandStore } from './models';
import { MerchantApiService } from './services';
import { BrandStoreActions } from './store/actions';
import { fromMerchant } from './store/reducers';
import { BrandStoreSelectors } from './store/selectors';

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
    search: FormControl;
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
    selectedRowIndex$: Observable<string>;
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
        private router: Router,
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
        this.search = new FormControl('');
        this.paginator.pageSize = 5;

        localStorage.removeItem('filterBrandStore');

        this.dataSource$ = this.store.select(BrandStoreSelectors.getAllBrandStore);
        // .pipe(
        //     filter(source => source.length > 0),
        //     delay(1000),
        //     startWith(this._$merchantApi.initBrandStore())
        // );
        this.totalDataSource$ = this.store.select(BrandStoreSelectors.getTotalBrandStore);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);

        this.initTable();

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000)
            )
            .subscribe(v => {
                if (v) {
                    localStorage.setItem('filterBrandStore', v);
                }

                this.onRefreshTable();
            });

        this.store
            .select(BrandStoreSelectors.getIsRefresh)
            .pipe(
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(isRefresh => {
                if (isRefresh) {
                    this.onRefreshTable();
                }
            });

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
        this.store.dispatch(BrandStoreActions.resetBrandStores());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get searchBrandStore(): string {
        return localStorage.getItem('filterBrandStore') || '';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onChangeStatus(item: BrandStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(BrandStoreActions.confirmChangeStatusStore({ payload: item }));

        return;
    }

    onDelete(item: BrandStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(BrandStoreActions.confirmDeleteStore({ payload: item }));

        return;
    }

    onRemoveSearchBrandStore(): void {
        localStorage.removeItem('filterBrandStore');
        this.search.reset();
    }

    onTrackBy(index: number, item: BrandStore): string {
        return !item ? null : item.id;
    }

    goStoreInfoPage(storeId: string): void {
        if (!storeId) {
            return;
        }

        this.store.dispatch(BrandStoreActions.goPage({ payload: 'info' }));
        this.router.navigate(['/pages/account/stores', storeId, 'detail']);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this.initTable();
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

        if (this.search.value) {
            const query = this.search.value;

            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: query
                }
            ];
        }

        console.log('SEARCH', this.search.value);

        this.store.dispatch(
            BrandStoreActions.fetchBrandStoresRequest({
                payload: data
            })
        );
    }
}
