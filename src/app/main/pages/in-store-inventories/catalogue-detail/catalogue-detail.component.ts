import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { select, Store as NgRxStore } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { IQueryParams, Role } from 'app/shared/models';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';

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

@Component({
    selector: 'app-catalogue-detail',
    templateUrl: './catalogue-detail.component.html',
    styleUrls: ['./catalogue-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogueDetailComponent implements OnInit, OnDestroy {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    /** Menyimpan ID store yang sedang dibuka. */
    storeId: string;
    /** Menyimpan ID catalogue yang sedang dibuka. */
    catalogueId: string;

    selectedStore$: Observable<any>;
    /** Observable untuk Store yang dipilih dari halaman depan. */
    selectedCatalogue$: Observable<any>;
    /** Observable untuk Array Attendance dari store yang dipilih. */
    catalogueHistories$: Observable<Array<any>>;
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

    /** Filter untuk tabel aktivitas karyawan. */
    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    /** Observable untuk status loading dari state-nya Attendance. */
    isHistoryLoading$: Observable<boolean>;
    /** Observable untuk status loading dari state-nya Store. */
    // isStoreLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        // private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        // private _fromMerchant: NgRxStore<fromMerchant.FeatureState>,
        // private _fromUser: NgRxStore<fromUser.FeatureState>,
        private _fromStoreCatalogue: NgRxStore<fromStoreCatalogue.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        /** Mendapatkan ID dari route (parameter URL) */
        const { catalogueId, storeId } = this.route.snapshot.params;

        /** Menyimpan ID catlaogue dan store-nya. */
        this.catalogueId = catalogueId;
        this.storeId = storeId;

        /** Melakukan request data Store berdasarkan ID nya melalui dispatch action. */
        this._fromStoreCatalogue.dispatch(StoreCatalogueActions.fetchStoreCatalogueRequest({
            payload: catalogueId
        }));

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
        this.paginator.pageSize = 5;

        /** Mendapatkan status loading dari store-nya Attendance. */
        this.isHistoryLoading$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getIsLoading)
        .pipe(
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan status loading dari store-nya Store. */
        // this.isStoreLoading$ = this._fromMerchant.select(MerchantSelectors.getIsLoading)
        // .pipe(
        //     distinctUntilChanged(),
        //     takeUntil(this._unSubs$)
        // );
        this.selectedStore$ = this._fromStoreCatalogue.select(MerchantSelectors.getMerchant)
        .pipe(
            tap(merchant => {
                return merchant;
            }),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan store yang telah dipilih dari halaman depan. */
        this.selectedCatalogue$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getSelectedStoreCatalogue)
        .pipe(
            map(storeCatalogue => {
                if (storeCatalogue) {
                    // const newMerchant = new Merchant(
                    //     merchant.id,
                    //     merchant.storeCode,
                    //     merchant.name,
                    //     merchant.address,
                    //     merchant.taxNo,
                    //     merchant.longitude,
                    //     merchant.latitude,
                    //     merchant.largeArea,
                    //     merchant.phoneNo,
                    //     merchant.imageUrl,
                    //     merchant.taxImageUrl,
                    //     merchant.status,
                    //     merchant.reason,
                    //     merchant.parent,
                    //     merchant.parentId,
                    //     merchant.numberOfEmployee,
                    //     merchant.externalId,
                    //     merchant.storeTypeId,
                    //     merchant.storeGroupId,
                    //     merchant.storeSegmentId,
                    //     merchant.urbanId,
                    //     merchant.vehicleAccessibilityId,
                    //     merchant.warehouseId,
                    //     merchant.userStores,
                    //     merchant.storeType,
                    //     merchant.storeGroup,
                    //     merchant.storeSegment,
                    //     merchant.urban,
                    //     merchant.storeConfig,
                    //     merchant.createdAt,
                    //     merchant.updatedAt,
                    //     merchant.deletedAt
                    // );

                    return storeCatalogue;
                }

            }),
            tap(storeCatalogue => {
                if (!storeCatalogue) {
                    this._fromStoreCatalogue.dispatch(StoreCatalogueActions.fetchStoreCatalogueRequest({
                        payload: this.catalogueId
                    }));
                }
            }),
            takeUntil(this._unSubs$)

        );

        /** Mendapatkan aktivitas karyawan dari store yang telah dipilih. */
        this.catalogueHistories$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getAllCatalogueHistory)
        .pipe(
            tap(catHistories => {
                if (catHistories.length > 0) {
                    this._fromStoreCatalogue
                    .dispatch(MerchantActions.fetchStoreRequest({
                        payload: catHistories[0].storeCatalogue.storeId
                    }));
                }
            }),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalCatalogueHistories$ = this._fromStoreCatalogue.select(StoreCatalogueSelectors.getTotalCatalogueHistory)
        .pipe(
            takeUntil(this._unSubs$)
        );

        /** Melakukan inisialisasi pertama kali untuk operasi tabel. */
        this.onChangePage();
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
        data['catalogueId'] = this.catalogueId;
        data['storeId'] = this.storeId;

        /** Mengambil arah sortir dan data yang ingin disotir. */
        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        /** Melakukan request dengan membawa query string yang telah disiapkan. */
        this._fromStoreCatalogue.dispatch(
            StoreCatalogueActions.fetchStoreCatalogueHistoriesRequest({
                payload: data
            })
        );
    }

    public getChainRoles(roles: Array<Role>): string {
        // return Attendance.getChainRoles(roles);
        return 'foo';
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
