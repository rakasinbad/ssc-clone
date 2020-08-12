import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatSelectionListChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Store } from 'app/main/pages/accounts/merchants/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { combineLatest, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Filter } from '../../models';
import { PortfolioActions, StoreActions } from '../../store/actions';
import { CoreFeatureState } from '../../store/reducers';
import { PortfolioSelector, PortfolioStoreSelector, StoreSelector } from '../../store/selectors';
import { PortfoliosFilterStoresComponent } from '../portfolios-filter-stores/portfolios-filter-stores.component';

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
    // Untuk menyimpan jumlah toko yang tersedia.
    totalAvailableStore$: Observable<number>;
    // Untuk menyimpan jumlah toko yang sudah terasosiasi dengan portofolio dan calon asosiasi dengan toko.
    totalPortfolioStore$: Observable<number>;

    // Untuk menyimpan Observable status loading dari state list store (merchant).
    isListStoreLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;

    // Untuk menyimpan ID Invoice Group yang terpilih.
    invoiceGroupId$: Observable<string>;

    // Untuk menangkap event yang terjadi saat meng-update store yang diklik.
    selectedStoreSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    // Untuk menyimpan ukuran lebar layar client.
    screenWidth: number;

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availableStoreScroll', { static: false, read: ElementRef })
    availableStoreScroll: ElementRef;
    @ViewChild('portfolioStoreScroll', { static: false, read: ElementRef })
    portfolioStoreScroll: ElementRef;

    // @HostListener('window:resize')
    // getScreenWidth(): void {
    //     this.screenWidth = window.innerWidth;
    // }

    constructor(
        private matDialog: MatDialog,
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
        private sanitizer: DomSanitizer,
        private helperSvc: HelperService,
        private scroll: ScrollDispatcher,
        private noticeSvc: NoticeService,
        private route: ActivatedRoute
    ) {
        // this.getScreenWidth();

        this.isListStoreLoading$ = this.shopStore
            .select(StoreSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        this.isPortfolioStoreLoading$ = this.portfolioStore
            .select(PortfolioSelector.getLoadingState)
            .pipe(takeUntil(this.subs$));

        this.invoiceGroupId$ = this.portfolioStore
            .select(PortfolioSelector.getSelectedInvoiceGroupId)
            .pipe(
                filter(invoiceGroupId => !!invoiceGroupId),
                takeUntil(this.subs$)
            );

        this.selectedStoreSub$
            .pipe(
                withLatestFrom(this.invoiceGroupId$),
                tap(([$event, invoiceGroupId]) => {
                    const store = $event.option.value as Store;
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
            )
            .subscribe();
    }

    private debug(label: string, data: any): void {
        if (!environment.production) {
            console.log(label, data);
        }
    }

    private requestPortfolioStore(portfolioId: string, skip: number): void {
        const data: IQueryParams = { paginate: true, limit: 20, skip: !skip ? 0 : skip };

        data['portfolioId'] = portfolioId;

        this.portfolioStore.dispatch(
            PortfolioActions.fetchPortfolioStoresRequest({
                payload: data
            })
        );
    }

    private requestStore(
        filters: Array<Filter>,
        storeType?: string,
        invoiceGroupId?: string,
        skip?: number
    ): void {
        const data: IQueryParams = { paginate: true, limit: 20, skip: !skip ? 0 : skip };

        for (const fil of filters) {
            data[fil.id] = fil.value.value;
        }

        // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
        if (this.search.value) {
            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: this.search.value
                }
                // {
                //     fieldName: 'name',
                //     keyword: searchValue
                // }
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

    trackStoreList(store: Store): Store {
        return store;
    }

    showTooltip(store: Store): string | null {
        const storeName = `${store.storeCode || '-'} - ${store.name || '-'}`;
        const isTruncated = this.printStoreName(store).endsWith('...');

        if (isTruncated) {
            return storeName;
        }

        return null;
    }

    printStoreName(store: Store): string {
        const storeName = `${store.externalId || '-'} - ${store.name || '-'}`;

        // if (this.screenWidth <= 1280) {
        //     return HelperService.truncateText(storeName, 35, 'end');
        // } else if (this.screenWidth <= 1440) {
        //     return HelperService.truncateText(storeName, 45, 'end');
        // }

        return storeName;
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
        this.portfolioStore.dispatch(PortfolioActions.confirmRemoveAllSelectedStores());
    }

    checkSelectedInvoiceGroupId(invoiceGroupId: string): boolean {
        // Hanya meneruskan observable ini jika sudah memilih Invoice Group.
        if (!invoiceGroupId) {
            this.noticeSvc.open(
                'Please select one of Invoice Group to view available stores.',
                'info',
                {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom'
                }
            );

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
            tap(() => this.shopStore.dispatch(StoreActions.truncateAllStores())),
            map(([filters, type, invoiceGroupId]) => ({
                filters,
                type: type === 'all' ? 'in-portfolio' : type,
                invoiceGroupId
            })),
            filter(({ invoiceGroupId }) => this.checkSelectedInvoiceGroupId(invoiceGroupId)),
            tap(({ filters, type, invoiceGroupId }) =>
                this.requestStore(filters, type, invoiceGroupId)
            ),
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
                });
                // .sort((a, b) => (+a.id) - (+b.id));

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
                        const selectedStore = portfolioStores.find(
                            pStore => pStore.id === newStore.id
                        );

                        if (selectedStore && newStore.source === 'list') {
                            newStore = new Store(selectedStore);
                            newStore.setSource = 'list';
                            newStore.setSelectedStore = !!!selectedStore.deletedAt;
                        } else if (selectedStore) {
                            newStore = new Store(selectedStore);
                            newStore.setSelectedStore = !!!selectedStore.deletedAt;
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
                // return newListStore.sort(({ name: nameA }, { name: nameB }) => (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0);
                return newListStore;
            }),
            takeUntil(this.subs$)
        );

        // Mengambil jumlah store yang tersedia.
        this.totalAvailableStore$ = this.shopStore
            .select(StoreSelector.getTotalStores)
            .pipe(takeUntil(this.subs$));

        // Mengambil jumlah store-nya portfolio dari state.
        this.totalPortfolioStore$ = combineLatest([
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioStoreEntity),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalPortfolioNewStoreEntity),
            this.portfolioStore.select(PortfolioStoreSelector.getTotalRemovedPortfolioStoresEntity)
        ]).pipe(
            tap(() => this.debug('TOTAL PORTFOLIO STORES CHECK', {})),
            map(
                ([portfolioStoreTotal, selectedStoreTotal, deletedPortfolioStores]) =>
                    portfolioStoreTotal + selectedStoreTotal - deletedPortfolioStores
            ),
            takeUntil(this.subs$)
        );

        this.removeFilter$.pipe(takeUntil(this.subs$)).subscribe(id => {
            if (id) {
                this.shopStore.dispatch(StoreActions.removeStoreFilter({ payload: id }));
            }
        });

        this.search.valueChanges
            .pipe(
                tap(() => this.debug('SEARCH VALUE CHANGES CHECK', {})),
                distinctUntilChanged(),
                debounceTime(1000),
                withLatestFrom(
                    this.shopStore.select(StoreSelector.getAllFilters),
                    this.shopStore.select(StoreSelector.getStoreEntityType),
                    this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)
                ),
                filter(([_, __, ___, invoiceGroupId]) =>
                    this.checkSelectedInvoiceGroupId(invoiceGroupId)
                ),
                tap(() => this.shopStore.dispatch(StoreActions.truncateAllStores())),
                takeUntil(this.subs$)
            )
            .subscribe(([_, filters, type, invoiceGroupId]) =>
                this.requestStore(filters, type, invoiceGroupId)
            );

        this.subs$.pipe(
            withLatestFrom(
                this.shopStore.select(StoreSelector.getAllFilters),
                this.shopStore.select(StoreSelector.getStoreEntityType),
                this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
                this.totalAvailableStore$
            ),
            tap(([text, filters, type, invoiceGroupId, totalAvailableStores]) => {
                if (text === 'LOAD_MORE_AVAILABLE_STORES') {
                    this.requestStore(filters, type, invoiceGroupId, totalAvailableStores);
                }
            }),
            takeUntil(this.subs$)
        );
    }

    ngAfterViewInit(): void {
        // 'Mendengarkan' event scrolling dari CDK Scrollable.
        this.scroll
            .scrolled(500)
            .pipe(
                // Hanya mengambil dari element-nya list available store dan list portfolio store.
                filter(cdkScrollable => {
                    return (
                        this.availableStoreScroll.nativeElement.id ===
                        (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id
                    );
                    // || this.portfolioStoreScroll.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id;
                }),
                // Mengambil nilai dari observable-nya loading list store and loading portfolio store.
                withLatestFrom(
                    this.isListStoreLoading$,
                    this.isPortfolioStoreLoading$,
                    this.totalAvailableStore$,
                    this.availableStores$
                ),
                // Tidak akan dilanjutkan jika keduanya sedang loading.
                filter(
                    ([
                        cdkScrollable,
                        listStoreLoading,
                        portfolioStoreLoading,
                        totalStores,
                        availableStores
                    ]) => {
                        if (
                            (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id ===
                                this.availableStoreScroll.nativeElement.id &&
                            availableStores.length >= totalStores
                        ) {
                            return false;
                        }

                        return !listStoreLoading || !portfolioStoreLoading;
                    }
                ),
                // Mengubah nilai observable menjadi element-nya saja tanpa membawa status loading.
                map(([cdkScrollable]) => (cdkScrollable as CdkScrollable).getElementRef()),
                // Hanya diteruskan jika element sudah ter-scroll sampai bawah.
                filter(elementRef => this.helperSvc.isElementScrolledToBottom(elementRef)),
                withLatestFrom(
                    this.shopStore.select(StoreSelector.getStoreTotalEntity),
                    this.portfolioStore.select(PortfolioSelector.getPortfolioTotalEntity),
                    this.shopStore.select(StoreSelector.getAllFilters),
                    this.shopStore.select(StoreSelector.getStoreEntityType),
                    this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
                    (
                        elementRef,
                        totalAvailableStore,
                        totalPortfolioStore,
                        filters,
                        type,
                        invoiceGroupId
                    ) => {
                        if (
                            elementRef.nativeElement.id ===
                            this.availableStoreScroll.nativeElement.id
                        ) {
                            return ([
                                'AVAILABLE_STORES',
                                elementRef,
                                totalAvailableStore,
                                filters,
                                type,
                                invoiceGroupId
                            ] as unknown) as [
                                string,
                                ElementRef<HTMLElement>,
                                number,
                                Array<Filter>,
                                string,
                                string
                            ];
                        } else if (
                            elementRef.nativeElement.id ===
                            this.portfolioStoreScroll.nativeElement.id
                        ) {
                            return ([
                                'PORTFOLIO_STORES',
                                elementRef,
                                totalPortfolioStore,
                                filters,
                                type,
                                invoiceGroupId
                            ] as unknown) as [
                                string,
                                ElementRef<HTMLElement>,
                                number,
                                Array<Filter>,
                                string,
                                string
                            ];
                        } else {
                            return ([
                                'UNKNOWN',
                                elementRef,
                                0,
                                filters,
                                type,
                                invoiceGroupId
                            ] as unknown) as [
                                string,
                                ElementRef<HTMLElement>,
                                number,
                                Array<Filter>,
                                string,
                                string
                            ];
                        }
                    }
                ),
                takeUntil(this.subs$)
            )
            .subscribe(([element, elementRef, total, filters, type, invoiceGroupId]) => {
                // Melakukan scrolling ke atas terhadap elemen tersebut.
                // elementRef.nativeElement.scrollTop = 0;

                // Pemisahan tugas berdasarkan element yang ingin diperiksa.
                if (element === 'AVAILABLE_STORES') {
                    // Debugging purpose.
                    this.debug('AVAILABLE STORE SCROLL HAPPENED.', {
                        element,
                        elementRef,
                        total,
                        filters,
                        type,
                        invoiceGroupId
                    });
                    // Menaikkan scroll ke atas agar tidak ikut ke bawah.
                    elementRef.nativeElement.scrollTop -= 100;

                    this.requestStore(filters, type, invoiceGroupId, total);
                } else if (element === 'PORTFOLIO_STORES') {
                    // Debugging purpose.
                    // this.debug('PORTFOLIO STORE SCROLL HAPPENED.', { element, elementRef, total, filters, type, invoiceGroupId });
                    // Menaikkan scroll ke atas agar tidak ikut ke bawah.
                    // elementRef.nativeElement.scrollTop -= 100;
                    // // Menangkap ID dari parameter URL.
                    // const { id: portfolioId } = this.route.snapshot.params.id;
                    // // Jaga-jaga kalau di URL tidak ada parameter-nya biar gak error.
                    // if (portfolioId) {
                    //     // Kalau ada, lakukan request.
                    //     this.requestPortfolioStore(portfolioId, total);
                    // }
                } else {
                    this.debug('UNKNOWN SCROLL HAPPENED.', {
                        element,
                        elementRef,
                        total,
                        filters,
                        type,
                        invoiceGroupId
                    });
                }
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
