import { Location } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { CatalogueActions } from 'app/main/pages/catalogues/store/actions';
import { CatalogueSelectors } from 'app/main/pages/catalogues/store/selectors';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Warehouse } from '../../warehouse-coverages/models/warehouse-coverage.model';
import { WarehouseCatalogue } from '../models/warehouse-catalogue.model';
import { SkuAssignmentsActions, WarehouseCatalogueActions } from '../store/actions';
import { FeatureState as SkuAssignmentCoreFeatureState } from '../store/reducers';
import { SkuAssignmentsSelectors, WarehouseCatalogueSelectors } from '../store/selectors';

@Component({
    selector: 'app-sku-assignment-detail',
    templateUrl: './sku-assignment-detail.component.html',
    styleUrls: ['./sku-assignment-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkuAssignmentDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'List Product',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.truncateTable();
                this.onRefreshTable(value);
            },
        },
    };
    displayedColumns: string[] = [
        'indexNumber',
        'sinbadSku',
        'productName',
        'skuStatus',
        'actions',
    ];

    selectedWarehouse: Warehouse;

    subs$: Subject<void> = new Subject<void>();
    isLoading$: Observable<boolean>;
    dataSource$: Observable<WarehouseCatalogue[]>;
    totalDataSource$: Observable<number>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private store: NgRxStore<SkuAssignmentCoreFeatureState>,
        private router: Router,
        private location: Location,
        private ngxPermissions: NgxPermissionsService
    ) {
        // Memuat breadcrumb.
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Warehouse',
                    },
                    {
                        title: 'SKU Assignment',
                        keepCase: true,
                    },
                    {
                        title: 'SKU Assignment Detail',
                        active: true,
                        keepCase: true,
                    },
                ],
            })
        );
    }

    private truncateTable(): void {
        this.store.dispatch(WarehouseCatalogueActions.resetWarehouseCatalogue());
    }

    private onRefreshTable(search: string = ''): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.paginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const query: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            // Menyalakan pagination.
            query['paginate'] = true;
            query['keyword'] = search;

            // Menentukan ID warehouse yang terpilih.
            query['warehouseId'] = this.selectedWarehouse.id;

            // Melakukan request store ke server via dispatch state.
            this.store.dispatch(
                WarehouseCatalogueActions.fetchWarehouseCataloguesRequest({ payload: query })
            );
        }
    }

    goBack(): void {
        this.location.back();
    }

    onEditSkuAssignment(): void {
        this.store.dispatch(
            SkuAssignmentsActions.selectWarehouse({
                payload: this.selectedWarehouse,
            })
        );

        this.router.navigate([
            '/pages/logistics/sku-assignments/' + this.selectedWarehouse.id + '/edit',
        ]);
    }

    setActive(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToActive({ payload: item }));
    }

    setInactive(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
    }

    ngOnInit(): void {
        this.ngxPermissions.hasPermission(['WH.SKU.UPDATE', 'WH.SKU.DELETE']).then((result) => {
            // Jika ada permission-nya.
            if (result) {
                this.displayedColumns = [
                    'indexNumber',
                    'sinbadSku',
                    'productName',
                    'skuStatus',
                    'actions',
                ];
            } else {
                this.displayedColumns = ['indexNumber', 'sinbadSku', 'productName', 'skuStatus'];
            }
        });

        this.store
            .select(CatalogueSelectors.getRefreshStatus)
            .pipe(takeUntil(this.subs$))
            .subscribe((needRefresh) => {
                if (needRefresh) {
                    this.truncateTable();
                    this.onRefreshTable();

                    this.store.dispatch(
                        CatalogueActions.setRefreshStatus({
                            status: false,
                        })
                    );
                }
            });

        this.isLoading$ = combineLatest([
            this.store.select(CatalogueSelectors.getIsLoading),
            this.store.select(WarehouseCatalogueSelectors.getLoadingState),
        ]).pipe(
            map((loadings) => loadings.includes(true)),
            takeUntil(this.subs$)
        );

        this.dataSource$ = this.store
            .select(WarehouseCatalogueSelectors.selectAll)
            .pipe(takeUntil(this.subs$));

        this.totalDataSource$ = this.store
            .select(WarehouseCatalogueSelectors.getTotalItem)
            .pipe(takeUntil(this.subs$));

        this.store
            .select(SkuAssignmentsSelectors.getSelectedWarehouse)
            .pipe(takeUntil(this.subs$))
            .subscribe((warehouse: Warehouse) => {
                this.selectedWarehouse = warehouse;

                this.truncateTable();
                this.onRefreshTable();
            });
    }

    ngAfterViewInit(): void {
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                this.truncateTable();
                this.onRefreshTable();
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(WarehouseCatalogueActions.resetWarehouseCatalogue());
    }
}
