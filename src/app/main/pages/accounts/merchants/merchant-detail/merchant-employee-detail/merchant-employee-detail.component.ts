import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { IQueryParams, LifecyclePlatform, Role } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { UserStore } from '../../models';
import { StoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { StoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-employee-detail',
    templateUrl: './merchant-employee-detail.component.html',
    styleUrls: ['./merchant-employee-detail.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'content-card'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantEmployeeDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['name', 'role', 'phone-no', 'last-check-in', 'status', 'actions'];

    auth$: Observable<Auth>;
    dataSource$: Observable<Array<UserStore>>;
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
        private route: ActivatedRoute,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$notice: NoticeService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
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
        console.log('Change page', ev);
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

                this._initTable();

                this.store
                    .select(StoreSelectors.getIsRefresh)
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

        const { id } = this.route.parent.snapshot.params;

        this.store.dispatch(
            StoreActions.fetchStoreEmployeesRequest({
                payload: { params: data, storeId: id }
            })
        );
    }
}
