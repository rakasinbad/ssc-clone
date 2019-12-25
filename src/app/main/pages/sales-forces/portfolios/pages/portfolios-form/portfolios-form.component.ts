import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

// Environment variables.
import { environment } from '../../../../../../../environments/environment';
// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
// Entity model.
import { Portfolio } from '../../models/portfolios.model';
// State management's stuffs.
import { CoreFeatureState } from '../../store/reducers';
import { PortfolioActions } from '../../store/actions';
import { PortfolioSelector, PortfolioStoreSelector } from '../../store/selectors';
import { UiActions, DropdownActions } from 'app/shared/store/actions';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fromMerchant } from 'app/main/pages/accounts/merchants/store/reducers';
import { StoreSelectors as MerchantSelectors } from 'app/main/pages/accounts/merchants/store/selectors';
import { Store } from 'app/main/pages/attendances/models';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { IQueryParams, UserSupplier, InvoiceGroup, SupplierStore } from 'app/shared/models';
import { MerchantActions } from 'app/main/pages/attendances/store/actions';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownSelectors } from 'app/shared/store/selectors';

@Component({
    selector: 'app-portfolio-form',
    templateUrl: './portfolios-form.component.html',
    styleUrls: ['./portfolios-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfoliosFormComponent implements OnInit, AfterViewInit {

    // Untuk menandakan halaman detail dalam keadaan mode edit atau tidak.
    isEditMode: boolean;
    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan ID portfolio yang sedang dibuka.
    portfolioId: string;
    // Untuk menyimpan form yang akan dikirim ke server.
    form: FormGroup;
    // Untuk menyimpan Invoice Group.
    invoiceGroups: Array<InvoiceGroup>;
    // Untuk menyimpan Observable status loading dari state portfolio.
    isPortfolioLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state list store (merchant).
    isListStoreLoading$: Observable<boolean>;

    /**
     * SEGALA SESUATU YANG BERHUBUNGAN LIST STORE.
     */
    // Untuk menyimpan data store.
    listStore: Array<SupplierStore>;
    // Untuk menyimpan jumlah store yang ada di server.
    totalListStore$: Observable<number>;
    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultListStorePageSize: number = environment.pageSize;
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedListStoreColumns: Array<string> = [
        // 'checkbox',
        'code',
        'name',
        'region',
        'segment',
        'type,'
    ];
    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    listStoreSelection: SelectionModel<Store> = new SelectionModel<Store>(true, []);
    // ViewChild untuk tabel.
    @ViewChild('table#list-store', { read: ElementRef, static: true })
    listStoreTable: ElementRef;
    // ViewChild untuk MatPaginator.
    @ViewChild('#list-store-paginator', { static: true })
    listStorePaginator: MatPaginator;
    // ViewChild untuk MatSort.
    @ViewChild('#list-store-sort', { static: true })
    listStoreSort: MatSort;

    /**
     * SEGALA SESUATU YANG BERHUBUNGAN DENGAN PORTFOLIO STORE.
     */
    // Untuk menyimpan data store.
    portfolioStores: Array<Store>;
    // Untuk menyimpan jumlah store yang ada di server.
    totalPortfolioStore$: Observable<number>;
    // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    defaultPortfolioStorePageSize: number = environment.pageSize;
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedPortfolioStoreColumns: Array<string> = [
        // 'checkbox',
        'code',
        'name',
        'region',
        'segment',
        'type,'
    ];
    // Menyimpan data baris tabel yang tercentang oleh checkbox.
    portfolioStoreSelection: SelectionModel<Store> = new SelectionModel<Store>(true, []);

    // ViewChild untuk tabel.
    @ViewChild('table#list-store', { read: ElementRef, static: true })
    portfolioStoreTable: ElementRef;

    // ViewChild untuk MatPaginator.
    @ViewChild('#list-store-paginator', { static: true })
    portfolioStorePaginator: MatPaginator;

    // ViewChild untuk MatSort.
    @ViewChild('#list-store-sort', { static: true })
    portfolioStoreSort: MatSort;

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private merchantStore: NgRxStore<fromMerchant.FeatureState>,
        private dropdownStore: NgRxStore<fromDropdown.State>,
        private route: ActivatedRoute,
        private router: Router,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService,
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
                title: 'Portfolio',
                translate: 'BREADCRUMBS.PORTFOLIO',
                url: '/pages/portfolio'
            },
            {
                title: 'Add Portfolio',
                translate: 'BREADCRUMBS.PORTFOLIO_ADD',
                active: true
            },
        ];

        // Mengambil status loading dari state-nya portfolio.
        this.isPortfolioLoading$ = this.portfolioStore.select(
            PortfolioSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil status loading dari state store-nya portfolio.
        this.isPortfolioStoreLoading$ = this.portfolioStore.select(
            PortfolioStoreSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil status loading dari state-nya store (merchant).
        this.isListStoreLoading$ = this.merchantStore.select(
            MerchantSelectors.getIsLoading
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil data Invoice Group dari state.
        this.dropdownStore.select(
            DropdownSelectors.getInvoiceGroupDropdownState
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(invoiceGroups => {
            if (invoiceGroups.length === 0) {
                return this.dropdownStore.dispatch(
                    DropdownActions.fetchDropdownInvoiceGroupRequest()
                );
            }

            this.invoiceGroups = invoiceGroups;
        });

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

    private onRefreshListStoreTable(): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.listStorePaginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const data: IQueryParams = {
                limit: this.listStorePaginator.pageSize || this.defaultListStorePageSize,
                skip: this.listStorePaginator.pageSize * this.listStorePaginator.pageIndex || 0
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            if (this.listStoreSort.direction) {
                // Menentukan sort direction tabel.
                data['sort'] = this.listStoreSort.direction === 'desc' ? 'desc' : 'asc';
                
                // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
                if (this.listStoreSort.active === 'code') {
                    data['sortBy'] = 'store_code';
                } else {
                    data['sortBy'] = this.listStoreSort.active;
                }
            } else {
                // Sortir default jika tidak ada sort yang aktif.
                data['sort'] = 'desc';
                data['sortBy'] = 'id';
            }

            // Melakukan request store ke server via dispatch state.
            this.merchantStore.dispatch(
                MerchantActions.fetchStoresRequest({ payload: data })
            );
        }
    }

    private onRefreshPortfolioStoreTable(): void {
        // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
        if (this.portfolioStorePaginator) {
            // Menyiapkan query parameter yang akan dikirim ke server.
            const data: IQueryParams = {
                limit: this.portfolioStorePaginator.pageSize || this.defaultPortfolioStorePageSize,
                skip: this.portfolioStorePaginator.pageSize * this.portfolioStorePaginator.pageIndex || 0
            };

            // Menyalakan pagination.
            data['paginate'] = true;

            if (this.portfolioStoreSort.direction) {
                // Menentukan sort direction tabel.
                data['sort'] = this.portfolioStoreSort.direction === 'desc' ? 'desc' : 'asc';
                
                // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
                if (this.portfolioStoreSort.active === 'code') {
                    data['sortBy'] = 'store_code';
                } else {
                    data['sortBy'] = this.portfolioStoreSort.active;
                }
            } else {
                // Sortir default jika tidak ada sort yang aktif.
                data['sort'] = 'desc';
                data['sortBy'] = 'id';
            }

            // Melakukan request store ke server via dispatch state.
            this.portfolioStore.dispatch(
                PortfolioActions.fetchPortfolioStoresRequest({ payload: data })
            );
        }
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const {
            ignoreTouched,
            ignoreDirty
        } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    ngOnInit(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            code: [{ value: '', disabled: true }],
            name: [{ value: '', disabled: false }],
            type: [{ value: '', disabled: false }],
            invoiceGroup: [{ value: '', disabled: false }],
            salesRep: [{ value: '', disabled: true }],
        });

        // Mengambil data portfolio yang terpilih dari state.
        // this.portfolioStore.select(
        //     PortfolioSelector.getSelectedPortfolio
        // ).pipe(
        //     withLatestFrom(this.portfolioStore.select(AuthSelectors.getUserSupplier)),
        //     takeUntil(this.subs$)
        // ).subscribe(([portfolio, userSupplier]: [Portfolio, UserSupplier]) => {
        //     // Jika portfolio yang terpilih tidak ada, maka ambil dari server berdasarkan ID URL nya. 
        //     if (!portfolio) {
        //         return this.portfolioStore.dispatch(
        //             PortfolioActions.fetchPortfolioRequest({ payload: this.portfolioId })
        //         );
        //     }

        //     // Jika portfolio-nya bukan milik user (ID supplier tidak sama)
        //     if (portfolio.invoiceGroup.supplierId !== userSupplier.supplierId) {
        //         // Munculkan error bahwa portfolio tidak ditemukan.
        //         this._notice.open('Portfolio not found.', 'error', {
        //             horizontalPosition: 'right',
        //             verticalPosition: 'bottom'
        //         });

        //         // Arahkan ke halaman depan portfolio.
        //         return this.router.navigate([
        //             '/pages/sales-force/portfolio'
        //         ]);
        //     }
        // });

        // Mengambil data list store dari state.
        this.merchantStore.select(
            MerchantSelectors.getAllStore
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(stores => {
            this.listStore = stores;
        });

        // Mengambil data store-nya portfolio dari state.
        this.portfolioStore.select(
            PortfolioStoreSelector.getAllPortfolioStores
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(stores => {
            this.portfolioStores = stores;
        });
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel List Store.
        // merge(
        //     this.listStoreSort.sortChange,
        //     this.listStorePaginator.page
        // ).pipe(
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     this.onRefreshListStoreTable();
        // });

        // Melakukan merge Observable pada perubahan sortir dan halaman tabel Portfolio Store.
        // merge(
        //     this.portfolioStoreSort.sortChange,
        //     this.portfolioStorePaginator.page
        // ).pipe(
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     this.onRefreshPortfolioStoreTable();
        // });
    }
}
