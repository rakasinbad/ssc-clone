import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { NoticeService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CreditStoreFormComponent } from '../credit-store-form/credit-store-form.component';
import { CreditLimitStore, CreditLimitStoreOptions } from '../models';
import { CreditLimitBalanceActions } from '../store/actions';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-stores',
    templateUrl: './credit-stores.component.html',
    styleUrls: ['./credit-stores.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'content-card'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditStoresComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Store List'
        },
        search: {
            active: true,
            changed: (value: string) =>
                this.store.dispatch(
                    CreditLimitBalanceActions.searchCreditLimitStore({ payload: value })
                )
        }
        // add: {
        //     permissions: ['CATALOGUE.CREATE'],
        // },
        // export: {
        //     permissions: ['CATALOGUE.EXPORT'],
        //     useAdvanced: true,
        //     pageType: 'catalogues'
        // },
        // import: {
        //     permissions: ['CATALOGUE.IMPORT'],
        //     useAdvanced: true,
        //     pageType: 'catalogues'
        // },
    };

    search: any;
    displayedColumns = [
        // 'order',
        'name',
        'credit-limit',
        'invoice-name',
        'receivable',
        'balance',
        'avg-monthly',
        'credit-limit-group',
        'store-segment',
        'top',
        'last-update',
        'actions'
    ];
    today = new Date();

    dataSource$: Observable<Array<CreditLimitStore>>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private matDialog: MatDialog,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _$notice: NoticeService
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

    safeValue(item: string): string {
        return item ? item : '-';
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onEdit(item: CreditLimitStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(
            CreditLimitBalanceActions.fetchCreditLimitStoreRequest({ payload: item.id })
        );

        const dialogRef = this.matDialog.open<
            CreditStoreFormComponent,
            any,
            { action: string; payload: CreditLimitStoreOptions }
        >(CreditStoreFormComponent, {
            data: {
                title: 'Set Credit Limit & Balance',
                id: item.id
            },
            disableClose: true
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntil(this._unSubs$))
            .subscribe(resp => {
                if (resp.action === 'edit' && resp.payload) {
                    this.store.dispatch(
                        CreditLimitBalanceActions.updateCreditLimitStoreRequest({
                            payload: { id: item.id, body: resp.payload }
                        })
                    );
                } else {
                    this.store.dispatch(UiActions.resetHighlightRow());
                }
            });
    }

    onCreditLimit(item: CreditLimitStore): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('FINANCE.CLB.SL.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    CreditLimitBalanceActions.confirmChangeCreditLimitStatus({ payload: item })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onFreezeBalance(item: CreditLimitStore): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('FINANCE.CLB.SL.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    CreditLimitBalanceActions.confirmChangeFreezeBalanceStatus({ payload: item })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onTrackBy(index: number, item: CreditLimitStore): string {
        return !item ? null : item.id;
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
                        this._initTable();
                    });

                const canDoActions = this.ngxPermissions.hasPermission('FINANCE.CLB.SL.UPDATE');

                canDoActions.then(hasAccess => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            'name',
                            'credit-limit',
                            'invoice-name',
                            'receivable',
                            'balance',
                            'avg-monthly',
                            'credit-limit-group',
                            'store-segment',
                            'top',
                            'last-update',
                            'actions'
                        ];
                    } else {
                        this.displayedColumns = [
                            'name',
                            'credit-limit',
                            'invoice-name',
                            'receivable',
                            'balance',
                            'avg-monthly',
                            'credit-limit-group',
                            'store-segment',
                            'top',
                            'last-update'
                        ];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;
                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true
                });

                this.dataSource$ = this.store.select(
                    CreditLimitBalanceSelectors.getAllCreditLimitStore
                );
                this.totalDataSource$ = this.store.select(
                    CreditLimitBalanceSelectors.getTotalCreditLimitStore
                );
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

                this._initTable();

                this.store
                    .select(CreditLimitBalanceSelectors.getKeyword)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(v => {
                        this.search = v;

                        this.store.dispatch(CreditLimitBalanceActions.triggerRefresh());
                    });

                this.store
                    .select(CreditLimitBalanceSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(isRefresh => {
                        if (isRefresh) {
                            this._onRefreshTable();
                        }
                    });
                break;
        }
    }
    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }

    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        if (typeof this.search !== 'undefined' && this.search) {
            const query = this.search;

            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: query
                }
            ];
        }
        this.store.dispatch(
            CreditLimitBalanceActions.fetchCreditLimitStoresRequest({
                payload: data
            })
        );
    }
}
