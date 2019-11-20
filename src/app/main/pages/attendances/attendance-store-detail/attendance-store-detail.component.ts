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
import { IQueryParams } from 'app/shared/models';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { Attendance, Store } from '../models';
import { locale as english } from '../i18n/en';
import { fromAttendance, fromStore } from '../store/reducers';
import { AttendanceSelectors } from '../store/selectors';
import { StoreSelectors } from '../../accounts/merchants/store/selectors';
import { StoreActions } from '../../accounts/merchants/store/actions';
import { AttendanceActions } from '../store/actions';

// import * as localization from 'moment/locale/id';
// import { LocaleConfig } from 'ngx-daterangepicker-material';
// moment.locale('id', localization);

@Component({
    selector: 'app-attendance-store-detail',
    templateUrl: './attendance-store-detail.component.html',
    styleUrls: ['./attendance-store-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceStoreDetailComponent implements OnInit, OnDestroy {
    /** Untuk unsubscribe. */
    private _unSubs$: Subject<void>;

    /** Menyimpan ID store yang sedang dibuka. */
    storeId: string;

    /** Observable untuk Store yang dipilih dari halaman depan. */
    selectedStore$: Observable<Store>;
    /** Observable untuk Array Attendance dari store yang dipilih. */
    employeesActivities$: Observable<Array<Attendance>>;
    /** Observable untuk mendapatkan jumlah data keseluruhan untuk aktivitas karyawan. */
    totalEmployeesActivities$: Observable<number>;

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
    /** Observable untuk status loading dari state-nya Store. */
    isStoreLoading$: Observable<boolean>;

    constructor(
        private route: ActivatedRoute,
        private _fromAttendance: NgRxStore<fromAttendance.FeatureState>,
        private _fromStore: NgRxStore<fromStore.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        /** Mendapatkan ID dari route (parameter URL) */
        const { id } = this.route.snapshot.params;

        /** Menyimpan ID store-nya. */
        this.storeId = id;

        /** Melakukan request data Store berdasarkan ID nya melalui dispatch action. */
        this._fromStore.dispatch(StoreActions.fetchStoreRequest({
            payload: {
                storeId: id
            }
        }));

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

        /** Mendapatkan status loading dari store-nya Store. */
        this.isStoreLoading$ = this._fromStore.select(StoreSelectors.getIsLoading)
        .pipe(
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan store yang telah dipilih dari halaman depan. */
        this.selectedStore$ = this._fromStore.select(StoreSelectors.getSelectedStore)
        .pipe(
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan aktivitas karyawan dari store yang telah dipilih. */
        this.employeesActivities$ = this._fromAttendance.select(AttendanceSelectors.getAllAttendance)
        .pipe(
            takeUntil(this._unSubs$)
        );

        /** Mendapatkan jumlah aktivitas karyawan dari store yang telah dipilih. */
        this.totalEmployeesActivities$ = this._fromAttendance.select(AttendanceSelectors.getTotalAttendance)
        .pipe(
            takeUntil(this._unSubs$)
        );

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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        /** Mengatur ulang halaman tabel ke halaman pertama. */
        this.paginator.pageIndex = 0;
    }
}
