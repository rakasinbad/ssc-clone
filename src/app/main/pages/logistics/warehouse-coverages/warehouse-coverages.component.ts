import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatPaginator, MatRadioChange, MatSort, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SelectedLocation } from 'app/shared/components/geolocation/models/selected-location.model';
import { NoticeService, HelperService } from 'app/shared/helpers';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions, WarehouseActions } from 'app/shared/store/actions';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { fromEvent, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Warehouse } from '../warehouses/models';
import { NotCoveredWarehouse } from './models/not-covered-warehouse.model';
import { WarehouseCoverage } from './models/warehouse-coverage.model';
import { WarehouseCoverageActions } from './store/actions';
import * as fromWarehouseCoverages from './store/reducers';
import { WarehouseCoverageSelectors } from './store/selectors';

@Component({
    selector: 'app-warehouse-coverages',
    templateUrl: './warehouse-coverages.component.html',
    styleUrls: ['./warehouse-coverages.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseCoveragesComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Form
    form: FormGroup;

    displayedColumns: Array<string> = ['province', 'city', 'district', 'urban', 'actions'];

    // tslint:disable-next-line: no-inferrable-types
    isFilterApplied: boolean = false;

    // Query params
    queryParamsWarehouseKeyword: string = null;

    isLoading$: Observable<boolean>;
    warehouses$: Observable<Array<Warehouse>>;
    totalWarehouses$: Observable<number>;
    isWarehouseLoading$: Observable<boolean>;
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
            label: 'Warehouse Coverage',
        },
        search: {
            active: false,
        },
        add: {
            permissions: ['WH.C.CREATE'],
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
    pageSize: number;

    // ViewChild untuk tabel.
    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    // ViewChild untuk MatPaginator.
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    // ViewChild untuk MatSort.
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // AutoComplete for Warehouse
    @ViewChild('warehouseAutoComplete', { static: true }) warehouseAutoComplete: MatAutocomplete;

    @ViewChild(MatAutocompleteTrigger, { static: true })
    autocompleteTrigger: MatAutocompleteTrigger;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home',
        },
        {
            title: 'Logistics',
        },
        {
            title: 'Warehouse Coverage',
            active: true,
        },
    ];

    constructor(
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<fromWarehouseCoverages.FeatureState>,
        private notice$: NoticeService,
        private ngxPermissions: NgxPermissionsService,
        private helper$: HelperService,
        private fb: FormBuilder
    ) {
        this.isLoading$ = this.store
            .select(WarehouseCoverageSelectors.getIsLoading)
            .pipe(takeUntil(this.subs$));

        this.warehouses$ = this.store
            .select(WarehouseSelectors.selectAll)
            .pipe(takeUntil(this.subs$));

        this.totalWarehouses$ = this.store
            .select(WarehouseSelectors.getTotalItem)
            .pipe(takeUntil(this.subs$));

        this.isWarehouseLoading$ = this.store
            .select(WarehouseSelectors.getIsLoading)
            .pipe(
                tap((val) => this.debug('IS WAREHOUSE LOADING?', val)),
                takeUntil(this.subs$)
            );

        this.coverages$ = this.store.select(WarehouseCoverageSelectors.selectAll).pipe(
            switchMap((coverages) => {
                if (this.selectedViewBy === 'area') {
                    return of(coverages as Array<WarehouseCoverage>);
                } else {
                    return of(coverages as Array<NotCoveredWarehouse>);
                }
            }),
            takeUntil(this.subs$)
        );

        this.totalCoverages$ = this.store
            .select(WarehouseCoverageSelectors.getTotalItem)
            .pipe(takeUntil(this.subs$));
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
        this.store.dispatch(WarehouseCoverageActions.truncateWarehouseCoverages());
    }

    private onRefreshTable(): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.paginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.pageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            if (this.selectedViewBy === 'warehouse') {
                data['viewBy'] = 'warehouse';
                data['warehouseId'] = this.selectedWarehouse && this.selectedWarehouse.id;
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

    resetTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.defaultPageSize;
        this.onRefreshTable();
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

    processWarehouseAutoComplete(): void {
        // TODO: fix autocompleteTrigger
        // ISSUE: autocompleteTrigger is undefined when search warehouse
        // console.log('FAHRUL WAREHOUSE COVERAGE 1. processWarehouseAutoComplete', {
        //     autocompleteTrigger: this.autocompleteTrigger,
        //     warehouseAutoComplete: this.warehouseAutoComplete
        // })
        if (
            this.autocompleteTrigger &&
            this.warehouseAutoComplete &&
            this.warehouseAutoComplete.panel
        ) {
            fromEvent<Event>(this.warehouseAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() =>
                        console.log(
                            `fromEvent<Event>(this.warehouseAutoComplete.panel.nativeElement, 'scroll')`
                        )
                    ),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total province di back-end dan loading state-nya.
                    withLatestFrom(
                        this.warehouses$,
                        this.totalWarehouses$,
                        this.store.select(WarehouseSelectors.getIsLoading),
                        ($event, warehouses, totalWarehouses, isLoading) => ({
                            $event,
                            warehouses,
                            totalWarehouses,
                            isLoading,
                        })
                    ),
                    // Debugging.
                    tap(() => this.debug('WAREHOUSE IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(
                        ({ isLoading, warehouses, totalWarehouses }) => (
                            !isLoading &&
                            totalWarehouses > warehouses.length &&
                            this.helper$.isElementScrolledToBottom(this.warehouseAutoComplete.panel)
                        )
                    ),
                    takeUntil(
                        this.autocompleteTrigger.panelClosingActions.pipe(
                            tap(() => this.debug('Warehouse is closing ...'))
                        )
                    )
                )
                .subscribe(({ warehouses }) => {
                    const queryParams: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: warehouses.length,
                    };
                    if (this.queryParamsWarehouseKeyword) {
                        queryParams['keyword'] = this.queryParamsWarehouseKeyword;
                    }

                    this.store.dispatch(
                        WarehouseActions.fetchWarehouseRequest({
                            payload: queryParams,
                        })
                    );
                });
        }
    }

    listenWarehouseAutoComplete(): void {
        setTimeout(() => this.processWarehouseAutoComplete());
    }

    displayWarehouse(item: Warehouse): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    ngOnInit(): void {
        this.ngxPermissions.hasPermission(['WH.C.UPDATE']).then((result) => {
            // Jika ada permission-nya.
            if (result) {
                this.displayedColumns = ['province', 'city', 'district', 'urban', 'actions'];
            } else {
                this.displayedColumns = ['province', 'city', 'district', 'urban'];
            }
        });

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );

        this.route.queryParams
            .pipe(
                filter((params) => {
                    const { limit, page_index: pageIndex } = params;

                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        return true;
                    } else {
                        this.resetTable();
                        return false;
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe({
                next: ({ limit, page_index: pageIndex }) => {
                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        this.paginator.pageSize = +limit;
                        this.paginator.pageIndex = +pageIndex;
                    }

                    this.onRefreshTable();
                },
            });

        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false }
            ],
        });

        // Handle Warehouse's Form Control
        (this.form.get('warehouse').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(500),
                distinctUntilChanged(),
                tap(( value: string | Warehouse ) => {
                    this.store.dispatch(WarehouseActions.clearWarehouseState());

                    const queryParams: IQueryParams = {
                        paginate: true,
                        limit: 999,
                        skip: 0,
                    };
                    if (typeof value === 'object') {
                        this.queryParamsWarehouseKeyword = value.name;
                        queryParams['id'] = value.id;
                    } else {
                        this.queryParamsWarehouseKeyword = value;
                        queryParams['keyword'] = value;
                    }

                    this.store.dispatch(
                        WarehouseActions.fetchWarehouseRequest({
                            payload: queryParams,
                        })
                    );
                }),
                takeUntil(this.subs$)
            )
            .subscribe();
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel.
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

        this.store.dispatch(WarehouseCoverageActions.truncateWarehouseCoverages());
    }

    onEditWarehouseCoverage(item: WarehouseCoverage | NotCoveredWarehouse): void {
        if (item instanceof WarehouseCoverage) {
            this.store.dispatch(
                WarehouseCoverageActions.selectWarehouse({
                    payload: (item as WarehouseCoverage).warehouseId,
                })
            );
        }

        this.router.navigate([
            '/pages/logistics/warehouse-coverages/' +
                (item as WarehouseCoverage).warehouseId +
                '/edit',
        ]);
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

    onSelectedWarehouse(event: MatAutocompleteSelectedEvent): void {
        const warehouse: Warehouse = event.option.value;

        if (!warehouse) {
            this.selectedWarehouse = null    
        } else {
            this.selectedWarehouse = warehouse;
        }

        this.isFilterApplied = false;
        this.cdRef.markForCheck();
        this.autocompleteTrigger && this.autocompleteTrigger.closePanel();
    }

    onSelectedAreaCoverage($event: number): void {
        if ($event === 0) {
            this.selectedAreaCoverage = 'covered';

            this.truncateTable();
        } else if ($event === 1) {
            this.selectedAreaCoverage = 'not_covered';

            this.truncateTable();
        }

        if (this.selectedLocation) {
            const { province, city, district, urban } = this.selectedLocation;

            if (province && city && district && urban) {
                this.onRefreshTable();
            } else {
                this.isFilterApplied = true;
            }
        } else {
            this.notice$.open(
                "Please fulfill the warehouse's location to view the coverages",
                'info',
                {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                }
            );
        }

        this.cdRef.markForCheck();
    }

    onChangedViewBy($event: MatRadioChange): void {
        this.selectedViewBy = $event.value;
        this.isFilterApplied = true;

        if (this.selectedViewBy === 'area') {
            this.displayedColumns = ['wh-name', 'province', 'city', 'district', 'urban'];
        } else if (this.selectedViewBy === 'warehouse') {
            this.ngxPermissions.hasPermission(['WH.C.UPDATE']).then((result) => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = ['province', 'city', 'district', 'urban', 'actions'];
                } else {
                    this.displayedColumns = ['province', 'city', 'district', 'urban'];
                }
            });
        }

        this.truncateTable();
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/warehouse-coverages/new');
    }

    onChangePage(ev: PageEvent): void {
        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { limit: ev.pageSize, page_index: ev.pageIndex },
            queryParamsHandling: 'merge',
        });
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
