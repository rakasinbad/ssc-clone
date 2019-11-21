import { Subject, merge, Observable } from 'rxjs';
import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    AfterViewInit
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { Store as NgRxStore, select } from '@ngrx/store';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { locale as english } from './i18n/en';
import { locale as indonesian } from 'app/navigation/i18n/id';

import { IQueryParams } from 'app/shared/models';
import { tap, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { Store, Attendance } from './models';

/**
 * ACTIONS
 */
import {
    AttendanceActions,
    MerchantActions
} from './store/actions';

/**
 * REDUCERS
 */
import {
    fromAttendance,
    fromMerchant
} from './store/reducers';

/**
 * SELECTORS
 */
import {
    AttendanceSelectors,
    MerchantSelectors
} from './store/selectors';
import { UiActions } from 'app/shared/store/actions';
import { Router } from '@angular/router';

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
        // 'GS',
        // 'SPV',
        // 'check-in',
        // 'check-out',
        // 'inventory',
        'actions'
    ];

    dataSource$: Observable<Array<Store>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private router: Router,
        private _fromStore: NgRxStore<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this._fromStore.dispatch(
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
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.paginator.pageSize = 5;

        this.dataSource$ 
            = this._fromStore
                .select(MerchantSelectors.getAllMerchant)
                .pipe(
                    map(stores => stores.map(store => {
                        const newStore = new Store(
                            store.id,
                            store.storeCode,
                            store.name,
                            store.address,
                            store.taxNo,
                            store.longitude,
                            store.latitude,
                            store.largeArea,
                            store.phoneNo,
                            store.imageUrl,
                            store.taxImageUrl,
                            store.status,
                            store.reason,
                            store.parent,
                            store.parentId,
                            store.numberOfEmployee,
                            store.externalId,
                            store.storeTypeId,
                            store.storeGroupId,
                            store.storeSegmentId,
                            store.urbanId,
                            store.vehicleAccessibilityId,
                            store.warehouseId,
                            store.userStores,
                            store.storeType,
                            store.storeGroup,
                            store.storeSegment,
                            store.urban,
                            store.storeConfig,
                            store.createdAt,
                            store.updatedAt,
                            store.deletedAt
                        );

                        newStore.setLegalInfo = store.legalInfo;
                        newStore.setCustomerHierarchies = store.customerHierarchies;

                        return newStore;
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

        this.onChangePage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        // merge(this.sort.sortChange, this.paginator.page)
        //     .pipe(tap(() => this.initTable()))
        //     .subscribe();

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(_ => {
                this.onChangePage();
            });
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
        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this._fromStore.dispatch(
            MerchantActions.fetchStoresRequest({
                payload: data
            })
        );
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
        this._fromStore.dispatch(
            MerchantActions.setSelectedStore({ payload: data })
        );

        this.router.navigate(['/pages/attendances/' + data.id + '/detail']);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
    }
}
