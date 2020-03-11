import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store, select } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';
import {
    StockManagementReasonActions,
    UiActions,
    WarehouseActions
} from 'app/shared/store/actions';
import {
    StockManagementReasonSelectors,
    WarehouseSelectors
} from 'app/shared/store/selectors/sources';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { Warehouse } from '../../warehouses/models';
import { StockManagementCatalogue } from '../models';
import { StockManagementCatalogueActions } from '../store/actions';
import * as fromStockManagements from '../store/reducers';
import { StockManagementCatalogueSelectors } from '../store/selectors';
import { HelperService } from 'app/shared/helpers';

@Component({
    selector: 'app-stock-management-form',
    templateUrl: './stock-management-form.component.html',
    styleUrls: ['./stock-management-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementFormComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    form: FormGroup;
    pageType: string;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'List SKU'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     this.search.setValue(value);
            //     setTimeout(() => this._onRefreshTable(), 100);
            // }
        },
        // add: {
        //     permissions: []
        // },
        export: {
            permissions: ['OMS.EXPORT']
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: ''
        }
    };
    displayedColumns = [
        'no',
        'sku-id',
        'sku-name',
        'stock-type',
        'qty-change',
        'reason',
        'sellable', // stock
        'after' // column sellable calc with column qty-change
        // 'on-hand',
        // 'final'
    ];

    dataSource = [
        {
            id: '1',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Brown',
            total: 58
        },
        {
            id: '2',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Red',
            total: 51
        },
        {
            id: '3',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL White',
            total: 34
        },
        {
            id: '4',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Black',
            total: 100
        }
    ];

    search: FormControl = new FormControl('');
    stockTypes: { id: boolean; label: string }[] = this._$helper.stockType();

    dataSource$: Observable<Array<StockManagementCatalogue>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    warehouses$: Observable<Array<Warehouse>>;
    stockManagementReasons$: Observable<(method: string) => Array<StockManagementReason>>;
    plusReasons$: Observable<Array<StockManagementReason>>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Stock Management'
        },
        {
            title: 'Update Stock'
        }
    ];

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromStockManagements.FeatureState>,
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

    get skus(): FormArray {
        return this.form.get('skus') as FormArray;
    }

    generateNumber(idx: number): number {
        return this.paginator.pageIndex * this.paginator.pageSize + (idx + 1);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private createSkusForm(source: StockManagementCatalogue): void {
        const row = this.formBuilder.group({
            warehouseCatalogueId: [''],
            unlimitedStock: [{ value: '', disabled: false }],
            qtyChange: [{ value: '', disabled: false }],
            warehouseCatalogueReasonId: [{ value: '', disabled: false }]
        });

        this.skus.push(row);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                const whName = this.form.get('whName').value;

                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable(whName);
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                // Fetch request warehouse
                this.store.dispatch(
                    WarehouseActions.fetchWarehouseRequest({ payload: { paginate: false } })
                );

                // Fetch request stock management reason
                this.store.dispatch(
                    StockManagementReasonActions.fetchStockManagementReasonRequest({
                        payload: { params: { paginate: false }, method: null }
                    })
                );

                const { id } = this.route.snapshot.params;

                if (id === 'new') {
                    this.pageType = 'new';
                } else if (Math.sign(id) === 1) {
                    this.pageType = 'edit';
                } else {
                    this.router.navigateByUrl('/pages/logistics/stock-managements');
                }

                this._initForm();

                if (this.pageType === 'new') {
                    this.form
                        .get('whName')
                        .valueChanges.pipe(
                            debounceTime(1000),
                            filter(v => !!v),
                            takeUntil(this._unSubs$)
                        )
                        .subscribe(v => {
                            this._initTable(v);
                        });
                }

                this.dataSource$ = this.store
                    .select(StockManagementCatalogueSelectors.selectAll)
                    .pipe(
                        tap(data => {
                            if (data && data.length > 0) {
                                data.forEach(v => this.createSkusForm(v));
                            }
                        })
                    );
                this.totalDataSource$ = this.store.select(
                    StockManagementCatalogueSelectors.getTotalItem
                );
                this.isLoading$ = this.store.select(StockManagementCatalogueSelectors.getIsLoading);

                this.warehouses$ = this.store.select(WarehouseSelectors.selectAll);
                this.stockManagementReasons$ = this.store.pipe(
                    select(StockManagementReasonSelectors.getReasons)
                );
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            whName: [''],
            skus: this.formBuilder.array([])
        });
    }

    private _initTable(warehouseId: string): void {
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
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            }

            this.store.dispatch(
                StockManagementCatalogueActions.fetchStockManagementCataloguesRequest({
                    payload: { params: data, warehouseId }
                })
            );
        }
    }

    private _onRefreshTable(warehouseId: string): void {
        this.paginator.pageIndex = 0;
        this._initTable(warehouseId);
    }
}
