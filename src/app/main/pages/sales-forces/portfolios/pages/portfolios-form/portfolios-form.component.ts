import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, SecurityContext, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
// NgRx's Libraries
import { Store as NgRxStore } from '@ngrx/store';
// RxJS' Libraries
import { Observable, Subject, merge, combineLatest, of, fromEvent } from 'rxjs';
import { takeUntil, withLatestFrom, map, distinctUntilChanged, debounceTime, tap, filter, delay, take, retryWhen, switchMap, exhaustMap, startWith } from 'rxjs/operators';

// Environment variables.
import { environment } from '../../../../../../../environments/environment';
// Languages' stuffs.
import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
// State management's stuffs.
import { CoreFeatureState } from '../../store/reducers';
import { PortfolioActions } from '../../store/actions';
import { PortfolioSelector, PortfolioStoreSelector } from '../../store/selectors';
import { UiActions, DropdownActions, FormActions } from 'app/shared/store/actions';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatSelectionList, MatSelectChange, MatSelect } from '@angular/material';
import { IQueryParams, InvoiceGroup, SupplierStore } from 'app/shared/models';
import { Store } from '../../models';
import { NoticeService, ErrorMessageService } from 'app/shared/helpers';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { StoreActions } from '../../store/actions';
import { StoreSelector } from '../../store/selectors';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IPortfolioAddForm, Portfolio } from '../../models/portfolios.model';
import { PortfoliosFilterStoresComponent } from '../../components/portfolios-filter-stores/portfolios-filter-stores.component';
import { CdkScrollable } from '@angular/cdk/overlay';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { PortfoliosConflictStoresComponent } from '../../components/portfolios-conflict-stores/portfolios-conflict-stores.component';

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
    search: FormControl;
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

    // /**
    //  * SEGALA SESUATU YANG BERHUBUNGAN LIST STORE.
    //  */
    // // Untuk menyimpan data store.
    // listStore: MatTableDataSource<Store>;
    // // Untuk menyimpan jumlah store yang ada di server.
    totalListStore$: Observable<number>;
    // // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    // defaultListStorePageSize: number = environment.pageSize;
    // // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    // displayedListStoreColumns: Array<string> = [
    //     'checkbox',
    //     'code',
    //     'name',
    //     // 'region',
    //     'segment',
    //     'type'
    // ];
    // // Menyimpan data baris tabel yang tercentang oleh checkbox.
    // listStoreSelection: SelectionModel<Store> = new SelectionModel<Store>(true, []);

    // // ViewChild untuk MatPaginator.
    // @ViewChild('listStorePaginator', { static: true })
    // listStorePaginator: MatPaginator;

    // // ViewChild untuk MatSort.
    // @ViewChild('listStoreSort', { static: true })
    // listStoreSort: MatSort;

    // /**
    //  * SEGALA SESUATU YANG BERHUBUNGAN DENGAN PORTFOLIO STORE.
    //  */
    // portfolioStores$: Observable<Array<Store>>;
    // // Untuk menyimpan data store.
    // portfolioStores: MatTableDataSource<Store>;
    // // Untuk menyimpan jumlah store yang ada di server.
    totalPortfolioStore$: Observable<number>;
    // // Menyimpan jumlah data yang ditampilkan dalam 1 halaman.
    // defaultPortfolioStorePageSize: number = environment.pageSize;
    // // Menyimpan nama-nama kolom tabel yang ingin dimunculkan.
    // displayedPortfolioStoreColumns: Array<string> = [
    //     'checkbox',
    //     'code',
    //     'name',
    //     // 'region',
    //     'segment',
    //     'type',
    //     'delete'
    // ];
    // // Menyimpan data baris tabel yang tercentang oleh checkbox.
    // portfolioStoreSelection: SelectionModel<Store> = new SelectionModel<Store>(true, []);

    // // ViewChild untuk MatPaginator.
    // @ViewChild('portfolioStorePaginator', { static: true })
    // portfolioStorePaginator: MatPaginator;

    // // ViewChild untuk MatSort.
    // @ViewChild('portfolioStoreSort', { static: true })
    // portfolioStoreSort: MatSort;

    // @ViewChild('listStore', { static: false }) listStore: CdkScrollable;

    @ViewChild('invoiceGroup', { static: false }) invoiceGroup: MatSelect;
    invoiceGroupSub: Subject<string> = new Subject<string>();

    constructor(
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
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
        // Mengambil ID portfolio dari param URL.
        this.portfolioId = this.route.snapshot.params.id;

        // Menyiapkan breadcrumb yang ingin ditampilkan.
        // const breadcrumbs = [
        //     {
        //         title: 'Home',
        //        // translate: 'BREADCRUMBS.HOME',
        //         active: false
        //     },
        //     {
        //         title: 'Sales Management',
        //         translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
        //         url: '/pages/sales-force/portfolio'
        //     },
        //     {
        //         title: 'Add Portfolio',
        //         translate: 'BREADCRUMBS.PORTFOLIO_ADD',
        //         active: true
        //     }
        // ];

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

        // Mengambil jumlah store dari state-nya store (merchant).
        this.totalListStore$ = combineLatest([
            this.shopStore.select(StoreSelector.getTotalStores),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioStores),
            this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStoreIds)
        ]).pipe(
            map(
                ([totalListStore, totalPortfolioStore, selectedPortfolioStoreIds]) =>
                    totalListStore - (totalPortfolioStore + selectedPortfolioStoreIds.length)
            ),
            takeUntil(this.subs$)
        );

        // Mengambil jumlah store-nya portfolio dari state.
        this.totalPortfolioStore$ = combineLatest([
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioStoreEntity),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioNewStoreEntity)
        ]).pipe(
            map(
                ([portfolioStoreTotal, selectedStoreTotal]) =>
                    portfolioStoreTotal + selectedStoreTotal
            ),
            takeUntil(this.subs$)
        );

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

        // Menetapkan breadcrumb yang ingin ditampilkan.
        // this.portfolioStore.dispatch(
        //     UiActions.createBreadcrumb({
        //         payload: breadcrumbs
        //     })
        // );

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

        // Mengatur ulang status form.
        this.portfolioStore.dispatch(FormActions.resetFormStatus());

        // Memuat terjemahan bahasa.
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // private onRefreshListStoreTable(filters?: { storeType: string; storeSegment: string; }): void {
    //     // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
    //     if (this.listStorePaginator) {
    //         // Menyiapkan query parameter yang akan dikirim ke server.
    //         const data: IQueryParams = {
    //             limit: this.listStorePaginator.pageSize || this.defaultListStorePageSize,
    //             skip: this.listStorePaginator.pageSize * this.listStorePaginator.pageIndex || 0
    //         };

    //         // Menyalakan pagination.
    //         data['paginate'] = true;

    //         if (filters) {
    //             if (filters.storeType) {
    //                 data['storeType'] = filters.storeType;
    //             }

    //             if (filters.storeSegment) {
    //                 data['storeSegment'] = filters.storeSegment;
    //             }
    //         } 

    //         if (this.listStoreSort.direction) {
    //             // Menentukan sort direction tabel.
    //             data['sort'] = this.listStoreSort.direction === 'desc' ? 'desc' : 'asc';

    //             // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
    //             if (this.listStoreSort.active === 'code') {
    //                 data['sortBy'] = 'store_code';
    //             } else {
    //                 data['sortBy'] = this.listStoreSort.active;
    //             }
    //         } else {
    //             // Sortir default jika tidak ada sort yang aktif.
    //             data['sort'] = 'asc';
    //             data['sortBy'] = 'id';
    //         }

    //         // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
    //         const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
    //         // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
    //         if (searchValue) {
    //             data['search'] = [
    //                 {
    //                     fieldName: 'store_code',
    //                     keyword: searchValue
    //                 },
    //                 {
    //                     fieldName: 'name',
    //                     keyword: searchValue
    //                 }
    //             ];
    //         }

    //         // Melakukan request store ke server via dispatch state.
    //         this.shopStore.dispatch(
    //             `StoreActions.fetchStore`sRequest({ payload: data })
    //         );
    //     }
    // }

    // private onRefreshPortfolioStoreTable(): void {
    //     // Melakukan dispatch untuk mengambil data store berdasarkan ID portfolio.
    //     if (this.portfolioStorePaginator && this.isEditMode) {
    //         // Menyiapkan query parameter yang akan dikirim ke server.
    //         const data: IQueryParams = {
    //             limit: this.portfolioStorePaginator.pageSize || this.defaultPortfolioStorePageSize,
    //             skip:
    //                 this.portfolioStorePaginator.pageSize *
    //                     this.portfolioStorePaginator.pageIndex || 0
    //         };

    //         // Menyalakan pagination.
    //         data['paginate'] = true;

    //         if (this.portfolioStoreSort.direction) {
    //             // Menentukan sort direction tabel.
    //             data['sort'] = this.portfolioStoreSort.direction === 'desc' ? 'desc' : 'asc';

    //             // Jika sort yg aktif adalah code, maka sortBy yang dikirim adalah store_code.
    //             if (this.portfolioStoreSort.active === 'code') {
    //                 data['sortBy'] = 'store_code';
    //             } else {
    //                 data['sortBy'] = this.portfolioStoreSort.active;
    //             }
    //         } else {
    //             // Sortir default jika tidak ada sort yang aktif.
    //             data['sort'] = 'asc';
    //             data['sortBy'] = 'id';
    //         }

    //         // Hanya mengambil store-nya portfolio jika ada ID nya portfolio.
    //         if (this.portfolioId) {
    //             data['portfolioId'] = this.portfolioId;
    //         }

    //         // Melakukan request store ke server via dispatch state.
    //         this.portfolioStore.dispatch(
    //             PortfolioActions.fetchPortfolioStoresRequest({ payload: data })
    //         );
    //     }
    // }

    // addSelectedStores(): void {        
    //     this.portfolioStore.dispatch(
    //         PortfolioActions.addSelectedStores({
    //             payload: this.listStoreSelection.selected
    //         })
    //     );

    //     this.onRefreshListStoreTable();
    // }

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

    // isAllListStoreSelected(): boolean {
    //     const numSelected = this.listStoreSelection.selected.length;
    //     const numRows = this.listStore.data.length;
    //     return numSelected === numRows;
    // }

    // listStoreMasterToggle(): void {
    //     if (this.form.get('type').value === 'direct') {
    //         return null;
    //     }

    //     this.isAllListStoreSelected()
    //         ? this.listStoreSelection.clear()
    //         : this.listStore.data.forEach(row => this.listStoreSelection.select(row));
    // }

    // isAllPortfolioStoreSelected(): boolean {
    //     const numSelected = this.portfolioStoreSelection.selected.length;
    //     const numRows = this.portfolioStores.data.length;

    //     console.log('IS ALL SELECTED', numSelected, numRows);

    //     return numSelected === numRows;
    // }

    // portfolioStoreMasterToggle(): void {
    //     this.isAllPortfolioStoreSelected()
    //         ? this.portfolioStoreSelection.clear()
    //         : this.portfolioStores.data.forEach(row => this.portfolioStoreSelection.select(row));
    // }

    // toggleListStore(store: Store): void {
    //     console.log('TOGGLE LIST STORE', this.listStoreSelection.isSelected(store));

    //     if (this.listStoreSelection.isSelected(store)) {
    //         return this.listStoreSelection.toggle(store);
    //     }

    //     if (
    //         this.listStoreSelection.selected.length > 0 &&
    //         this.form.get('type').value === 'direct'
    //     ) {
    //         return null;
    //     }

    //     this.listStoreSelection.toggle(store);
    // }

    // togglePortfolioStore(store: Store): void {
    //     if (this.portfolioStoreSelection.isSelected(store)) {
    //         return this.portfolioStoreSelection.toggle(store);
    //     }

    //     this.portfolioStoreSelection.toggle(store);
    // }

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

    processConflictStores(form: IPortfolioAddForm, conflictStores: Array<Store>): void {
        // Memunculkan dialog.
        const dialogRef = this.matDialog.open(PortfoliosConflictStoresComponent, {
            data: {
                formData: form,
                conflictStores
            },
            width: '100vw',
            disableClose: true,
        });

        // Subscribe ke dialog yang terbuka dan akan jalan ketika dialog sudah tertutup.
        (dialogRef.afterClosed() as Observable<string>).pipe(
            // Hanya diteruskan jika menekan tombol "Yes".
            filter(action => {
                this.portfolioStore.dispatch(FormActions.resetClickSaveButton());

                return !!action;
            }),
            tap(() => {
                // Mengambil store yang ingin dihapus dari form dan membentuknya untuk siap dihapus oleh back-end.
                const removedStores = (this.form.get('removedStores').value as Array<Store>).map(store => ({ storeId: store.id, portfolioId: this.portfolioId }));
                // Menambah store yang ingin dihapus dari toko yang konflik dengan portfolio lain dan fakturnya sama.
                removedStores.push(...conflictStores.map(store => ({ storeId: store.id, portfolioId: store.portfolio.id })));
                // Mengambil ID store-nya aja dari toko yang ingin dihapus.
                const removedStoreIds = removedStores.map(removedStore => removedStore.storeId);
                // Meng-update form data toko yang ingin dihapus.
                form.removedStore = removedStores;
                // Menyaring toko dari toko yang akan dihapus.
//                 form.stores = form.stores.filter(store => !removedStoreIds.includes(String(store.storeId)));

                // Melakukan request ke back-end untuk update portfolio.
                this.portfolioStore.dispatch(
                    PortfolioActions.patchPortfolioRequest({ payload: { id: this.portfolioId, portfolio: form } })
                );
            }),
            take(1)
        ).subscribe();
    }

    processPortfolioForm(form: IPortfolioAddForm, rawStores: Array<Store>): void {
        // Mendapatkan toko-toko dari form.
        // const storesForm = (form.stores as unknown as Array<Store>);
        // Menampung toko yang konflik. (Toko yang sudah ada di portfolio lain dengan faktur yang sama)
        const conflictStores = rawStores.filter(store => store.portfolio);

        if (conflictStores.length === 0) {
            if (!this.isEditMode) {
                // Melakukan request ke back-end untuk create portfolio.
                this.portfolioStore.dispatch(
                    PortfolioActions.createPortfolioRequest({ payload: form })
                );
            } else {
                // Menambah toko-toko yang ingin dihapus ke dalam form.
                form.removedStore = (this.form.get('removedStores').value as Array<Store>)
                                            .map(store => ({
                                                storeId: store.id,
                                                portfolioId: this.portfolioId
                                            }));

                // Melakukan request ke back-end untuk update portfolio.
                this.portfolioStore.dispatch(
                    PortfolioActions.patchPortfolioRequest({ payload: { id: this.portfolioId, portfolio: form } })
                );
            }
        } else {
            // Memproses form yang memiliki toko-toko konflik.
            this.processConflictStores(form, conflictStores);
        }
    }

    submitPortfolio(): void {
        const rawStores = (this.form.get('stores').value as Array<Store>);

        const portfolioForm: IPortfolioAddForm = {
            name: this.form.get('name').value,
            type: this.form.get('type').value,
            invoiceGroupId: this.form.get('invoiceGroup').value,
            stores: rawStores.map(store => ({ storeId: +store.id, target: 0 })),
        };

        this.processPortfolioForm(portfolioForm, rawStores);
    }

    // onChangePage(tableType: 'listStore' | 'portfolioStore'): void {
    //     if (tableType === 'listStore') {
    //         this.onRefreshListStoreTable();
    //     } else if (tableType === 'portfolioStore') {
    //         this.onRefreshPortfolioStoreTable();
    //     }
    // }

    // deletePortfolioStore(portfolioStoreId: string): void {
    //     this.portfolioStore.dispatch(
    //         PortfolioActions.removeSelectedStores({ payload: [portfolioStoreId] })
    //     );

    //     this.onRefreshListStoreTable();
    // }

    // deleteSelectedPortfolioStore(): void {
    //     this.portfolioStore.dispatch(
    //         PortfolioActions.removeSelectedStores({ payload: [...this.portfolioStoreSelection.selected.map(p => p.id)] })
    //     );

    //     this.onRefreshListStoreTable();
    // }

    openFilter(): void {
        this.matDialog.open(PortfoliosFilterStoresComponent, {
            data: {
                title: 'Filter'
            },
            disableClose: true,
            width: '1000px'
        });
    }

    checkFormValidation(form: FormGroup, stores: Array<Store>): void {
        if (form.invalid || stores.length === 0) {
            this.portfolioStore.dispatch(FormActions.setFormStatusInvalid());
        } else if (form.valid && stores.length > 0) {
            this.portfolioStore.dispatch(FormActions.setFormStatusValid());
        }
    }

    // checkInvoiceGroupChanged($event: MatSelectChange): void {
    //     this.portfolioStore.select(
    //         PortfolioSelector.getSelectedInvoiceGroupId
    //     ).pipe(
    //         exhaustMap(([formInvoiceGroupId, selectedInvoiceGroupId]) => {
    //             if (formInvoiceGroupId !== selectedInvoiceGroupId) {
    //                 const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(DeleteConfirmationComponent, {
    //                     data: {
    //                         id: `${formInvoiceGroupId}|${selectedInvoiceGroupId}`,
    //                         title: 'Clear',
    //                         message: `It will clear all selected store from the list.
    //                                     It won't affected this portfolio unless you click the save button.
    //                                     Are you sure want to proceed?`,
    //                     }, disableClose: true
    //                 });
    
    //                 return dialogRef.afterClosed();
    //             }

    //             const subject = new Subject<string>();
    //             subject.next('cancelled');
    //             subject.complete();
    //             return subject;
    //         }),
    //         take(1)
    //     ).subscribe(invoiceGroupId => {
    //         if (invoiceGroupId === 'cancelled') {
    //             const lastInvoiceGroupId = invoiceGroupId.split('|')[1];
    //             $event.source.value = lastInvoiceGroupId;
    //         } else {
    //             const formInvoiceGroupId = invoiceGroupId.split('|')[0];
    //             this.portfolioStore.dispatch(PortfolioActions.setSelectedInvoiceGroupId({ payload: formInvoiceGroupId }));
    //         }
    //     });
    // }

    ngOnInit(): void {
        this.isEditMode = this.route.snapshot.url[this.route.snapshot.url.length - 1].path === 'edit';

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
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: '/pages/sales-force/portfolio'
                        },
                        {
                            title: 'Edit Portfolio',
                            translate: 'BREADCRUMBS.PORTFOLIO_EDIT',
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
                            translate: 'BREADCRUMBS.SALES_REP_MANAGEMENT',
                            url: '/pages/sales-force/portfolio'
                        },
                        {
                            title: 'Add Portfolio',
                            translate: 'BREADCRUMBS.PORTFOLIO_ADD',
                            active: true
                        }
                    ]
                })
            );
        }

        // Inisialisasi FormControl untuk search.
        this.search = new FormControl('');

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
            invoiceGroup: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            stores: [[]],
            removedStores: [[]],
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
        // this.shopStore.select(
        //     StoreSelector.getAllStores
        // ).pipe(
        //     withLatestFrom(
        //         this.portfolioStore.select(PortfolioStoreSelector.getPortfolioStoreEntityIds),
        //         this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStoreIds),
        //         (listStores: Array<Store>, portfolioStoreIds: Array<string>, portfolioNewStoreIds: Array<string>) => ({
        //             listStores, portfolioStoreIds, portfolioNewStoreIds
        //         })
        //     ),
        //     takeUntil(this.subs$)
        // ).subscribe(({ listStores, portfolioStoreIds, portfolioNewStoreIds }) => {
        //     // const newListStore = listStores.filter(listStore => !portfolioStoreIds.concat(portfolioNewStoreIds).includes(listStore.id));

        //     // this.listStore = new MatTableDataSource(newListStore);
        //     // this.listStoreSelection = new SelectionModel<Store>(true, newListStore);
        //     // this.listStoreSelection.clear();
        // });

        // Mengambil data store-nya portfolio dari state.
        combineLatest([
            this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
            this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores)
        ]).pipe(
            map(([portfolioStore, selectedStore]) => selectedStore.concat(portfolioStore)),
            withLatestFrom(this.shopStore.select(StoreSelector.getSelectedStoreIds)),
            tap(([stores, _]) => {
                if ((!stores || stores.length === 0) && this.isEditMode) {
                    const err = new Error('Portfolio stores not available right now.');
                    err.name = 'ERR_NO_PORTFOLIO_STORE';

                    const query: IQueryParams = {
                        paginate: false,
                        // skip: 0,
                        // limit: 20,
                        // sort: 'asc',
                        // sortBy: 'id',
                        
                    };

                    query['portfolioId'] = this.portfolioId;
                    this.portfolioStore.dispatch(
                        PortfolioActions.fetchPortfolioStoresRequest({
                            payload: query
                        })
                    );

                    throw err;
                }
            }),
            retryWhen((error: Observable<Error>) => {
                return error.pipe(
                    tap(err => !environment.production ? console.log('PORTFOLIO STORES CHECK ERROR', err) : null),
                    switchMap(err => {
                        if (err.name === 'ERR_NO_PORTFOLIO_STORE') {
                            return of(err);
                        }
                    }),
                    delay(1000),
                    take(5)
                );
                // return error.toPromise()
                //     .then(err => {
                //         if (this.isEditMode && err.name === 'ERR_NO_PORTFOLIO_STORE') {
                //             return error.pipe(delay(1000), take(5));
                //         }
                //     });
            }),
            takeUntil(this.subs$)
        ).subscribe(([portfolioStores]) => {
            // Mengambil toko-toko yang ingin dihapus dari portfolio.
            const deletedStores = portfolioStores.filter(pStore => pStore.deletedAt);

            // Mengambil toko-toko yang ingin ditambah atau diperbarui ke portfolio.
            const newPortfolioStore = portfolioStores.filter(pStore => !deletedStores.map(dStore => dStore.id).includes(pStore.id));

            // Menetapkan toko-toko yang ingin ditambahkan ke portfolio ke dalam form.
            this.form.get('stores').setValue(newPortfolioStore.map(store => new Store(store)));
            // Menetapkan toko-toko yang ingin dihapus dari portfolio ke dalam form.
            this.form.get('removedStores').setValue(deletedStores.map(store => new Store(store)));

            // this.portfolioStores$ = of(newPortfolioStore.map(store => new Store(store)));
            // this.portfolioStores = new MatTableDataSource(newPortfolioStore);
            // this.portfolioStoreSelection = new SelectionModel<Store>(true, newPortfolioStore);
            // this.portfolioStoreSelection.clear();

            this.checkFormValidation(this.form, newPortfolioStore);
        });

        this.form
            .valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                takeUntil(this.subs$)
            ).subscribe(() => {
                this.checkFormValidation(this.form, (this.form.get('stores').value as Array<Store>));
            });

        // (this.form.get('invoiceGroup')
        //     .valueChanges as Observable<string>)
        //     .pipe(
        //         // withLatestFrom(this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)),
        //         // exhaustMap(([formInvoiceGroupId, selectedInvoiceGroupId]) => {
        //         //     if (formInvoiceGroupId !== selectedInvoiceGroupId) {
        //         //         const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(DeleteConfirmationComponent, {
        //         //             data: {
        //         //                 id: formInvoiceGroupId,
        //         //                 title: 'Clear',
        //         //                 message: `It will clear all selected store from the list.
        //         //                             It won't affected this portfolio unless you click the save button.
        //         //                             Are you sure want to proceed?`,
        //         //             }, disableClose: true
        //         //         });
        
        //         //         return dialogRef.afterClosed();
        //         //     }

        //         //     const subject = new Subject<string>();
        //         //     subject.next('cancelled');
        //         //     subject.complete();
        //         //     return subject;
        //         // }),
        //         // filter(action => action !== 'cancelled'),
        //         takeUntil(this.subs$)
        //     ).subscribe((value: string) => {
        //         this.portfolioStore.dispatch(PortfolioActions.setSelectedInvoiceGroupId({ payload: value }));
        //     });

        this.portfolioStore
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                tap(isClick => console.log(isClick)),
                filter(isClick => !!isClick),
                takeUntil(this.subs$)
            )
            .subscribe(isClick => {
                /** Jika menekannya, maka submit data form-nya. */
                if (isClick) {
                    this.submitPortfolio();
                }
            });

        this.portfolioStore.dispatch(UiActions.showFooterAction());
    }

    ngAfterViewInit(): void {
        // Mengambil ID portfolio dari state maupun URL.
        if (this.isEditMode) {
            this.portfolioStore.select(
                PortfolioSelector.getSelectedPortfolio
            ).pipe(
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
            ).subscribe(portfolio => {
                if (!portfolio) {
                    throw Error('Selected portfolio not available');
                } else {
                    this.portfolioId = portfolio.id;
    
                    if (this.isEditMode) {
                        this.form.patchValue({
                            name: portfolio.name,
                            invoiceGroup: portfolio.invoiceGroupId,
                        });

                        this.portfolioStore.dispatch(
                            PortfolioActions.setSelectedInvoiceGroupId({ payload: portfolio.invoiceGroupId })
                        );
                    }
                }
            });
        }

        // this.listStore.elementScrolled().pipe(
        //     tap(event => event),
        //     takeUntil(this.subs$)
        // )

        // this.listStore.sort = this.listStoreSort;
        // this.listStore.paginator = this.listStorePaginator;

        // this.portfolioStores.sort = this.portfolioStoreSort;
        // this.portfolioStores.paginator = this.portfolioStorePaginator;

        // if (!this.isEditMode) {
        //     this.portfolioStore.dispatch(
        //         PortfolioActions.truncatePortfolioStores()
        //     );
        // }

        // Melakukan merge Observable pada perubahan sortir dan halaman tabel List Store.
        // merge(
        //     this.listStoreSort.sortChange,
        //     this.listStorePaginator.page
        // ).pipe(
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     this.onRefreshListStoreTable();
        // });

        // this.shopStore.select(
        //     StoreSelector.getStoreFilters
        // ).pipe(
        //     takeUntil(this.subs$)
        // ).subscribe((filters: { storeType: string; storeSegment: string }) =>
        //     this.onRefreshListStoreTable(filters)
        // );

        // Melakukan merge Observable pada perubahan sortir dan halaman tabel Portfolio Store.
        // merge(
        //     this.portfolioStoreSort.sortChange,
        //     this.portfolioStorePaginator.page
        // ).pipe(
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     this.onRefreshPortfolioStoreTable();
        // });

        // this.form.get('type').valueChanges
        //     .pipe(
        //         takeUntil(this.subs$)
        //     ).subscribe(value => {
        //         if (value === 'direct') {
        //             this.listStoreSelection.clear();
        //         }
        //     });

        // this.search.valueChanges
        //     .pipe(
        //         distinctUntilChanged(),
        //         debounceTime(1000),
        //         takeUntil(this.subs$)
        //     ).subscribe(() => this.onRefreshListStoreTable());

        // this.onRefreshListStoreTable();
        // this.onRefreshPortfolioStoreTable();

        this.invoiceGroupSub.pipe(
            withLatestFrom(
                this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
                (formInvoiceGroupId, selectedInvoiceGroupId) => ({ formInvoiceGroupId, selectedInvoiceGroupId })
            ),
            exhaustMap<{ formInvoiceGroupId: string; selectedInvoiceGroupId: string }, Observable<string | null>>(({ formInvoiceGroupId, selectedInvoiceGroupId }) => {
                // Memunculkan dialog ketika di state sudah ada invoice group yang terpilih dan pilihan tersebut berbeda dengan nilai yang sedang dipilih saat ini.
                if (selectedInvoiceGroupId && formInvoiceGroupId !== selectedInvoiceGroupId) {
                    const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
                        data: {
                            id: `changed|${formInvoiceGroupId}|${selectedInvoiceGroupId}`,
                            title: 'Clear',
                            message: `It will clear all selected store from the list.
                                        It won't affected this portfolio unless you click the save button.
                                        Are you sure want to proceed?`,
                        }, disableClose: true
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

                    return subject.asObservable().pipe(
                        startWith(payload),
                        take(1)
                    );
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
                    this.portfolioStore.dispatch(PortfolioActions.setSelectedInvoiceGroupId({ payload: formInvoiceGroupId }));

                    return true;
                }

                return false;
            }),
            withLatestFrom(
                this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
                this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
                (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
            ),
            map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(({ newStores, portfolioStores }) => {
                let isCleared = false;
                const newStoreIds = newStores.map(newStore => newStore.id);
                const portfolioStoreIds = portfolioStores.map(portfolioStore => portfolioStore.id);

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
            }),
            tap((isCleared) => {
                // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
                if (isCleared) {
                    this._notice.open('All selected stores have been cleared.', 'info', { verticalPosition: 'bottom', horizontalPosition: 'right' });
                }
            }),
            takeUntil(this.subs$)
        ).subscribe();
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
        
        this.portfolioStore.dispatch(StoreActions.removeAllStoreFilters());
        this.portfolioStore.dispatch(PortfolioActions.resetSelectedInvoiceGroupId());
        this.portfolioStore.dispatch(PortfolioActions.truncateSelectedPortfolios());
        this.portfolioStore.dispatch(PortfolioActions.truncatePortfolioStores());
        
        this.shopStore.dispatch(StoreActions.setStoreEntityType({ payload: 'in-portfolio' }));
    }
}
