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
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { select, Store as NgRxStore } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { IQueryParams, User, Role } from 'app/shared/models';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { Attendance } from '../models';
import { locale as english } from '../i18n/en';
import { fromAttendance, fromUser } from '../store/reducers';
import { AttendanceSelectors, UserSelectors } from '../store/selectors';
import { AttendanceActions, UserActions } from '../store/actions';

// import * as localization from 'moment/locale/id';
// import { LocaleConfig } from 'ngx-daterangepicker-material';
// moment.locale('id', localization);

@Component({
    selector: 'app-attendance-employee-detail',
    templateUrl: './attendance-employee-detail.component.html',
    styleUrls: ['./attendance-employee-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceEmployeeDetailComponent implements OnInit, OnDestroy {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    /** ID toko dan pegawai yang ingin diambil data-nya. */
    _storeId: string;
    _employeeId: string;

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
        'locationType',
        'checkDate',
        'checkIn',
        'checkOut',
        'actions'
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
    isAttendanceLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private _fromUser: NgRxStore<fromUser.FeatureState>,
        private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        /** Mendapatkan ID user dan toko dari parameter URL. */
        this._employeeId = this.route.snapshot.params.employeeId;
        this._storeId = this.route.snapshot.params.storeId;

        this._fromUser.dispatch(UserActions.fetchUserRequest({ payload: this._employeeId }));
        this._fuseTranslationLoaderService.loadTranslations(english);
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
        this.isAttendanceLoading$ = this._fromAttendance.select(AttendanceSelectors.getIsLoading)
        .pipe(
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan aktivitas karyawan dari store yang telah dipilih. */
        this.employeeActivities$ = this._fromAttendance.select(AttendanceSelectors.getAllAttendance)
        .pipe(
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalEmployeeActivities$ = this._fromAttendance.select(AttendanceSelectors.getTotalAttendance)
        .pipe(
            takeUntil(this._unSubs$)
        );

        /** Mengambil data user sesuai dengan ID pegawainya. */
        this.selectedUser$ = this._fromUser.select(UserSelectors.getUser).pipe(takeUntil(this._unSubs$));

        /** Melakukan inisialisasi pertama kali untuk operasi tabel. */
        this.onChangePage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

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
        data['userId'] = this._employeeId;

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

    public getChainRoles(roles: Array<Role>): string {
        return Attendance.getChainRoles(roles);
    }

    public getAttendanceType(attendanceType: any): string {
        return Attendance.getAttendanceType(attendanceType);
    }

    public getLocationType(locationType: any): string {
        return Attendance.getLocationType(locationType);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
