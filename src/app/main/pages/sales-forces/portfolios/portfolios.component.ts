// Angular's Libraries
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
    TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store as NgRxStore } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { Portfolio } from './models/portfolios.model';
import { PortfolioActions } from './store/actions';
import { CoreFeatureState } from './store/reducers';
import { PortfolioSelector } from './store/selectors';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';

@Component({
    selector: 'app-portfolios',
    templateUrl: './portfolios.component.html',
    styleUrls: ['./portfolios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosComponent implements OnInit, OnDestroy, AfterViewInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Portfolio'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        },
        // add: {
        //     permissions: ['SRM.PFO.CREATE'],
        //     onClick: () => this.addPortfolio()
        // },
        export: {
            permissions: ['SRM.PFO.EXPORT'],
            useAdvanced: true,
            pageType: 'portfolios'
        },
        import: {
            permissions: ['SRM.PFO.IMPORT'],
            useAdvanced: true,
            pageType: 'portfolios'
        }
    };

    // Untuk menangani search bar.
    search: FormControl;
    // Untuk menampung data portfolio.
    portfolios: Array<Portfolio>;
    // Untuk menampung status dari state portfolio.
    isLoading$: Observable<boolean>;
    // Untuk menampung status dari state request export.
    isRequestingExport$: Observable<boolean>;
    // Untuk mendapatkan total portfolio.
    totalPortfolios$: Observable<number>;
    // Untuk unsubscribe semua Observable.
    subs$: Subject<void> = new Subject<void>();
    // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    displayedColumns: Array<string> = [
        // 'checkbox',
        'code',
        'name',
        'salesForce',
        'timestamp',
        'actions'
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

    // ViewChild untuk penjelasan singkat mengenai Portfolio.
    @ViewChild('portfolioExplanation', { static: false })
    portfolioExplanation: TemplateRef<any>;

    constructor(
        private _cd: ChangeDetectorRef,
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private exportStore: NgRxStore<fromExport.State>,
        private router: Router,
        private readonly sanitizer: DomSanitizer,
        private ngxPermissionsService: NgxPermissionsService,
        private applyDialogFactory: ApplyDialogFactoryService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
    ) {
        this.portfolioStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Sales Management',
                        translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT'
                    },
                    {
                        title: 'Portfolio',
                        translate: 'BREADCRUMBS.PORTFOLIO',
                        active: true
                    }
                ]
            })
        );

        // Mendapatkan state loading.
        this.isLoading$ = this.portfolioStore
            .select(PortfolioSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        // Mendapatkan state loading.
        this.isRequestingExport$ = this.exportStore
            .select(ExportSelector.getRequestingState)
            .pipe(takeUntil(this.subs$));

        // Mendapatkan total portfolio dari state.
        this.totalPortfolios$ = this.portfolioStore
            .select(PortfolioSelector.getTotalPortfolios)
            .pipe(takeUntil(this.subs$));

        // Mendapatkan data portfolio dari state.
        this.portfolioStore
            .select(PortfolioSelector.getAllPortfolios)
            .pipe(takeUntil(this.subs$))
            .subscribe(portfolios => {
                // Mengambil data dari state.
                this.portfolios = portfolios;
                // Meng-update UI sesuai data yang didapat.
                this._cd.markForCheck();
            });

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
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

            // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
            const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
            // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
            if (searchValue) {
                data['search'] = [
                    {
                        fieldName: 'code',
                        keyword: searchValue
                    },
                    {
                        fieldName: 'name',
                        keyword: searchValue
                    }
                ];
            }

            // Melakukan request store ke server via dispatch state.
            this.portfolioStore.dispatch(
                PortfolioActions.fetchPortfoliosRequest({ payload: data })
            );
        }
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.PFO.UPDATE', 'SRM.PFO.DELETE'])
            .then(result => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        // 'checkbox',
                        'code',
                        'name',
                        'salesForce',
                        'timestamp',
                        'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'code',
                        'name',
                        'salesForce',
                        'timestamp'
                        // 'actions',
                    ];
                }
            });
    }

    /**
     * PUBLIC FUNCTIONS
     */
    openPortfolioExplanation(): void {
        this.applyDialogFactory.open(
            {
                title: 'Portfolio',
                template: this.portfolioExplanation,
                isApplyEnabled: true,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '75vw',
                minWidth: '75vw',
                maxWidth: '75vw',
                height: '80vh',
                panelClass: 'dialog-container-no-padding'
            }
        );
    }

    exportPortfolio(): void {
        this.portfolioStore.dispatch(PortfolioActions.exportPortfoliosRequest());
    }

    addPortfolio(): void {
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());

        this.router.navigate(['/pages/sales-force/portfolio/add']);
    }

    editPortfolio(id: string): void {
        this.router.navigate([`/pages/sales-force/portfolio/${id}/edit`]);
    }

    viewPortfolio(id: string): void {
        this.portfolioStore.dispatch(PortfolioActions.setSelectedPortfolios({ payload: [id] }));

        this.router.navigate([`/pages/sales-force/portfolio/${id}/detail`]);
    }

    onChangePage($event: PageEvent): void {}

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.portfolios.length;
        return numSelected === numRows;
    }

    masterToggle(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.portfolios.forEach(row => this.selection.select(row));
    }

    /**
     * ANGULAR'S LIFECYCLE HOOKS
     */

    ngOnInit(): void {
        this.search = new FormControl('');

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(value => {
                    const sanitized = !!this.sanitizer.sanitize(SecurityContext.HTML, value);

                    if (sanitized) {
                        return true;
                    } else {
                        if (value.length === 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                this.onRefreshTable();
            });

        this.updatePrivileges();
        this.onRefreshTable();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
        this.portfolioStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.portfolioStore.dispatch(UiActions.hideCustomToolbar());
    }

    ngAfterViewInit(): void {
        // Melakukan merge Observable pada perubahan sortir dan halaman tabel.
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                this.onRefreshTable();
            });
    }
}
