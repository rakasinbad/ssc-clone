import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit
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
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { IQueryParams, Role } from 'app/shared/models';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';

import { Attendance, Store as Merchant } from '../models';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';

/**
 * ACTIONS
 */
import { AttendanceActions, MerchantActions, UserActions } from '../store/actions';

/**
 * REDUCERS
 */
import { fromAttendance, fromMerchant, fromUser } from '../store/reducers';

/**
 * SELECTORS
 */
import { AttendanceSelectors, MerchantSelectors } from '../store/selectors';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-attendance-store-detail',
    templateUrl: './attendance-store-detail.component.html',
    styleUrls: ['./attendance-store-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceStoreDetailComponent implements AfterViewInit, OnInit, OnDestroy {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    /** Menyimpan ID store yang sedang dibuka. */
    storeId: string;

    /** Observable untuk Store yang dipilih dari halaman depan. */
    selectedStore$: Observable<Merchant>;
    /** Observable untuk Array Attendance dari store yang dipilih. */
    employeesActivities$: Observable<Array<Attendance>>;
    /** Observable untuk mendapatkan jumlah data keseluruhan untuk aktivitas karyawan. */
    totalEmployeesActivities$: Observable<number>;

    /** Field-field table yang akan ditampilkan di view. */
    public displayedColumns = [
        'number',
        'employee',
        'role',
        'attendanceType',
        'locationType',
        'checkDate',
        'checkIn',
        'checkOut',
        'duration',
        'actions'
    ];

    /** Paginator untuk tabel aktivitas karyawan. */
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    /** Sort untuk tabel aktivitas karyawan. */
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // Untuk menampilkan jumlah data dalam 1 halaman tabel.
    defaultPageSize = environment.pageSize;
    // Untuk menampilkan opsi jumlah data per halaman tabel.
    defaultPageSizeTable = environment.pageSizeTable;

    /** Filter untuk tabel aktivitas karyawan. */
    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    /** Observable untuk status loading dari state-nya Attendance. */
    isAttendanceLoading$: Observable<boolean>;
    /** Observable untuk status loading dari state-nya Store. */
    isStoreLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        private _fromMerchant: NgRxStore<fromMerchant.FeatureState>,
        private _fromUser: NgRxStore<fromUser.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _helper: HelperService
    ) {
        /** Mendapatkan ID dari route (parameter URL) */
        const { id } = this.route.snapshot.params;

        /** Menyimpan ID store-nya. */
        this.storeId = id;

        /** Melakukan request data Store berdasarkan ID nya melalui dispatch action. */
        this._fromMerchant.dispatch(
            MerchantActions.fetchStoreRequest({
                payload: id
            })
        );

        this._fromMerchant.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Attendances',
                        translate: 'BREADCRUMBS.ATTENDANCES',
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
        this.isAttendanceLoading$ = this._fromAttendance
            .select(AttendanceSelectors.getIsLoading)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$));

        /** Mendapatkan status loading dari store-nya Store. */
        this.isStoreLoading$ = this._fromMerchant
            .select(MerchantSelectors.getIsLoading)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$));

        /** Mendapatkan store yang telah dipilih dari halaman depan. */
        this.selectedStore$ = this._fromMerchant.select(MerchantSelectors.getMerchant).pipe(
            map(merchant => {
                if (merchant) {
                    return new Merchant(merchant);
                }
            }),
            tap(merchant => {
                if (!merchant) {
                    this._fromMerchant.dispatch(
                        MerchantActions.fetchStoreRequest({
                            payload: this.storeId
                        })
                    );
                }
            }),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan aktivitas karyawan dari store yang telah dipilih. */
        this.employeesActivities$ = this._fromAttendance
            .select(AttendanceSelectors.getAllAttendance)
            .pipe(takeUntil(this._unSubs$));

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalEmployeesActivities$ = this._fromAttendance
            .select(AttendanceSelectors.getTotalAttendance)
            .pipe(takeUntil(this._unSubs$));

        /** Melakukan inisialisasi pertama kali untuk operasi tabel. */
        this.onChangePage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._fromMerchant.dispatch(
            UiActions.createBreadcrumb({
                payload: null
            })
        );

        if (this._unSubs$) {
            this._unSubs$.next();
            this._unSubs$.complete();
        }
    }

    ngAfterViewInit(): void {
        this._fromMerchant.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Attendances',
                        translate: 'BREADCRUMBS.ATTENDANCES',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public onChangePage(): void {
        if (this.paginator) {
            /** Menyiapkan parameter untuk query string saat request ke back-end. */
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.defaultPageSize * this.paginator.pageIndex
            };
    
            /** Menyalakan opsi pagination ke back-end. */
            data['paginate'] = true;
    
            /** Mengambil ID dari parameter URL dan dikirim ke back-end untuk mengambil data attendance berdasarkan tokonya. */
            data['storeId'] = this.route.snapshot.params.id;
    
            /** Mengambil arah sortir dan data yang ingin disotir. */
            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }
    
            /** Melakukan request dengan membawa query string yang telah disiapkan. */
            this._fromAttendance.dispatch(
                AttendanceActions.fetchAttendancesRequest({
                    payload: data
                })
            );
        }
    }

    public getChainRoles(roles: Array<Role>): string {
        return Attendance.getChainRoles(roles);
    }

    public getAttendanceType(attendanceType: string): string {
        return this._helper.attendanceType(attendanceType);
    }

    public getLocationType(locationType: string): string {
        return this._helper.locationType(locationType);
    }

    public getDuration(row: Attendance): string {
        if (!row.checkIn || !row.checkOut) {
            return '-';
        }

        return moment(row.checkIn).to(moment(row.checkOut), true);
    }

    public openEmployeeAttendanceDetail(data: Attendance): void {
        this._fromUser.dispatch(UserActions.setSelectedUser({ payload: data.user }));

        this.router.navigate([
            `/pages/attendances/${this.storeId}/employee/${data.user.id}/detail`
        ]);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
