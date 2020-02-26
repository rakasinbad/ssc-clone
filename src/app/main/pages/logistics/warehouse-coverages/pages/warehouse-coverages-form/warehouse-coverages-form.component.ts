import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSelect, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, fromEvent } from 'rxjs';
import { takeUntil, map, tap, debounceTime, withLatestFrom, filter, startWith, distinctUntilChanged } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { Province, IQueryParams } from 'app/shared/models';
import { FeatureState as WarehouseCoverageCoreState } from '../../store/reducers';
import { LocationSelectors } from '../../store/selectors';
import { LocationActions } from '../../store/actions';

@Component({
    selector: 'app-warehouse-coverages-form',
    templateUrl: './warehouse-coverages-form.component.html',
    styleUrls: ['./warehouse-coverages-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesFormComponent implements OnInit, OnDestroy, AfterViewInit {

    // Form
    form: FormGroup;

    // Untuk menyimpan province yang terpilih.
    selectedProvince$: Observable<string>;
    // Untuk menyimpan city yang terpilih.
    selectedCity$: Observable<string>;
    // Untuk menyimpan district yang terpilih.
    selectedDistrict$: Observable<string>;

    // Mengambil state loading-nya province.
    isProvinceLoading$: Observable<boolean>;
    // Mengambil state loading-nya city.
    isCityLoading$: Observable<boolean>;
    // Mengambil state loading-nya district.
    isDistrictLoading$: Observable<boolean>;

    // Untuk menyimpan nilai input form province, baik sedang mengetik ataupun sudah memilihnya dari Autocomplete.
    // provinceForm$: Observable<string>;
    // provinceForm$: Observable<string>;
    // provinceForm$: Observable<string>;

    // Untuk menyimpan jumlah semua province.
    totalProvinces$: Observable<number>;
    // Untuk menyimpan jumlah semua city.
    totalCities$: Observable<number>;
    // Untuk menyimpan jumlah semua district.
    totalDistricts$: Observable<number>;
    
    // Untuk menyimpan province yang tersedia.
    availableProvinces$: Observable<Array<Province>>;
    // Untuk menyimpan city yang tersedia.
    availableCities$: Observable<Array<string>>;
    // Untuk menyimpan district yang tersedia.
    availableDistricts$: Observable<Array<string>>;

    // AutoComplete for Province
    @ViewChild('provinceAutoComplete', { static: true }) provinceAutoComplete: MatAutocomplete;
    // AutoComplete for City
    @ViewChild('cityAutoComplete', { static: true }) cityAutoComplete: MatAutocomplete;
    // AutoComplete for District
    @ViewChild('districtAutoComplete', { static: true }) districtAutoComplete: MatAutocomplete;

    @ViewChild(MatAutocompleteTrigger, { static: true }) autocompleteTrigger: MatAutocompleteTrigger;

    // Subject for subscription
    subs$: Subject<void> = new Subject<void>();

    // Warehouse Dropdown
    @ViewChild('warehouse', { static: false }) invoiceGroup: MatSelect;
    warehouseSub: Subject<string> = new Subject<string>();

    constructor(
        private fb: FormBuilder,
        private locationStore: NgRxStore<WarehouseCoverageCoreState>,
        private helper$: HelperService,
        private errorMessageSvc: ErrorMessageService,
    ) {
        // Mengambil total province di database.
        this.totalProvinces$ = this.locationStore.select(
            LocationSelectors.getProvinceTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil total city di database.
        this.totalCities$ = this.locationStore.select(
            LocationSelectors.getCityTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil total district di database.
        this.totalDistricts$ = this.locationStore.select(
            LocationSelectors.getDistrictTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya province.
        this.isProvinceLoading$ = this.locationStore.select(
            LocationSelectors.getProvinceLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya city.
        this.isCityLoading$ = this.locationStore.select(
            LocationSelectors.getCityLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya district.
        this.isDistrictLoading$ = this.locationStore.select(
            LocationSelectors.getDistrictLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state province yang terpilih.
        this.selectedProvince$ = this.locationStore.select(
            LocationSelectors.getSelectedProvince
        ).pipe(
            tap(() => {
                this.form.get('city').reset();
                this.form.get('district').reset();
            }),
            takeUntil(this.subs$)
        );

        // Mengambil state city yang terpilih.
        this.selectedCity$ = this.locationStore.select(
            LocationSelectors.getSelectedCity
        ).pipe(
            tap(() => {
                this.form.get('district').reset();
            }),
            takeUntil(this.subs$)
        );

        // Mengambil state district yang terpilih.
        this.selectedDistrict$ = this.locationStore.select(
            LocationSelectors.getSelectedDistrict
        ).pipe(
            takeUntil(this.subs$)
        );
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            console.log(label, data);
        }
    }

    private initProvince(): void {
        // Menyiapkan query untuk pencarian province.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form city dan district.
        this.form.get('city').reset();
        this.form.get('district').reset();

        // Mengirim state untuk melakukan request province.
        this.locationStore.dispatch(
            LocationActions.fetchProvincesRequest({
                payload: newQuery
            })
        );
    }

    // private initCity(): void {
    //     // Menyiapkan query untuk pencarian city.
    //     const newQuery: IQueryParams = {
    //         paginate: true,
    //         limit: 10,
    //         skip: 0
    //     };

    //     // Reset form district.
    //     this.form.get('district').reset();

    //     // Mengirim state untuk melakukan request city.
    //     this.locationStore.dispatch(
    //         LocationActions.fetchCitiesRequest({
    //             payload: newQuery
    //         })
    //     );
    // }

    // private initDistrict(): void {
    //     // Menyiapkan query untuk pencarian district.
    //     const newQuery: IQueryParams = {
    //         paginate: true,
    //         limit: 10,
    //         skip: 0
    //     };

    //     // Mengirim state untuk melakukan request district.
    //     this.locationStore.dispatch(
    //         LocationActions.fetchDistrictsRequest({
    //             payload: newQuery
    //         })
    //     );
    // }

    onSelectedProvince(event: MatAutocompleteSelectedEvent): void {
        const province: Province = event.option.value;

        if (!province) {
            return;
        }

        this.locationStore.dispatch(LocationActions.selectProvince({ payload: province.id }));
    }

    displayProvince(item: Province): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    onSelectedCity(event: MatAutocompleteSelectedEvent): void {
        const city: string = event.option.value;

        if (!city) {
            return;
        }

        this.locationStore.dispatch(LocationActions.selectCity({ payload: city }));
    }

    displayCity(item: string): string {
        if (!item) {
            return;
        }

        return item;
    }

    onSelectedDistrict(event: MatAutocompleteSelectedEvent): void {
        const district: string = event.option.value;

        if (!district) {
            return;
        }

        this.locationStore.dispatch(LocationActions.selectDistrict({ payload: district }));
    }

    displayDistrict(item: string): string {
        if (!item) {
            return;
        }

        return item;
    }

    processProvinceAutoComplete(): void {
        if (this.autocompleteTrigger && this.provinceAutoComplete && this.provinceAutoComplete.panel) {
            fromEvent<Event>(this.provinceAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.provinceAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total province di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableProvinces$,
                        this.totalProvinces$,
                        this.locationStore.select(LocationSelectors.getProvinceLoadingState),
                        ($event, provinces, totalProvinces, isLoading) => ({ $event, provinces, totalProvinces, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('PROVINCE IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, provinces, totalProvinces }) =>
                        !isLoading &&
                        (totalProvinces > provinces.length) &&
                        this.helper$.isElementScrolledToBottom(this.provinceAutoComplete.panel)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions.pipe(
                        tap(() => this.debug('Province is closing ...'))
                    ))
                ).subscribe(({ provinces }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: provinces.length
                    };

                    this.locationStore.dispatch(
                        LocationActions.fetchProvincesRequest({
                            payload: newQuery
                        })
                    );
                });
        }
    }

    processCityAutoComplete(): void {
        if (this.autocompleteTrigger && this.cityAutoComplete && this.cityAutoComplete.panel) {
            fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableCities$,
                        this.totalCities$,
                        this.locationStore.select(LocationSelectors.getCityLoadingState),
                        ($event, cities, totalCities, isLoading) => ({ $event, cities, totalCities, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('CITY IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, cities, totalCities }) =>
                        !isLoading &&
                        (totalCities > cities.length) &&
                        this.helper$.isElementScrolledToBottom(this.cityAutoComplete.panel)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions.pipe(
                        tap(() => this.debug('City is closing ...'))
                    ))
                ).subscribe(({ cities }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: cities.length
                    };

                    this.locationStore.dispatch(
                        LocationActions.fetchCitiesRequest({
                            payload: newQuery
                        })
                    );
                });
        }
    }

    processDistrictAutoComplete(): void {
        if (this.autocompleteTrigger && this.districtAutoComplete && this.districtAutoComplete.panel) {
            fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableDistricts$,
                        this.totalDistricts$,
                        this.locationStore.select(LocationSelectors.getDistrictLoadingState),
                        ($event, districts, totalDistricts, isLoading) => ({ $event, districts, totalDistricts, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('DISTRICT IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, districts, totalDistricts }) =>
                        !isLoading &&
                        (totalDistricts > districts.length) &&
                        this.helper$.isElementScrolledToBottom(this.districtAutoComplete.panel)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions.pipe(
                        tap(() => this.debug('District is closing ...'))
                    ))
                ).subscribe(({ districts }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: districts.length
                    };

                    this.locationStore.dispatch(
                        LocationActions.fetchDistrictsRequest({
                            payload: newQuery
                        })
                    );
                });
        }
    }

    listenProvinceAutoComplete(): void {
        setTimeout(() => this.processProvinceAutoComplete());
    }

    listenCityAutoComplete(): void {
        setTimeout(() => this.processProvinceAutoComplete());
    }

    listenDistrictAutoComplete(): void {
        setTimeout(() => this.processProvinceAutoComplete());
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
        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            province: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            city: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            district: [[]],
        });

        (this.form.get('province').valueChanges as Observable<string>).pipe(
            startWith(''),
            distinctUntilChanged(),
            debounceTime(200),
            tap((value: string) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.locationStore.dispatch(
                    LocationActions.truncateProvinces()
                );

                this.locationStore.dispatch(
                    LocationActions.fetchProvincesRequest({
                        payload: queryParams
                    })
                );
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    ngAfterViewInit(): void {
        this.availableProvinces$ = this.locationStore.select(
            LocationSelectors.selectAllProvices
        ).pipe(
            map(provinces => {
                if (provinces.length === 0) {
                    this.initProvince();
                }

                return provinces;
            }),
            takeUntil(this.subs$)
        );
        // this.warehouseSub.pipe(
        //     withLatestFrom(
        //         this.portfolioStore.select(PortfolioSelector.getSelectedInvoiceGroupId),
        //         (formInvoiceGroupId, selectedInvoiceGroupId) => ({ formInvoiceGroupId, selectedInvoiceGroupId })
        //     ),
        //     exhaustMap<{ formInvoiceGroupId: string; selectedInvoiceGroupId: string }, Observable<string | null>>(({ formInvoiceGroupId, selectedInvoiceGroupId }) => {
        //         // Memunculkan dialog ketika di state sudah ada invoice group yang terpilih dan pilihan tersebut berbeda dengan nilai yang sedang dipilih saat ini.
        //         if (selectedInvoiceGroupId && formInvoiceGroupId !== selectedInvoiceGroupId) {
        //             const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string | null>(DeleteConfirmationComponent, {
        //                 data: {
        //                     id: `changed|${formInvoiceGroupId}|${selectedInvoiceGroupId}`,
        //                     title: 'Clear',
        //                     message: `It will clear all selected store from the list.
        //                                 It won't affected this portfolio unless you click the save button.
        //                                 Are you sure want to proceed?`,
        //                 }, disableClose: true
        //             });
    
        //             return dialogRef.afterClosed().pipe(
        //                 map(id => {
        //                     if (!id) {
        //                         return `cancelled|${selectedInvoiceGroupId}`;
        //                     }

        //                     return id;
        //                 }),
        //                 take(1)
        //             );
        //         } else {
        //             const subject = new Subject<string>();
        //             let payload;

        //             if (!selectedInvoiceGroupId) {
        //                 payload = `init|${formInvoiceGroupId}`;
        //             } else {
        //                 payload = `cancelled|${selectedInvoiceGroupId}`;
        //             }

        //             return subject.asObservable().pipe(
        //                 startWith(payload),
        //                 take(1)
        //             );
        //         }
        //     }),
        //     filter(invoiceGroupId => {
        //         const action = invoiceGroupId.split('|')[0];
    
        //         if (action === 'cancelled') {
        //             const lastInvoiceGroupId = invoiceGroupId.split('|')[1];
        //             this.invoiceGroup.value = lastInvoiceGroupId;

        //             return false;
        //         } else if (action === 'init' || action === 'changed') {
        //             const formInvoiceGroupId = invoiceGroupId.split('|')[1];
        //             this.portfolioStore.dispatch(PortfolioActions.setSelectedInvoiceGroupId({ payload: formInvoiceGroupId }));

        //             return true;
        //         }

        //         return false;
        //     }),
        //     withLatestFrom(
        //         this.portfolioStore.select(PortfolioStoreSelector.getPortfolioNewStores),
        //         this.portfolioStore.select(PortfolioStoreSelector.getAllPortfolioStores),
        //         (_, newStores, portfolioStores) => ({ newStores, portfolioStores })
        //     ),
        //     map<{ newStores: Array<Store>; portfolioStores: Array<Store> }, any>(({ newStores, portfolioStores }) => {
        //         let isCleared = false;
        //         const newStoreIds = newStores.map(newStore => newStore.id);
        //         const portfolioStoreIds = portfolioStores.map(portfolioStore => portfolioStore.id);

        //         if (newStoreIds.length > 0) {
        //             isCleared = true;
        //             this.portfolioStore.dispatch(
        //                 PortfolioActions.removeSelectedStores({
        //                     payload: newStoreIds
        //                 })
        //             );
        //         }

        //         if (portfolioStoreIds.length > 0) {
        //             isCleared = true;
        //             this.portfolioStore.dispatch(
        //                 PortfolioActions.markStoresAsRemovedFromPortfolio({
        //                     payload: portfolioStoreIds
        //                 })
        //             );
        //         }

        //         return isCleared;
        //     }),
        //     tap((isCleared) => {
        //         // Hanya memunculkan notifikasi jika memang ada store yang terhapus.
        //         if (isCleared) {
        //             this._notice.open('All selected stores have been cleared.', 'info', { verticalPosition: 'bottom', horizontalPosition: 'right' });
        //         }
        //     }),
        //     takeUntil(this.subs$)
        // ).subscribe();
    }

}
