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
import { fromAttendance, fromStore } from './store/reducers';
import { Store as NgRxStore, select } from '@ngrx/store';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { IQueryParams } from 'app/shared/models';
import { AttendanceActions } from './store/actions';
import { tap, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { Store } from './models';
import { AttendanceSelectors } from './store/selectors';

import { StoreSelectors } from '../accounts/merchants/store/selectors';

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

    dataSource$: Observable<Store[]>;
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
        private store: NgRxStore<fromAttendance.FeatureState>,
        private _fromStore: NgRxStore<fromStore.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.paginator.pageSize = 5;

        this.dataSource$ = this._fromStore.select(StoreSelectors.getAllStore);
        this.totalDataSource$ = this._fromStore.pipe(
            select(StoreSelectors.getTotalStore),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
        this.isLoading$ = this._fromStore.pipe(
            select(StoreSelectors.getIsLoading),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        this.initTable();
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
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
    }

    private initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this.store.dispatch(
            AttendanceActions.fetchAttendancesRequest({
                payload: data
            })
        );
    }
}
