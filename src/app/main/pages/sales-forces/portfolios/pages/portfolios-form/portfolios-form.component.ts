import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatSelect } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store as NgRxStore } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { IQueryParams } from 'app/shared/models/query.model';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { combineLatest, Observable, of, Subject, BehaviorSubject } from 'rxjs';
import {
    debounceTime,
    delay,
    distinctUntilChanged,
    exhaustMap,
    filter,
    map,
    retryWhen,
    startWith,
    switchMap,
    take,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { PortfoliosConflictStoresComponent } from '../../components/portfolios-conflict-stores/portfolios-conflict-stores.component';
import { PortfoliosFilterStoresComponent } from '../../components/portfolios-filter-stores/portfolios-filter-stores.component';
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { IPortfolioAddForm } from '../../models/portfolios.model';
import { PortfolioActions, StoreActions } from '../../store/actions';
import { CoreFeatureState } from '../../store/reducers';
import { PortfolioSelector, PortfolioStoreSelector, StoreSelector } from '../../store/selectors';
import { Warehouse, StorePortfolio } from '../../models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { HelperService } from 'app/shared/helpers';
import { Selection, SelectionList, SelectionState } from 'app/shared/components/multiple-selection/models';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { HashTable2 } from 'app/shared/models/hashtable2.model';
import { StoresApiService } from '../../services';
import { SingleWarehouseDropdownComponent } from 'app/shared/components/dropdowns/single-warehouse/single-warehouse.component';
import { SingleWarehouseDropdownService } from 'app/shared/components/dropdowns/single-warehouse/services';

@Component({
    selector: 'app-portfolios-form',
    templateUrl: './portfolios-form.component.html',
    styleUrls: ['./portfolios-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosFormComponent implements OnInit, OnDestroy, AfterViewInit {
    // Untuk menandakan halaman detail dalam keadaan mode edit atau tidak.
    isEditMode: boolean;
    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    // Untuk search list store.
    search: FormControl = new FormControl('');
    // Untuk menyimpan ID portfolio yang sedang dibuka.
    portfolioId: string;
    // Untuk menyimpan tipe portfolio yang sedang diproses.
    portfolioType: 'direct' | 'group';
    // Untuk menyimpan form yang akan dikirim ke server.
    form: FormGroup;
    // Untuk menyimpan Invoice Group.
    invoiceGroups: Array<InvoiceGroup>;

    // Untuk menyimpan Observable status loading dari state portfolio.
    isPortfolioLoading$: Observable<boolean>;
    
    // Untuk menyimpan toko yang sudah terasosiasi oleh portfolio (dari database).
    initialPortfolioStores$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
    // Untuk menyimpan jumlah toko yang sudah terasosiasi oleh portfolio (dari database).
    totalInitialPortfolioStores$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk menyimpan toko yang tersedia untuk dipilih.
    availableStores$: Observable<Array<Selection>>;
    // Untuk menyimpan toko yang tersedia untuk dipilih.
    totalAvailableStores$: Observable<number>;

    // Untuk menyimpan state loading yang menampung pilihan toko yang tersedia.
    isAvailableStoresLoading$: Observable<boolean>;
    // Untuk menyimpan state loading yang menampung pilihan toko yang sudah dipilih.
    isSelectedStoresLoading$: Observable<boolean>;

    // Untuk menyimpan toko yang ingin di-disable pada selection dengan alasan adanya proses checking dan sejenisnya.
    disabledStores: HashTable2<Selection> = new HashTable2<Selection>([], 'id');
    // Untuk menyimpan toko yang dianggap konflik karena toko tersebut sudah ada di portfolio lain.
    conflictedStores: HashTable2<Selection> = new HashTable2<Selection>([], 'id');

    // Untuk menyimpan store yang terasosiasi dengan portfolio.
    selectedStores: Array<Selection> = [];

    // Untuk binding ke element MatSelect-nya Invoice Group.
    @ViewChild('invoiceGroup', { static: false }) invoiceGroup: MatSelect;
    // Untuk binding ke component select-single-warehouse.
    @ViewChild('selectWarehouse', { static: false }) selectWarehouse: SingleWarehouseDropdownComponent;
    // Untuk menyimpan warehouse yang terpilih.
    invoiceGroupSub: Subject<string> = new Subject<string>();

    // Untuk menyimpan judul form.
    // tslint:disable-next-line: no-inferrable-types
    formTitle: string = 'Store Portfolio Information';

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
        private dropdownStore: NgRxStore<fromDropdown.State>,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private fb: FormBuilder,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _notice: NoticeService,
        private errorMessageSvc: ErrorMessageService,
        private multipleSelection: MultipleSelectionService,
        private storeApi: StoresApiService,
        private singleWarehouseService: SingleWarehouseDropdownService
    ) {
        // Mengambil ID portfolio dari param URL.
        this.portfolioId = this.route.snapshot.params.id;
        const { portfolio } = this.route.snapshot.params;

        this.updatePortfolioType(portfolio);

        // Mengambil data Invoice Group dari state.
        this.dropdownStore
            .select(DropdownSelectors.getInvoiceGroupDropdownState)
            .pipe(takeUntil(this.subs$))
            .subscribe(invoiceGroups => {
                if (invoiceGroups.length === 0) {
                    return this.dropdownStore.dispatch(
                        DropdownActions.fetchDropdownInvoiceGroupRequest()
                    );
                }

                this.invoiceGroups = invoiceGroups;
            });

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
                            url: '/pages/sales-force/portfolio'
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

        // Mengubah tipe store entity menjadi in-portfolio.
        this.shopStore.dispatch(StoreActions.setStoreEntityType({ payload: 'in-portfolio' }));

        // Mengatur ulang status form.
        this.portfolioStore.dispatch(FormActions.resetFormStatus());

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    onSelectedWarehouse(value: Warehouse): void {
        this.form.get('warehouse').setValue(value);
    }

    updateSelectedTab(tabId: number): void {
        if (tabId === 0) {
            this.shopStore.dispatch(StoreActions.setStoreEntityType({ payload: 'in-portfolio' }));
        } else if (tabId === 1) {
            this.shopStore.dispatch(StoreActions.setStoreEntityType({ payload: 'out-portfolio' }));
        }

        if (this.form.get('warehouse').value) {
            this.portfolioStore.dispatch(StoreActions.truncateAllStores());
            this.requestStore(this.search.value);
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

    processConflictStores(form: IPortfolioAddForm, conflictStores: Array<StorePortfolio>): void {
        // Memunculkan dialog.
        const dialogRef = this.matDialog.open(PortfoliosConflictStoresComponent, {
            data: {
                formData: form,
                conflictStores
            },
            width: '100vw',
            disableClose: true
        });

        // Subscribe ke dialog yang terbuka dan akan jalan ketika dialog sudah tertutup.
        (dialogRef.afterClosed() as Observable<string>)
            .pipe(
                // Hanya diteruskan jika menekan tombol "Yes".
                filter(action => {
                    this.portfolioStore.dispatch(FormActions.resetClickSaveButton());

                    return !!action;
                }),
                tap(() => {
                    // Mengambil store yang ingin dihapus dari form dan membentuknya untuk siap dihapus oleh back-end.
                    const removedStores = (this.form.get('removedStores').value as Array<
                        Store
                    >).map(store => ({ storeId: store.id, portfolioId: this.portfolioId }));
                    // Menambah store yang ingin dihapus dari toko yang konflik dengan portfolio lain dan fakturnya sama.
                    removedStores.push(
                        ...conflictStores.map(store => ({
                            storeId: store.storeId,
                            portfolioId: store['portfolioId']
                        }))
                    );
                    // Mengambil ID store-nya aja dari toko yang ingin dihapus.
                    // const removedStoreIds = removedStores.map(removedStore => removedStore.storeId);
                    // Meng-update form data toko yang ingin dihapus.
                    form.removedStore = removedStores;
                    // Menyaring toko dari toko yang akan dihapus.
                    //                 form.stores = form.stores.filter(store => !removedStoreIds.includes(String(store.storeId)));

                    if (this.portfolioId) {
                        // Melakukan request ke back-end untuk update portfolio.
                        this.portfolioStore.dispatch(
                            PortfolioActions.patchPortfolioRequest({
                                payload: { id: this.portfolioId, portfolio: form }
                            })
                        );
                    } else {
                        this.portfolioStore.dispatch(
                            PortfolioActions.createPortfolioRequest({ payload: form })
                        );
                    }
                }),
                take(1)
            )
            .subscribe();
    }

    // processPortfolioForm(form: IPortfolioAddForm, rawStores: Array<Store>): void {
    //     // Mendapatkan toko-toko dari form.
    //     // const storesForm = (form.stores as unknown as Array<Store>);
    //     // Menampung toko yang konflik. (Toko yang sudah ada di portfolio lain dengan faktur yang sama)
    //     const conflictStores = rawStores.filter(store => store.portfolio);

    //     if (conflictStores.length === 0) {
    //         if (!this.isEditMode) {
    //             // Melakukan request ke back-end untuk create portfolio.
    //             this.portfolioStore.dispatch(
    //                 PortfolioActions.createPortfolioRequest({ payload: form })
    //             );
    //         } else {
    //             // Menambah toko-toko yang ingin dihapus ke dalam form.
    //             form.removedStore = (this.form.get('removedStores').value as Array<Store>).map(
    //                 store => ({
    //                     storeId: store.id,
    //                     portfolioId: this.portfolioId
    //                 })
    //             );

    //             // Melakukan request ke back-end untuk update portfolio.
    //             this.portfolioStore.dispatch(
    //                 PortfolioActions.patchPortfolioRequest({
    //                     payload: { id: this.portfolioId, portfolio: form }
    //                 })
    //             );
    //         }
    //     } else {
    //         // Memproses form yang memiliki toko-toko konflik.
    //         this.processConflictStores(form, conflictStores);
    //     }
    // }

    submitPortfolio(): void {
        // Mendapatkan toko - toko yang ingin diasosiasikan ke portfolio.
        const stores = this.form.get('stores').value as Array<Store>;
        const conflictedStores = this.conflictedStores.toArray();

        // Menyiapkan payload untuk request ke back-end.
        const portfolioForm: IPortfolioAddForm = {
            name: this.form.get('name').value,
            type: this.portfolioType,
            warehouseId: (this.form.get('warehouse').value as Warehouse).id,
            stores: stores.map(store => ({ storeId: +store.id, target: 0 }))
        };

        if (this.portfolioType === 'group') {
            portfolioForm['invoiceGroupId'] = this.form.get('invoiceGroup').value;
        }

        if (conflictedStores.length === 0) {
            if (!this.isEditMode) {
                // Melakukan request ke back-end untuk create portfolio.
                this.portfolioStore.dispatch(
                    PortfolioActions.createPortfolioRequest({ payload: portfolioForm })
                );
            } else {
                // Menambah toko-toko yang ingin dihapus ke dalam form.
                portfolioForm.removedStore = (this.form.get('removedStores').value as Array<Store>).map(
                    store => ({
                        storeId: store.id,
                        portfolioId: this.portfolioId
                    })
                );

                // Melakukan request ke back-end untuk update portfolio.
                this.portfolioStore.dispatch(
                    PortfolioActions.patchPortfolioRequest({
                        payload: { id: this.portfolioId, portfolio: portfolioForm }
                    })
                );
            }
        } else {
            // Memproses form yang memiliki toko-toko konflik.
            this.processConflictStores(portfolioForm, conflictedStores.map(store => store['data'] as StorePortfolio));
        }
    }

    openFilter(): void {
        this.matDialog.open(PortfoliosFilterStoresComponent, {
            data: {
                title: 'Filter'
            },
            disableClose: true,
            width: '1000px'
        });
    }

    checkFormValidation(): void {
        const form = this.form;
        const stores = this.form.get('stores').value;
        const removedStores = this.form.get('removedStores').value;

        // Yang pastinya kalau form-nya invalid, tetap invalid.
        if (form.invalid) {
            this.portfolioStore.dispatch(FormActions.setFormStatusInvalid());
            return;
        }

        // Jika portfolio-nya direct, maka form-nya selalu valid, selama form mandatory-nya valid juga.
        if (this.portfolioType === 'direct') {
            this.portfolioStore.dispatch(FormActions.setFormStatusValid());
            return;
        }
        
        // Jika portfolio-nya selain direct, maka harus ada toko yang ditambah ataupun dihapus ...
        // ... dan juga tidak ada toko yang sedang dicek keberadaannya lokasinya di portfolio tertentu.
        if ((stores.length > 0 || removedStores.length > 0) && this.disabledStores.length === 0) {
            this.portfolioStore.dispatch(FormActions.setFormStatusValid());
            return;
        }

        // Selalu invalid jika tidak masuk ke pemeriksaan manapun.
        this.portfolioStore.dispatch(FormActions.setFormStatusInvalid());
    }

    clearAllStores(): void {
        // Memberi pesan konfirmasi jika warehouse yang dipilih berbeda dengan pilihan sebelumnya.
        this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
            data: {
                id: `confirm`,
                title: 'Clear All',
                message: 'Are you sure want to proceed?'
            },
            disableClose: true
        }).afterClosed()
        .subscribe(confirmed => {
            if (confirmed) {
                this.form.patchValue({
                    stores: [],
                    removedStores: []
                });
        
                this.multipleSelection.clearAllSelectedOptions();
            }
        });
    }

    searchStore(search: string): void {
        this.portfolioStore.dispatch(StoreActions.truncateAllStores());
        this.search.setValue(search);
        this.requestStore(search);
    }

    requestStore(search?: string, takeSkip?: boolean): void {
        of(null).pipe(
            filter(() => {
                if (!this.form.get('warehouse').value) {
                    return false;
                }

                return true;
            }),
            withLatestFrom(
                this.shopStore.select(StoreSelector.getAllStores),
                this.portfolioStore.select(StoreSelector.getStoreEntityType),
            ),
            take(1)
        ).subscribe({
            next: ([_, totalStores, storeType]) => {
                this.shopStore.dispatch(
                    StoreActions.fetchStoresRequest({
                        payload: {
                            paginate: true,
                            limit: 20,
                            skip: takeSkip ? totalStores.length : 0,
                            keyword: search ? search : this.search.value,
                            type: storeType,
                            headers: {
                                version: '2'
                            },
                            warehouseId: (this.form.get('warehouse').value as Warehouse).id
                        } as IQueryParams
                    })
                );

                this.cd.detectChanges();
            },
            error: () => {
                this.cd.detectChanges();
            },
            complete: () => {
                this.cd.detectChanges();
            },
        });
    }

    onSelectedStoreChanged($event: SelectionState): void {
        HelperService.debug('onSelectedStoreStateChanged', $event);

        const storeId = +$event.data.id;
        const invoiceGroupId = +(this.form.get('invoiceGroup').value);
        const warehouseId = +(this.form.get('warehouse').value as Warehouse).id;

        if ($event.checked) {
            this.disabledStores.upsert($event.data);

            if (warehouseId) {
                this.storeApi.isStoreAtPortfolio(storeId, warehouseId, invoiceGroupId)
                    .subscribe({
                        next: ({ code: portfolioCode, name: portfolioName, portfolioId }) => {
                            this.disabledStores.remove(storeId.toString());

                            if (portfolioCode && portfolioName && portfolioId) {
                                this.conflictedStores.upsert({
                                    ...$event.data,
                                    data: {
                                        ...$event.data['data'],
                                        portfolioId,
                                        portfolioCode: portfolioCode || '-',
                                        portfolioName: portfolioName || '(no name)'
                                    },
                                    isSelected: true,
                                    tooltip: `This store is already added on Portfolio "${portfolioName}". (Code: ${portfolioCode})"`
                                } as Selection);
                            }

                            this.cd.detectChanges();
                        },
                        error: () => {
                            this.disabledStores.remove(storeId.toString());
                            this.cd.detectChanges();
                        },
                        complete: () => {
                            this.checkFormValidation();
                            this.disabledStores.remove(storeId.toString());
                            this.cd.detectChanges();
                        },
                    });
            }
        } else {
            this.conflictedStores.remove(storeId.toString());
        }
    }

    onSelectedStoresChanged($event: SelectionList): void {
        HelperService.debug('onSelectedStoresChanged', $event);

        this.form.patchValue({
            stores: $event.added,
            removedStores: $event.removed
        });
    }

    private updatePortfolioType(portfolio: string): void {
        if (portfolio === 'direct') {
            this.formTitle = 'Direct Store Portfolio Information';
            this.portfolioType = portfolio;
        } else {
            if (portfolio === 'group') {
                this.portfolioType = portfolio;
            }

            this.formTitle = 'Store Portfolio Information';
        }
    }

    private setupBreadcrumb(): void {
        const urlLength = this.route.snapshot.url.length;
        this.isEditMode = this.route.snapshot.url[urlLength - 1].path === 'edit';

        if (this.isEditMode) {
            this.portfolioStore.dispatch(
                PortfolioActions.setSelectedPortfolios({
                    payload: [this.portfolioId]
                })
            );

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
                            // translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: '/pages/sales-force/portfolio'
                        },
                        {
                            title: 'Edit Portfolio',
                            // translate: 'BREADCRUMBS.PORTFOLIO_EDIT',
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
                            // translate: 'BREADCRUMBS.HOME',
                            active: false
                        },
                        {
                            title: 'Sales Management',
                            // translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: '/pages/sales-force/portfolio'
                        },
                        {
                            title: 'Add Portfolio',
                            // translate: 'BREADCRUMBS.PORTFOLIO_ADD',
                            active: true
                        }
                    ]
                })
            );
        }
    }

    private setupForm(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            code: [{ value: '', disabled: true }],
            name: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            type: [
                { value: 'group', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            oldWarehouse: [
                { value: '', disabled: false }
            ],
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            invoiceGroup: [
                { value: '', disabled: false }
            ],
            stores: [[]],
            removedStores: [[]]
        });

        if (this.portfolioType === 'group') {
            this.form.get('invoiceGroup').setValidators(
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                })
            );

            this.form.get('invoiceGroup').updateValueAndValidity();
        }

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

                    this.portfolioStore.dispatch(PortfolioActions.selectWarehouse({ warehouse: value }));

                    this.requestStore(this.search.value);
                } else if (value && oldWarehouse.id !== value.id) {
                    // Memberi pesan konfirmasi jika warehouse yang dipilih berbeda dengan pilihan sebelumnya.
                    this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
                        data: {
                            id: `confirm`,
                            title: 'Clear',
                            message: `It will clear all selected store from the list.
                                    It won't affected this portfolio unless you click the save button.
                                    Are you sure want to proceed?`
                        },
                        disableClose: true
                    }).afterClosed()
                    .subscribe(confirmed => {
                        if (confirmed) {
                            this.portfolioStore.dispatch(StoreActions.truncateAllStores());
                            this.multipleSelection.clearAllSelectedOptions();

                            this.form.patchValue({
                                oldWarehouse: this.form.get('warehouse').value,
                                warehouse: value
                            });

                            this.singleWarehouseService.selectWarehouse(value);
    
                            this.requestStore(this.search.value);
                        } else {
                            this.singleWarehouseService.selectWarehouse(oldWarehouse);
                        }
                    });
                }

                if (!value) {
                    this.portfolioStore.dispatch(StoreActions.truncateAllStores());
                }
            });
    }

    private initDataRequest(): void {
        if (this.portfolioId) {
            this.portfolioStore.dispatch(PortfolioActions.fetchPortfolioRequest({
                payload: this.portfolioId
            }));

            this.portfolioStore.dispatch(PortfolioActions.fetchPortfolioStoresRequest({
                payload: {
                    skip: 0,
                    limit: 100,
                    paginate: true,
                    portfolioId: this.portfolioId
                } as IQueryParams
            }));
        }
    }

    private setupStateSelector(): void {
        // Melakukan setup untuk selector portfolio yang dipilih.
        this.portfolioStore.select(
            PortfolioSelector.getSelectedPortfolio
        ).pipe(
            tap(value => HelperService.debug('GET SELECTED PORTFOLIO', value)),
            takeUntil(this.subs$)
        ).subscribe(portfolio => {
            if (portfolio) {
                this.initialPortfolioStores$.next(
                    portfolio.storePortfolios.map(store => ({
                        id: store.storeId,
                        group: 'initial-portfolio-store',
                        label: `${store.store.storeCode} - ${store.store.name}`,
                        isSelected: true,
                        data: store
                    }) as Selection)
                );

                this.totalInitialPortfolioStores$.next(portfolio.storePortfolios.length);

                this.singleWarehouseService.selectWarehouse(portfolio.warehouse);

                HelperService.debug('GET STORE OF PORTFOLIO', {
                    portfolio,
                    stores: this.initialPortfolioStores$.value,
                    total: this.totalInitialPortfolioStores$.value
                });

                this.updatePortfolioType(portfolio.type);
            }
        });

        // Melakukan setup untuk selector toko yang tersedia untuk dipilih.
        this.availableStores$ = this.portfolioStore.select(
            StoreSelector.getAllStores
        ).pipe(
            map(stores => stores.map(store => ({
                id: store.storeId,
                group: store.storeType,
                label: `${store.externalId} - ${store.storeName}`,
                isSelected: false,
                data: store
            }) as Selection)),
            takeUntil(this.subs$)
        );

        // Melakukan setup untuk selector jumlah toko yang tersedia untuk dipilih.
        this.totalAvailableStores$ = this.portfolioStore.select(
            StoreSelector.getTotalStores
        ).pipe(
            takeUntil(this.subs$)
        );

        // Melakukan setup untuk selector state loading yang menampung pilihan toko yang tersedia.
        this.isAvailableStoresLoading$ = this.portfolioStore.select(
            StoreSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Melakukan setup untuk selector state loading yang menampung pilihan toko yang sudah dipilih.
        this.isSelectedStoresLoading$ = this.portfolioStore.select(
            PortfolioStoreSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Melakukan setup untuk selector state loading pada data portfolio.
        this.isPortfolioLoading$ = this.portfolioStore.select(
            PortfolioSelector.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Melakukan setup untuk selector event listener ketika menekan tombol "Save" pada toolbar.
        this.portfolioStore.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            filter(isClick => !!isClick),
            takeUntil(this.subs$)
        ).subscribe(isClick => {
            /** Jika menekannya, maka submit data form-nya. */
            if (isClick) {
                this.submitPortfolio();
            }
        });
    }

    ngOnInit(): void {
        // Inisialisasi breadcrumb.
        this.setupBreadcrumb();

        // Inisialisasi form.
        this.setupForm();

        // Inisialisasi subscribe ke selector.
        this.setupStateSelector();

        // Inisialisasi request data.
        this.initDataRequest();

        // Memunculkan footer action.
        this.portfolioStore.dispatch(UiActions.showFooterAction());

        // Mengambil data store-nya portfolio dari state.
        // combineLatest([
        //     this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
        //     this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores)
        // ])
        //     .pipe(
        //         map(([portfolioStore, selectedStore]) => selectedStore.concat(portfolioStore)),
        //         withLatestFrom(this.shopStore.select(StoreSelector.getSelectedStoreIds)),
        //         tap(([stores, _]) => {
        //             if ((!stores || stores.length === 0) && this.isEditMode) {
        //                 const err = new Error('Portfolio stores not available right now.');
        //                 err.name = 'ERR_NO_PORTFOLIO_STORE';

        //                 const query: IQueryParams = {
        //                     paginate: false
        //                     // skip: 0,
        //                     // limit: 20,
        //                     // sort: 'asc',
        //                     // sortBy: 'id',
        //                 };

        //                 query['portfolioId'] = this.portfolioId;
        //                 this.portfolioStore.dispatch(
        //                     PortfolioActions.fetchPortfolioStoresRequest({
        //                         payload: query
        //                     })
        //                 );

        //                 throw err;
        //             }
        //         }),
        //         retryWhen((error: Observable<Error>) => {
        //             return error.pipe(
        //                 tap(err =>
        //                     !environment.production
        //                         ? console.log('PORTFOLIO STORES CHECK ERROR', err)
        //                         : null
        //                 ),
        //                 switchMap(err => {
        //                     if (err.name === 'ERR_NO_PORTFOLIO_STORE') {
        //                         return of(err);
        //                     }
        //                 }),
        //                 delay(1000),
        //                 take(60)
        //             );
        //             // return error.toPromise()
        //             //     .then(err => {
        //             //         if (this.isEditMode && err.name === 'ERR_NO_PORTFOLIO_STORE') {
        //             //             return error.pipe(delay(1000), take(5));
        //             //         }
        //             //     });
        //         }),
        //         takeUntil(this.subs$)
        //     )
        //     .subscribe(([portfolioStores]) => {
        //         // Mengambil toko-toko yang ingin dihapus dari portfolio.
        //         const deletedStores = portfolioStores.filter(pStore => pStore.deletedAt);

        //         // Mengambil toko-toko yang ingin ditambah atau diperbarui ke portfolio.
        //         const newPortfolioStore = portfolioStores.filter(
        //             pStore => !deletedStores.map(dStore => dStore.id).includes(pStore.id)
        //         );

        //         // Menetapkan toko-toko yang ingin ditambahkan ke portfolio ke dalam form.
        //         this.form.get('stores').setValue(newPortfolioStore.map(store => new Store(store)));
        //         // Menetapkan toko-toko yang ingin dihapus dari portfolio ke dalam form.
        //         this.form
        //             .get('removedStores')
        //             .setValue(deletedStores.map(store => new Store(store)));

        //         // this.portfolioStores$ = of(newPortfolioStore.map(store => new Store(store)));
        //         // this.portfolioStores = new MatTableDataSource(newPortfolioStore);
        //         // this.portfolioStoreSelection = new SelectionModel<Store>(true, newPortfolioStore);
        //         // this.portfolioStoreSelection.clear();

        //         this.checkFormValidation(this.form, newPortfolioStore);
        //     });
    }

    ngAfterViewInit(): void {
        // Mengambil ID portfolio dari state maupun URL.
        if (this.isEditMode) {
            this.portfolioStore
                .select(PortfolioSelector.getSelectedPortfolio)
                .pipe(
                    tap(portfolio => {
                        if (!portfolio) {
                            throw Error('Selected portfolio not available');
                        }
                    }),
                    retryWhen(error => {
                        this.portfolioStore.dispatch(
                            PortfolioActions.fetchPortfolioRequest({ payload: this.portfolioId })
                        );

                        return error.pipe(delay(1000), take(3));
                    }),
                    takeUntil(this.subs$)
                )
                .subscribe(portfolio => {
                    if (!portfolio) {
                        throw Error('Selected portfolio not available');
                    } else {
                        this.portfolioId = portfolio.id;

                        if (this.isEditMode) {
                            this.form.patchValue({
                                name: portfolio.name,
                                invoiceGroup: portfolio.invoiceGroupId,
                                type: portfolio.type
                            });

                            this.portfolioStore.dispatch(
                                PortfolioActions.setSelectedInvoiceGroupId({
                                    payload: portfolio.invoiceGroupId
                                })
                            );
                        }
                    }
                });
        }

        this.invoiceGroupSub
            .pipe(
                withLatestFrom(
                    this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
                    (formInvoiceGroupId, selectedInvoiceGroupId) => ({
                        formInvoiceGroupId,
                        selectedInvoiceGroupId
                    })
                ),
                exhaustMap<
                    { formInvoiceGroupId: string; selectedInvoiceGroupId: string },
                    Observable<string | null>
                >(({ formInvoiceGroupId, selectedInvoiceGroupId }) => {
                    // Memunculkan dialog ketika di state sudah ada invoice group yang terpilih dan pilihan tersebut berbeda dengan nilai yang sedang dipilih saat ini.
                    if (selectedInvoiceGroupId && formInvoiceGroupId !== selectedInvoiceGroupId) {
                        const dialogRef = this.matDialog.open<
                            DeleteConfirmationComponent,
                            any,
                            string | null
                        >(DeleteConfirmationComponent, {
                            data: {
                                id: `changed|${formInvoiceGroupId}|${selectedInvoiceGroupId}`,
                                title: 'Clear',
                                message: `It will clear all selected store from the list.
                                        It won't affected this portfolio unless you click the save button.
                                        Are you sure want to proceed?`
                            },
                            disableClose: true
                        });

                        return dialogRef.afterClosed().pipe(
                            map(id => {
                                if (!id) {
                                    return `cancelled|${selectedInvoiceGroupId}`;
                                }

                                return id;
                            }),
                            take(1)
                        );
                    } else {
                        const subject = new Subject<string>();
                        let payload;

                        if (!selectedInvoiceGroupId) {
                            payload = `init|${formInvoiceGroupId}`;
                        } else {
                            payload = `cancelled|${selectedInvoiceGroupId}`;
                        }

                        return subject.asObservable().pipe(startWith(payload), take(1));
                    }
                }),
                filter(invoiceGroupId => {
                    const action = invoiceGroupId.split('|')[0];

                    if (action === 'cancelled') {
                        const lastInvoiceGroupId = invoiceGroupId.split('|')[1];
                        this.invoiceGroup.value = lastInvoiceGroupId;

                        return false;
                    } else if (action === 'init' || action === 'changed') {
                        const formInvoiceGroupId = invoiceGroupId.split('|')[1];
                        this.portfolioStore.dispatch(
                            PortfolioActions.setSelectedInvoiceGroupId({
                                payload: formInvoiceGroupId
                            })
                        );

                        return true;
                    }

                    return false;
                }),
                withLatestFrom(
                    this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
                    this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
                    (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
                ),
                map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(
                    ({ newStores, portfolioStores }) => {
                        let isCleared = false;
                        const newStoreIds = newStores.map(newStore => newStore.id);
                        const portfolioStoreIds = portfolioStores.map(
                            portfolioStore => portfolioStore.id
                        );

                        if (newStoreIds.length > 0) {
                            isCleared = true;
                            this.portfolioStore.dispatch(
                                PortfolioActions.removeSelectedStores({
                                    payload: newStoreIds
                                })
                            );
                        }

                        if (portfolioStoreIds.length > 0) {
                            isCleared = true;
                            this.portfolioStore.dispatch(
                                PortfolioActions.markStoresAsRemovedFromPortfolio({
                                    payload: portfolioStoreIds
                                })
                            );
                        }

                        return isCleared;
                    }
                ),
                tap(isCleared => {
                    // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
                    if (isCleared) {
                        this._notice.open('All selected stores have been cleared.', 'info', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    }
                }),
                takeUntil(this.subs$)
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());
        this.portfolioStore.dispatch(UiActions.hideFooterAction());
        this.portfolioStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.portfolioStore.dispatch(UiActions.hideCustomToolbar());
        this.portfolioStore.dispatch(FormActions.resetFormStatus());
        this.portfolioStore.dispatch(FormActions.resetClickSaveButton());
        this.portfolioStore.dispatch(FormActions.resetCancelButtonAction());

        this.portfolioStore.dispatch(StoreActions.truncateAllStores());
        this.portfolioStore.dispatch(StoreActions.removeAllStoreFilters());

        this.portfolioStore.dispatch(PortfolioActions.resetSelectedInvoiceGroupId());
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());

        this.shopStore.dispatch(StoreActions.setStoreEntityType({ payload: 'in-portfolio' }));
    }
}
