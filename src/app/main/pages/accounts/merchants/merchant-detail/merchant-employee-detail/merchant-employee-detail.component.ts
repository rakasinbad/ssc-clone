import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
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
import { Role } from 'app/main/pages/roles/role.model';
import { IQueryParams } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { StoreEmployee } from '../../models';
import { MerchantApiService } from '../../services';
import { BrandStoreActions } from '../../store/actions';
import { fromMerchant } from '../../store/reducers';
import { BrandStoreSelectors } from '../../store/selectors';

@Component({
    selector: 'app-merchant-employee-detail',
    templateUrl: './merchant-employee-detail.component.html',
    styleUrls: ['./merchant-employee-detail.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    // host: {
    //     class: 'content-card'
    // },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantEmployeeDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    // dataSource: MatTableDataSource<any>; // Need for demo
    displayedColumns = ['id', 'name', 'role', 'phone-no', 'last-check-in', 'actions'];

    dataSource$: Observable<StoreEmployee[]>;
    selectedRowIndex$: Observable<string>;
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
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$merchantApi: MerchantApiService
    ) {
        // this.dataSource = new MatTableDataSource(); // Need for demo
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
        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        this.dataSource$ = this.store.select(BrandStoreSelectors.getAllStoreEmployee);
        /* .pipe(
            filter(source => source.length > 0),
            delay(1000),
            startWith(this._$merchantApi.initStoreEmployee())
        ); */
        this.totalDataSource$ = this.store.select(BrandStoreSelectors.getTotalStoreEmployee);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(BrandStoreSelectors.getIsLoading);

        this.initTable();

        this.store
            .select(BrandStoreSelectors.getIsRefresh)
            .pipe(
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(isRefresh => {
                console.log('TRY Refresh', isRefresh);
                if (isRefresh) {
                    this.onRefreshTable();
                }
            });

        // Need for demo
        // this.store
        //     .select(BrandStoreSelectors.getAllStoreEmployee)
        //     .pipe(takeUntil(this._unSubs$))
        //     .subscribe(source => {
        //         this.dataSource = new MatTableDataSource(source);
        //     });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Need for demo
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.initTable();
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(BrandStoreActions.resetStoreEmployees());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    joinRoles(roles: Role[]): string {
        if (roles.length > 0) {
            return roles.map(i => i.role).join(',<br>');
        }

        return '-';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onChangeStatus(item: StoreEmployee): void {
        console.log('CHANGE', item);

        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(BrandStoreActions.confirmChangeStatusStoreEmployee({ payload: item }));

        return;
    }

    onDelete(item: StoreEmployee): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(BrandStoreActions.confirmDeleteStoreEmployee({ payload: item }));

        return;
    }

    onTrackBy(index: number, item: StoreEmployee): string {
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

        const { id } = this.route.parent.snapshot.params;

        this.store.dispatch(
            BrandStoreActions.fetchStoreEmployeesRequest({
                payload: {
                    params: data,
                    storeId: id
                }
            })
        );
    }
}
