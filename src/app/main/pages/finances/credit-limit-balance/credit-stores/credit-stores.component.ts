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
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CreditStoreFormComponent } from '../credit-store-form/credit-store-form.component';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-stores',
    templateUrl: './credit-stores.component.html',
    styleUrls: ['./credit-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditStoresComponent implements OnInit, AfterViewInit, OnDestroy {
    dataSource: MatTableDataSource<any>; // Need for demo
    displayedColumns = [
        'id',
        'name',
        'limit',
        'balance',
        'receivable',
        'limit-group',
        'segment',
        'top',
        'last-update',
        'actions'
    ];
    today = new Date();

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(
        private matDialog: MatDialog,
        private store: Store<fromCreditLimitBalance.FeatureState>
    ) {
        this.dataSource = new MatTableDataSource();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

        // Need for demo
        this.store
            .select(CreditLimitBalanceSelectors.getAllCreditLimitBalance)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(source => (this.dataSource = new MatTableDataSource(source)));
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        // Need for demo
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

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

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onEdit(item): void {
        this.matDialog.open(CreditStoreFormComponent, {
            data: {
                title: 'Set Credit Limit & Balance'
            },
            disableClose: true
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initTable(): void {}
}
