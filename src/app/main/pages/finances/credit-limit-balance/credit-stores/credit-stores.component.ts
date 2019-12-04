import { environment } from 'environments/environment';
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
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CreditStoreFormComponent } from '../credit-store-form/credit-store-form.component';
import { CreditLimitStore, CreditLimitStoreOptions } from '../models';
import { CreditLimitBalanceActions } from '../store/actions';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';
import { LogService } from 'app/shared/helpers';

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
    displayedColumns = [
        // 'order',
        'name',
        'credit-limit',
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

    dataSource$: Observable<CreditLimitStore[]>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromCreditLimitBalance.FeatureState>,
        private _$log: LogService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.paginator.pageSize = this.defaultPageSize;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        this.dataSource$ = this.store.select(CreditLimitBalanceSelectors.getAllCreditLimitStore);
        this.totalDataSource$ = this.store.select(
            CreditLimitBalanceSelectors.getTotalCreditLimitStore
        );
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

        this.initTable();

        this.store
            .select(CreditLimitBalanceSelectors.getIsRefresh)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe(isRefresh => {
                if (isRefresh) {
                    this.onRefreshTable();
                }
            });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
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

    onFreezeBalance(item: CreditLimitStore): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(
            CreditLimitBalanceActions.confirmChangeFreezeBalanceStatus({ payload: item })
        );
    }

    onTrackBy(index: number, item: CreditLimitStore): string {
        return !item ? null : item.id;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this.initTable();
    }

    private initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        // if (this.search.value) {
        //     const query = this.search.value;

        //     data['search'] = [
        //         {
        //             fieldName: 'keyword',
        //             keyword: query
        //         }
        //     ];
        // }

        this.store.dispatch(
            CreditLimitBalanceActions.fetchCreditLimitStoresRequest({
                payload: data
            })
        );
    }
}
