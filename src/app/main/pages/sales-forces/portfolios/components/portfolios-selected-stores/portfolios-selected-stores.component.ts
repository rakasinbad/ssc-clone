import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, SecurityContext } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';

import { Store, Filter } from '../../models';
import { CoreFeatureState } from '../../store/reducers';
import { StoreSelector, PortfolioSelector, PortfolioStoreSelector } from '../../store/selectors';
import { takeUntil, filter, map, withLatestFrom, tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { StoreActions, PortfolioActions } from '../../store/actions';
import { IQueryParams } from 'app/shared/models';
import { MatDialog, MatSelectionListChange } from '@angular/material';
import { PortfoliosFilterStoresComponent } from '../portfolios-filter-stores/portfolios-filter-stores.component';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { EventEmitter } from 'protractor';

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

    constructor(
        private matDialog: MatDialog,
        private portfolioStore: NgRxStore<CoreFeatureState>,
        private shopStore: NgRxStore<CoreFeatureState>,
        private sanitizer: DomSanitizer,
    ) {
        this.isLoading$ = combineLatest([
            this.portfolioStore.select(PortfolioSelector.getLoadingState),
            this.shopStore.select(StoreSelector.getLoadingState)
        ]).pipe(
            map(([portfolio, store]) => portfolio || store),
            takeUntil(this.subs$)
        );
    }

    private debug(label: string, data: any): void {
        if (!environment.production) {
            console.log(label, data);
        }
    }

    private requestStore(filters: Array<Filter>): void {
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

        this.shopStore.dispatch(
            StoreActions.fetchStoresRequest({
                payload: data
            })
        );
    }

    printStoreName(store: Store): string {
        return `${store.storeCode || '-'} - ${store.name || '-'}`;
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

    updateSelectedStores($event: MatSelectionListChange): void {
        const store = ($event.option.value as Store);
        const isSelected = $event.option.selected;

        if (store.source === 'fetch') {
            if (isSelected) {
                this.portfolioStore.dispatch(
                    PortfolioActions.addSelectedStores({
                        payload: [store]
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
            }
        }
        
        // console.log($event);
    }

    clearAllSelectedStores(): void {
        this.portfolioStore.dispatch(
            PortfolioActions.confirmRemoveAllSelectedStores()
        );
    }

    ngOnInit(): void {
        this.subs$.pipe(
            filter(text => text === 'PREPARE_INIT_CREATE_FORM'),
            withLatestFrom(
                this.availableStores$,
                this.selectedStores$,
                (_, availableStores, selectedStores) => ({ availableStores, selectedStores })
            ),
            map(({ availableStores, selectedStores }) => {
                
            }),
            takeUntil(this.subs$)
        );

        this.filters$ = this.shopStore.select(
            StoreSelector.getAllFilters
        ).pipe(
            tap(filters => this.requestStore(filters)),
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
            map(([availableStores, portfolioStores]) => {
                // Mengambil ID dari store yang sudah terasosiasi dengan portfolio.
                const portfolioStoreIds = portfolioStores.map(pStore => pStore.id);

                // Mengubah state toko tersebut tidak terpilih.
                const newListStore = availableStores.map(store => {
                    const newStore = new Store(store);

                    // Hanya menandai toko yang ada di portfolio, namun tidak ditandai akan dihapus nantinya.
                    if (portfolioStoreIds.includes(newStore.id)) {
                        const selectedStore = portfolioStores.find(pStore => pStore.id === newStore.id);

                        if (selectedStore) {
                            newStore.setSource = 'list';
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
                withLatestFrom(this.shopStore.select(StoreSelector.getAllFilters)),
                takeUntil(this.subs$)
            ).subscribe(([_, filters]) => this.requestStore(filters));
    }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.removeFilter$.next();
        this.removeFilter$.complete();
    }

}
