import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Role } from 'app/shared/models/role.model';
import { User } from 'app/shared/models/user.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { Observable, Subject, merge } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Attendance } from '../models';
import { AttendanceActions, UserActions } from '../store/actions';
import { fromAttendance, fromUser } from '../store/reducers';
import { AttendanceSelectors, UserSelectors } from '../store/selectors';

@Component({
    selector: 'app-attendance-employee-detail',
    templateUrl: './attendance-employee-detail.component.html',
    styleUrls: ['./attendance-employee-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceEmployeeDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    /** ID toko dan pegawai yang ingin diambil data-nya. */
    _storeId: string;
    _employeeId: string;
    _activityId: string;

    /** Observable untuk User yang dipilih dari halaman depan. */
    selectedUser$: Observable<User>;
    /** Observable untuk Array User dari store yang dipilih. */
    employeeActivities$: Observable<Array<Attendance>>;
    /** Observable untuk mendapatkan jumlah data keseluruhan untuk aktivitas karyawan. */
    totalEmployeeActivities$: Observable<number>;

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

    // Untuk menampilkan jumlah data dalam 1 halaman tabel.
    defaultPageSize = environment.pageSize;
    // Untuk menampilkan opsi jumlah data per halaman tabel.
    defaultPageSizeTable = environment.pageSizeTable;

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
    isAttendanceLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private _fromUser: NgRxStore<fromUser.FeatureState>,
        private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _helper: HelperService
    ) {
        /** Mendapatkan ID user dan toko dari parameter URL. */
        this._employeeId = this.route.snapshot.params.employeeId;
        this._storeId = this.route.snapshot.params.storeId;
        this._activityId = this.route.snapshot.params.activityId;

        this._fromUser.dispatch(UserActions.fetchUserRequest({ payload: this._employeeId }));

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        /** Inisialisasi Subject untuk auto-unsubscribe. */
        this._unSubs$ = new Subject<void>();

        /** Menentukan maksimal jumlah data yang ditampilkan pada tabel. */
        // this.paginator.pageSize = 5;

        /** Mendapatkan status loading dari store-nya Attendance. */
        this.isAttendanceLoading$ = this._fromAttendance
            .select(AttendanceSelectors.getIsLoading)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$));

        /** Mendapatkan aktivitas karyawan dari store yang telah dipilih. */
        this.employeeActivities$ = this._fromAttendance
            .select(AttendanceSelectors.getAllAttendance)
            .pipe(takeUntil(this._unSubs$));

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalEmployeeActivities$ = this._fromAttendance
            .select(AttendanceSelectors.getTotalAttendance)
            .pipe(takeUntil(this._unSubs$));

        /** Mengambil data user sesuai dengan ID pegawainya. */
        this.selectedUser$ = this._fromUser
            .select(UserSelectors.getUser)
            .pipe(takeUntil(this._unSubs$));
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._fromAttendance.dispatch(
            UiActions.createBreadcrumb({
                payload: null
            })
        );

        if (this._unSubs$) {
            this._unSubs$.next();
            this._unSubs$.complete();
        }

        this._fromAttendance.dispatch(AttendanceActions.resetAttendances());
    }

    ngAfterViewInit(): void {
        this._fromAttendance.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Attendances',
                        translate: 'BREADCRUMBS.ATTENDANCES',
                        active: true
                    }
                ]
            })
        );

        /** Melakukan inisialisasi pertama kali untuk operasi tabel. */
        this.onChangePage();

        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(
            takeUntil(this._unSubs$)
        ).subscribe(() => {
            this.onChangePage();
        });
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
            data['storeId'] = this._storeId;
            data['userId'] = this._employeeId;

            /** Mengambil arah sortir dan data yang ingin disotir. */
            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';

                switch (this.sort.active) {
                    case 'number':
                        data['sortBy'] = 'id';
                        break;
                    case 'checkDate':
                        data['sortBy'] = 'date';
                        break;
                    case 'attendanceType':
                        data['sortBy'] = 'attendance_type';
                        break;
                    case 'locationType':
                        data['sortBy'] = 'location_type';
                        break;
                    case 'checkIn':
                        data['sortBy'] = 'check_in';
                        break;
                    case 'checkOut':
                        data['sortBy'] = 'check_out';
                        break;
                }
            } else {
                data['sort'] = 'desc';
                data['sortBy'] = 'id';
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

    public getAttendanceType(attendanceType: any): string {
        return this._helper.attendanceType(attendanceType);
    }

    public getLocationType(locationType: any): string {
        return this._helper.locationType(locationType);
    }

    public editEmployeeAttendanceDetail(data: Attendance): void {
        this._fromAttendance.dispatch(AttendanceActions.setSelectedAttendance({ payload: data }));

        this.router.navigate([
            '/pages',
            '/attendances/',
            this._storeId,
            '/employee/',
            this._employeeId,
            '/activity/',
            this._activityId,
            '/detail'
        ]);
    }

    public getDuration(row: Attendance): string {
        if (!row.checkIn || !row.checkOut) {
            return '-';
        }

        return moment(row.checkIn).to(moment(row.checkOut), true);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
