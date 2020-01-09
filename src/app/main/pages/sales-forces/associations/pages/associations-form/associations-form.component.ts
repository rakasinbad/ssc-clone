import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subject, Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Store as NgRxStore } from '@ngrx/store';

// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { InvoiceGroup, IQueryParams } from 'app/shared/models';
import { CoreFeatureState } from '../../../portfolios/store/reducers';
import { fromDropdown } from 'app/shared/store/reducers';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { PortfolioSelector, PortfolioStoreSelector, StoreSelector } from '../../../portfolios/store/selectors';
import { takeUntil, filter, withLatestFrom, startWith, tap, take } from 'rxjs/operators';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { StoreActions, PortfolioActions } from '../../../portfolios/store/actions';
import { FeatureState as SalesRepsFeatureState } from '../../../sales-reps/store/reducers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { SalesRep } from '../../../sales-reps/models';
import { SalesRepSelectors } from '../../../sales-reps/store/selectors';
import { SalesRepActions } from '../../../sales-reps/store/actions';
import { map } from 'rxjs/operators';
import { Portfolio } from '../../../portfolios/models';
import { AssociationsFilterPortfoliosComponent } from '../../components/filter-portfolios/associations-filter-portfolios.component';
import { IAssociationForm } from '../../models';

import * as fromAssociation from '../../store/reducers';
import { AssociationActions } from '../../store/actions';
// 
@Component({
    selector: 'app-associations-form',
    templateUrl: './associations-form.component.html',
    styleUrls: ['./associations-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationsFormComponent implements OnInit, OnDestroy, AfterViewInit {

    // Link untuk kembali ke halaman depan Association.
    associationsHome = '/pages/sales-force/associations';

    // Untuk menandakan halaman detail dalam keadaan mode edit atau tidak.
    isEditMode: boolean;
    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    // Untuk search list store.
    search: FormControl;
    // Untuk menyimpan ID association yang sedang dibuka.
    associationId: string;
    // Untuk menyimpan form yang akan dikirim ke server.
    form: FormGroup;

    // Untuk menyimpan portfolio-portfolio yang tersedia.
    availablePortfolios$: Observable<Array<Portfolio>>;
    // Untuk menyimpan portfolio-portfolio yang terpilih.
    selectedPortfolios$: Observable<Array<Portfolio>>;
    // Untuk menyimpan jumlah portfolio yang sudah terpilih.
    totalSelectedPortfolios$: Observable<number>;

    // Untuk menyimpan Sales Reps.
    salesReps$: Observable<Array<SalesRep>>;
    // Untuk mendapatkan Sales Rep. yang terpilih.
    selectedSalesRep$: Observable<SalesRep>;
    // Untuk menyimpan Invoice Group.
    invoiceGroups$: Observable<Array<InvoiceGroup>>;
    // Untuk menyimpan Observable status loading dari state portfolio.
    isPortfolioLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state list store (merchant).
    isListStoreLoading$: Observable<boolean>;

    salesRepForm$: Observable<string>;
    invoiceGroupForm$: Observable<string>;

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
        private associationStore: NgRxStore<fromAssociation.FeatureState>,
        private salesRepStore: NgRxStore<SalesRepsFeatureState>,
        private dropdownStore: NgRxStore<fromDropdown.State>,
        private matDialog: MatDialog,
        private readonly sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService
    ) {
        // Mengambil ID association dari param URL.
        this.associationId = this.route.snapshot.params.id;

        // Mengambil status loading dari state-nya portfolio.
        this.isPortfolioLoading$ = this.portfolioStore
            .select(PortfolioSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        // Mengambil status loading dari state store-nya portfolio.
        // this.isPortfolioStoreLoading$ = this.portfolioStore
        //     .select(PortfolioStoreSelector.getLoadingState)
        //     .pipe(takeUntil(this.subs$));
        // Mengambil status loading dari state-nya store (merchant).
        // this.isListStoreLoading$ = this.shopStore
        //     .select(StoreSelector.getLoadingState)
        //     .pipe(takeUntil(this.subs$));
        // Mengambil data Invoice Group dari state.
        this.invoiceGroups$ = this.dropdownStore
            .select(DropdownSelectors.getInvoiceGroupDropdownState)
            .pipe(
                filter(invoiceGroups => {
                    if (invoiceGroups.length === 0) {
                        this.dropdownStore.dispatch(
                            DropdownActions.fetchDropdownInvoiceGroupRequest()
                        );
                    }

                    return true;
                }),
                takeUntil(this.subs$)
            );

        // Mengambil data Sales Reps. dari state.
        this.salesReps$ = this.salesRepStore
            .select(SalesRepSelectors.selectAll)
            .pipe(
                filter(salesReps => {
                    if (salesReps.length === 0) {
                        this.salesRepStore.dispatch(
                            SalesRepActions.fetchSalesRepsRequest({
                                payload: {
                                    paginate: true
                                }
                            })
                        );
                    }

                    return true;
                }),
                takeUntil(this.subs$)
            );

        // Untuk meng-handle Sales Rep. yang terpilih.
        // this.selectedSalesRep$ = this.salesRepStore
        //     .select(SalesRepSelectors.getSelectedItem)
        //     .pipe(
        //         takeUntil(this.subs$)
        //     );

        // Mengambil jumlah portfolio.
        this.selectedPortfolios$ = this.portfolioStore.select(
                                        PortfolioSelector.getSelectedPortfolioIds
                                    ).pipe(
                                        withLatestFrom(
                                            this.portfolioStore.select(PortfolioSelector.getAllPortfolios)
                                        ),
                                        map(([portfolioIds, portfolios]) =>
                                            portfolios.filter(portfolio =>
                                                portfolioIds.includes(portfolio.id)
                                            )
                                        ),
                                        takeUntil(this.subs$)
                                    );

        // Mengaambil jumlah portfolio yang terpilih.
        this.totalSelectedPortfolios$ = this.selectedPortfolios$
                                            .pipe(
                                                map(selected => selected.length),
                                                takeUntil(this.subs$)
                                            );

        // Memuat footer action untuk keperluan form.
        this.portfolioStore.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor Konten Produk',
                            active: true
                        },
                        value: {
                            active: false
                        },
                        active: false
                    },
                    action: {
                        goBack: {
                            label: 'Cancel',
                            active: true,
                            url: this.associationsHome
                        },
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: false
                        }
                    }
                }
            })
        );

        // Mengatur ulang status form.
        this.portfolioStore.dispatch(FormActions.resetFormStatus());

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    private initBreadcrumb(): void {
        if (this.isEditMode) {
            this.portfolioStore.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME',
                            active: false
                        },
                        {
                            title: 'Sales Rep Management',
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: this.associationsHome
                        },
                        {
                            title: 'Edit Association',
                            translate: 'BREADCRUMBS.ASSOCIATION_EDIT',
                            active: true
                        }
                    ]
                })
            );
        } else {
            this.portfolioStore.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME',
                            active: false
                        },
                        {
                            title: 'Sales Rep Management',
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: this.associationsHome
                        },
                        {
                            title: 'Add Association',
                            translate: 'BREADCRUMBS.ASSOCIATION_ADD',
                            active: true
                        }
                    ]
                })
            );
        }
    }

    private initForm(): void {
        // Inisialisasi FormControl untuk search.
        this.search = new FormControl('');

        // Inisialisasi form.
        this.form = this.fb.group({
            // code: [{ value: '', disabled: true }],
            salesRep: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            // type: [
            //     { value: 'group', disabled: false },
            //     [
            //         RxwebValidators.required({
            //             message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
            //         })
            //     ]
            // ],
            invoiceGroup: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            portfolios: [[]],
            removedPortfolios: [[]],
        });

        // this.form.get('salesRep').valueChanges.pipe(startWith(''));
        this.salesRepForm$ = this.form.get('salesRep').valueChanges.pipe(
            takeUntil(this.subs$)
        );

        this.invoiceGroupForm$ = this.form.get('invoiceGroup').valueChanges.pipe(
            takeUntil(this.subs$)
        );

        this.selectedSalesRep$ = combineLatest([
            (this.form.get('salesRep').valueChanges as Observable<string>),
            this.salesRepStore.select(SalesRepSelectors.getSelectedItem),
        ]).pipe(
                withLatestFrom(
                    this.salesRepStore.select(SalesRepSelectors.selectEntities),
                    ([[salesRepId, _]], salesReps) => ({ salesRepId, salesReps })
                ),
                map(({ salesRepId, salesReps }) => {
                    if (!salesReps[salesRepId]) {
                        this.salesRepStore.dispatch(
                            SalesRepActions.fetchSalesRepRequest({
                                payload: salesRepId
                            })
                        );
                    } else {
                        return salesReps[salesRepId];
                    }
                }),
                takeUntil(this.subs$)
            );

        this.portfolioStore
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this.subs$)
            )
            .subscribe(isClick => {
                /** Jika menekannya, maka submit data form-nya. */
                if (isClick) {
                    this.submitAssociations();
                }
            });

        this.portfolioStore.dispatch(UiActions.showFooterAction());
    }

    processAssociationForm(form: IAssociationForm): void {
        // Menambah toko-toko yang ingin dihapus ke dalam form.
        form.delete = (this.form.get('removedPortfolios').value as Array<Portfolio>)
                                .map(portfolio => +portfolio.id);

        // Melakukan request ke back-end untuk create / update association.
        this.associationStore.dispatch(
            AssociationActions.createAssociationRequest({ payload: form })
        );
    }

    submitAssociations(): void {
        const rawPortfolioIds = (this.form.get('portfolios').value as Array<number>);

        const associationsForm: IAssociationForm = {
            userId: this.form.get('salesRep').value,
            portfolioId: rawPortfolioIds,
        };

        this.processAssociationForm(associationsForm);
    }

    updateSelectedTab(tabId: number): void {
        if (tabId === 0) {
            this.portfolioStore.dispatch(
                PortfolioActions.setPortfolioEntityType({ payload: 'inside' })
            );
        } else if (tabId === 1) {
            this.portfolioStore.dispatch(
                PortfolioActions.setPortfolioEntityType({ payload: 'outside' })
            );
        }
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

    openFilter(): void {
        this.matDialog.open(AssociationsFilterPortfoliosComponent, {
            data: {
                title: 'Filter'
            },
            disableClose: true,
            width: '1000px'
        });
    }

    checkFormValidation(form: FormGroup, portfolios: Array<Portfolio>): void {
        if (form.invalid || portfolios.length === 0) {
            this.portfolioStore.dispatch(FormActions.setFormStatusInvalid());
        } else if (form.valid && portfolios.length > 0) {
            this.portfolioStore.dispatch(FormActions.setFormStatusValid());
        }
    }

    requestPortfolio(salesRepId: string, invoiceGroupId: string, portfolioEntityType: string): void {
        // Mendapatkan toko yang tersedia.
        const portfolioQuery: IQueryParams = {
            limit: 10,
            skip: 0,
        };
        portfolioQuery['type'] = portfolioEntityType;
        portfolioQuery['invoiceGroupId'] = invoiceGroupId;

        this.portfolioStore.dispatch(
            PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
        );

        // Hanya mendapatkan toko yang terasosiasi dengan sales rep.
        const associatedPortfolioQuery: IQueryParams = {
            limit: 10,
            skip: 0
        };
        associatedPortfolioQuery['userId'] = salesRepId;
        
        this.portfolioStore.dispatch(
            PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
        );
    }

    ngOnInit(): void {
        this.isEditMode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'edit';

        this.initBreadcrumb();

        this.initForm();
    }

    ngOnDestroy(): void {
        this.portfolioStore.dispatch(UiActions.hideFooterAction());
        this.portfolioStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.portfolioStore.dispatch(UiActions.hideCustomToolbar());
        this.portfolioStore.dispatch(FormActions.resetFormStatus());
        this.portfolioStore.dispatch(FormActions.resetClickSaveButton());
        this.portfolioStore.dispatch(FormActions.resetCancelButtonAction());
        
        this.portfolioStore.dispatch(StoreActions.removeAllStoreFilters());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());

        this.subs$.next();
        this.subs$.complete();
    }

    ngAfterViewInit(): void {
        combineLatest([
            this.salesRepForm$,
            this.invoiceGroupForm$,
            this.portfolioStore.select(PortfolioSelector.getPortfolioEntityType),
        ]).pipe(
            // Keduanya harus terisi
            filter(([salesRepId, invoiceGroupId, _]) => {
                const result = !!salesRepId && !!invoiceGroupId;

                if (!result) {
                    this._notice.open('Please fill Sales Rep. and Invoice Group to display the portfolios.', 'info', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }

                return result;
            }),
            map(([salesRepId, invoiceGroupId, portfolioEntityType]) =>
                this.requestPortfolio(salesRepId, invoiceGroupId, portfolioEntityType)
            ),
            takeUntil(this.subs$)
        ).subscribe();
    }

}
