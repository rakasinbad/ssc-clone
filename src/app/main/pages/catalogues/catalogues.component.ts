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
import { MatDialog } from '@angular/material';
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
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';

import { IQueryParams } from 'app/shared/models';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { statusCatalogue } from './status';


import { Catalogue } from './models';

import { CataloguesActiveInactiveComponent } from './catalogues-active-inactive/catalogues-active-inactive.component';
import { CataloguesBlockComponent } from './catalogues-block/catalogues-block.component';
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
        'checkbox',
        'name',
        'sku',
        // 'variant',
        'price',
        'stock',
        'sales',
        'actions'
    ];
    hasSelected: boolean;
    search: FormControl;
    statusCatalogue: any;

    dataSource$: Observable<Array<Catalogue>>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

  constructor(
    private store: Store<fromCatalogue.FeatureState>,
    private _fuseNavigationService: FuseNavigationService,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
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

    this._fuseNavigationService.register('customNavigation', this.statusCatalogue);

    this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
  }

  // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.store.dispatch(UiActions.showCustomToolbar());
        this._unSubs$ = new Subject<void>();
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
