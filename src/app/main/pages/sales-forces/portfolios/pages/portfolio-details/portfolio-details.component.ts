import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge, combineLatest, of } from 'rxjs';
import { takeUntil, withLatestFrom, tap } from 'rxjs/operators';

// Environment variables.
import { environment } from '../../../../../../../environments/environment';
// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
// Entity model.
import { Portfolio } from '../../models/portfolios.model';
// State management's stuffs.
import { fromPortfolios, CoreFeatureState } from '../../store/reducers';
import { PortfolioActions, StoreActions } from '../../store/actions';
import { PortfolioSelector, StoreSelector, PortfolioStoreSelector } from '../../store/selectors';
import { UiActions } from 'app/shared/store/actions';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from 'app/main/pages/attendances/models';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { IQueryParams } from 'app/shared/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';

@Component({
    selector: 'app-portfolio-details',
    templateUrl: './portfolio-details.component.html',
    styleUrls: ['./portfolio-details.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

    // Untuk menandakan halaman detail dalam keadaan mode edit atau tidak.
    isEditMode: boolean;
    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan data portfolio yang sedang dibuka.
    portfolio: Portfolio;
    // Untuk menyimpan ID portfolio yang sedang dibuka.
    portfolioId: string;
    // Untuk menyimpan form yang akan dikirim ke server.
    form: FormGroup;
    // Untuk menyimpan Observable status loading dari state portfolio.
    isPortfolioLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;

    // Untuk menyimpan data store.
    listStore: MatTableDataSource<Store>;
    // Untuk menyimpan jumlah store yang ada di server.
    totalPortfolioStores$: Observable<number>;
    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultPageSize: number = environment.pageSize;
    // Menyimpan opsi jumlah data yang dapat ditampilkan dalam 1 halaman.
    defaultPageSizeOptions: Array<number> = environment.pageSizeTable;
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedColumns: Array<string> = [
        // 'checkbox',
        'code',
        'name',
        // 'region',
        'segment',
        'type'
    ];
    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    selection: SelectionModel<Store> = new SelectionModel<Store>(true, []);

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
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private storeState: NgRxStore<CoreFeatureState>,
        private route: ActivatedRoute,
        private router: Router,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _notice: NoticeService
    ) {
        // Mengambil ID portfolio dari URL.
        this.portfolioId = this.route.snapshot.params.id;

        // Menyiapkan breadcrumb yang ingin ditampilkan.
        const breadcrumbs = [
            {
                title: 'Home',
                translate: 'BREADCRUMBS.HOME',
                active: false
            },
            {
                title: 'Sales Rep Management',
                translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                url: '/pages/sales-force/portfolio'
            },
            {
                title: 'Detail Portfolio',
                translate: 'BREADCRUMBS.PORTFOLIO_DETAIL',
                active: true
            },
        ];

        // Mengambil status loading dari state-nya portfolio.
        this.isPortfolioLoading$ = this.portfolioStore.select(
            PortfolioSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil status loading dari state-nya store (merchant).
        this.isPortfolioStoreLoading$ = this.portfolioStore.select(
            PortfolioStoreSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        this.totalPortfolioStores$ = this.portfolioStore.select(
            PortfolioStoreSelector.getTotalPortfolioStores
        ).pipe(
            takeUntil(this.subs$)
        );

        // Menetapkan breadcrumb yang ingin ditampilkan.
        this.portfolioStore.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );
    }

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

            // Mencantumkan ID portfolio-nya untuk request data store.
            data['portfolioId'] = this.portfolioId;

            // Melakukan request store ke server via dispatch state.
            this.portfolioStore.dispatch(
                PortfolioActions.fetchPortfolioStoresRequest({ payload: data })
            );
        }
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.listStore.data.length;
        return numSelected === numRows;
    }

    masterToggle(): void {
        this.isAllSelected() ?
            this.selection.clear() :
            this.listStore.data.forEach(row => this.selection.select(row));
    }

    onChangePage(): void {
        this.onRefreshTable();
    }

    ngOnInit(): void {

        // Inisialisasi form.
        this.form = this.fb.group({
            code: [{ value: '', disabled: true }],
            name: [{ value: '', disabled: true }],
            salesForce: [{ value: '', disabled: true }],
        });

        // Mengambil data portfolio yang terpilih dari state.
        this.portfolioStore.select(
            PortfolioSelector.getAllPortfolios
        ).pipe(
            withLatestFrom(
                this.portfolioStore.select(PortfolioSelector.getSelectedPortfolio),
                this.portfolioStore.select(AuthSelectors.getUserSupplier),
                (_, portfolio, userSupplier) => ({ portfolio, userSupplier })
            ),
            takeUntil(this.subs$)
        ).subscribe(({ portfolio, userSupplier }) => {
            // Jika portfolio yang terpilih tidak ada, maka ambil dari server berdasarkan ID URL nya. 
            if (!portfolio) {
                // Tetapkan portfolio yang terpilih.
                this.portfolioStore.dispatch(
                    PortfolioActions.setSelectedPortfolios({ payload: [this.portfolioId] })
                );

                // Melakukan request data portfolio.
                return this.portfolioStore.dispatch(
                    PortfolioActions.fetchPortfolioRequest({ payload: this.portfolioId })
                );
            }

            // Jika portfolio-nya bukan milik user (ID supplier tidak sama)
            if (portfolio.invoiceGroup.supplierId !== userSupplier.supplierId) {
                // Munculkan error bahwa portfolio tidak ditemukan.
                this._notice.open('Portfolio not found.', 'error', {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom'
                });

                // Arahkan ke halaman depan portfolio.
                return this.router.navigate([
                    '/pages/sales-force/portfolio'
                ]);
            }

            this.portfolio = portfolio;
            this._cd.markForCheck();
        });

        // Mengambil data store dari state.
        this.portfolioStore.select(
            PortfolioStoreSelector.getAllPortfolioStores
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(stores => {
            this.listStore = new MatTableDataSource(stores);
        });
    }

    ngAfterViewInit(): void {
        // Melakukan trigger me-refresh tabel untuk mendapatkan data store.
        this.onRefreshTable();

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

    ngOnDestroy(): void {
        this.portfolioStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.portfolioStore.dispatch(UiActions.hideCustomToolbar());

        this.subs$.next();
        this.subs$.complete();
    }
}
