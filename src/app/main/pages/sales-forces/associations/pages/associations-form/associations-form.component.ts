import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store as NgRxStore } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { combineLatest, fromEvent, Observable, Subject, of } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    take,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Portfolio, Association } from '../../models';
import { SalesRep } from 'app/shared/components/dropdowns/single-sales-rep/models';
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { AssociationForm } from '../../models';
import {
    AssociationActions,
    StoreActions,
    PortfolioActions
} from '../../store/actions';
import { FeatureState as AssociationCoreFeatureState } from '../../store/reducers';
import {
    AssociationSelectors,
    StoreSelectors,
    PortfolioSelectors
} from '../../store/selectors';
import { Warehouse } from '../../models';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { AssociationService } from '../../services';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { SingleWarehouseDropdownService } from 'app/shared/components/dropdowns/single-warehouse/services';
import { SingleSalesRepDropdownService } from 'app/shared/components/dropdowns/single-sales-rep/services';
import { SelectionState, SelectionList, Selection } from 'app/shared/components/multiple-selection/models';
import { PortfolioStoresComponent } from '../../components/portfolio-stores/portfolio-stores.component';

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
    // Untuk menyimpan status loading ketika memuat association.
    isLoading$: Observable<boolean>;
    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    // Untuk search list store.
    search: FormControl;
    // Untuk menyimpan ID association yang sedang dibuka.
    associationId: string;
    // Untuk menyimpan form yang akan dikirim ke server.
    form: FormGroup;

    // Untuk menyimpan portfolio yang sudah ter-assign ke SR.
    initialPortfolios$: Observable<Array<Selection>>;
    // Untuk menyimpan jumlah portfolio yang sudah ter-assign ke SR.
    totalInitialPortfolios$: Observable<number>;

    // Untuk menyimpan association yang tersedia.
    availableAssociations$: Observable<Array<Selection>>;
    // Untuk menyimpan jumlah association yang tersedia.
    totalAvailableAssociations$: Observable<number>;

    // Untuk menyimpan status loading pada associations yang belum ter-assign oleh SR.
    isAvailableAssociationsLoading$: Observable<boolean>;
    // Untuk menyimpan status loading pada portfolio yang sudah ter-assign oleh SR.
    isSelectedAssociationsLoading$: Observable<boolean>;
    // Untuk menyimpan state apakah ingin clear all atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    // isClearAll: boolean = false;

    constructor(
        private associationStore: NgRxStore<AssociationCoreFeatureState>,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService,
        private helperSvc: HelperService,
        private associationService: AssociationService,
        private multipleSelection: MultipleSelectionService,
        private singleSalesRep: SingleSalesRepDropdownService,
        private singleWarehouseService: SingleWarehouseDropdownService,
    ) {
        // Mengambil state loading dari service.
        this.isLoading$ = this.associationService.getLoadingState().pipe(
            takeUntil(this.subs$)
        );

        // Mengambil ID association dari param URL.
        this.associationId = this.route.snapshot.params.id;

        // Menentukan mode edit.
        const urlLength = this.route.snapshot.url.length;
        this.isEditMode = this.route.snapshot.url[urlLength - 1].path === 'edit';

        // Menentukan tipe portfolio yang terpilih di awal.
        this.associationService.setSelectedPortfolioType('in');

        // Memuat footer action untuk keperluan form.
        this.associationStore.dispatch(
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
        this.associationStore.dispatch(FormActions.resetFormStatus());

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Memuat footer.
        this.associationStore.dispatch(UiActions.showFooterAction());
    }

    private initBreadcrumb(): void {
        this.associationStore.dispatch(
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
                        title: `${this.isEditMode ? 'Edit' : 'Add'} SR Assignment`,
                        // translate: 'BREADCRUMBS.ASSOCIATION_EDIT',
                        active: true,
                        keepCase: true
                    }
                ]
            })
        );
    }

    private initForm(): void {
        // Inisialisasi FormControl untuk search.
        this.search = new FormControl('');

        // Inisialisasi form.
        this.form = this.fb.group({
            // code: [{ value: '', disabled: true }],
            oldSalesRep: [
                { value: '', disabled: false },
            ],
            salesRep: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            oldWarehouse: [
                { value: '', disabled: false },
            ],
            portfolios: [[]],
            removedPortfolios: [[]],
            stores: [[]],
            removedStores: [[]]
        });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap(value => HelperService.debug('FORM VALUE CHANGED', value)),
                takeUntil(this.subs$)
            ).subscribe(() => {
                this.checkFormValidation();
            });

        this.form.get('warehouse').valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                takeUntil(this.subs$)
            ).subscribe(value => {
                // Mendapatkan warehouse yang sudah dipilih sebelumnya.
                const oldWarehouse = (this.form.get('oldWarehouse').value as Warehouse);

                if (!oldWarehouse) {
                    // Langsung menetapkan nilai oldWarehouse-nya sama dengan warehouse yang dipilih saat ini.
                    this.form.patchValue({
                        oldWarehouse: value,
                        warehouse: value
                    });

                    this.form.updateValueAndValidity();

                    this.associationService.selectWarehouse(value);

                    this.requestAssociation(this.search.value);
                } else if (value && oldWarehouse.id !== value.id) {
                    // Memberi pesan konfirmasi jika warehouse yang dipilih berbeda dengan pilihan sebelumnya.
                    this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
                        data: {
                            id: `confirm`,
                            title: 'Clear',
                            message: `It will clear all selected portfolios and stores from the list.
                                    It won't affected this SR Assignment unless you click the save button.
                                    Are you sure want to proceed?`
                        },
                        disableClose: true
                    }).afterClosed()
                    .subscribe(confirmed => {
                        if (confirmed) {
                            // this.isClearAll = true;

                            this.associationStore.dispatch(AssociationActions.clearState());
                            this.associationStore.dispatch(PortfolioActions.clearState());

                            this.multipleSelection.clearAllSelectedOptions();

                            this.form.patchValue({
                                portfolios: [],
                                removedPortfolios: [],
                                stores: [],
                                removedStores: [],
                                oldWarehouse: this.form.get('warehouse').value,
                                warehouse: value
                            });

                            this.associationService.selectWarehouse(value);
                            this.singleWarehouseService.selectWarehouse(value);
    
                            this.requestAssociation(this.search.value);
                        } else {
                            this.associationService.selectWarehouse(oldWarehouse);
                            this.singleWarehouseService.selectWarehouse(oldWarehouse);
                        }
                    });
                }

                if (!value) {
                    this.associationStore.dispatch(StoreActions.clearState());
                }
            });

        this.form.get('salesRep').valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                takeUntil(this.subs$)
            ).subscribe(value => {
                // Mendapatkan SR yang sudah dipilih sebelumnya.
                const oldSalesRep = (this.form.get('oldSalesRep').value as SalesRep);

                if (!oldSalesRep) {
                    // Langsung menetapkan nilai oldSalesRep-nya sama dengan salesRep yang dipilih saat ini.
                    this.form.patchValue({
                        oldSalesRep: value,
                        salesRep: value
                    });

                    this.form.updateValueAndValidity();

                    this.associationService.selectSalesRep(value);

                    this.requestAssociation(this.search.value);
                } else if (value && oldSalesRep.id !== value.id) {
                    // Memberi pesan konfirmasi jika SR yang dipilih berbeda dengan pilihan sebelumnya.
                    this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
                        data: {
                            id: `confirm`,
                            title: 'Clear',
                            message: `It will clear all selected portfolios and stores from the list.
                                    It won't affected this SR Assignment unless you click the save button.
                                    Are you sure want to proceed?`
                        },
                        disableClose: true
                    }).afterClosed()
                    .subscribe(confirmed => {
                        if (confirmed) {
                            // this.isClearAll = true;

                            this.associationStore.dispatch(AssociationActions.clearState());
                            this.associationStore.dispatch(PortfolioActions.clearState());

                            this.multipleSelection.clearAllSelectedOptions();

                            this.form.patchValue({
                                portfolios: [],
                                removedPortfolios: [],
                                stores: [],
                                removedStores: [],
                                oldSalesRep: this.form.get('salesRep').value,
                                salesRep: value
                            });

                            this.associationService.selectSalesRep(value);
                            this.singleSalesRep.selectSalesRep(value);
    
                            this.requestAssociation(this.search.value);
                        } else {
                            this.associationService.selectSalesRep(oldSalesRep);
                            this.singleSalesRep.selectSalesRep(oldSalesRep);
                        }
                    });
                }

                if (!value) {
                    this.associationStore.dispatch(StoreActions.clearState());
                }
            });

        this.associationStore
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this.subs$)
            )
            .subscribe(() => {
                /** Jika menekannya, maka submit data form-nya. */
                this.submitAssociations();
            });
    }

    private initSubscriptions(): void {
        this.initialPortfolios$ = this.associationStore.select(
            PortfolioSelectors.selectAll
        ).pipe(
            map(portfolios => {
                return portfolios.map(portfolio => ({
                    id: portfolio.id,
                    name: portfolio.name,
                    group: 'initial-associated-portfolio',
                    label: `${portfolio.name} (${portfolio.storeQty} ${portfolio.storeQty > 1 ? 'stores' : 'store'})`,
                    isSelected: true,
                    additionalInformation: {
                        text: 'See details',
                        clickable: true,
                    },
                    data: portfolio
                }) as Selection);
            }),
            takeUntil(this.subs$)
        );

        this.totalInitialPortfolios$ = this.associationStore.select(
            PortfolioSelectors.getTotalItem
        ).pipe(
            takeUntil(this.subs$)
        );

        this.availableAssociations$ = this.associationStore.select(
            AssociationSelectors.selectAll
        ).pipe(
            withLatestFrom(
                this.associationService.getSelectedPortfolioType(),
            ),
            map(([associations, portfolioType]) => {
                if (portfolioType === 'in') {
                    return associations.map(association => ({
                        id: association.id,
                        group: 'in-portfolio',
                        name: `${association.code} - ${association.name}`,
                        label: `${association.name} (${association.storeAmount} ${association.storeAmount > 1 ? 'stores' : 'store'})`,
                        isSelected: false,
                        additionalInformation: {
                            text: 'See details',
                            clickable: true,
                        },
                        data: association
                    }) as Selection);
                }

                return associations.map(association => ({
                    id: association.storeId,
                    group: 'out-portfolio',
                    name: `${association.externalId} - ${association.storeName}`,
                    label: `${association.externalId} - ${association.storeName}`,
                    isSelected: false,
                    data: association
                }) as Selection);
            }),
            takeUntil(this.subs$)
        );

        this.totalAvailableAssociations$ = this.associationStore.select(
            AssociationSelectors.getTotalItem
        ).pipe(
            takeUntil(this.subs$)
        );

        this.isAvailableAssociationsLoading$ = this.associationStore.select(
            AssociationSelectors.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        this.isSelectedAssociationsLoading$ = this.associationStore.select(
            PortfolioSelectors.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    get selectedSalesRep(): SalesRep {
        return (this.form.get('salesRep').value as SalesRep);
    }

    clearAll(): void {
        // Memberi pesan konfirmasi jika warehouse yang dipilih berbeda dengan pilihan sebelumnya.
        this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
            data: {
                id: `confirm`,
                title: 'Clear All',
                message: 'Are you sure want to proceed?'
            },
            disableClose: true
        }).afterClosed().pipe(
            withLatestFrom(
                this.associationStore.select(PortfolioSelectors.selectAll),
            )
        )
        .subscribe(([confirmed, portfolios]) => {
            if (confirmed) {
                this.form.patchValue({
                    portfolios: [],
                    removedPortfolios: portfolios.map(portfolio => +portfolio.id),
                    stores: [],
                    removedStores: []
                });
        
                this.multipleSelection.clearAllSelectedOptions();
            }
        });
    }


    onSelectedStoresChanged($event: SelectionList): void {
        HelperService.debug('onSelectedStoresChanged', $event);

        const { added, removed } = $event;

        this.form.patchValue({
            stores: added.filter(add => add.group === 'out-portfolio'),
            portfolios: added.filter(add => add.group === 'in-portfolio' || add.group === 'initial-associated-portfolio'),
            removedPortfolios: removed.filter(rem => rem.group === 'initial-associated-portfolio'),
            // removedStores: $event.removed
        });
    }

    private requestAssociatedPortfolio(userId: string, warehouseId: string): void {
        if (!userId || !warehouseId) {
            return;
        }

        this.associationStore.dispatch(PortfolioActions.clearState());

        this.associationStore.dispatch(
            PortfolioActions.fetchPortfoliosRequest({
                payload: {
                    // limit: 20,
                    // skip: takeSkip ? totalAssociations.length : 0,
                    // keyword: search ? search : this.search.value,
                    // type: portfolioType === 'in' ? 'inside' : 'outside',
                    // warehouseId: selectedWarehouse.id,
                    userId,
                    warehouseId,
                    keyword: this.search.value,
                    // associated: true,
                    paginate: false,
                } as IQueryParams
            })
        );
    }

    requestAssociation(search?: string, takeSkip?: boolean): void {
        of(null).pipe(
            debounceTime(200),
            withLatestFrom(
                this.associationStore.select(AssociationSelectors.selectAll),
                this.associationService.getSelectedPortfolioType(),
                this.associationService.getSelectedWarehouse(),
                this.associationService.getSelectedSalesRep(),
            ),
            filter(([_, __, ___, selectedWarehouse, selectedSalesRep]) => {
                if (!selectedSalesRep || !selectedWarehouse) {
                    return false;
                }

                return true;
            }),
            
            take(1)
        ).subscribe({
            next: ([_, totalAssociations, portfolioType, selectedWarehouse, selectedSalesRep]) => {
                this.requestAssociatedPortfolio(selectedSalesRep.userId, selectedWarehouse.id);

                this.associationStore.dispatch(
                    AssociationActions.fetchAssociationsRequest({
                        payload: {
                            paginate: true,
                            limit: 20,
                            skip: takeSkip ? totalAssociations.length : 0,
                            keyword: search ? search : this.search.value,
                            type: portfolioType === 'in' ? 'inside' : 'outside',
                            warehouseId: selectedWarehouse.id,
                        } as IQueryParams
                    })
                );

                this.cdRef.detectChanges();
            },
            error: () => {
                this.cdRef.detectChanges();
            },
            complete: () => {
                this.cdRef.detectChanges();
            },
        });
    }

    onSelectedWarehouse(value: Warehouse): void {
        this.form.get('warehouse').setValue(value);
    }

    onSelectedSalesRep(value: SalesRep): void {
        this.form.get('salesRep').setValue(value);
    }

    updateSelectedTab(tabId: number): void {
        if (tabId === 0) {
            this.associationService.setSelectedPortfolioType('in');
        } else {
            this.associationService.setSelectedPortfolioType('out');
        }

        this.requestAssociation(this.search.value, false);
    }

    onClickedSeeDetails(value: Selection): void {
        HelperService.debug('onClickedSeeDetails', value);

        this.matDialog.open(PortfolioStoresComponent, {
            data: value.data,
            width: '100vw'
        });
    }

    submitAssociations(): void {
        const userId = +(this.form.get('salesRep').value as SalesRep).userId;

        const warehouseId = +(this.form.get('warehouse').value as Warehouse).id;

        const rawPortfolioIds = (this.form.get('portfolios').value as Array<Portfolio>)
            // .filter(p => !!!p.deletedAt)
            .map(p => +p.id);

        const deletedPortfolioIds = (this.form.get('removedPortfolios').value as Array<Portfolio>)
            // .filter(p => !!p.deletedAt)
            .map(p => +p.id);

        const rawStoreIds = (this.form.get('stores').value as Array<Store>)
            // .filter(s => !!!s.deletedAt)
            .map(s => +s.id);

        const deletedStoreIds = (this.form.get('removedStores').value as Array<Store>)
            // .filter(s => !!s.deletedAt)
            .map(s => +s.id);

        const associationsForm: AssociationForm = {
            userId,
            warehouseId,
            portfolioId: rawPortfolioIds,
            deletePortfolio: deletedPortfolioIds,
            storeId: rawStoreIds,
            deleteStore: deletedStoreIds
        };

        // Menetapkan loading state.
        this.associationService.setLoadingState(true);

        // Melakukan request ke back-end untuk create / update association.
        this.associationStore.dispatch(
            AssociationActions.createAssociationRequest({ payload: associationsForm })
        );
    }

    getFormError(form: any): string {
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
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

    checkFormValidation(): void {
        if (this.form.invalid) {
            this.associationStore.dispatch(FormActions.setFormStatusInvalid());
        } else if (this.form.valid) {
            this.associationStore.dispatch(FormActions.setFormStatusValid());
        }
    }

    ngOnInit(): void {
        this.singleSalesRep.selectSalesRep(null);
        this.singleWarehouseService.selectWarehouse(null);

        this.initBreadcrumb();

        this.initSubscriptions();

        this.initForm();
    }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.associationService.selectSalesRep(null);
        this.associationService.selectWarehouse(null);
        this.associationService.setLoadingState(false);

        this.associationStore.dispatch(AssociationActions.clearState());
        this.associationStore.dispatch(PortfolioActions.clearState());

        this.associationStore.dispatch(UiActions.hideFooterAction());
        this.associationStore.dispatch(UiActions.hideCustomToolbar());
        this.associationStore.dispatch(FormActions.resetFormStatus());
        this.associationStore.dispatch(FormActions.resetClickSaveButton());
        this.associationStore.dispatch(FormActions.resetCancelButtonAction());
        this.associationStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }
}
