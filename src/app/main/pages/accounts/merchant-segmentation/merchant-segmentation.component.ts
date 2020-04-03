import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTabChangeEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { MerchantSegmentationFormComponent } from './merchant-segmentation-form';
import { StoreChannel, StoreCluster, StoreGroup, StoreSegmentTree, StoreType } from './models';
import {
    StoreChannelActions,
    StoreClusterActions,
    StoreGroupActions,
    StoreTypeActions
} from './store/actions';
import * as fromStoreSegments from './store/reducers';
import { MerchantSegmentTreeTableSelectors } from './store/selectors';

@Component({
    selector: 'app-merchant-segmentation',
    templateUrl: './merchant-segmentation.component.html',
    styleUrls: ['./merchant-segmentation.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSegmentationComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-20 mx-16 mb-16',
        title: {
            label: 'Table'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        }
        // add: {
        //     permissions: [],
        // },
        // export: {
        //     permissions: [],
        //     useAdvanced: true,
        //     pageType: ''
        // }
        // import: {
        //     permissions: [''],
        //     useAdvanced: true,
        //     pageType: ''
        // },
    };

    displayedColumns = [
        'branch-id',
        'segment-branch',
        'branch-level',
        'desc',
        'total-store',
        'status',
        'actions'
    ];

    search: FormControl = new FormControl('');

    dataSource$: Observable<Array<StoreSegmentTree>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _type = 0;

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private domSanitizer: DomSanitizer,
        private matDialog: MatDialog,
        private store: Store<fromStoreSegments.FeatureState>
    ) {}

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
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onEdit(item: StoreSegmentTree): void {
        if (!item) {
            return;
        }

        const formValue = {
            id: item.id,
            externalId: item.externalId,
            name: item.name,
            desc: item.description
        };

        let segmentType = 'type';

        switch (this._type) {
            case 1:
                segmentType = 'group';
                break;

            case 2:
                segmentType = 'channel';
                break;

            case 3:
                segmentType = 'cluster';
                break;

            default:
                segmentType = 'type';
                break;
        }

        this.matDialog.open(MerchantSegmentationFormComponent, {
            data: {
                title: 'Segment Branch Information',
                segmentType: segmentType,
                form: formValue
            },
            panelClass: 'merchant-segment-form-dialog',
            disableClose: true
        });
    }

    onSelectedTab(ev: MatTabChangeEvent): void {
        this._type = ev.index;

        this._onRefreshTable();
    }

    onSetStatus(item: StoreSegmentTree): void {
        if (!item) {
            return;
        }

        const formValue: any = {
            id: item.id,
            externalId: item.externalId,
            parentId: item.parentId,
            name: item.name,
            description: item.description,
            status: item.status
        };

        let segmentType = 'type';

        switch (this._type) {
            case 1:
                segmentType = 'group';
                this.store.dispatch(
                    StoreGroupActions.confirmChangeStatusStoreGroup({
                        payload: new StoreGroup({ ...formValue })
                    })
                );
                return;

            case 2:
                segmentType = 'channel';
                this.store.dispatch(
                    StoreChannelActions.confirmChangeStatusStoreChannel({
                        payload: new StoreChannel({ ...formValue })
                    })
                );
                return;

            case 3:
                segmentType = 'cluster';
                this.store.dispatch(
                    StoreClusterActions.confirmChangeStatusStoreCluster({
                        payload: new StoreCluster({ ...formValue })
                    })
                );
                return;

            default:
                segmentType = 'type';

                this.store.dispatch(
                    StoreTypeActions.confirmChangeStatusStoreType({
                        payload: new StoreType({ ...formValue })
                    })
                );
                return;
        }
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
                switch (this._type) {
                    case 1:
                        this.store.dispatch(StoreGroupActions.clearState());
                        break;

                    case 2:
                        this.store.dispatch(StoreChannelActions.clearState());
                        break;

                    case 3:
                        this.store.dispatch(StoreClusterActions.clearState());
                        break;

                    default:
                        this.store.dispatch(StoreTypeActions.clearState());
                        break;
                }

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

                this.dataSource$ = this.store.select(MerchantSegmentTreeTableSelectors.selectAll);
                this.totalDataSource$ = this.store.select(
                    MerchantSegmentTreeTableSelectors.getTotalItem
                );
                this.isLoading$ = this.store.select(MerchantSegmentTreeTableSelectors.getIsLoading);

                // Trigger refresh
                this.store
                    .select(MerchantSegmentTreeTableSelectors.getIsRefresh)
                    .pipe(
                        filter(v => !!v),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(() => this._onRefreshTable());

                // Trigger search
                this.search.valueChanges
                    .pipe(
                        distinctUntilChanged(),
                        debounceTime(1000),
                        filter(v => {
                            if (v) {
                                return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                            }

                            return true;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(v => {
                        this._onRefreshTable();
                    });

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

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            }

            if (typeof this._type === 'number') {
                switch (this._type) {
                    case 1:
                        this.store.dispatch(
                            StoreGroupActions.fetchStoreLastGroupRequest({ payload: data })
                        );
                        break;

                    case 2:
                        this.store.dispatch(
                            StoreChannelActions.fetchStoreLastChannelRequest({ payload: data })
                        );
                        break;

                    case 3:
                        this.store.dispatch(
                            StoreClusterActions.fetchStoreLastClusterRequest({ payload: data })
                        );
                        break;

                    default:
                        this.store.dispatch(
                            StoreTypeActions.fetchStoreLastTypeRequest({ payload: data })
                        );
                        break;
                }
            }
        }
    }

    private _onRefreshTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
