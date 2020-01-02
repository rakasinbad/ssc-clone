import { environment } from '../../../../environments/environment';

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    SecurityContext
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';

import { StoreCatalogueApiService } from './services';
import { StoreCatalogueActions } from './store/actions';
import { fromStoreCatalogue } from './store/reducers';
import { StoreCatalogueSelectors } from './store/selectors';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-in-store-inventories',
    templateUrl: './in-store-inventories.component.html',
    styleUrls: ['./in-store-inventories.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InStoreInventoriesComponent implements OnInit, AfterViewInit, OnDestroy {
    total: number;
    search: FormControl;
    displayedColumns = [
        'storeId',
        'skuId',
        'skuName',
        'price',
        // 'addition',
        // 'subtraction',
        // 'stockOnHand',
        // 'stockType',
        // 'condition',
        // 'employeeName',
        // 'role',
        'date',
        'actions',
    ];
    environment = environment;

    dataSource$: Observable<Array<any>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    public readonly today: Date = new Date();

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private router: Router,
        private store: Store<fromStoreCatalogue.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$log: LogService,
        private _$storeCatalogueApi: StoreCatalogueApiService,
        public translate: TranslateService,
        private sanitizer: DomSanitizer
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
        
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Inventory',
                        translate: 'BREADCRUMBS.INVENTORY'
                    },
                    {
                        title: 'In-Store Inventory',
                        translate: 'BREADCRUMBS.IN_STORE_INVENTORY',
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
        this.search = new FormControl('' , [
            Validators.required,
            control => {
                const value = control.value;
                const sanitized = !!this.sanitizer.sanitize(SecurityContext.HTML, value);

                if (sanitized) {
                    return null;
                } else {
                    if (value.length === 0) {
                        return null;
                    } else {
                        return { unsafe: true };
                    }
                }
            }
        ]);

        this.paginator.pageSize = environment.pageSize;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        // .pipe(
        //     filter(source => source.length > 0),
        //     delay(1000),
        //     startWith(this._$merchantApi.initBrandStore())
        // );

        this.dataSource$ = this.store
                            .select(StoreCatalogueSelectors.getAllStoreCatalogue)
                            .pipe(
                                takeUntil(this._unSubs$)
                            );
        this.totalDataSource$ = this.store
                                .select(StoreCatalogueSelectors.getTotalStoreCatalogue)
                                .pipe(
                                    takeUntil(this._unSubs$)
                                );
        this.isLoading$ = this.store.select(StoreCatalogueSelectors.getIsLoading)
                                .pipe(
                                    takeUntil(this._unSubs$)
                                );

        this.initTable();

        this.search.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(() => {
                this.onRefreshTable();
            });

        // this.store
        //     .select(StoreSelectors.getIsRefresh)
        //     .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
        //     .subscribe(isRefresh => {
        //         if (isRefresh) {
        //             this.onRefreshTable();
        //         }
        //     });
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
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());
        // this.store.dispatch(StoreActions.resetStore());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    openStoreHistoryInventories(id: string): void {
        this.store.dispatch(
            StoreCatalogueActions.setSelectedStoreCatalogue({
                payload: id
            })
        );

        this.router.navigate([
            '/pages/in-store-inventories/' + id + '/detail'
        ]);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this.initTable();
    }
// 
    private initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || environment.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        // if (this.sort.direction) {
        //     data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        //     data['sortBy'] = this.sort.active;
        // }

        data['sort'] = 'desc';
        data['sortBy'] = 'id';

        if (this.search.status === 'VALID') {
            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: this.search.value
                }
            ];
        }

        this.store.dispatch(
            StoreCatalogueActions.fetchStoreCataloguesRequest({
                payload: data
            })
        );
    }
}
