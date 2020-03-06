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
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Store } from 'app/shared/models/store.model';
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

import { Filter, Portfolio } from '../../../portfolios/models';
import { PortfolioActions, StoreActions } from '../../../portfolios/store/actions';
import { CoreFeatureState as PortfolioCoreFeatureState } from '../../../portfolios/store/reducers';
import { PortfolioSelector } from '../../../portfolios/store/selectors';
import { SalesRep } from '../../../sales-reps/models';
import { FeatureState as SalesRepFeatureState } from '../../../sales-reps/store/reducers';
import { SalesRepSelectors } from '../../../sales-reps/store/selectors';
import { AssociationApiService } from '../../services';
import { AssociatedPortfolioActions, AssociatedStoreActions } from '../../store/actions';
import { FeatureState as AssociationCoreFeatureState } from '../../store/reducers';
import {
    AssociatedPortfolioSelectors,
    AssociatedStoreSelectors,
    AssociationSelectors,
    StoreSelectors
} from '../../store/selectors';
import { AssociationsFilterPortfoliosComponent } from '../filter-portfolios/associations-filter-portfolios.component';
import { PortfolioStoresComponent } from '../portfolio-stores/portfolio-stores.component';

@Component({
    selector: 'app-associations-selected-portfolios',
    templateUrl: './associations-selected-portfolios.component.html',
    styleUrls: ['./associations-selected-portfolios.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationsSelectedPortfoliosComponent implements OnInit, OnDestroy, AfterViewInit {
    // Untuk keperluan subscription.
    subs$: Subject<string> = new Subject<string>();
    // Untuk keperluan handle menghapus filter.
    //     removeFilter$: Subject<string> = new Subject<string>();
    // Untuk menyimpan ID Sales Rep.
    salesRep$: Observable<SalesRep>;

    // Untuk keperluan penanganan pencarian store.
    search: FormControl = new FormControl('');

    // Untuk menyimpan daftar toko yang tersedia untuk dipilih.
    availablePortfolios$: Observable<Array<Portfolio> | Array<Store>>;
    // Untuk menyimpan daftar toko, baik calon untuk portofolio maupun yang sudah menjadi bagian portofolio.
    selectedPortfolios$: Observable<Array<Portfolio> | Array<Store>>;
    // Untuk menyimpan filter pencarian toko yang sedang aktif.
    filters$: Observable<Array<Filter>>;
    // Untuk menyimpanan status loading dari state.
    isPortfolioLoading$: Observable<boolean>;
    // Untuk menyimpan status loading dari state-nya associated portfolio.
    isAssociatedPortfolioLoading$: Observable<boolean>;
    // Untuk menyimpan jumlah toko yang sudah terasosiasi dengan portofolio dan calon asosiasi dengan toko.
    totalSelectedPortfolios$: Observable<number>;

    // Untuk menyimpan Observable status loading dari state store-nya portfolio.
    isPortfolioStoreLoading$: Observable<boolean>;
    // Untuk menyimpan Observable status loading dari state list store (merchant).
    isListStoreLoading$: Observable<boolean>;

    // Untuk menyimpan ID Invoice Group yang terpilih.
    invoiceGroupId$: Observable<string>;

    // Untuk menangkap event yang terjadi saat meng-update portfolio yang diklik.
    selectedPortfolioSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availablePortfolioScroll', { static: false, read: ElementRef })
    availableStoreScroll: ElementRef;

    constructor(
        private matDialog: MatDialog,
        private portfolioStore: NgRxStore<PortfolioCoreFeatureState>,
        private salesRepStore: NgRxStore<SalesRepFeatureState>,
        private associationStore: NgRxStore<AssociationCoreFeatureState>,
        private sanitizer: DomSanitizer,
        private helperSvc: HelperService,
        private scroll: ScrollDispatcher,
        private noticeSvc: NoticeService,
        private associationSvc: AssociationApiService
    ) {
        this.salesRep$ = this.salesRepStore
            .select(SalesRepSelectors.getSelectedItem)
            .pipe(takeUntil(this.subs$));

        this.isPortfolioLoading$ = combineLatest([
            this.associationStore.select(StoreSelectors.getLoadingState),
            this.portfolioStore.select(PortfolioSelector.getLoadingState)
        ]).pipe(
            map(isLoadings => isLoadings.includes(true)),
            takeUntil(this.subs$)
        );

        this.isAssociatedPortfolioLoading$ = this.associationStore
            .select(AssociatedPortfolioSelectors.getLoadingState)
            .pipe(takeUntil(this.subs$));

        this.invoiceGroupId$ = this.portfolioStore
            .select(PortfolioSelector.getSelectedInvoiceGroupId)
            .pipe(
                filter(invoiceGroupId => !!invoiceGroupId),
                takeUntil(this.subs$)
            );
        // this.scroll.register(this.scrollable);

        // this.scroll.register()
        // this.scroll.scrolled((500)

        // console.log(this.availableStoreScroll);
        // this.availableStoreScrollable = new CdkScrollable(this.availableStore, this.scroll, ngZo)

        this.selectedPortfolioSub$
            .pipe(
                withLatestFrom(
                    this.associationStore.select(AssociatedPortfolioSelectors.selectEntities),
                    this.associationStore.select(AssociatedStoreSelectors.selectEntities)
                ),
                tap(([$event, portfolioEntities, storeEntities]) => {
                    let isInSelected = false;
                    let value: Portfolio | Store = $event.option.value;
                    const isSelected = $event.option.selected;

                    if (value instanceof Portfolio) {
                        isInSelected = !!portfolioEntities[value.id];

                        if (isInSelected) {
                            value = new Portfolio(portfolioEntities[value.id]);
                        }

                        if (value.source === 'fetch') {
                            if (isSelected) {
                                this.associationStore.dispatch(
                                    AssociatedPortfolioActions.addSelectedPortfolios({
                                        payload: [value]
                                    })
                                );
                            } else {
                                this.associationStore.dispatch(
                                    AssociatedPortfolioActions.removeSelectedPortfolios({
                                        payload: [value.id]
                                    })
                                );
                            }
                        } else if (value.source === 'list') {
                            if (!isInSelected) {
                                if (isSelected) {
                                    this.associationStore.dispatch(
                                        AssociatedPortfolioActions.addSelectedPortfolios({
                                            payload: [value]
                                        })
                                    );
                                } else {
                                    this.associationStore.dispatch(
                                        AssociatedPortfolioActions.removeSelectedPortfolios({
                                            payload: [value.id]
                                        })
                                    );
                                }
                            } else {
                                if (!isSelected) {
                                    this.associationStore.dispatch(
                                        AssociatedPortfolioActions.markPortfolioAsRemoved({
                                            payload: [value.id]
                                        })
                                    );
                                } else {
                                    this.associationStore.dispatch(
                                        AssociatedPortfolioActions.abortPortfolioAsRemoved({
                                            payload: [value.id]
                                        })
                                    );
                                }
                            }
                        }
                    } else if (value instanceof Store) {
                        isInSelected = !!storeEntities[value.id];

                        if (isInSelected) {
                            value = new Store(storeEntities[value.id]);
                        }

                        if (value.source === 'fetch') {
                            if (isSelected) {
                                this.associationStore.dispatch(
                                    AssociatedStoreActions.addSelectedStores({
                                        payload: [value]
                                    })
                                );
                            } else {
                                this.associationStore.dispatch(
                                    AssociatedStoreActions.removeSelectedStores({
                                        payload: [value.id]
                                    })
                                );
                            }
                        } else if (value.source === 'list') {
                            if (!isInSelected) {
                                if (isSelected) {
                                    this.associationStore.dispatch(
                                        AssociatedStoreActions.addSelectedStores({
                                            payload: [value]
                                        })
                                    );
                                } else {
                                    this.associationStore.dispatch(
                                        AssociatedStoreActions.removeSelectedStores({
                                            payload: [value.id]
                                        })
                                    );
                                }
                            } else {
                                if (!isSelected) {
                                    this.associationStore.dispatch(
                                        AssociatedStoreActions.markStoreAsRemoved({
                                            payload: [value.id]
                                        })
                                    );
                                } else {
                                    this.associationStore.dispatch(
                                        AssociatedStoreActions.abortStoreAsRemoved({
                                            payload: [value.id]
                                        })
                                    );
                                }
                            }
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

    showStore(portfolio: Portfolio): void {
        const query: IQueryParams = { paginate: false, limit: 100, skip: 0 };
        query['portfolioId'] = portfolio.id;
        query['noSupplierId'] = true;

        this.portfolioStore.dispatch(
            StoreActions.fetchStoresRequest({
                payload: query
            })
        );

        this.matDialog.open(PortfolioStoresComponent, {
            data: portfolio,
            width: '100vw'
        });
    }

    // private requestStore(filters: Array<Filter>, storeType?: string, invoiceGroupId?: string): void {
    //     const data: IQueryParams = { paginate: false };

    //     for (const fil of filters) {
    //         data[fil.id] = fil.value.value;
    //     }

    //     // Mengambil nilai dari search bar dan melakukan 'sanitasi' untuk menghindari injection.
    //     const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search.value);
    //     // Jika hasil sanitasi lolos, maka akan melanjutkan pencarian.
    //     if (searchValue) {
    //         data['keyword'] = searchValue;
    //     }

    //     if (storeType) {
    //         data['type'] = storeType;
    //     }

    //     data['invoiceGroupId'] = invoiceGroupId;

    //     this.shopStore.dispatch(
    //         StoreActions.fetchStoresRequest({
    //             payload: data
    //         })
    //     );
    // }

    isAPortfolio(data: Portfolio | Store): boolean {
        return data instanceof Portfolio;
    }

    printPortfolioName(data: Portfolio | Store): string {
        const portfolio = data as Portfolio;
        const store = data as Store;

        // return `${portfolio.name || '-'} (${portfolio.storeQty} ${portfolio.storeQty === 1 ? 'store' : 'stores'})`;
        if (portfolio instanceof Portfolio) {
            // if (portfolio.type === 'group') {
            //     return `${portfolio.name || '-'} (${portfolio.storeQty} stores)`;
            // } else if (portfolio.type === 'direct') {
            //     return portfolio.stores[0].name;
            //     // return `${store..name || '-'} - ${store.name || '-'}`;
            // }
            return `${portfolio.name || '-'} (${portfolio.storeQty} ${
                portfolio.storeQty <= 1 ? 'store' : 'stores'
            })`;
        }

        if (store instanceof Store) {
            return store.name;
        }
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

    addStore(portfolio: Portfolio): void {
        this.portfolioStore.dispatch(
            PortfolioActions.addSelectedPortfolios({
                payload: [portfolio.id]
            })
        );
    }

    clearAllSelectedPortfolios(): void {
        this.portfolioStore.dispatch(PortfolioActions.confirmRemoveAllSelectedStores());
    }

    // checkSelectedInvoiceGroupId(invoiceGroupId: string): boolean {
    //     // Hanya meneruskan observable ini jika sudah memilih Invoice Group.
    //     if (!invoiceGroupId) {
    //         this.noticeSvc.open('Please select one of Invoice Group to view available portfolios.', 'info', {
    //             horizontalPosition: 'right',
    //             verticalPosition: 'bottom'
    //         });

    //         return false;
    //     }

    //     return true;
    // }

    // getStoreWarning(store: Store): string | null {
    //     if (!store.portfolio) {
    //         return null;
    //     }

    //     return `This store is already added on Portfolio "${store.portfolio.name}". (Code: ${store.portfolio.code})"`;
    // }

    ngOnInit(): void {
        // this.filters$ = combineLatest([
        //     this.shopStore.select(StoreSelector.getAllFilters),
        //     this.shopStore.select(StoreSelector.getStoreEntityType),
        //     this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId)
        // ]).pipe(
        //     map(([filters, type, invoiceGroupId]) => ({ filters, type: type === 'all' ? 'in-portfolio' : type, invoiceGroupId })),
        //     filter(({ invoiceGroupId }) => this.checkSelectedInvoiceGroupId(invoiceGroupId)),
        //     tap(({ filters, type, invoiceGroupId }) => this.requestStore(filters, type, invoiceGroupId)),
        //     map(({ filters }) => filters),
        //     takeUntil(this.subs$)\
        // );

        this.selectedPortfolios$ = combineLatest([
            // this.portfolioStore.select(PortfolioSelector.getAllPortfolios),
            this.associationStore.select(AssociatedPortfolioSelectors.selectAll),
            this.associationStore.select(AssociatedStoreSelectors.selectAll)
        ]).pipe(
            tap(() => this.debug('SELECTED PORTFOLIOS CHECK', {})),
            map(([selectedPortfolios, selectedStores]) => {
                const sortedPortfolios = ((selectedPortfolios as unknown) as Array<Portfolio>)
                    .map(portfolio => new Portfolio(portfolio))
                    .sort((a, b) => +a.id - +b.id);
                const sortedStores = ((selectedStores as unknown) as Array<Store>)
                    .map(store => new Store(store))
                    .sort((a, b) => +a.id - +b.id);
                return sortedPortfolios.concat(...((sortedStores as unknown) as Array<Portfolio>));
            }),
            takeUntil(this.subs$)
        );

        this.availablePortfolios$ = combineLatest([
            this.associationStore.select(StoreSelectors.selectAllStores),
            this.portfolioStore.select(PortfolioSelector.getAllPortfolios),
            this.associationStore.select(AssociatedPortfolioSelectors.selectAll),
            this.associationStore.select(AssociatedStoreSelectors.selectAll)
        ]).pipe(
            // Debugging purpose.
            tap(() => this.debug('AVAILABLE PORTFOLIOS CHECK', {})),
            // Mengambil Invoice Group yang terpilih.
            withLatestFrom(
                this.associationStore.select(AssociationSelectors.getSelectedInvoiceGroup)
            ),
            // Memeriksa Invoice Group yang dipilih.
            filter(([_, invoiceGroup]) => !!invoiceGroup),
            // Mengubah bentuk portfolio yang ingin ditampilkan.
            map(
                ([
                    [availableStores, availablePortfolios, selectedPortfolios, selectedStores],
                    invoiceGroup
                ]) => {
                    // Mengambil ID dari portfolio yang dipilih.
                    const selectedPortfolioIds = selectedPortfolios
                        .filter(portfolio => !!!portfolio.deletedAt)
                        .map(portfolio => portfolio.id);

                    // Mengambil ID dari store yang dipilih.
                    const selectedStoreIds = selectedStores
                        .filter(store => !!!store.deletedAt)
                        .map(store => store.id);

                    // Mengambil portfolio dari state dengan mencocokkan Invoice Group-nya.
                    const newAvailablePortfolios:
                        | Array<Portfolio>
                        | Array<Store> = availablePortfolios
                        .filter(portfolio => portfolio.invoiceGroupId === invoiceGroup.id)
                        .map(portfolio => {
                            const newPortfolio = new Portfolio(portfolio);
                            newPortfolio.isSelected = selectedPortfolioIds.includes(
                                newPortfolio.id
                            );
                            return newPortfolio;
                        });

                    // Mengambil store dari state dengan mencocokkan Invoice Group-nya.
                    const newAvailableStores: Array<Store> = availableStores.map(store => {
                        const newStore = new Store(store);
                        newStore.isSelected = selectedStoreIds.includes(newStore.id);
                        return newStore;
                    });

                    ((newAvailablePortfolios as unknown) as Array<Store>).push(
                        ...newAvailableStores
                    );

                    // Mengembalikan daftar toko dengan state yang baru.
                    return newAvailablePortfolios.sort((a, b) => +a.id - +b.id);
                }
            ),
            takeUntil(this.subs$)
        );

        // Mengambil jumlah portfolio yang terpilih dari state.
        this.totalSelectedPortfolios$ = this.selectedPortfolios$.pipe(
            // Debugging purpose.
            tap(selectedPortfolios =>
                this.debug('TOTAL PORTFOLIO STORES CHECK', {
                    data: selectedPortfolios,
                    length: selectedPortfolios.length
                })
            ),
            // Hanya mengambil jumlah isi dari array-nya saja.
            map(
                selectedPortfolios =>
                    ((selectedPortfolios as unknown) as Array<Store>).filter(
                        store => !!!store.deletedAt
                    ).length
            ),
            takeUntil(this.subs$)
        );

        // this.removeFilter$.pipe(
        //     takeUntil(this.subs$)
        // ).subscribe(id => {
        //     if (id) {
        //         this.shopStore.dispatch(
        //             StoreActions.removeStoreFilter({ payload: id })
        //         );
        //     }
        // });

        (this.search.valueChanges as Observable<string>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                tap(searchValue =>
                    this.debug('SEARCH VALUE CHANGES CHECK (BEFORE SANITIZED)', searchValue)
                ),
                map(searchValue => this.sanitizer.sanitize(SecurityContext.HTML, searchValue)),
                tap(searchValue =>
                    this.debug('SEARCH VALUE CHANGES CHECK (AFTER SANITIZED)', searchValue)
                ),
                filter(searchValue => !!searchValue || searchValue.length === 0),
                takeUntil(this.subs$)
            )
            .subscribe((searchValue: string) =>
                this.portfolioStore.dispatch(
                    PortfolioActions.setSearchKeywordPortfolio({ payload: searchValue })
                )
            );
    }

    ngAfterViewInit(): void {
        // this.scroll.scrolled(500)
        //     .pipe(
        //         tap(cdkScrollable => this.debug('CDKSCROLLABLE SCROLLED CHECK', { cdkScrollable })),
        //         filter(cdkScrollable =>
        //             this.availableStoreScroll.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id
        //         ),
        //         map(cdkScrollable => (cdkScrollable as CdkScrollable).getElementRef()),
        //         filter((elementRef) => this.helperSvc.isElementScrolledToBottom(elementRef)),
        //         takeUntil(this.subs$)
        //     ).subscribe();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        //         this.removeFilter$.next();
        //         this.removeFilter$.complete();

        this.selectedPortfolioSub$.next();
        this.selectedPortfolioSub$.complete();
    }
}
