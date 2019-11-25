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
import { MatDialog, MatTable } from '@angular/material';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material';
import { GeneratorService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, debounceTime, tap } from 'rxjs/operators';

import { IQueryParams } from 'app/shared/models';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { statusCatalogue } from './status';
import { CataloguesService } from './services';

import { Catalogue } from './models';

import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive/catalogues-active-inactive.component';
// import { CataloguesBlockComponent } from './catalogues-block/catalogues-block.component';
import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock/catalogues-edit-price-stock.component';
import { CataloguesRemoveComponent } from './catalogues-remove/catalogues-remove.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { CatalogueActions } from './store/actions';
import { fromCatalogue } from './store/reducers';
import { CatalogueSelectors } from './store/selectors';

@Component({
  selector: 'app-catalogues',
  templateUrl: './catalogues.component.html',
  styleUrls: ['./catalogues.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {

    dataSource: MatTableDataSource<Catalogue>;
    displayedColumns = [
        // 'checkbox',
        'name',
        'sku',
        // 'variant',
        'price',
        'stock',
        // 'sales',
        'actions'
    ];
    hasSelected: boolean;
    search: FormControl;
    statusCatalogue: any;

    dataSource$: Observable<Array<Catalogue>>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

  constructor(
    private store: Store<fromCatalogue.FeatureState>,
    private _fuseNavigationService: FuseNavigationService,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _$catalogue: CataloguesService,
    private _$generate: GeneratorService,
    private matDialog: MatDialog,
    public translate: TranslateService,
  ) {
    this.store.dispatch(
        UiActions.createBreadcrumb({
            payload: [
                {
                    title: 'Home',
                    translate: 'BREADCRUMBS.HOME'
                },
                {
                    title: 'Catalogue',
                    translate: 'BREADCRUMBS.CATALOGUE'
                },
                {
                    title: 'Manage Product',
                    translate: 'BREADCRUMBS.MANAGE_PRODUCT',
                    active: true
                }
            ]
        })
    );
    this.statusCatalogue = statusCatalogue;

    // Set default first status active
    this.store.dispatch(
        UiActions.setCustomToolbarActive({
            payload: 'all-type'
        })
    );

    this.store.select(
        UiSelectors.getCustomToolbarActive
    ).pipe(
        distinctUntilChanged(),
        takeUntil(this._unSubs$)
    ).subscribe(index => {
        console.log('INDEX', index);
        if (index === 'all-type') {
            this.dataSource$ = this.store.select(CatalogueSelectors.getAllCatalogues);
        } else if (index === 'live') {
            this.dataSource$ = this.store.select(CatalogueSelectors.getLiveCatalogues);
        } else if (index === 'empty') {
            this.dataSource$ = this.store.select(CatalogueSelectors.getEmptyStockCatalogues);
        } else if (index === 'blocked') {
            this.dataSource$ = this.store.select(CatalogueSelectors.getBlockedCatalogues);
        } else if (index === 'inactive') {
            this.dataSource$ = this.store.select(CatalogueSelectors.getInactiveCatalogues).pipe(
                tap(catalogues => console.log(catalogues))
            );
        }
    });

    this._fuseNavigationService.register('customNavigation', this.statusCatalogue);
    this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

    this.store.dispatch(UiActions.showCustomToolbar());
    this.store.dispatch(CatalogueActions.fetchTotalCatalogueStatusRequest());
    this.store.select(
        CatalogueSelectors.getAllTotalCatalogue
    ).pipe(
        takeUntil(this._unSubs$)
    ).subscribe(payload => {
        const newNavigations = this._$catalogue
                                    .getCatalogueStatuses({
                                        allCount: payload.totalAllStatus,
                                        liveCount: payload.totalActive,
                                        emptyCount: payload.totalEmptyStock,
                                        blockedCount: payload.totalEmptyStock
                                    });
        
        if (Array.isArray(Object.keys(newNavigations))) {
            for (const [idx, navigation] of Object.keys(newNavigations).entries()) {
                this._fuseNavigationService.updateNavigationItem(statusCatalogue[idx].id, { title: newNavigations[navigation] }, 'customNavigation');
            }
        }
    });
  }

  // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.store.dispatch(UiActions.showCustomToolbar());
        // this.translate.set('STATUS.CATALOGUE.ALL_PARAM.TITLE', 'Semua 222', 'id');
        // this.translate.set('STATUS.CATALOGUE.ALL_PARAM.TITLE', 'Semua 222', 'en');
        // console.log(this._fuseNavigationService.getNavigationItem('all-type', this._fuseNavigationService.getNavigation('customNavigation')));
        
        // this._unSubs$ = new Subject<void>();
        this.search = new FormControl('');
        this.hasSelected = false;

        this.dataSource$ = this.store.select(CatalogueSelectors.getAllCatalogues);
        this.isLoading$ = this.store.select(CatalogueSelectors.getIsLoading);
        
        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000)
            ).subscribe(value => {
                this.onRefreshTable();
            });

        this.initTable();
        // Need for demo
        // this.store
        //     .select(CatalogueSelectors.getAllCatalogues)
        //     .pipe(takeUntil(this._unSubs$))
        //     .subscribe(source => {
        //         this.dataSource = new MatTableDataSource(source);
        //     });

        // this.store.select([
        //     CatalogueSelectors.getAllCatalogues,
        //     CatalogueSelectors.getBlockedCatalogues,
        //     CatalogueSelectors.getEmptyStockCatalogues,
        //     CatalogueSelectors.getLiveCatalogues
        // ]).pipe(takeUntil(this._unSubs$));

        // this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
        this.paginator.pageSize = 10;

        // this._$catalogue.getCatalogueStatuses({ allCount: 40, blockedCount: 5, emptyCount: 10, liveCount: 25 });
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
        this._fuseNavigationService.unregister('customNavigation');
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());
        
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get totalDataSource$(): Observable<number> {
        return this.store.pipe(
            select(CatalogueSelectors.getTotalCatalogue),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this.store.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: data
            })
        );

        // this.table.nativeElement.scrollIntoView();
    }

    onDelete(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmRemoveCatalogue({ payload: item }));
    }

    setActive(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToActive({ payload: item }));
        // this.matDialog.open(CataloguesActiveInactiveComponent, {
        //     data: {
        //         mode: 'active',
        //         catalogue: item
        //     }
        // });
    }

    onBlock(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
        // this.matDialog.open(CataloguesBlockComponent, {
        //     data: {
        //         catalogue: item
        //     }
        // });
    }

    setInactive(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
        // this.matDialog.open(CataloguesActiveInactiveComponent, {
        //     data: {
        //         mode: 'inactive',
        //         catalogue: item
        //     }
        // });
    }

    onImportProduct() {
        // this.matDialog.open(CataloguesImportComponent, {
        //     data: {
        //         title: 'Import'
        //     }
        // });
    }

    editCatalogue(editMode: 'price' | 'stock', catalogue: Catalogue): void {
        this.matDialog.open(CataloguesEditPriceStockComponent, {
            data: {
                catalogueId: catalogue.id,
                editMode,
                price: catalogue.suggestRetailPrice,
                stock: catalogue.stock
            },
            disableClose: false
        });
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
            limit: this.paginator.pageSize || 10,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            
            if (this.sort.active === 'price') {
                data['sortBy'] = 'suggest_retail_price';
            } else {
                data['sortBy'] = this.sort.active;
            }
        }

        if (this.search.value) {
            const query = this.search.value;

            data['search'] = [
                {
                    fieldName: 'name',
                    keyword: query
                }
            ];
        }

        this.store.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: data
            })
        );
    }
}
