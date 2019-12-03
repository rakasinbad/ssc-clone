import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { IQueryParams, Role, UserSupplier } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

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
    search: FormControl;
    total: number;
    displayedColumns = ['user', 'email', 'role', 'actions'];

    dataSource$: Observable<UserSupplier[]>;
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
        private store: Store<fromInternal.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Internal',
                        translate: 'BREADCRUMBS.INTERNAL',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.search = new FormControl('');
        this.paginator.pageSize = this.defaultPageSize;
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        localStorage.removeItem('filter.internal.employee');

        this.dataSource$ = this.store.select(InternalSelectors.getAllInternalEmployee);
        this.totalDataSource$ = this.store.select(InternalSelectors.getTotalInternalEmployee);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(InternalSelectors.getIsLoading);

        this.initTable();

        this.search.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(v => {
                if (v) {
                    localStorage.setItem('filter.internal.employee', v);
                }

                this.onRefreshTable();
            });

        this.store
            .select(InternalSelectors.getIsRefresh)
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

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(InternalActions.resetInternalEmployees());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    get searchInternalEmployee(): string {
        return localStorage.getItem('filter.internal.employee') || '';
    }

    joinRoles(roles: Role[]): string {
        if (roles.length > 0) {
            return roles.map(i => i.role).join(',<br>');
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

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(InternalActions.confirmChangeStatusInternalEmployee({ payload: item }));
    }

    onDelete(item: UserSupplier): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(InternalActions.confirmDeleteInternalEmployee({ payload: item }));
    }

    onRemoveSearchInternalEmployee(): void {
        localStorage.removeItem('filter.internal.employee');
        this.search.reset();
    }

    onTrackBy(index: number, item: UserSupplier): string {
        return !item ? null : item.id;
    }

    safeValue(item: any): any {
        return item ? item : '-';
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

        if (this.search.value) {
            const query = this.search.value;

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
