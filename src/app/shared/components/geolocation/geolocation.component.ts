import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';

import { FeatureState as GeolocationCoreState } from './store/reducers';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { GeolocationSelectors } from './store/selectors';
import { GeolocationActions } from './store/actions';
import { Urban } from './models';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { FormActions } from 'app/shared/store/actions';
import { SelectedLocation } from './models/selected-location.model';
import { Province } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
    selector: 'sinbad-geolocation',
    templateUrl: './geolocation.component.html',
    styleUrls: ['./geolocation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeolocationComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    form: FormGroup;
    // Subject for subscription
    subs$: Subject<void> = new Subject<void>();
    // Subject for detect location changes.
    location$: Subject<string> = new Subject<string>();

    // Mengambil state loading-nya province.
    isProvinceLoading$: Observable<boolean>;
    // Mengambil state loading-nya city.
    isCityLoading$: Observable<boolean>;
    // Mengambil state loading-nya district.
    isDistrictLoading$: Observable<boolean>;
    // Mengambil state loading-nya urban.
    isUrbanLoading$: Observable<boolean>;

    // Untuk menyimpan jumlah semua province.
    totalProvinces$: Observable<number>;
    // Untuk menyimpan jumlah semua city.
    totalCities$: Observable<number>;
    // Untuk menyimpan jumlah semua district.
    totalDistricts$: Observable<number>;
    // Untuk menyimpan jumlah semua urban.
    totalUrbans$: Observable<number>;
    
    // Untuk menyimpan province yang tersedia.
    availableProvinces$: Observable<Array<Province>>;
    // Untuk menyimpan city yang tersedia.
    availableCities$: Observable<Array<string>>;
    // Untuk menyimpan district yang tersedia.
    availableDistricts$: Observable<Array<string>>;
    // Untuk menyimpan urban yang tersedia.
    availableUrbans$: Observable<Array<Urban>>;

    // Untuk menyimpan province yang terpilih.
    selectedProvince$: Observable<Province>;
    // Untuk menyimpan city yang terpilih.
    selectedCity$: Observable<string>;
    // Untuk menyimpan district yang terpilih.
    selectedDistrict$: Observable<string>;
    // Untuk menyimpan urban yang terpilih.
    selectedUrban$: Observable<Urban>;

    // Untuk menentukan arah flex dari setiap input-nya.
    @Input() direction: 'row' | 'column' = 'row';
    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selectedLocation: EventEmitter<SelectedLocation> = new EventEmitter<SelectedLocation>();

    // AutoComplete for Province
    @ViewChild('provinceAutoComplete', { static: true }) provinceAutoComplete: MatAutocomplete;
    // AutoComplete for City
    @ViewChild('cityAutoComplete', { static: true }) cityAutoComplete: MatAutocomplete;
    // AutoComplete for District
    @ViewChild('districtAutoComplete', { static: true }) districtAutoComplete: MatAutocomplete;
    // AutoComplete for Urban
    @ViewChild('urbanAutoComplete', { static: true }) urbanAutoComplete: MatAutocomplete;

    @ViewChild(MatAutocompleteTrigger, { static: true }) autocompleteTrigger: MatAutocompleteTrigger;

    constructor(
        private fb: FormBuilder,
        private helper$: HelperService,
        private errorMessage$: ErrorMessageService,
        private geolocationStore: NgRxStore<GeolocationCoreState>
    ) {
        // Mengambil total province di database.
        this.totalProvinces$ = this.geolocationStore.select(
            GeolocationSelectors.getProvinceTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil total city di database.
        this.totalCities$ = this.geolocationStore.select(
            GeolocationSelectors.getCityTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil total district di database.
        this.totalDistricts$ = this.geolocationStore.select(
            GeolocationSelectors.getDistrictTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil total urban di database.
        this.totalUrbans$ = this.geolocationStore.select(
            GeolocationSelectors.getUrbanTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya province.
        this.isProvinceLoading$ = this.geolocationStore.select(
            GeolocationSelectors.getProvinceLoadingState
        ).pipe(
            tap(val => this.debug('IS PROVINCE LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya city.
        this.isCityLoading$ = this.geolocationStore.select(
            GeolocationSelectors.getCityLoadingState
        ).pipe(
            tap(val => this.debug('IS CITY LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya district.
        this.isDistrictLoading$ = this.geolocationStore.select(
            GeolocationSelectors.getDistrictLoadingState
        ).pipe(
            tap(val => this.debug('IS DISTRICT LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya urban.
        this.isUrbanLoading$ = this.geolocationStore.select(
            GeolocationSelectors.getUrbanLoadingState
        ).pipe(
            tap(val => this.debug('IS URBAN LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state province yang terpilih.
        this.selectedProvince$ = this.geolocationStore.select(
            GeolocationSelectors.getSelectedProvinceEntity
        ).pipe(
            debounceTime(100),
            tap(val => this.debug('SELECTED PROVINCE:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state city yang terpilih.
        this.selectedCity$ = this.geolocationStore.select(
            GeolocationSelectors.getSelectedCity
        ).pipe(
            debounceTime(100),
            tap(val => this.debug('SELECTED CITY:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state district yang terpilih.
        this.selectedDistrict$ = this.geolocationStore.select(
            GeolocationSelectors.getSelectedDistrict
        ).pipe(
            debounceTime(100),
            tap(val => this.debug('SELECTED DISTRICT:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state district yang terpilih.
        this.selectedUrban$ = this.geolocationStore.select(
            GeolocationSelectors.getSelectedUrbanEntity
        ).pipe(
            debounceTime(100),
            tap(val => this.debug('SELECTED URBAN:', val)),
            takeUntil(this.subs$)
        );
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    private initProvince(): void {
        // Menyiapkan query untuk pencarian province.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        this.enableLocationForm('province');
        this.clearLocationForm('city');
        this.clearLocationForm('district');
        this.clearLocationForm('urban');

        // Mengirim state untuk melepas province yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(
            GeolocationActions.deselectProvince()
        );

        // Mengosongkan province pada state.
        this.geolocationStore.dispatch(
            GeolocationActions.truncateProvinces()
        );

        // Mengirim state untuk melakukan request province.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchProvincesRequest({
                payload: newQuery
            })
        );
    }

    private initCity(): void {
        // Menyiapkan query untuk pencarian city.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        this.enableLocationForm('city');
        this.clearLocationForm('district');
        this.clearLocationForm('urban');


        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(
            GeolocationActions.deselectCity()
        );

        // Mengosongkan city pada state.
        this.geolocationStore.dispatch(
            GeolocationActions.truncateCities()
        );

        // Mengirim state untuk melakukan request city.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchCitiesRequest({
                payload: newQuery
            })
        );
    }

    private initDistrict(): void {
        // Menyiapkan query untuk pencarian district.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        this.enableLocationForm('district');
        this.clearLocationForm('urban');

        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(
            GeolocationActions.deselectDistrict()
        );

        // Mengosongkan district pada state.
        this.geolocationStore.dispatch(
            GeolocationActions.truncateDistricts()
        );

        // Mengirim state untuk melakukan request district.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchDistrictsRequest({
                payload: newQuery
            })
        );
    }

    private initUrban(): void {
        // Menyiapkan query untuk pencarian district.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 30,
            skip: 0
        };

        this.enableLocationForm('urban');

        // Mengirim state untuk melepas urban yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(
            GeolocationActions.deselectUrban()
        );

        // Mengosongkan urban pada state.
        this.geolocationStore.dispatch(
            GeolocationActions.truncateUrbans()
        );

        // Mengirim state untuk melakukan request urban.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchUrbansRequest({
                payload: newQuery
            })
        );
    }

    enableLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (location === 'province' || location === 'city' || location === 'district' || location === 'urban') {
            this.form.get(location).enable();
            this.form.get(location).reset();
        }
    }

    clearLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (location === 'province' || location === 'city' || location === 'district' || location === 'urban') {
            this.form.get(location).disable();
            this.form.get(location).reset();
        }

        if (location === 'province') {
            this.geolocationStore.dispatch(
                GeolocationActions.deselectProvince()
            );

            this.geolocationStore.dispatch(
                GeolocationActions.truncateProvinces()
            );
        }

        if (location === 'city') {
            this.geolocationStore.dispatch(
                GeolocationActions.deselectCity()
            );

            this.geolocationStore.dispatch(
                GeolocationActions.truncateCities()
            );
        }

        if (location === 'district') {
            this.geolocationStore.dispatch(
                GeolocationActions.deselectDistrict()
            );

            this.geolocationStore.dispatch(
                GeolocationActions.truncateDistricts()
            );
        }

        if (location === 'urban') {
            this.geolocationStore.dispatch(
                GeolocationActions.deselectUrban()
            );

            this.geolocationStore.dispatch(
                GeolocationActions.truncateUrbans()
            );
        }
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessage$.getFormError(form);
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

    onSelectedProvince(event: MatAutocompleteSelectedEvent): void {
        const province: Province = event.option.value;

        if (!province) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectProvince({ payload: province.id }));

        this.autocompleteTrigger.closePanel();

        this.initCity();
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

        this.geolocationStore.dispatch(GeolocationActions.selectCity({ payload: city }));

        this.autocompleteTrigger.closePanel();

        this.initDistrict();
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

        this.geolocationStore.dispatch(GeolocationActions.selectDistrict({ payload: district }));

        this.autocompleteTrigger.closePanel();

        this.initUrban();
    }

    displayDistrict(item: string): string {
        if (!item) {
            return;
        }

        return item;
    }

    onSelectedUrban(event: MatAutocompleteSelectedEvent): void {
        const urban: Urban = event.option.value;

        if (!urban) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectUrban({ payload: urban.id }));

        this.autocompleteTrigger.closePanel();
    }

    displayUrban(item: Urban): string {
        if (!item) {
            return;
        }

        return item.urban;
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
                        this.geolocationStore.select(GeolocationSelectors.getProvinceLoadingState),
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

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchProvincesRequest({
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
                        this.geolocationStore.select(GeolocationSelectors.getCityLoadingState),
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

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchCitiesRequest({
                            payload: newQuery
                        })
                    );
                });
        }
    }

    processDistrictAutoComplete(): void {
        if (this.autocompleteTrigger && this.districtAutoComplete && this.districtAutoComplete.panel) {
            fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableDistricts$,
                        this.totalDistricts$,
                        this.geolocationStore.select(GeolocationSelectors.getDistrictLoadingState),
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

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchDistrictsRequest({
                            payload: newQuery
                        })
                    );
                });
        }
    }

    processUrbanAutoComplete(): void {
        if (this.autocompleteTrigger && this.urbanAutoComplete && this.urbanAutoComplete.panel) {
            fromEvent<Event>(this.urbanAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.urbanAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableUrbans$,
                        this.totalUrbans$,
                        this.geolocationStore.select(GeolocationSelectors.getUrbanLoadingState),
                        ($event, urbans, totalUrbans, isLoading) => ({ $event, urbans, totalUrbans, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('URBANS IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, urbans, totalUrbans }) =>
                        !isLoading &&
                        (totalUrbans > urbans.length) &&
                        this.helper$.isElementScrolledToBottom(this.urbanAutoComplete.panel)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions.pipe(
                        tap(() => this.debug('Urban is closing ...'))
                    ))
                ).subscribe(({ urbans }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: urbans.length
                    };

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchUrbansRequest({
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
        setTimeout(() => this.processCityAutoComplete());
    }

    listenDistrictAutoComplete(): void {
        setTimeout(() => this.processDistrictAutoComplete());
    }

    listenUrbanAutoComplete(): void {
        setTimeout(() => this.processUrbanAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            province: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            city: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            district: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            urban: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
        });

        // Handle Province's Form Control
        (this.form.get('province').valueChanges as Observable<string>).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedProvince$),
            filter(([provinceForm, selectedProvince]: [Province | string, Province | string]) => {
                if (!(provinceForm instanceof Province) && (selectedProvince instanceof Province)) {
                    this.clearLocationForm('city');
                }
                
                return !(provinceForm instanceof Province);
            }),
            tap(([value, _]: [string, string]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.geolocationStore.dispatch(
                    GeolocationActions.truncateProvinces()
                );

                this.geolocationStore.dispatch(
                    GeolocationActions.fetchProvincesRequest({
                        payload: queryParams
                    })
                );

                this.location$.next('');
            }),
            takeUntil(this.subs$)
        ).subscribe();

        // Handle City's Form Control
        (this.form.get('city').valueChanges as Observable<string>).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedProvince$),
            filter(([cityForm, selectedProvince]) => {
                if (!selectedProvince) {
                    return false;
                }

                if (!cityForm) {
                    this.clearLocationForm('district');
                }

                return true;
            }),
            tap(([value, _]: [string, Province]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.geolocationStore.dispatch(
                    GeolocationActions.truncateCities()
                );

                this.geolocationStore.dispatch(
                    GeolocationActions.fetchCitiesRequest({
                        payload: queryParams
                    })
                );

                this.location$.next('');
            }),
            takeUntil(this.subs$)
        ).subscribe();

        // Handle District's Form Control
        (this.form.get('district').valueChanges as Observable<string>).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(
                this.selectedCity$,
                this.selectedDistrict$,
                (districtForm, selectedCity, selectedDistrict) => ([districtForm, selectedCity, selectedDistrict] as [string, string, string])
            ),
            filter(([districtForm, selectedCity, _]) => {
                if (!selectedCity) {
                    return false;
                }

                if (!districtForm) {
                    this.clearLocationForm('urban');
                }

                return true;
            }),
            tap(([value, _, __]: [string, string, string]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.geolocationStore.dispatch(
                    GeolocationActions.truncateDistricts()
                );

                this.geolocationStore.dispatch(
                    GeolocationActions.fetchDistrictsRequest({
                        payload: queryParams
                    })
                );

                this.location$.next('');
            }),
            takeUntil(this.subs$)
        ).subscribe();

        // Handle District's Form Control
        (this.form.get('urban').valueChanges as Observable<string>).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(
                this.selectedCity$,
                this.selectedDistrict$,
                this.selectedUrban$,
                (urbanForm, selectedCity, selectedDistrict, selectedUrban) =>
                    ([urbanForm, selectedCity, selectedDistrict, selectedUrban] as [string, string, string, Urban])
            ),
            filter(([urbanForm, _, __, selectedUrban]) => {
                if (!selectedUrban) {
                    return false;
                }

                if (!urbanForm) {
                    this.clearLocationForm('urban');
                }

                return true;
            }),
            tap(([value, _, __, ___]: [string, string, string, Urban]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.geolocationStore.dispatch(
                    GeolocationActions.truncateDistricts()
                );

                this.geolocationStore.dispatch(
                    GeolocationActions.fetchDistrictsRequest({
                        payload: queryParams
                    })
                );

                this.location$.next('');
            }),
            takeUntil(this.subs$)
        ).subscribe();

        // this.form.valueChanges
        // .pipe(
        //     debounceTime(100),
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     this.location$.next('');
        // });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.location$.next();
        this.location$.complete();

        this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());
        this.geolocationStore.dispatch(GeolocationActions.truncateCities());
        this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());
        this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());

        this.geolocationStore.dispatch(GeolocationActions.deselectProvince());
        this.geolocationStore.dispatch(GeolocationActions.deselectCity());
        this.geolocationStore.dispatch(GeolocationActions.deselectDistrict());
        this.geolocationStore.dispatch(GeolocationActions.deselectUrban());
    }

    ngAfterViewInit(): void {
        this.availableProvinces$ = this.geolocationStore.select(
            GeolocationSelectors.selectAllProvinces
        ).pipe(
            debounceTime(100),
            withLatestFrom(this.isProvinceLoading$),
            filter(([_, isLoading]: [Array<Province>, boolean]) => (!(!!isLoading))),
            map(([provinces]: [Array<Province>, boolean]) => {
                if (provinces.length === 0) {
                    this.initProvince();
                }

                return provinces;
            }),
            takeUntil(this.subs$)
        );

        this.availableCities$ = this.geolocationStore.select(
            GeolocationSelectors.selectAllCities
        ).pipe(
            takeUntil(this.subs$)
        );

        this.availableDistricts$ = this.geolocationStore.select(
            GeolocationSelectors.selectAllDistricts
        ).pipe(
            takeUntil(this.subs$)
        );

        this.availableUrbans$ = this.geolocationStore.select(
            GeolocationSelectors.selectAllUrbans
        ).pipe(
            takeUntil(this.subs$)
        );

        this.location$.pipe(
            debounceTime(200),
            withLatestFrom(
                this.selectedProvince$,
                this.selectedCity$,
                this.selectedDistrict$,
                this.selectedUrban$
            ),
            tap(value => this.debug('tap => onSelectedLocation()', value)),
            takeUntil(this.subs$)
        ).subscribe(([_, province, city, district, urban]: [string, Province, string, string, Urban]) => {
            this.selectedLocation.emit({ province, city, district, urban });
        });
    }

}
