// Angular's Libraries
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PageEvent, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

// Environment variables.
import { environment } from '../../../../../environments/environment';
// Entity model.
import { Portfolio } from './models/portfolios.model';
// State management's stuffs.
import { FeatureState } from './store/reducers';
import { PortfolioActions } from './store/actions';
import { PortfolioSelector } from './store/selectors';
import { Router } from '@angular/router';
import { IQueryParams } from 'app/shared/models';

@Component({
    selector: 'app-portfolios',
    templateUrl: './portfolios.component.html',
    styleUrls: ['./portfolios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosComponent implements OnInit, OnDestroy, AfterViewInit {

    // Untuk menampung data portfolio.
    portfolios: Array<Portfolio>;
    // Untuk menampung status dari state portfolio.
    isLoading$: Observable<boolean>;
    // Untuk mendapatkan total portfolio.
    totalPortfolios$: Observable<number>;
    // Untuk unsubscribe semua Observable.
    subs$: Subject<void> = new Subject<void>();
    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultPageSize: number = environment.pageSize;
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedColumns: Array<string> = [
        // 'checkbox',
        'code',
        'name',
        'salesForce',
        'timestamp',
        'actions',
    ];
    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    selection: SelectionModel<Portfolio> = new SelectionModel<Portfolio>(true, []);

    // ViewChild untuk tabel.
    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    // ViewChild untuk MatPaginator.
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    // ViewChild untuk MatSort.
    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private portfolioStore: NgRxStore<FeatureState>,
        private router: Router,
    ) {
        // Mendapatkan state loading.
        this.isLoading$ = this.portfolioStore.select(
            PortfolioSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$),
        );

        // Mendapatkan total portfolio dari state.
        this.totalPortfolios$ = this.portfolioStore.select(
            PortfolioSelector.getTotalPortfolios
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mendapatkan data portfolio dari state.
        this.portfolioStore.select(
            PortfolioSelector.getAllPortfolios
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(portfolios => {
            this.portfolios = portfolios;
        });
    }

    /**
     * PRIVATE FUNCTIONS
     */
    private onRefreshTable(): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.paginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            if (this.sort.direction) {
                // Menentukan sort direction tabel.
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                
                // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
                if (this.sort.active === 'code') {
                    data['sortBy'] = 'store_code';
                }
            } else {
                // Sortir default jika tidak ada sort yang aktif.
                data['sort'] = 'desc';
                data['sortBy'] = 'id';
            }

            // Melakukan request store ke server via dispatch state.
            this.portfolioStore.dispatch(
                PortfolioActions.fetchPortfoliosRequest({ payload: data })
            );
        }
    }

    /**
     * PUBLIC FUNCTIONS
     */
    editPortfolio(id: string): void {

    }

    viewPortfolio(id: string): void {
        this.router.navigate([`/pages/sales-force/portfolio/${id}/detail`]);
    }

    onChangePage($event: PageEvent): void {

    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.portfolios.length;
        return numSelected === numRows;
    }

    masterToggle(): void {
        this.isAllSelected() ?
            this.selection.clear() :
            this.portfolios.forEach(row => this.selection.select(row));
    }

    /**
     * ANGULAR'S LIFECYCLE HOOKS
     */

    ngOnInit(): void {
        this.onRefreshTable();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel.
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.onRefreshTable();
        });
    }
}
