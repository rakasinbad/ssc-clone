import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
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
import { LogService } from 'app/shared/helpers';
import { IQueryParams, LifecyclePlatform, SupplierStore } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { MerchantApiService } from './services';
import { StoreActions } from './store/actions';
import { fromMerchant } from './store/reducers';
import { StoreSelectors } from './store/selectors';

@Component({
    selector: 'app-merchants',
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    search: FormControl = new FormControl('');
    total: number;
    displayedColumns = [
        'store-code',
        'name',
        'city',
        'address',
        'owner-phone-no',
        'store-segment',
        'store-type',
        'status',
        'actions'
    ];

    dataSource$: Observable<SupplierStore[]>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private ngPerms: NgxPermissionsService,
        private ngRoles: NgxRolesService,
        private store: Store<fromMerchant.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$log: LogService,
        private _$merchantApi: MerchantApiService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
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

        this.paginator.pageSize = this.defaultPageSize;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        localStorage.removeItem('filter.store');

        console.log('Perms ', this.ngPerms.getPermissions());
        console.log('Roles', this.ngRoles.getRoles());

        // .pipe(
        //     filter(source => source.length > 0),
        //     delay(1000),
        //     startWith(this._$merchantApi.initBrandStore())
        // );

        this.dataSource$ = this.store.select(StoreSelectors.getAllStore);
        this.totalDataSource$ = this.store.select(StoreSelectors.getTotalStore);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

        this.initTable();

        this.search.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(v => {
                if (v) {
                    localStorage.setItem('filter.store', v);
                }

                this.onRefreshTable();
            });

        this.store
            .select(StoreSelectors.getIsRefresh)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe(isRefresh => {
                if (isRefresh) {
                    this.onRefreshTable();
                }
            });

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

    get searchStore(): string {
        return localStorage.getItem('filter.store') || '';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onChangeStatus(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(StoreActions.confirmChangeStatusStore({ payload: item }));
    }

    onDelete(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(StoreActions.confirmDeleteStore({ payload: item }));
    }

    onRemoveSearchStore(): void {
        localStorage.removeItem('filter.store');
        this.search.reset();
    }

    onTrackBy(index: number, item: SupplierStore): string {
        return !item ? null : item.id;
    }

    goStoreInfoPage(storeId: string): void {
        if (!storeId) {
            return;
        }

        this.store.dispatch(StoreActions.goPage({ payload: 'info' }));
        this.router.navigate(['/pages/account/stores', storeId, 'detail']);
    }

    safeValue(item: string): string {
        return item ? item : '-';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this.initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(UiActions.resetBreadcrumb());
                this.store.dispatch(StoreActions.resetStore());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                break;
        }
    }

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

        this._$log.generateGroup('[INIT TABLE MERCHANTS]', {
            payload: {
                type: 'log',
                value: data
            }
        });

        this.store.dispatch(
            StoreActions.fetchStoresRequest({
                payload: data
            })
        );
    }
}
