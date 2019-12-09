import { environment } from 'environments/environment';
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
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, debounceTime } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { SupplierInventoryActions } from './store/actions';
import { fromSupplierInventory } from './store/reducers';
import { SupplierInventorySelectors } from './store/selectors';

@Component({
    selector: 'app-supplier-inventories',
    templateUrl: './supplier-inventories.component.html',
    styleUrls: ['./supplier-inventories.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierInventoriesComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    search: FormControl;
    displayedColumns = [
        'id',
        'product-name',
        'brand-name',
        'stock-type',
        'stock',
        'stock-en-route',
        'actions'
    ];
    hasSelected: boolean;
    today = new Date();

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void>;

    constructor(
        private store: Store<fromSupplierInventory.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
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
                        title: 'Inventory',
                        translate: 'BREADCRUMBS.INVENTORY'
                    },
                    {
                        title: 'Supplier Inventory',
                        translate: 'BREADCRUMBS.SUPPLIER_INVENTORY',
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
        this.hasSelected = false;
        this.paginator.pageSize = this.defaultPageSize;

        this.dataSource$ = this.store.select(SupplierInventorySelectors.getAllSupplierInventory);
        this.totalDataSource$ = this.store.select(
            SupplierInventorySelectors.getTotalSupplierInventory
        );
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(SupplierInventorySelectors.getIsLoading);

        this.initTable();

        this.search.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(v => {
                this.onRefreshTable();
            });

        this.store
            .select(SupplierInventorySelectors.getIsRefresh)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe(isRefresh => {
                if (isRefresh) {
                    this.onRefreshTable();
                }
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
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // localStorage.removeItem('filter.payment.status');

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(SupplierInventoryActions.resetSupplierInventories());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);

        this.table.nativeElement.scrollIntoView();
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
    }

    safeValue(item: any): any {
        return item ? item : '-';
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
                    fieldName: 'name',
                    keyword: query
                }
            ];
        }

        this.store.dispatch(
            SupplierInventoryActions.fetchSupplierInventoriesRequest({ payload: data })
        );
    }
}
