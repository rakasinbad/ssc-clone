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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { statusCatalogue } from './status';
import { fromCatalogue } from './store/reducers';
import { CatalogueSelectors } from './store/selectors';
import { ICatalogueDemo } from './models';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-catalogues',
  templateUrl: './catalogues.component.html',
  styleUrls: ['./catalogues.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {

    dataSource: MatTableDataSource<ICatalogueDemo>; // Need for demo
    displayedColumns = [
        'checkbox',
        'name',
        'sku',
        'variant',
        'price',
        'stock',
        'sales',
        'actions'
    ];
    hasSelected: boolean;
    statusCatalogue: any;

    dataSource$: Observable<ICatalogueDemo[]>;
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
    public translate: TranslateService
  ) {
    this.dataSource = new MatTableDataSource(); // Need for demo
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
        this.hasSelected = false;

        // Need for demo
        this.store
            .select(CatalogueSelectors.getAllCatalogues)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(source => {
                this.dataSource = new MatTableDataSource(source);
            });

        // this.store.select([
        //     CatalogueSelectors.getAllCatalogues,
        //     CatalogueSelectors.getBlockedCatalogues,
        //     CatalogueSelectors.getEmptyStockCatalogues,
        //     CatalogueSelectors.getLiveCatalogues
        // ]).pipe(takeUntil(this._unSubs$));

        // this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
        // this.paginator.pageSize = 5;
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Need for demo
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

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

    private initTable(): void {}
}
