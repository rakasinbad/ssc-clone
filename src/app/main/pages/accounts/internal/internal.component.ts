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
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Role } from 'app/shared/models/role.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { Auth } from '../../core/auth/models';
import { AuthSelectors } from '../../core/auth/store/selectors';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { InternalActions } from './store/actions';
import { fromInternal } from './store/reducers';
import { InternalSelectors } from './store/selectors';

@Component({
    selector: 'app-internal',
    templateUrl: './internal.component.html',
    styleUrls: ['./internal.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Internal Employee'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        },
        add: {
            permissions: ['ACCOUNT.INTERNAL.CREATE']
        },
        export: {
            // permissions: ['OMS.EXPORT']
        },
        import: {
            // permissions: ['OMS.IMPORT'],
            // useAdvanced: true,
            // pageType: ''
        }
    };
    displayedColumns = ['user', 'email', 'role', 'status', 'actions'];

    search: FormControl = new FormControl('');

    auth$: Observable<Auth>;
    dataSource$: Observable<Array<UserSupplier>>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<void> = new Subject<void>();

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
            // translate: 'BREADCRUMBS.HOME'
        },
        // {
        //     title: 'Account',
        //     translate: 'BREADCRUMBS.ACCOUNT'
        // },
        {
            title: 'User Management',
            translate: 'BREADCRUMBS.INTERNAL',
            active: true
        }
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private router: Router,
        private route: ActivatedRoute,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromInternal.FeatureState>,
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

    get searchInternalEmployee(): string {
        return localStorage.getItem('filter.internal.employee') || '';
    }

    joinRoles(roles: Role[]): string {
        if (roles && roles.length > 0) {
            const newRoles = roles.map(i => i.role);

            return newRoles.length > 0 ? newRoles.join(',<br>') : '-';
        }

        return '-';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onChangeStatus(item: UserSupplier): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    InternalActions.confirmChangeStatusInternalEmployee({ payload: item })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/account/internal/new');
    }

    onDelete(item: UserSupplier): void {
        if (!item || !item.id) {
            return;
        }

        const canDelete = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.DELETE');

        canDelete.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(
                    InternalActions.confirmDeleteInternalEmployee({ payload: item })
                );
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    goUserInfoPage(id, row): void
    {
        HelperService.debug("ROW CLICKED", {id, row});
        this.router.navigateByUrl(`/pages/account/internal/${id}/detail`);
    }

    onEdit(id): void
    {
        HelperService.debug("EDIT CLICKED", {id});
        this.router.navigateByUrl(`/pages/account/internal/${id}/edit`);
    }

    onRemoveSearchInternalEmployee(): void {
        localStorage.removeItem('filter.internal.employee');
        this.search.reset();
    }

    onTrackBy(index: number, item: UserSupplier): string {
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
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });

                const canDoActions = this.ngxPermissions.hasPermission([
                    'ACCOUNT.INTERNAL.UPDATE',
                    'ACCOUNT.INTERNAL.DELETE'
                ]);

                canDoActions.then(hasAccess => {
                    if (hasAccess) {
                        this.displayedColumns = ['user', 'email', 'role', 'status', 'created_at', 'updated_at', 'actions'];
                    } else {
                        this.displayedColumns = ['user', 'email', 'role', 'status', 'created_at', 'updated_at', 'actions'];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state internals
                this.store.dispatch(InternalActions.resetInternalEmployees());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true
                });

                // localStorage.removeItem('filter.internal.employee');

                this.auth$ = this.store.select(AuthSelectors.getUserState);
                this.dataSource$ = this.store.select(InternalSelectors.getAllInternalEmployee);
                this.totalDataSource$ = this.store.select(
                    InternalSelectors.getTotalInternalEmployee
                );
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = this.store.select(InternalSelectors.getIsLoading);

                this._initTable();

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

                this.store
                    .select(InternalSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(isRefresh => {
                        if (isRefresh) {
                            this._onRefreshTable();
                        }
                    });
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

            this.store.dispatch(InternalActions.fetchInternalEmployeesRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
