import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    AfterViewInit
} from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store as NgRxStore } from '@ngrx/store';
import { IQueryParams, Role } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import * as moment from 'moment';
import { Observable, Subject, merge, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap, withLatestFrom, filter } from 'rxjs/operators';

// import { StoreCatalogue } from '../models';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from 'app/navigation/i18n/id';

/**
 * ACTIONS
 */
import {
    StoreCatalogueActions,
} from '../store/actions';

/**
 * REDUCERS
 */
import {
    fromStoreCatalogue,
} from '../store/reducers';

/**
 * SELECTORS
 */
import {
    StoreCatalogueSelectors,
} from '../store/selectors';
// import { StoreSelectors } from '../../accounts/merchants/store/selectors';
import { MerchantSelectors } from '../../attendances/store/selectors';
import { MerchantActions } from '../../attendances/store/actions';
import { fromMerchant } from '../../accounts/merchants/store/reducers';
import { Store, Catalogue } from '../models';
import { StoreHistoryInventory } from '../models/store-catalogue.model';
import { fromCatalogue } from '../../catalogues/store/reducers';
import { CatalogueActions } from '../../catalogues/store/actions';
import { CatalogueSelectors } from '../../catalogues/store/selectors';
import { AuthSelectors } from '../../core/auth/store/selectors';

@Component({
    selector: 'app-catalogue-detail',
    templateUrl: './catalogue-detail.component.html',
    styleUrls: ['./catalogue-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogueDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    storeId: string;
    catalogueId: string;
    storeCatalogueId: string;

    /** Untuk menyimpan data store yang dipilih berdasarkan Store History Inventories-nya. */
    selectedStore: Store;
    /** Untuk menyimpan katalog yang terpilih berdasarkan Store History Inventories-nya. */
    selectedCatalogue: Catalogue;
    /** Untuk Array StoreHistoryInventory dari StoreCatalogue yang dipilih. */
    catalogueHistories: Array<StoreHistoryInventory>;
    /** Observable untuk mendapatkan jumlah data keseluruhan untuk aktivitas karyawan. */
    totalCatalogueHistories$: Observable<number>;

    /** Field-field table yang akan ditampilkan di view. */
    public displayedColumns = [
        'skuName',
        'skuId',
        'price',
        'addition',
        'subtraction',
        'stockOnHand',
        'stockType',
        'condition',
        'employeeName',
        'role',
        'date',
        // 'actions',
    ];

    /** Paginator untuk tabel aktivitas karyawan. */
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    /** Sort untuk tabel aktivitas karyawan. */
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    /** Observable untuk status loading dari state-nya Store. */
    isStoreLoading$: Observable<boolean>;
    /** Observable untuk status loading dari state-nya Store History Inventories. */
    isHistoryLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        // private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        // private _fromUser: NgRxStore<fromUser.FeatureState>,
        private _fromCatalogue: NgRxStore<fromCatalogue.FeatureState>,
        private _fromMerchant: NgRxStore<fromMerchant.FeatureState>,
        private _fromStoreCatalogue: NgRxStore<fromStoreCatalogue.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        /** Ambil dari URL. */
        this.storeCatalogueId = this.route.snapshot.params.id;

        this._fromStoreCatalogue.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Inventory',
                        translate: 'BREADCRUMBS.INVENTORY',
                        url: '/pages/in-store-inventories'
                    },
                    {
                        title: 'In-Store Inventory',
                        translate: 'BREADCRUMBS.IN_STORE_INVENTORY',
                        active: true
                    }
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        /** Inisialisasi Subject untuk auto-unsubscribe. */
        this._unSubs$ = new Subject<void>();

        /** Menentukan maksimal jumlah data yang ditampilkan pada tabel. */
        this.paginator.pageSize = environment.pageSize;

        /** Mendapatkan status loading dari Store Catalogue Histories. */
        this.isHistoryLoading$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getIsLoading)
            .pipe(
                takeUntil(this._unSubs$)
            );

        this._fromStoreCatalogue.select(StoreCatalogueSelectors.getAllCatalogueHistory)
            .pipe(
                takeUntil(this._unSubs$)
            ).subscribe(histories => {
                if (histories.length > 0) {
                    this.catalogueHistories = histories;
                }
            });

        combineLatest([
            this._fromStoreCatalogue.select(StoreCatalogueSelectors.getAllStoreCatalogue),
            this._fromStoreCatalogue.select(StoreCatalogueSelectors.getSelectedStoreCatalogue)
        ]).pipe(
                withLatestFrom(
                    this._fromStoreCatalogue.select(AuthSelectors.getUserSupplier)
                ),
                takeUntil(this._unSubs$)
            ).subscribe(([[storeCatalogues, selectedStoreCatalogue], userSupplier]) => {
                /** Jika tidak ada data user supplier di state. */
                if (!userSupplier) {
                    return this._fromStoreCatalogue.dispatch(
                        StoreCatalogueActions.fetchStoreCatalogueHistoriesFailure({
                            payload: {
                                id: 'fetchStoreCatalogueHistoriesFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                /** Jika belum ada store catalogue yang terpilih. */
                if (!selectedStoreCatalogue) {
                    /** Ambil dari URL. */
                    this.storeCatalogueId = this.route.snapshot.params.id;
                    /** Mengambil data Store Catalogue dari state. */
                    const cachedStoreCatalogue = storeCatalogues.filter(sc => sc.id === this.storeCatalogueId)[0];

                    /** Jika belum ada, maka lakukan request dan masukkan ke dalam state. */
                    if (!cachedStoreCatalogue) {
                        return this._fromStoreCatalogue.dispatch(
                            StoreCatalogueActions.fetchStoreCatalogueRequest({ payload: this.storeCatalogueId })
                        );
                    } else {
                        /** Set seleectedStoreCatalogue berdasarkan ID dari URL. */
                        return this._fromStoreCatalogue.dispatch(
                            StoreCatalogueActions.setSelectedStoreCatalogue({ payload: this.storeCatalogueId })
                        );
                    }
                } else {
                    /** Mengambil ID Supplier dari Store Catalogue yang terpilih. */
                    const selectedSupplierStore = selectedStoreCatalogue.store.supplierStores
                                                .filter(supplierStore => supplierStore.supplierId === userSupplier.supplierId);

                    /** Jika Store Catalogue yang terpilih tidak sesuai dengan ID Supplier user-nya, maka tidak diperbolehkan untuk melihatnya. */
                    if (selectedSupplierStore.length === 0) {
                        return this._fromStoreCatalogue.dispatch(
                                StoreCatalogueActions.fetchStoreCatalogueHistoriesFailure({
                                payload: {
                                    id: 'fetchStoreCatalogueHistoriesFailure',
                                    errors: 'Not found'
                                }
                            }
                        ));
                    }

                    this.selectedStore = selectedStoreCatalogue.store;
                    this.selectedCatalogue = selectedStoreCatalogue.catalogue;
                    this.onChangePage();
                }
            });

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalCatalogueHistories$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getTotalCatalogueHistory)
            .pipe(
                takeUntil(this._unSubs$)
            );
    }

    ngAfterViewInit(): void {
        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.onChangePage();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._fromStoreCatalogue.dispatch(
            UiActions.createBreadcrumb({
                payload: null
            })
        );

        if (this._unSubs$) {
            this._unSubs$.next();
            this._unSubs$.complete();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public onChangePage(): void {
        /** Menyiapkan parameter untuk query string saat request ke back-end. */
        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        /** Menyalakan opsi pagination ke back-end. */
        data['paginate'] = true;

        /** Mengambil ID dari parameter URL dan dikirim ke back-end untuk mengambil data attendance berdasarkan tokonya. */
        data['storeCatalogueId'] = this.storeCatalogueId;

        /** Mengambil arah sortir dan data yang ingin disotir. */
        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        } else {
            data['sort'] = 'desc';
            data['sortBy'] = 'created_at';
        }

        /** Melakukan request dengan membawa query string yang telah disiapkan. */
        this._fromStoreCatalogue.dispatch(
            StoreCatalogueActions.fetchStoreCatalogueHistoriesRequest({
                payload: data
            })
        );
    }

    // public getAttendanceType(attendanceType: any): string {
    //     return Attendance.getAttendanceType(attendanceType);
    // }

    // public getLocationType(locationType: any): string {
    //     return Attendance.getLocationType(locationType);
    // }

    // public openEmployeeAttendanceDetail(data: Attendance): void {
    //     this._fromUser.dispatch(
    //         UserActions.setSelectedUser({ payload: data.user })
    //     );

    //     this.router.navigate([
    //         `/pages/attendances/${this.storeId}/employee/${data.user.id}/detail`
    //     ]);
    // }
    hasDiscountPrice(catalogue: Catalogue): boolean {
        return Catalogue.hasDiscountPrice(catalogue);
    }

    getCataloguePrice(catalogue: Catalogue): number {
        return Catalogue.getCataloguePrice(catalogue);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
