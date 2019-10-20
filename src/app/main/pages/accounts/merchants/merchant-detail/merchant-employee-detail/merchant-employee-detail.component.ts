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
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fromMerchant } from '../../store/reducers';
import { MerchantSelectors } from '../../store/selectors';

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
    dataSource: MatTableDataSource<any>;
    displayedColumns = ['no', 'name', 'role', 'phoneNumber', 'lastCheckIn', 'actions'];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    private _unSubs$: Subject<void>;

    constructor(private store: Store<fromMerchant.FeatureState>) {
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
            .select(MerchantSelectors.getAllStoreEmployee)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(source => {
                this.dataSource = new MatTableDataSource(source);
            });
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initTable(): void {}
}
