import { Subject, merge, Observable, combineLatest } from 'rxjs';
import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    AfterViewInit,
    SecurityContext
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { Store as NgRxStore, select } from '@ngrx/store';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';

import { IQueryParams } from 'app/shared/models';
import { tap, distinctUntilChanged, takeUntil, map, debounceTime, take } from 'rxjs/operators';
import { Store, Attendance } from './models';

import { environment } from 'environments/environment';

/**
 * ACTIONS
 */
import { AttendanceActions, MerchantActions } from './store/actions';

/**
 * REDUCERS
 */
import { fromAttendance, fromMerchant } from './store/reducers';

/**
 * SELECTORS
 */
import { AttendanceSelectors, MerchantSelectors } from './store/selectors';
import { UiActions } from 'app/shared/store/actions';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ValidationError } from '@ngx-pwa/local-storage';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
    selector: 'app-attendances',
    templateUrl: './attendances.component.html',
    styleUrls: ['./attendances.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendancesComponent implements OnInit, AfterViewInit, OnDestroy {
    total: number;
    displayedColumns = [
        'idToko',
        'storeName',
        'storeAddress',
        'storePhoneNumber',
        // 'GS',
        // 'SPV',
        // 'check-in',
        // 'check-out',
        // 'inventory',
        'actions'
    ];

    defaultPageSize = environment.pageSize;
    defaultPageSizeTable = environment.pageSizeTable;

    dataSource$: Observable<Array<Store>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    search: FormControl;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private router: Router,
        private sanitizer: DomSanitizer,
        private _fromStore: NgRxStore<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private ngxPermissionsService: NgxPermissionsService,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

        this.search = new FormControl('', [
            Validators.required,
            control => {
                const value = control.value;
                const sanitized = !!this.sanitizer.sanitize(SecurityContext.HTML, value);

                if (sanitized) {
                    return null;
                } else {
                    if (value.length === 0) {
                        return null;
                    } else {
                        return { unsafe: true };
                    }
                }
            }
        ]);

        this.dataSource$ = this._fromStore.select(MerchantSelectors.getAllMerchant).pipe(
            map(stores =>
                stores.map(store => {
                    return new Store(store);
                })
            )
        );

        this.totalDataSource$ = this._fromStore.pipe(
            select(MerchantSelectors.getTotalMerchant),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
        this.isLoading$ = this._fromStore.pipe(
            select(MerchantSelectors.getIsLoading),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
        this.search.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(() => {
                this.onChangePage();
            });

        this.onChangePage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.
        this._fromStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
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

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        // merge(this.sort.sortChange, this.paginator.page)
        //     .pipe(tap(() => this.initTable()))
        //     .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(_ => {
                this.onChangePage();
            });

        this.updatePrivileges();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._fromStore.dispatch(UiActions.createBreadcrumb({ payload: null }));

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public onChangePage(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.defaultPageSize * this.paginator.pageIndex
            };
    
            data['paginate'] = true;
    
            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }
    
            if (this.search.status === 'VALID') {
                data['search'] = [
                    {
                        fieldName: 'name',
                        keyword: this.search.value
                    }
                ];
            }
    
            this._fromStore.dispatch(
                MerchantActions.fetchStoresRequest({
                    payload: data
                })
            );
        }
    }

    getDiffTime(
        startTime: string,
        endTime: string,
        units: 'hours' | 'minutes' | 'seconds',
        precise?: boolean
    ): number {
        const startTimeFormat = startTime ? moment(startTime).format('HH:mm:ss') : '';
        const endTimeFormat = endTime ? moment(endTime).format('HH:mm:ss') : '';
        const startTimeArr = startTimeFormat ? startTimeFormat.split(':') : [];
        const endTimeArr = endTimeFormat ? endTimeFormat.split(':') : [];

        let diffNumber = 0;

        switch (units) {
            case 'seconds':
            case 'minutes':
            case 'hours':
                const startTimeMoment =
                    startTimeArr.length === 3
                        ? moment([startTimeArr[0], startTimeArr[1], startTimeArr[2]], 'HH:mm:ss')
                        : null;
                const endTimeMoment =
                    endTimeArr.length === 3
                        ? moment([endTimeArr[0], endTimeArr[1], endTimeArr[2]], 'HH:mm:ss')
                        : null;

                if (startTimeMoment && endTimeMoment) {
                    diffNumber = moment(endTime).diff(moment(startTime), units, precise);
                }
                break;
        }

        return diffNumber;
    }

    public openStoreAttendanceDetail(data: Store): void {
        this._fromStore.dispatch(MerchantActions.setSelectedStore({ payload: data }));

        this.router.navigate(['/pages/attendances/' + data.id + '/detail']);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService.hasPermission(['ATTENDANCE.UPDATE', 'ATTENDANCE.DELETE']).then(result => {
            // Jika ada permission-nya.
            if (result) {
                this.displayedColumns = [
                    'idToko',
                    'storeName',
                    'storeAddress',
                    'storePhoneNumber',
                    // 'GS',
                    // 'SPV',
                    // 'check-in',
                    // 'check-out',
                    // 'inventory',
                    'actions'
                ];
            } else {
                this.displayedColumns = [
                    'idToko',
                    'storeName',
                    'storeAddress',
                    'storePhoneNumber',
                    // 'GS',
                    // 'SPV',
                    // 'check-in',
                    // 'check-out',
                    // 'inventory',
                    // 'actions'
                ];
            }
        });
    }
}
