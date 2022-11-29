import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MAT_DIALOG_DATA, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { StoreSegmentAlert } from '../models';
import { StoreAlertActions } from '../store/actions';
import * as fromStoreSegments from '../store/reducers';
import { MerchantSegmentAlertSelectors } from '../store/selectors';

@Component({
    selector: 'app-merchant-segmentation-alert',
    templateUrl: './merchant-segmentation-alert.component.html',
    styleUrls: ['./merchant-segmentation-alert.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationAlertComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    dialogTitle: string;
    segmentType: string;
    initForm: any;

    displayedColumns = [
        'store-id',
        'store-name',
        'store-type',
        'store-group',
        'store-channel',
        'store-cluster'
    ];
    dataSource = new MatTableDataSource([
        {
            storeId: '1',
            storeName: 'Toko ABC',
            storeType: 'Apotek 2',
            storeGroup: 'Watson',
            storeChannel: 'MT',
            storeCluster: 'Toko Susu'
        },
        {
            storeId: '2',
            storeName: 'Toko ABC',
            storeType: 'Apotek 1',
            storeGroup: null,
            storeChannel: 'GT',
            storeCluster: null
        }
    ]);

    dataSource$: Observable<Array<StoreSegmentAlert>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private store: Store<fromStoreSegments.FeatureState>
    ) {
        this.dialogTitle = this.data.title;
        this.segmentType = this.data.segmentType ? this.data.segmentType : null;
        this.initForm = { id: this.data.id, change: this.data.change };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state storeSegmentAlert
                this.store.dispatch(StoreAlertActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true
                });

                this.dataSource$ = this.store.select(MerchantSegmentAlertSelectors.selectAll);
                this.totalDataSource$ = this.store.select(
                    MerchantSegmentAlertSelectors.getTotalItem
                );
                this.isLoading$ = this.store.select(MerchantSegmentAlertSelectors.getIsLoading);

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            data['type'] = this.segmentType;
            data['typeId'] = this.data.id;

            this.store.dispatch(StoreAlertActions.fetchStoreAlertRequest({ payload: data }));
        }
    }
}
