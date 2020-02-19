import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, ChangeDetectorRef, ViewChildren, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subject, Observable, combineLatest, fromEvent } from 'rxjs';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Store as NgRxStore } from '@ngrx/store';

// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { InvoiceGroup, IQueryParams } from 'app/shared/models';
import { CoreFeatureState } from '../../../portfolios/store/reducers';
import { fromDropdown } from 'app/shared/store/reducers';
import { MatDialog, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NoticeService, ErrorMessageService, HelperService } from 'app/shared/helpers';
import { PortfolioSelector, PortfolioStoreSelector, StoreSelector } from '../../../portfolios/store/selectors';
import { takeUntil, filter, withLatestFrom, startWith, tap, take, debounceTime, delay } from 'rxjs/operators';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { PortfolioActions } from '../../../portfolios/store/actions';
import { StoreActions, AssociatedStoreActions } from '../../store/actions';
import { FeatureState as SalesRepsFeatureState } from '../../../sales-reps/store/reducers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { map } from 'rxjs/operators';
import { Portfolio } from '../../../portfolios/models';
import { AssociationsFilterPortfoliosComponent } from '../../components/filter-portfolios/associations-filter-portfolios.component';
import { IAssociationForm, SalesRep } from '../../models';

import { FeatureState as AssociationCoreFeatureState } from '../../store/reducers';
import { AssociationActions, SalesRepActions, AssociatedPortfolioActions } from '../../store/actions';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { environment } from 'environments/environment';
import { SalesRepSelectors, AssociatedPortfolioSelectors, AssociationSelectors } from '../../store/selectors';
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
    // Untuk menyimpan data Sales Rep sebelumnya.
    prevSalesRep: SalesRep;

    // Untuk menyimpan portfolio-portfolio yang tersedia.
    availablePortfolios$: Observable<Array<Portfolio>>;
    // Untuk menyimpan portfolio-portfolio yang terpilih.
    selectedPortfolios$: Observable<Array<Portfolio>>;
    // Untuk menyimpan jumlah portfolio yang sudah terpilih.
    totalSelectedPortfolios$: Observable<number>;

    // Untuk menyimpan Sales Reps.
    salesReps$: Observable<Array<SalesRep>>;
    // Untuk menyimpan jumlah Sales Reps.
    totalSalesReps$: Observable<number>;
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
    // Untuk menyimpan Observable status loading dari request association.
    isRequesting$: Observable<boolean>;

    salesRepForm$: Observable<SalesRep>;
    invoiceGroupForm$: Observable<InvoiceGroup>;

    @ViewChild('salesRepScroll', { static: true }) salesRepScroll: MatAutocomplete;
    @ViewChild(MatAutocompleteTrigger, { static: true }) autocompleteTrigger: MatAutocompleteTrigger;

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private associationStore: NgRxStore<AssociationCoreFeatureState>,
        private dropdownStore: NgRxStore<fromDropdown.State>,
        private matDialog: MatDialog,
        private readonly sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        // private router: Router,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        // private _cd: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService,
        private helperSvc: HelperService,
    ) {
        // Mengambil ID association dari param URL.
        this.associationId = this.route.snapshot.params.id;

        // Mengambil status loading dari state-nya portfolio.
        this.isPortfolioLoading$ = this.portfolioStore
            .select(PortfolioSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        // Mengambil jumlah sales rep yang ada di server.
        this.totalSalesReps$ = this.associationStore.select(
            SalesRepSelectors.getTotalItem
        ).pipe(
            takeUntil(this.subs$)
        );

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
                // debounceTime(3000),
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

        this.isRequesting$ = this.associationStore.select(
            AssociationSelectors.getRequestingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil data Sales Reps. dari state.
        this.salesReps$ = this.associationStore
            .select(SalesRepSelectors.selectAll)
            .pipe(
                filter(salesReps => {
                    if (salesReps.length === 0) {
                        this.associationStore.dispatch(
                            SalesRepActions.fetchSalesRepsRequest({
                                payload: {
                                    paginate: true,
                                    limit: 10,
                                    skip: 0
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
                                        map(([portfolioIds, portfolios]) => {
                                            const selectedPortfolios = portfolios.filter(portfolio =>
                                                portfolioIds.includes(portfolio.id)
                                            );

                                            this.form.get('portfolios').setValue(selectedPortfolios.map(portfolio => portfolio.id));

                                            return selectedPortfolios;
                                        }),
                                        takeUntil(this.subs$)
                                    );

        // Mengaambil jumlah portfolio yang terpilih.
        // this.totalSelectedPortfolios$ = this.selectedPortfolios$
        //                                     .pipe(
        //                                         map(selected => selected.length),
        //                                         takeUntil(this.subs$)
        //                                     );

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
                           // translate: 'BREADCRUMBS.HOME',
                            active: false
                        },
                        {
                            title: 'Sales Management',
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: this.associationsHome
                        },
                        {
                            title: 'Edit SR Assignment',
                            // translate: 'BREADCRUMBS.ASSOCIATION_EDIT',
                            active: true,
                            keepCase: true,
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
                           // translate: 'BREADCRUMBS.HOME',
                            active: false
                        },
                        {
                            title: 'Sales Management',
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: this.associationsHome
                        },
                        {
                            title: 'Add SR Assignment',
                            // 
                            // translate: 'BREADCRUMBS.ASSOCIATION_ADD',
                            active: true,
                            keepCase: true,
                        }
                    ]
                })
            );
        }
    }

    private debug(label: string, data: any): void {
        if (!environment.production) {
            console.log(label, data);
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

        this.salesRepForm$ = (this.form.get('salesRep').valueChanges as Observable<SalesRep>).pipe(
            tap(value => {
                if (value !== this.prevSalesRep) {
                    this.prevSalesRep = value;
                    this.associationStore.dispatch(AssociatedPortfolioActions.abortInitialized());
                    this.associationStore.dispatch(AssociatedPortfolioActions.clearAssociatedPortfolios());
                }

                this.associationStore.dispatch(AssociationActions.setSelectedSalesRep({ payload: value }));
            }),
            takeUntil(this.subs$)
        );

        this.invoiceGroupForm$ = (this.form.get('invoiceGroup').valueChanges as Observable<InvoiceGroup>).pipe(
            tap(value => this.associationStore.dispatch(AssociationActions.setSelectedInvoiceGroup({ payload: value }))),
            takeUntil(this.subs$)
        );

        this.associationStore.select(
            AssociatedPortfolioSelectors.selectAll
        ).pipe(
            tap((selectedPortfolios) => {
                this.form.get('portfolios').setValue(selectedPortfolios);
            }),
            takeUntil(this.subs$)
        ).subscribe();

        // this.selectedSalesRep$ = combineLatest([
        //     (this.form.get('salesRep').valueChanges as Observable<string>),
        //     this.salesRepStore.select(SalesRepSelectors.getSelectedItem),
        // ]).pipe(
        //         withLatestFrom(
        //             this.salesRepStore.select(SalesRepSelectors.selectEntities),
        //             ([[salesRepId, _]], salesReps) => ({ salesRepId, salesReps })
        //         ),
        //         map(({ salesRepId, salesReps }) => {
        //             if (!salesReps[salesRepId]) {
        //                 this.salesRepStore.dispatch(
        //                     SalesRepActions.fetchSalesRepRequest({
        //                         payload: salesRepId
        //                     })
        //                 );
        //             } else {
        //                 return salesReps[salesRepId];
        //             }
        //         }),
        //         takeUntil(this.subs$)
        //     );

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

        // this.form.valueChanges
        combineLatest([
            this.salesRepForm$,
            this.invoiceGroupForm$,
            this.associationStore.select(AssociatedPortfolioSelectors.selectTotal)
        ]).pipe(
            tap(([salesRep, invoiceGroup, selectedPortfolioIds]) => {
                if (!salesRep || !invoiceGroup || selectedPortfolioIds === 0) {
                    this.portfolioStore.dispatch(FormActions.setFormStatusInvalid());
                } else {
                    this.portfolioStore.dispatch(FormActions.setFormStatusValid());
                }
            }),
            takeUntil(this.subs$)
        ).subscribe();

        this.portfolioStore.dispatch(UiActions.showFooterAction());
    }

    displaySalesRep(item: SalesRep): string {
        if (!item) {
            return;
        }

        return item.user.fullName;
    }

    submitAssociations(): void {
        const rawPortfolioIds = (this.form.get('portfolios').value as Array<Portfolio>).filter(p => !(!!p.deletedAt)).map(p => +p.id);
        const deletedPOortfolioIds = (this.form.get('portfolios').value as Array<Portfolio>).filter(p => !!p.deletedAt).map(p => +p.id);

        const associationsForm: IAssociationForm = {
            userId: +((this.form.get('salesRep').value as SalesRep).userId),
            portfolioId: rawPortfolioIds,
            delete: deletedPOortfolioIds,
        };

        // Melakukan request ke back-end untuk create / update association.
        this.associationStore.dispatch(
            AssociationActions.createAssociationRequest({ payload: associationsForm })
        );
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

    // requestPortfolio(salesRepId: string, invoiceGroupId: string, portfolioEntityType: string, keyword: string): void {
    //     // Mendapatkan toko yang tersedia.
    //     const portfolioQuery: IQueryParams = {
    //         limit: 100,
    //         skip: 0,
    //         paginate: true
    //     };
    //     portfolioQuery['request'] = 'associations';
    //     portfolioQuery['type'] = portfolioEntityType;
    //     portfolioQuery['invoiceGroupId'] = invoiceGroupId;

    //     this.portfolioStore.dispatch(
    //         PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
    //     );

    //     // Hanya mendapatkan toko yang terasosiasi dengan sales rep.
    //     // const associatedPortfolioQuery: IQueryParams = {
    //     //     limit: 10,
    //     //     skip: 0
    //     // };
    //     // associatedPortfolioQuery['userId'] = salesRepId;
        
    //     // this.portfolioStore.dispatch(
    //     //     PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
    //     // );
    // }

    ngOnInit(): void {
        this.isEditMode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'edit';

        this.initBreadcrumb();

        this.initForm();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.portfolioStore.dispatch(UiActions.hideFooterAction());
        this.portfolioStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.portfolioStore.dispatch(UiActions.hideCustomToolbar());
        this.portfolioStore.dispatch(FormActions.resetFormStatus());
        this.portfolioStore.dispatch(FormActions.resetClickSaveButton());
        this.portfolioStore.dispatch(FormActions.resetCancelButtonAction());
        
        this.portfolioStore.dispatch(StoreActions.truncateStores());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());

        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
        this.associationStore.dispatch(AssociatedPortfolioActions.abortInitialized());
        this.associationStore.dispatch(AssociatedPortfolioActions.clearAssociatedPortfolios());
    }

    ngAfterViewInit(): void {
        combineLatest([
            this.salesRepForm$,
            this.invoiceGroupForm$,
            this.portfolioStore.select(PortfolioSelector.getPortfolioEntityType),
            this.portfolioStore.select(PortfolioSelector.getSearchKeywordPortfolio),
        ]).pipe(
            // Keduanya harus terisi.
            filter(([salesRep, invoiceGroup]) => {
                const result = !!salesRep && !!invoiceGroup;

                if (!result) {
                    this._notice.open('Please fill Sales Rep. and Invoice Group to display the portfolios.', 'info', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }

                return result;
            }),
            withLatestFrom(this.associationStore.select(AssociatedPortfolioSelectors.getInitialized)),
            // Mengosongkan portfolio-nya terlebih dahulu.
            tap(() => {
                this.associationStore.dispatch(AssociatedStoreActions.clearAssociatedStores());
                this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
                this.portfolioStore.dispatch(StoreActions.truncateStores());
            }),
            // Memproses pengambilan data portfolio dari server.
            tap(([[salesRep, invoiceGroup, portfolioEntityType, keyword], initialized]) => {
                // Mendapatkan portfolio yang tersedia.
                const portfolioQuery: IQueryParams = {
                    limit: 100,
                    skip: 0,
                    paginate: true
                };

                if (keyword) {
                    portfolioQuery['keyword'] = keyword;
                }

                portfolioQuery['request'] = 'associations';
                portfolioQuery['type'] = portfolioEntityType;
                portfolioQuery['invoiceGroupId'] = invoiceGroup.id;

                if (portfolioEntityType === 'inside') {
                    this.portfolioStore.dispatch(
                        PortfolioActions.fetchPortfoliosRequest({ payload: portfolioQuery })
                    );
                } else if (portfolioEntityType === 'outside') {
                    this.associationStore.dispatch(
                        StoreActions.fetchStoresRequest({ payload: portfolioQuery})
                    );
                } else {
                    return;
                }

                if (!initialized) {
                    // Mendapatkan portfolio type group.
                    const associatedPortfolioGroupQuery: IQueryParams = {
                        limit: 100,
                        skip: 0
                    };

                    associatedPortfolioGroupQuery['fromSalesRep'] = true;
                    // associatedPortfolioGroupQuery['type'] = 'group';
                    associatedPortfolioGroupQuery['userId'] = salesRep.userId;
                    // associatedPortfolioGroupQuery['combined'] = true;
                    associatedPortfolioGroupQuery['associated'] = true;
                    
                    this.associationStore.dispatch(
                        AssociatedPortfolioActions.fetchAssociatedPortfoliosRequest({ payload: associatedPortfolioGroupQuery })
                    );

                    // Menandakan permintaan sudah dilakukan di awal.
                    this.associationStore.dispatch(
                        AssociatedPortfolioActions.markInitialized()
                    );
                }
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    // processSalesRepOptionSelected(): void {
    //     this.salesRepScroll.optionSelected.pipe(
    //         takeUntil(this.salesRepScroll.closed)
    //     ).subscribe(() => this.autocompleteTrigger.closePanel());
    // }

    // listSalesRepOptionSelected(): void {
    //     setTimeout(() => this.processSalesRepOptionSelected());
    // }

    processSalesRepScroll(): void {
        if (this.autocompleteTrigger && this.salesRepScroll && this.salesRepScroll.panel) {
            fromEvent<Event>(this.salesRepScroll.panel.nativeElement, 'scroll')
                .pipe(
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil sales rep yang ada di state, jumlah total sales rep. di back-end dan loading state-nya.
                    withLatestFrom(
                        this.salesReps$,
                        this.totalSalesReps$,
                        this.associationStore.select(SalesRepSelectors.getLoadingState),
                        ($event, salesReps, totalSalesReps, isLoading) => ({ $event, isLoading, salesReps, totalSalesReps }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SALES REP IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, salesReps, totalSalesReps }) =>
                        !isLoading &&
                        (totalSalesReps > salesReps.length) &&
                        this.helperSvc.isElementScrolledToBottom(this.salesRepScroll.panel)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions.pipe(
                        tap(() => console.log('closing'))
                    ))
                ).subscribe(({ salesReps }) =>
                    this.associationStore.dispatch(
                        SalesRepActions.fetchSalesRepsRequest({
                            payload: {
                                paginate: true,
                                limit: 10,
                                skip: salesReps.length
                            }
                        })
                    )
                );
        }
    }

    listenSalesRepScroll(): void {
        setTimeout(() => this.processSalesRepScroll());
    }

}
