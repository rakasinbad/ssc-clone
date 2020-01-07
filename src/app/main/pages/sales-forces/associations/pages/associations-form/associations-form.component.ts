import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subject, Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { Store as NgRxStore } from '@ngrx/store';

// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { InvoiceGroup } from 'app/shared/models';
import { CoreFeatureState } from '../../../portfolios/store/reducers';
import { fromDropdown } from 'app/shared/store/reducers';
import { MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { PortfolioSelector, PortfolioStoreSelector, StoreSelector } from '../../../portfolios/store/selectors';
import { takeUntil, filter, withLatestFrom, startWith } from 'rxjs/operators';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { StoreActions, PortfolioActions } from '../../../portfolios/store/actions';
import { FeatureState as SalesRepsFeatureState } from '../../../sales-reps/store/reducers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { SalesRep } from '../../../sales-reps/models';
import { SalesRepSelectors } from '../../../sales-reps/store/selectors';
import { SalesRepActions } from '../../../sales-reps/store/actions';
import { map } from 'rxjs/operators';

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

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
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
        this.isPortfolioStoreLoading$ = this.portfolioStore
            .select(PortfolioStoreSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        // Mengambil status loading dari state-nya store (merchant).
        this.isListStoreLoading$ = this.shopStore
            .select(StoreSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

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
            code: [{ value: '', disabled: true }],
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
            stores: [[]],
            portfolios: [[]],
            removedStores: [[]],
            removedPortfolios: [[]],
        });

        this.form.get('salesRep').valueChanges.pipe(startWith(''));

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
    }

    updateSelectedTab(tabId: number): void {
        if (tabId === 0) {
            this.shopStore.dispatch(
                StoreActions.setStoreEntityType({ payload: 'in-portfolio' })
            );
        } else if (tabId === 1) {
            this.shopStore.dispatch(
                StoreActions.setStoreEntityType({ payload: 'out-portfolio' })
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


    ngOnInit(): void {
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
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());

        this.subs$.next();
        this.subs$.complete();
    }

    ngAfterViewInit(): void {

    }

}
