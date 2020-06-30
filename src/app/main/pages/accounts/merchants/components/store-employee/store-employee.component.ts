import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { environment } from 'environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { Observable, BehaviorSubject, Subject, merge } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';
import { UserStore } from '../../models';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { fromMerchant } from '../../store/reducers';
import { NoticeService, HelperService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { Role } from 'app/shared/models/role.model';
import { UiActions } from 'app/shared/store/actions';
import { StoreActions } from '../../store/actions';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { StoreSelectors } from '../../store/selectors';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UiSelectors } from 'app/shared/store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
    selector: 'store-employee-component',
    templateUrl: './store-employee.component.html',
    styleUrls: ['./store-employee.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class StoreEmployeeComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;
    
    @Input() supplierStore: SupplierStore;
    private subs$: Subject<void> = new Subject<void>();

    displayedColumns = [
        'name',
        'role',
        'phone-no',
        'last-check-in',
        'status',
        'actions'
    ];

    auth$: Observable<Auth>;
    selectedRowIndex$: Observable<string>;
    dataSource$: Observable<Array<UserStore>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;
    
    constructor(
        private route: ActivatedRoute,
        private ngxPermissions: NgxPermissionsService,
        private store: NgRxStore<fromMerchant.FeatureState>,
        private _$notice: NoticeService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this.subs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this.subs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                this.ngxPermissions
                    .hasPermission([
                        'ACCOUNT.STORE.EMPLOYEE.UPDATE',
                        'ACCOUNT.STORE.EMPLOYEE.DELETE'
                    ])
                    .then(hasAccess => {
                        if (hasAccess) {
                            this.displayedColumns = [
                                'name',
                                'role',
                                'phone-no',
                                'last-check-in',
                                'status',
                                'actions'
                            ];
                        } else {
                            this.displayedColumns = [
                                'name',
                                'role',
                                'phone-no',
                                'last-check-in',
                                'status'
                            ];
                        }
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(StoreActions.resetStoreEmployees());

                this.subs$.next();
                this.subs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;
                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true
                });

                /* .pipe(
            filter(source => source.length > 0),
            delay(1000),
            startWith(this._$merchantApi.initStoreEmployee())
        ); */

                this.auth$ = this.store.select(AuthSelectors.getUserState);
                this.dataSource$ = this.store.select(StoreSelectors.getAllStoreEmployee);
                this.totalDataSource$ = this.store.select(StoreSelectors.getTotalStoreEmployee);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

                setTimeout(() => this._initTable());

                this.store
                    .select(StoreSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this.subs$))
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

        const { storeId } = this.supplierStore;

        this.store.dispatch(
            StoreActions.fetchStoreEmployeesRequest({
                payload: { params: data, storeId }
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    hasOwnerRoles(roles: Array<Role>): boolean {
        if (roles && roles.length > 0) {
            const idx = roles.findIndex(role => String(role.role).toLowerCase() === 'pemilik');

            return idx === -1 ? false : true;
        }

        return false;
    }

    joinRoles(roles: Array<Role>): string {
        if (roles.length > 0) {
            return roles.map(i => i.role).join(', ');
        }

        return '-';
    }

    safeValue(item: string): string {
        return item ? item : '-';
    }

    onChangePage(ev: PageEvent): void {
        HelperService.debug('STORE EMPLOYEE PAGE CHANGED', ev);
    }

    onChangeStatus(item: UserStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusEmployee = this.ngxPermissions.hasPermission(
            'ACCOUNT.STORE.EMPLOYEE.UPDATE'
        );

        canChangeStatusEmployee.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    StoreActions.confirmChangeStatusStoreEmployee({ payload: item })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onDelete(item: UserStore): void {
        if (!item || !item.id) {
            return;
        }

        const canDeleteEmployee = this.ngxPermissions.hasPermission(
            'ACCOUNT.STORE.EMPLOYEE.DELETE'
        );

        canDeleteEmployee.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(StoreActions.confirmDeleteStoreEmployee({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onTrackBy(index: number, item: UserStore): string {
        return !item ? null : item.id;
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

}
