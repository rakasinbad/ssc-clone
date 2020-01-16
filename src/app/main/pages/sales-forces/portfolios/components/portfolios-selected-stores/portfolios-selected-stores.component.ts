import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, SecurityContext, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';

import { Store, Filter } from '../../models';
import { CoreFeatureState } from '../../store/reducers';
import { StoreSelector, PortfolioSelector, PortfolioStoreSelector } from '../../store/selectors';
import { takeUntil, filter, map, withLatestFrom, tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { StoreActions, PortfolioActions } from '../../store/actions';
import { IQueryParams } from 'app/shared/models';
import { MatDialog, MatSelectionListChange, MatSelectionList } from '@angular/material';
import { PortfoliosFilterStoresComponent } from '../portfolios-filter-stores/portfolios-filter-stores.component';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { HelperService, NoticeService } from 'app/shared/helpers';

@Component({
    selector: 'app-portfolios-selected-stores',
    templateUrl: './portfolios-selected-stores.component.html',
    styleUrls: ['./portfolios-selected-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosSelectedStoresComponent implements OnInit, OnDestroy, AfterViewInit {

    // Untuk keperluan subscription.
    subs$: Subject<string> = new Subject<string>();
    // Untuk keperluan handle menghapus filter.
    removeFilter$: Subject<string> = new Subject<string>();

    // Untuk keperluan penanganan pencarian store.
    search: FormControl = new FormControl('');

    // Untuk menyimpan daftar toko yang tersedia untuk dipilih.
    availableStores$: Observable<Array<Store>>;
    // Untuk menyimpan daftar toko, baik calon untuk portofolio maupun yang sudah menjadi bagian portofolio.
    selectedStores$: Observable<Array<Store>>;
    // Untuk menyimpan filter pencarian toko yang sedang aktif.
    filters$: Observable<Array<Filter>>;
    // Untuk menyimpanan status loading dari state.
    isLoading$: Observable<boolean>;
    // Untuk menyimpan jumlah toko yang sudah terasosiasi dengan portofolio dan calon asosiasi dengan toko.
    totalPortfolioStore$: Observable<number>;

    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state list store (merchant).
    isListStoreLoading$: Observable<boolean>;

    // Untuk menyimpan ID Invoice Group yang terpilih.
    invoiceGroupId$: Observable<string>;

    // Untuk menangkap event yang terjadi saat meng-update store yang diklik.
    selectedStoreSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availableStoreScroll', { static: false, read: ElementRef }) availableStoreScroll: ElementRef;

    constructor(
        private matDialog: MatDialog,
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
        private sanitizer: DomSanitizer,
        private helperSvc: HelperService,
        private scroll: ScrollDispatcher,
        private noticeSvc: NoticeService
    ) {
        this.isLoading$ = combineLatest([
            this.portfolioStore.select(PortfolioSelector.getLoadingState),
            this.shopStore.select(StoreSelector.getLoadingState)
        ]).pipe(
            map(([portfolio, store]) => portfolio || store),
            takeUntil(this.subs$)
        );

        this.invoiceGroupId$ = this.portfolioStore.select(
            PortfolioSelector.getSelectedInvoiceGroupId
        ).pipe(
            filter(invoiceGroupId => !!invoiceGroupId),
            takeUntil(this.subs$)
        );
        // this.scroll.register(this.scrollable);

        // this.scroll.register()
        // this.scroll.scrolled((500)

        // console.log(this.availableStoreScroll);
        // this.availableStoreScrollable = new CdkScrollable(this.availableStore, this.scroll, ngZo)

        this.selectedStoreSub$.pipe(
            withLatestFrom(this.invoiceGroupId$),
            tap(([$event, invoiceGroupId]) => {
                const store = ($event.option.value as Store);
                const isSelected = $event.option.selected;

                if (store.source === 'fetch') {
                    if (isSelected) {
                        this.portfolioStore.dispatch(
                            PortfolioActions.addSelectedStores({
                                payload: [store]
                            })
                        );

                        this.shopStore.dispatch(
                            StoreActions.checkStoreAtInvoiceGroupRequest({
                                payload: {
                                    storeId: store.id,
                                    invoiceGroupId
                                }
                            })
                        );
                    } else {
                        this.portfolioStore.dispatch(
                            PortfolioActions.removeSelectedStores({
                                payload: [store.id]
                            })
                        );
                    }
                } else if (store.source === 'list') {
                    if (!isSelected) {
                        this.portfolioStore.dispatch(
                            PortfolioActions.markStoreAsRemovedFromPortfolio({
                                payload: store.id
                            })
                        );
                    } else {
                        this.portfolioStore.dispatch(
                            PortfolioActions.abortStoreAsRemovedFromPortfolio({
                                payload: store.id
                            })
                        );

                        this.shopStore.dispatch(
                            StoreActions.checkStoreAtInvoiceGroupRequest({
                                payload: {
                                    storeId: store.id,
                                    invoiceGroupId
                                }
                            })
                        );
                    }
                }
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private debug(label: string, data: any): void {
        if (!environment.production) {
            console.log(label, data);
        }
    }

    private requestStore(filters: Array<Filter>, storeType?: string, invoiceGroupId?: string): void {
        const data: IQueryParams = { paginate: false };
    
        for (const fil of filters) {
            data[fil.id] = fil.value.value;
        }

        // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
        const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
        // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
        if (searchValue) {
            data['search'] = [
                {
                    fieldName: 'store_code',
                    keyword: searchValue
                },
                {
                    fieldName: 'name',
                    keyword: searchValue
                }
            ];
        }

        if (storeType) {
            data['type'] = storeType;
        }

        data['invoiceGroupId'] = invoiceGroupId;

        this.shopStore.dispatch(
            StoreActions.fetchStoresRequest({
                payload: data
            })
        );
    }

    printStoreName(store: Store): string {
        return `${store.externalId || '-'} - ${store.name || '-'}`;
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

    addStore(store: Store): void {
        this.portfolioStore.dispatch(
            PortfolioActions.addSelectedStores({
                payload: [store]
            })
        );
    }

    clearAllSelectedStores(): void {
        this.portfolioStore.dispatch(
            PortfolioActions.confirmRemoveAllSelectedStores()
        );
    }

    checkSelectedInvoiceGroupId(invoiceGroupId: string): boolean {
        // Hanya meneruskan observable ini jika sudah memilih Invoice Group.
        if (!invoiceGroupId) {
            this.noticeSvc.open('Please select one of Invoice Group to view available stores.', 'info', {
                horizontalPosition: 'right',
                verticalPosition: 'bottom'
            });

            return false;
        }

        return true;
    }

    getStoreWarning(store: Store): string | null {
        if (!store.portfolio) {
            return null;
        }

        return `This store is already added on Portfolio "${store.portfolio.name}". (Code: ${store.portfolio.code})"`;
    }

    ngOnInit(): void {
        this.filters$ = combineLatest([
            this.shopStore.select(StoreSelector.getAllFilters),
            this.shopStore.select(StoreSelector.getStoreEntityType),
            this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)
        ]).pipe(
            map(([filters, type, invoiceGroupId]) => ({ filters, type: type === 'all' ? 'in-portfolio' : type, invoiceGroupId })),
            filter(({ invoiceGroupId }) => this.checkSelectedInvoiceGroupId(invoiceGroupId)),
            tap(({ filters, type, invoiceGroupId }) => this.requestStore(filters, type, invoiceGroupId)),
            map(({ filters }) => filters),
            takeUntil(this.subs$)
        );

        // TODO: Menampilkan toko yang sudah terasosiasi atau akan terasosiasi.
        this.selectedStores$ = combineLatest([
            this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
            this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores)
        ]).pipe(
            tap(() => this.debug('SELECTED STORES CHECK', {})),
            map<Array<Array<Store>>, Array<Store>>(([portfolioStore, selectedStore]) => {
                // Mendapatkan ID store dari store-nya portfolio.
                const portfolioStoreIds = portfolioStore.map(pStore => pStore.id);
                // Mendapatkan ID store dari store yang terpilih.
                const selectedStoreIds = selectedStore.map(sStore => sStore.id);
                // Menggabungkan store dari store-nya portfolio dengan store yang terpilih.
                const mergedStores = selectedStore.concat(portfolioStore);

                return mergedStores.map(store => {
                    const newStore = new Store(store);

                    if (portfolioStoreIds.includes(store.id)) {
                        newStore.setSource = 'list';
                    } else if (selectedStoreIds.includes(store.id)) {
                        newStore.setSource = 'fetch';
                    }

                    return newStore;
                }).sort((a, b) => (+a.id) - (+b.id));

                // selectedStore.concat(portfolioStore.map(store => {
                //     const newStore = new Store(store);
                //     newStore.setSource = 'list';

                //     return newStore;
                // }))
            }),
            // withLatestFrom(this.shopStore.select(StoreSelector.getSelectedStoreIds)),
            // map<[Array<Store>, Array<string>], Array<Store>>(([portfolioStores, listStoreIds]) => {
            //     const newPortfolioStore = portfolioStores
            //                                 // Hanya mengambil toko yang bukan sebagai calon toko baru untuk portfolio dan tidak ditandai untuk dihapus.
            //                                 .filter(portfolioStore => !listStoreIds.includes(portfolioStore.id) && !portfolioStore.deletedAt)
            //                                 .map(store => {
            //                                     const newStore = new Store(store);
            //                                     newStore.setSelectedStore = true;

            //                                     return newStore;
            //                                 });

            //     // this.portfolioStores = new MatTableDataSource(newPortfolioStore);
            //     // this.portfolioStoreSelection = new SelectionModel<Store>(true, newPortfolioStore);
            //     // this.portfolioStoreSelection.clear();

            //     return newPortfolioStore.sort((a, b) => (+a.id) - (+b.id));
            // }),
            takeUntil(this.subs$)
        );

        // this.availableStores$ = this.shopStore.select(
        //     StoreSelector.getAllStores
        // ).pipe(
        //     withLatestFrom(
        //         this.shopStore.select(StoreSelector.getAllFilters),
        //         (stores, filters) => ({ stores, filters })
        //     ),
        //     filter(({ stores, filters }) => {
        //         if (!stores || stores.length === 0) {
        //             this.requestStore(filters);

        //             return false;
        //         } else {
        //             return true;
        //         }
        //     }),
        //     map(({ stores }) => stores),
        //     takeUntil(this.subs$)
        // );

        this.availableStores$ = combineLatest([
            this.shopStore.select(StoreSelector.getAllStores),
            this.selectedStores$
        ]).pipe(
            tap(() => this.debug('AVAILABLE STORES CHECK', {})),
            withLatestFrom(this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)),
            filter(([_, invoiceGroupId]) => this.checkSelectedInvoiceGroupId(invoiceGroupId)),
            map(([[availableStores, portfolioStores]]) => {
                // Mengambil ID dari store yang sudah terasosiasi dengan portfolio.
                const portfolioStoreIds = portfolioStores.map(pStore => pStore.id);

                // Mengubah state toko tersebut tidak terpilih.
                const newListStore = availableStores.map(store => {
                    let newStore = new Store(store);

                    // Hanya menandai toko yang ada di portfolio, namun tidak ditandai akan dihapus nantinya.
                    if (portfolioStoreIds.includes(newStore.id)) {
                        const selectedStore = portfolioStores.find(pStore => pStore.id === newStore.id);

                        if (selectedStore && newStore.source === 'list') {
                            newStore = new Store(selectedStore);
                            newStore.setSource = 'list';
                            newStore.setSelectedStore = !(!!selectedStore.deletedAt);
                        } else if (selectedStore) {
                            newStore = new Store(selectedStore);
                            newStore.setSelectedStore = !(!!selectedStore.deletedAt);
                        }
                    } else {
                        newStore.setSelectedStore = false;
                    }

                    return newStore;
                });

                // this.listStore = new MatTableDataSource(newListStore);
                // this.listStoreSelection = new SelectionModel<Store>(true, newListStore);
                // this.listStoreSelection.clear();

                // Mengembalikan daftar toko dengan state yang baru.
                return newListStore.sort((a, b) => (+a.id) - (+b.id));
            }),
            takeUntil(this.subs$)
        );

        // Mengambil jumlah store-nya portfolio dari state.
        this.totalPortfolioStore$ = combineLatest([
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioStoreEntity),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioNewStoreEntity),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalRemovedPortfolioStoresEntity),
        ])
        .pipe(
            tap(() => this.debug('TOTAL PORTFOLIO STORES CHECK', {})),
            map(([portfolioStoreTotal, selectedStoreTotal, deletedPortfolioStores]) => (portfolioStoreTotal + selectedStoreTotal - deletedPortfolioStores)),
            takeUntil(this.subs$)
        );

        this.removeFilter$.pipe(
            takeUntil(this.subs$)
        ).subscribe(id => {
            if (id) {
                this.shopStore.dispatch(
                    StoreActions.removeStoreFilter({ payload: id })
                );
            }
        });

        this.search
            .valueChanges
            .pipe(
                tap(() => this.debug('SEARCH VALUE CHANGES CHECK', {})),
                distinctUntilChanged(),
                debounceTime(1000),
                withLatestFrom(
                    this.shopStore.select(StoreSelector.getAllFilters),
                    this.shopStore.select(StoreSelector.getStoreEntityType),
                    this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)
                ),
                filter(([_, __, ___, invoiceGroupId]) => this.checkSelectedInvoiceGroupId(invoiceGroupId)),
                takeUntil(this.subs$)
            ).subscribe(([_, filters, type, invoiceGroupId]) => this.requestStore(filters, type, invoiceGroupId));
    }

    ngAfterViewInit(): void {
        // this.availableStore.elementScrolled().pipe(
        //     tap(event => console.log(event)),
        //     takeUntil(this.subs$)
        // );

        // this.scroll.register(this.availableStore);

        // this.availableStore.elementScrolled()
        //     .pipe(
        //         takeUntil(this.subs$)
        //     ).subscribe(data => console.log(data));

        // this.scrollable.elementScrolled()
        //     .pipe(
        //         takeUntil(this.subs$)
        //     ).subscribe(data => console.log(data));
        // console.log(this.availableStore);

        // console.log(this.scrollable);
        // console.log(this.availableStoreScroll);

        this.scroll.scrolled(500)
            .pipe(
                filter(cdkScrollable => {
                    return this.availableStoreScroll.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id;
                }),
                map(cdkScrollable => (cdkScrollable as CdkScrollable).getElementRef()),
                filter((elementRef) => this.helperSvc.isElementScrolledToBottom(elementRef)),
                takeUntil(this.subs$)
            ).subscribe(data => {
                console.log(data);
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.removeFilter$.next();
        this.removeFilter$.complete();


        this.selectedStoreSub$.next();
        this.selectedStoreSub$.complete();
    }

}
