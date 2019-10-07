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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IQueryParams } from 'app/shared/models/query.model';
import * as fromRoot from 'app/store/app.reducer';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { IAccount, Account } from './models/account.model';
import { AccountActions } from './store/actions';
import { AccountSelectors } from './store/selectors';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent implements OnInit, AfterViewInit, OnDestroy {
    total: number;
    displayedColumns = [
        'checkbox',
        'id',
        'image',
        'name',
        'phone',
        'store',
        'roles',
        'odooid',
        'actions'
    ];
    hasSelected: boolean;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private store: Store<fromRoot.State>,
        private translateService: TranslateService,
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
        this.hasSelected = false;
        this.paginator.pageSize = 5;

        this.initTable();

        this.store
            .pipe(
                select(AccountSelectors.getIsDeleting),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(isDeleting => {
                if (isDeleting) {
                    this.onRefresTable();
                }
            });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                tap(() => this.initTable())
                // takeUntil(this._unSubs$)
            )
            .subscribe();
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

    get dataSource$(): Observable<Account[]> {
        return this.store.pipe(
            select(AccountSelectors.getAllAccount),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
    }

    get totalDataSource$(): Observable<number> {
        return this.store.pipe(
            select(AccountSelectors.getTotalAccount),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
    }

    get isLoading$(): Observable<boolean> {
        return this.store.pipe(
            select(AccountSelectors.getIsLoading),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
    }

    joinRoles(roles): string {
        if (roles.length > 0) {
            return roles.map(i => i.role).join(',<br>');
        }

        return roles;
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onDelete(item: Account): void {
        if (!item) {
            return;
        }

        this.store.dispatch(AccountActions.deleteAccountRequest({ payload: item.id }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefresTable(): void {
        this.paginator.pageIndex = 0;
        this.initTable();
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

        // if (this.keywords) {
        //     if (!this.keyFilter || this.keyFilter === 'all') {
        //         data['search'] = [
        //             {
        //                 fieldName: 'name',
        //                 keyword: this.keywords
        //             }
        //             // {
        //             //     fieldName: 'investmentManager',
        //             //     keyword  : this.keywords
        //             // },
        //             // {
        //             //     fieldName: 'category',
        //             //     keyword  : this.keywords
        //             // }
        //         ];
        //     } else {
        //         data['search'] = [
        //             {
        //                 fieldName: this.keyFilter,
        //                 keyword: this.keywords
        //             }
        //         ];
        //     }
        // }

        this.store.dispatch(
            AccountActions.fetchAccountsRequest({
                payload: data
            })
        );
    }
}
