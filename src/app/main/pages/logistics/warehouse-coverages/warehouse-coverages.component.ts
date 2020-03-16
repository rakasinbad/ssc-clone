import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    OnDestroy,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { MatPaginator, MatSort, MatRadioChange, MatTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Observable, Subject, merge, of } from 'rxjs';
import { UiSelectors } from 'app/shared/store/selectors';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions, WarehouseActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';

import * as fromWarehouseCoverages from './store/reducers';
import { tap, takeUntil, map, switchMap } from 'rxjs/operators';
import { Warehouse } from '../warehouses/models';
import { SelectedLocation } from 'app/shared/components/geolocation/models/selected-location.model';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { NotCoveredWarehouse } from './models/not-covered-warehouse.model';
import { WarehouseCoverage } from './models/warehouse-coverage.model';
import { WarehouseCoverageSelectors } from './store/selectors';
import { WarehouseCoverageActions } from './store/actions';

@Component({
    selector: 'app-warehouse-coverages',
    templateUrl: './warehouse-coverages.component.html',
    styleUrls: ['./warehouse-coverages.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;
    displayedColumns: Array<string> = [
        'province', 'city', 'district', 'urban', 'actions'
    ];

    // tslint:disable-next-line: no-inferrable-types
    isFilterApplied: boolean = false;

    isLoading$: Observable<boolean>;
    warehouses$: Observable<Array<Warehouse>>;
    coverages$: Observable<Array<WarehouseCoverage> | Array<NotCoveredWarehouse>>;
    totalCoverages$: Observable<number>;
    selectedWarehouse: Warehouse;
    selectedLocation: SelectedLocation;
    // tslint:disable-next-line: no-inferrable-types
    selectedAreaCoverage: string = 'covered';

    // tslint:disable-next-line: no-inferrable-types
    selectedViewBy: string = 'warehouse';

    // buttonViewByActive$: Observable<string>;
    subs$: Subject<void> = new Subject<void>();

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse Coverage'
        },
        search: {
            active: false
        },
        add: {
            permissions: []
        },
        // export: {
        //     permissions: ['SRM.JP.EXPORT'],
        //     useAdvanced: true,
        //     pageType: 'journey-plans'
        // },
        // import: {
        //     permissions: ['SRM.JP.IMPORT'],
        //     useAdvanced: true,
        //     pageType: 'journey-plans'
        // }
    };

    // ViewChild untuk tabel.
    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    // ViewChild untuk MatPaginator.
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    // ViewChild untuk MatSort.
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Logistics'
        },
        {
            title: 'Warehouse Coverage',
            active: true
        }
    ];

    constructor(
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private store: Store<fromWarehouseCoverages.FeatureState>
    ) {
        this.isLoading$ = this.store.select(
            WarehouseCoverageSelectors.getIsLoading
        ).pipe(
            takeUntil(this.subs$)
        );

        this.warehouses$ = this.store.select(
            WarehouseSelectors.selectAll
        ).pipe(
            takeUntil(this.subs$)
        );

        this.coverages$ = this.store.select(
            WarehouseCoverageSelectors.selectAll
        ).pipe(
            switchMap(coverages => {
                if (this.selectedViewBy === 'area') {
                    return of(coverages as Array<WarehouseCoverage>);
                } else {
                    return of(coverages as Array<NotCoveredWarehouse>);
                }
            }),
            takeUntil(this.subs$)
        );

        this.totalCoverages$ = this.store.select(
            WarehouseCoverageSelectors.selectTotal
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    private truncateTable(): void {
        this.store.dispatch(
            WarehouseCoverageActions.truncateWarehouseCoverages()
        );
    }

    private onRefreshTable(): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.paginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            if (this.selectedViewBy === 'warehouse') {
                data['viewBy'] = 'warehouse';
                data['warehouseId'] = this.selectedWarehouse.id;
            } else if (this.selectedViewBy === 'area') {
                data['viewBy'] = 'area';
                data['type'] = this.selectedAreaCoverage;

                // Mengambil location yang telah dipilih.
                data['province'] = this.selectedLocation.province.name;
                data['city'] = this.selectedLocation.city;
                data['district'] = this.selectedLocation.district;
                data['urban'] = this.selectedLocation.urban.urban;
            }


            // if (this.sort.direction) {
            //     // Menentukan sort direction tabel.
            //     data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';

            //     // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
            //     if (this.sort.active === 'code') {
            //         data['sortBy'] = 'store_code';
            //     }
            // } else {
            //     // Sortir default jika tidak ada sort yang aktif.
            //     data['sort'] = 'desc';
            //     data['sortBy'] = 'id';
            // }

            // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
            // const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
            // // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
            // if (searchValue) {
            //     data['search'] = [
            //         {
            //             fieldName: 'code',
            //             keyword: searchValue
            //         },
            //         {
            //             fieldName: 'name',
            //             keyword: searchValue
            //         }
            //     ];
            // }

            // Melakukan request store ke server via dispatch state.
            this.store.dispatch(
                WarehouseCoverageActions.fetchWarehouseCoveragesRequest({ payload: data })
            );
        }
    }

    onApplyFilter(): void {
        if (this.selectedViewBy === 'warehouse') {
            this.isFilterApplied = true;
            this.truncateTable();
            this.onRefreshTable();
        } else if (this.selectedViewBy === 'area') {
            this.isFilterApplied = true;
            this.truncateTable();
            this.onRefreshTable();
        }
    }

    onOpenWarehouseDetail(id: string): void {
        this.router.navigate(['/pages/logistics/warehouses/' + id + '/detail']);
    }

    ngOnInit(): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );

        this.store.dispatch(
            WarehouseActions.fetchWarehouseRequest({
                payload: {
                    paginate: false
                }
            })
        );
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel.
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.onRefreshTable();
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.store.dispatch(WarehouseCoverageActions.truncateWarehouseCoverages());
    }

    onEditWarehouseCoverage(item: WarehouseCoverage | NotCoveredWarehouse): void {
        if (item instanceof WarehouseCoverage) {
            this.store.dispatch(
                WarehouseCoverageActions.selectWarehouse({
                    payload: (item as WarehouseCoverage).warehouseId
                })
            );
        }

        this.router.navigate(['/pages/logistics/warehouse-coverages/' + (item as WarehouseCoverage).warehouseId + '/edit']);
    }

    onSelectedLocation($event: SelectedLocation): void {
        this.debug('onSelectedLocation', $event);

        if ($event.province && $event.city && $event.district && $event.urban) {
            this.isFilterApplied = false;
            this.selectedLocation = $event;
        } else {
            this.isFilterApplied = true;
            this.selectedLocation = null;
        }

        this.cdRef.markForCheck();
    }

    onSelectedWarehouse(warehouse: Warehouse): void {
        this.selectedWarehouse = warehouse;
        this.isFilterApplied = false;
        this.cdRef.markForCheck();
    }

    onSelectedAreaCoverage($event: number): void {
        if ($event === 0) {
            this.selectedAreaCoverage = 'covered';

            this.truncateTable();
        } else if ($event === 1) {
            this.selectedAreaCoverage = 'not_covered';

            this.truncateTable();
        }

        const { province, city, district, urban } = this.selectedLocation;
        if (province && city && district && urban) {
            this.onRefreshTable();
        } else {
            this.isFilterApplied = true;
        }

        this.cdRef.markForCheck();
    }

    onChangedViewBy($event: MatRadioChange): void {
        this.selectedViewBy = $event.value;
        this.isFilterApplied = true;

        if (this.selectedViewBy === 'area') {
            this.displayedColumns = [
                'wh-name', 'province', 'city', 'district', 'urban'
            ];
        } else if (this.selectedViewBy === 'warehouse') {
            this.displayedColumns = [
                'province', 'city', 'district', 'urban', 'actions'
            ];
        }

        this.truncateTable();
        this.cdRef.markForCheck();
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/warehouse-coverages/new');
    }

    clickTabViewBy(action: string): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'warehouse-coverage-main':
                this.store.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'warehouse-coverage-main' })
                );
                break;
            case 'warehouse-covearge-urban':
                this.store.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'warehouse-covearge-urban' })
                );
                break;

            default:
                return;
        }
    }
}
