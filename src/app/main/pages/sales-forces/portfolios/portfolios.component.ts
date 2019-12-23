// Angular's Libraries
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PageEvent } from '@angular/material';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Environment variables.
import { environment } from '../../../../../environments/environment';
// Entity model.
import { Portfolio } from './models/portfolios.model';
// State management's stuffs.
import { fromPortfolios, FeatureState } from './store/reducers';
import { PortfolioActions } from './store/actions';
import { PortfolioSelector } from './store/selectors';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'app-portfolios',
    templateUrl: './portfolios.component.html',
    styleUrls: ['./portfolios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosComponent implements OnInit, OnDestroy {

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
        'actions,'
    ];
    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    selection: SelectionModel<Portfolio> = new SelectionModel<Portfolio>(true, []);

    constructor(
        private portfolioStore: NgRxStore<FeatureState>
    ) {
        // Mendapatkan state loading.
        this.isLoading$ = this.portfolioStore.select(
            PortfolioSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mendapatkan total portfolio dari state.
        this.totalPortfolios$ = this.portfolioStore.select(
            PortfolioSelector.getTotalPortfolios
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    /**
     * PUBLIC FUNCTIONS
     */
    editPortfolio(id: string): void {

    }

    viewPortfolio(id: string): void {

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
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }
}
