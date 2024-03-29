import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    Input,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    EventEmitter,
    Output,
} from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';

import { FeatureState as GeolocationCoreState } from './store/reducers';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import {
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatAutocompleteSelectedEvent,
} from '@angular/material';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import {
    tap,
    debounceTime,
    withLatestFrom,
    filter,
    takeUntil,
    map,
    startWith,
    distinctUntilChanged,
    take,
} from 'rxjs/operators';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
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
    selectedProvince$: BehaviorSubject<Province> = new BehaviorSubject<Province>(null);
    // Untuk menyimpan city yang terpilih.
    selectedCity$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    // Untuk menyimpan district yang terpilih.
    selectedDistrict$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    // Untuk menyimpan urban yang terpilih.
    selectedUrban$: BehaviorSubject<Urban> = new BehaviorSubject<Urban>(null);

    // Untuk menentukan arah flex dari setiap input-nya.
    @Input() direction: 'row' | 'column' = 'row';
    // tslint:disable-next-line: no-inferrable-types
    @Input() showRequiredMark: boolean = false;
    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selectedLocation: EventEmitter<SelectedLocation> =
        new EventEmitter<SelectedLocation>();

    // AutoComplete for Province
    @ViewChild('provinceAutoComplete', { static: true }) provinceAutoComplete: MatAutocomplete;
    @ViewChild('triggerProvince', { static: true, read: MatAutocompleteTrigger })
    triggerProvince: MatAutocompleteTrigger;
    // AutoComplete for City
    @ViewChild('cityAutoComplete', { static: true }) cityAutoComplete: MatAutocomplete;
    @ViewChild('triggerCity', { static: true, read: MatAutocompleteTrigger })
    triggerCity: MatAutocompleteTrigger;
    // AutoComplete for District
    @ViewChild('districtAutoComplete', { static: true }) districtAutoComplete: MatAutocomplete;
    @ViewChild('triggerDistrict', { static: true, read: MatAutocompleteTrigger })
    triggerDistrict: MatAutocompleteTrigger;
    // AutoComplete for Urban
    @ViewChild('urbanAutoComplete', { static: true }) urbanAutoComplete: MatAutocomplete;
    @ViewChild('triggerUrban', { static: true, read: MatAutocompleteTrigger })
    triggerUrban: MatAutocompleteTrigger;

    constructor(
        private fb: FormBuilder,
        private helper$: HelperService,
        private errorMessage$: ErrorMessageService,
        private geolocationStore: NgRxStore<GeolocationCoreState>
    ) {
        // Mengambil total province di database.
        this.totalProvinces$ = this.geolocationStore
            .select(GeolocationSelectors.getProvinceTotal)
            .pipe(takeUntil(this.subs$));

        // Mengambil total city di database.
        this.totalCities$ = this.geolocationStore
            .select(GeolocationSelectors.getCityTotal)
            .pipe(takeUntil(this.subs$));

        // Mengambil total district di database.
        this.totalDistricts$ = this.geolocationStore
            .select(GeolocationSelectors.getDistrictTotal)
            .pipe(takeUntil(this.subs$));

        // Mengambil total urban di database.
        this.totalUrbans$ = this.geolocationStore
            .select(GeolocationSelectors.getUrbanTotal)
            .pipe(takeUntil(this.subs$));

        // Mengambil state loading-nya province.
        this.isProvinceLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getProvinceLoadingState)
            .pipe(
                tap((val) => this.debug('IS PROVINCE LOADING?', val)),
                takeUntil(this.subs$)
            );

        // Mengambil state loading-nya city.
        this.isCityLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getCityLoadingState)
            .pipe(
                tap((val) => this.debug('IS CITY LOADING?', val)),
                takeUntil(this.subs$)
            );

        // Mengambil state loading-nya district.
        this.isDistrictLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getDistrictLoadingState)
            .pipe(
                tap((val) => this.debug('IS DISTRICT LOADING?', val)),
                takeUntil(this.subs$)
            );

        // Mengambil state loading-nya urban.
        this.isUrbanLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getUrbanLoadingState)
            .pipe(
                tap((val) => this.debug('IS URBAN LOADING?', val)),
                takeUntil(this.subs$)
            );

        // Mengambil state province yang terpilih.
        this.geolocationStore
            .select(GeolocationSelectors.getSelectedProvinceEntity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED PROVINCE:', val)),
                takeUntil(this.subs$)
            )
            .subscribe((v) => this.selectedProvince$.next(v));

        // Mengambil state city yang terpilih.
        this.geolocationStore
            .select(GeolocationSelectors.getSelectedCity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED CITY:', val)),
                takeUntil(this.subs$)
            )
            .subscribe((v) => this.selectedCity$.next(v));

        // Mengambil state district yang terpilih.
        this.geolocationStore
            .select(GeolocationSelectors.getSelectedDistrict)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED DISTRICT:', val)),
                takeUntil(this.subs$)
            )
            .subscribe((v) => this.selectedDistrict$.next(v));

        // Mengambil state district yang terpilih.
        this.geolocationStore
            .select(GeolocationSelectors.getSelectedUrbanEntity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED URBAN:', val)),
                takeUntil(this.subs$)
            )
            .subscribe((v) => this.selectedUrban$.next(v));
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
            skip: 0,
        };

        this.enableLocationForm('province');
        this.clearLocationForm('city');
        this.clearLocationForm('district');
        this.clearLocationForm('urban');

        // Mengirim state untuk melepas province yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(GeolocationActions.deselectProvince());

        // Mengosongkan province pada state.
        this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());

        // Mengirim state untuk melakukan request province.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchProvincesRequest({
                payload: newQuery,
            })
        );
    }

    private initCity(provinceId: string): void {
        // Menyiapkan query untuk pencarian city.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0,
        };

        newQuery['provinceId'] = provinceId;

        this.enableLocationForm('city');
        this.clearLocationForm('district');
        this.clearLocationForm('urban');

        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(GeolocationActions.deselectCity());

        // Mengosongkan city pada state.
        this.geolocationStore.dispatch(GeolocationActions.truncateCities());

        // Mengirim state untuk melakukan request city.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchCitiesRequest({
                payload: newQuery,
            })
        );
    }

    private initDistrict(provinceId: string, city: string): void {
        // Menyiapkan query untuk pencarian district.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0,
        };

        newQuery['provinceId'] = provinceId;
        newQuery['city'] = city;

        this.enableLocationForm('district');
        this.clearLocationForm('urban');

        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(GeolocationActions.deselectDistrict());

        // Mengosongkan district pada state.
        this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());

        // Mengirim state untuk melakukan request district.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchDistrictsRequest({
                payload: newQuery,
            })
        );
    }

    private initUrban(provinceId: string, city: string, district: string): void {
        // Menyiapkan query untuk pencarian district.
        if (!provinceId || !city || !district) {
            return;
        }

        const newQuery: IQueryParams = {
            paginate: true,
            limit: 30,
            skip: 0,
        };

        newQuery['provinceId'] = provinceId;
        newQuery['city'] = city;
        newQuery['district'] = district;

        this.enableLocationForm('urban');

        // Mengirim state untuk melepas urban yang telah dipilih sebelumnya.
        this.geolocationStore.dispatch(GeolocationActions.deselectUrban());

        // Mengosongkan urban pada state.
        this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());

        // Mengirim state untuk melakukan request urban.
        this.geolocationStore.dispatch(
            GeolocationActions.fetchUrbansRequest({
                payload: newQuery,
            })
        );
    }

    enableLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (
            location === 'province' ||
            location === 'city' ||
            location === 'district' ||
            location === 'urban'
        ) {
            this.form.get(location).enable();
            this.form.get(location).reset();
        }
    }

    clearLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (
            location === 'province' ||
            location === 'city' ||
            location === 'district' ||
            location === 'urban'
        ) {
            this.form.get(location).disable();
            this.form.get(location).reset();
        }

        if (location === 'province') {
            this.geolocationStore.dispatch(GeolocationActions.deselectProvince());

            this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());
        }

        if (location === 'city') {
            this.geolocationStore.dispatch(GeolocationActions.deselectCity());

            this.geolocationStore.dispatch(GeolocationActions.truncateCities());
        }

        if (location === 'district') {
            this.geolocationStore.dispatch(GeolocationActions.deselectDistrict());

            this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());
        }

        if (location === 'urban') {
            this.geolocationStore.dispatch(GeolocationActions.deselectUrban());

            this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());
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

        // this.autocompleteTrigger.closePanel();
        // this.triggerProvince.closePanel();

        this.initCity(province.id);
    }

    displayProvince(item: Province): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    onSelectedCity(event: MatAutocompleteSelectedEvent): void {
        const province: string = this.selectedProvince$.value.id;
        const city: string = event.option.value;

        if (!province || !city) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectCity({ payload: city }));

        this.triggerCity.closePanel();

        this.initDistrict(province, city);
    }

    displayCity(item: string): string {
        if (!item) {
            return;
        }

        return item;
    }

    onSelectedDistrict(event: MatAutocompleteSelectedEvent): void {
        const province: string = this.selectedProvince$.value.id;
        const city: string = this.selectedCity$.value;
        const district: string = event.option.value;

        if (!province || !city || !district) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectDistrict({ payload: district }));

        this.triggerDistrict.closePanel();

        this.initUrban(province, city, district);
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

        this.triggerUrban.closePanel();
    }

    displayUrban(item: Urban): string {
        if (!item) {
            return;
        }

        return item.urban;
    }

    processProvinceAutoComplete(): void {
        if (this.triggerProvince && this.provinceAutoComplete && this.provinceAutoComplete.panel) {
            fromEvent<Event>(this.provinceAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() =>
                        this.debug(
                            `fromEvent<Event>(this.provinceAutoComplete.panel.nativeElement, 'scroll')`
                        )
                    ),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total province di back-end dan loading state-nya.
                    withLatestFrom(
                        this.availableProvinces$,
                        this.totalProvinces$,
                        this.geolocationStore.select(GeolocationSelectors.getProvinceLoadingState),
                        ($event, provinces, totalProvinces, isLoading) => ({
                            $event,
                            provinces,
                            totalProvinces,
                            isLoading,
                        })
                    ),
                    // Debugging.
                    tap(() => this.debug('PROVINCE IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(
                        ({ isLoading, provinces, totalProvinces }) =>
                            !isLoading &&
                            totalProvinces > provinces.length &&
                            this.helper$.isElementScrolledToBottom(this.provinceAutoComplete.panel)
                    ),
                    takeUntil(
                        this.triggerProvince.panelClosingActions.pipe(
                            tap(() => this.debug('Province is closing ...'))
                        )
                    )
                )
                .subscribe(({ provinces }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: provinces.length,
                    };

                    newQuery['keyword'] = this.form.get('province').value;

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchProvincesRequest({
                            payload: newQuery,
                        })
                    );
                });
        }
    }

    processCityAutoComplete(): void {
        if (this.triggerCity && this.cityAutoComplete && this.cityAutoComplete.panel) {
            fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() =>
                        this.debug(
                            `fromEvent<Event>(this.cityAutoComplete.panel.nativeElement, 'scroll')`
                        )
                    ),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.selectedProvince$,
                        this.availableCities$,
                        this.totalCities$,
                        this.geolocationStore.select(GeolocationSelectors.getCityLoadingState),
                        ($event, selectedProvince, cities, totalCities, isLoading) => ({
                            $event,
                            selectedProvince,
                            cities,
                            totalCities,
                            isLoading,
                        })
                    ),
                    // Debugging.
                    tap(() => this.debug('CITY IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(
                        ({ isLoading, selectedProvince, cities, totalCities }) =>
                            !isLoading &&
                            selectedProvince &&
                            totalCities > cities.length &&
                            this.helper$.isElementScrolledToBottom(this.cityAutoComplete.panel)
                    ),
                    takeUntil(
                        this.triggerCity.panelClosingActions.pipe(
                            tap(() => this.debug('City is closing ...'))
                        )
                    )
                )
                .subscribe(({ cities, selectedProvince }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: cities.length,
                    };

                    newQuery['keyword'] = this.form.get('city').value;
                    newQuery['provinceId'] = selectedProvince.id;

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchCitiesRequest({
                            payload: newQuery,
                        })
                    );
                });
        }
    }

    processDistrictAutoComplete(): void {
        if (this.triggerDistrict && this.districtAutoComplete && this.districtAutoComplete.panel) {
            fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() =>
                        this.debug(
                            `fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')`
                        )
                    ),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.selectedProvince$,
                        this.selectedCity$,
                        this.availableDistricts$,
                        this.totalDistricts$,
                        this.geolocationStore.select(GeolocationSelectors.getDistrictLoadingState),
                        (
                            $event,
                            selectedProvince,
                            selectedCity,
                            districts,
                            totalDistricts,
                            isLoading
                        ) => ({
                            $event,
                            selectedProvince,
                            selectedCity,
                            districts,
                            totalDistricts,
                            isLoading,
                        })
                    ),
                    // Debugging.
                    tap(() => this.debug('DISTRICT IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(
                        ({
                            isLoading,
                            selectedProvince,
                            selectedCity,
                            districts,
                            totalDistricts,
                        }) =>
                            !isLoading &&
                            selectedProvince &&
                            selectedCity &&
                            totalDistricts > districts.length &&
                            this.helper$.isElementScrolledToBottom(this.districtAutoComplete.panel)
                    ),
                    takeUntil(
                        this.triggerDistrict.panelClosingActions.pipe(
                            tap(() => this.debug('District is closing ...'))
                        )
                    )
                )
                .subscribe(({ districts, selectedProvince, selectedCity }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: districts.length,
                    };

                    newQuery['keyword'] = this.form.get('district').value;
                    newQuery['provinceId'] = selectedProvince.id;
                    newQuery['city'] = selectedCity;

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchDistrictsRequest({
                            payload: newQuery,
                        })
                    );
                });
        }
    }

    processUrbanAutoComplete(): void {
        if (this.triggerUrban && this.urbanAutoComplete && this.urbanAutoComplete.panel) {
            fromEvent<Event>(this.urbanAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() =>
                        this.debug(
                            `fromEvent<Event>(this.urbanAutoComplete.panel.nativeElement, 'scroll')`
                        )
                    ),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil province yang ada di state, jumlah total city di back-end dan loading state-nya.
                    withLatestFrom(
                        this.selectedProvince$,
                        this.selectedCity$,
                        this.selectedDistrict$,
                        this.availableUrbans$,
                        this.totalUrbans$,
                        this.geolocationStore.select(GeolocationSelectors.getUrbanLoadingState),
                        (
                            $event,
                            selectedProvince,
                            selectedCity,
                            selectedDistrict,
                            urbans,
                            totalUrbans,
                            isLoading
                        ) => ({
                            $event,
                            selectedProvince,
                            selectedCity,
                            selectedDistrict,
                            urbans,
                            totalUrbans,
                            isLoading,
                        })
                    ),
                    // Debugging.
                    tap(() => this.debug('URBANS IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(
                        ({
                            isLoading,
                            selectedProvince,
                            selectedCity,
                            selectedDistrict,
                            urbans,
                            totalUrbans,
                        }) =>
                            !isLoading &&
                            selectedProvince &&
                            selectedCity &&
                            selectedDistrict &&
                            totalUrbans > urbans.length &&
                            this.helper$.isElementScrolledToBottom(this.urbanAutoComplete.panel)
                    ),
                    takeUntil(
                        this.triggerUrban.panelClosingActions.pipe(
                            tap(() => this.debug('Urban is closing ...'))
                        )
                    )
                )
                .subscribe(({ urbans, selectedProvince, selectedCity, selectedDistrict }) => {
                    const newQuery: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: urbans.length,
                    };

                    newQuery['keyword'] = this.form.get('urban').value;
                    newQuery['provinceId'] = selectedProvince.id;
                    newQuery['city'] = selectedCity;
                    newQuery['district'] = selectedDistrict;

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchUrbansRequest({
                            payload: newQuery,
                        })
                    );
                });
        }
    }

    listenProvinceAutoComplete(): void {
        // this.triggerProvince.autocomplete = this.provinceAutoComplete;
        setTimeout(() => this.processProvinceAutoComplete());
    }

    listenCityAutoComplete(): void {
        // this.triggerCity.autocomplete = this.cityAutoComplete;
        setTimeout(() => this.processCityAutoComplete());
    }

    listenDistrictAutoComplete(): void {
        // this.triggerDistrict.autocomplete = this.districtAutoComplete;
        setTimeout(() => this.processDistrictAutoComplete());
    }

    listenUrbanAutoComplete(): void {
        // this.triggerUrban.autocomplete = this.urbanAutoComplete;
        setTimeout(() => this.processUrbanAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            warehouse: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            province: [
                { value: '', disabled: false },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            city: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            district: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            urban: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
        });

        // Handle Province's Form Control
        (this.form.get('province').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(this.selectedProvince$),
                filter(
                    ([provinceForm, selectedProvince]: [Province | string, Province | string]) => {
                        if (
                            !(provinceForm instanceof Province) &&
                            selectedProvince instanceof Province
                        ) {
                            this.clearLocationForm('city');
                        }

                        return !(provinceForm instanceof Province);
                    }
                ),
                tap(([value, _]: [string, string]) => {
                    const queryParams: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: 0,
                    };

                    queryParams['keyword'] = value;

                    this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchProvincesRequest({
                            payload: queryParams,
                        })
                    );

                    this.location$.next('');
                }),
                takeUntil(this.subs$)
            )
            .subscribe();

        // Handle City's Form Control
        (this.form.get('city').valueChanges as Observable<string>)
            .pipe(
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
                tap(([value, selectedProvince]: [string, Province]) => {
                    const queryParams: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: 0,
                    };

                    queryParams['keyword'] = value;
                    queryParams['provinceId'] = selectedProvince.id;

                    this.geolocationStore.dispatch(GeolocationActions.truncateCities());

                    this.geolocationStore.dispatch(
                        GeolocationActions.fetchCitiesRequest({
                            payload: queryParams,
                        })
                    );

                    this.location$.next('');
                }),
                takeUntil(this.subs$)
            )
            .subscribe();

        // Handle District's Form Control
        (this.form.get('district').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(
                    this.selectedProvince$,
                    this.selectedCity$,
                    this.selectedDistrict$,
                    (districtForm, selectedProvince, selectedCity, selectedDistrict) =>
                        [districtForm, selectedProvince, selectedCity, selectedDistrict] as [
                            string,
                            Province,
                            string,
                            string
                        ]
                ),
                filter(([districtForm, selectedProvince, selectedCity]) => {
                    if (!selectedProvince || !selectedCity) {
                        return false;
                    }

                    if (!districtForm) {
                        this.clearLocationForm('urban');
                    }

                    return true;
                }),
                tap(
                    ([value, selectedProvince, selectedCity, _]: [
                        string,
                        Province,
                        string,
                        string
                    ]) => {
                        const queryParams: IQueryParams = {
                            paginate: true,
                            limit: 10,
                            skip: 0,
                        };

                        queryParams['keyword'] = value;
                        queryParams['provinceId'] = selectedProvince.id;
                        queryParams['city'] = selectedCity;

                        this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());

                        this.geolocationStore.dispatch(
                            GeolocationActions.fetchDistrictsRequest({
                                payload: queryParams,
                            })
                        );

                        this.location$.next('');
                    }
                ),
                takeUntil(this.subs$)
            )
            .subscribe();

        // Handle District's Form Control
        (this.form.get('urban').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(
                    this.selectedProvince$,
                    this.selectedCity$,
                    this.selectedDistrict$,
                    this.selectedUrban$,
                    (urbanForm, selectedProvince, selectedCity, selectedDistrict, selectedUrban) =>
                        [
                            urbanForm,
                            selectedProvince,
                            selectedCity,
                            selectedDistrict,
                            selectedUrban,
                        ] as [string, Province, string, string, Urban]
                ),
                filter(([urbanForm, selectedProvince, selectedCity, selectedUrban]) => {
                    if (!selectedProvince && !selectedCity) {
                        return false;
                    }

                    if (selectedUrban && urbanForm && !this.urbanAutoComplete.isOpen) {
                        this.location$.next('');
                        return false;
                    }

                    if (selectedUrban || (!urbanForm && !this.urbanAutoComplete.isOpen)) {
                        return false;
                    }

                    if (!urbanForm && selectedUrban && !this.urbanAutoComplete.isOpen) {
                        this.form.get('urban').patchValue(selectedUrban);
                        return false;
                    }

                    return true;
                }),
                tap(
                    ([value, selectedProvince, selectedCity, selectedDistrict, _]: [
                        string,
                        Province,
                        string,
                        string,
                        Urban
                    ]) => {
                        const queryParams: IQueryParams = {
                            paginate: true,
                            limit: 10,
                            skip: 0,
                        };

                        queryParams['keyword'] = value;
                        queryParams['provinceId'] = selectedProvince.id;
                        queryParams['city'] = selectedCity;
                        queryParams['district'] = selectedDistrict;

                        this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());

                        this.geolocationStore.dispatch(
                            GeolocationActions.fetchUrbansRequest({
                                payload: queryParams,
                            })
                        );

                        this.location$.next('');
                    }
                ),
                takeUntil(this.subs$)
            )
            .subscribe();

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
        this.availableProvinces$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllProvinces)
            .pipe(
                debounceTime(100),
                withLatestFrom(this.isProvinceLoading$),
                filter(([_, isLoading]: [Array<Province>, boolean]) => !!!isLoading),
                map(([provinces]: [Array<Province>, boolean]) => {
                    if (provinces.length === 0) {
                        this.initProvince();
                    }

                    return provinces;
                }),
                takeUntil(this.subs$)
            );

        this.availableCities$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllCities)
            .pipe(takeUntil(this.subs$));

        this.availableDistricts$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllDistricts)
            .pipe(takeUntil(this.subs$));

        this.availableUrbans$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllUrbans)
            .pipe(takeUntil(this.subs$));

        this.location$
            .pipe(
                debounceTime(200),
                withLatestFrom(
                    this.selectedProvince$,
                    this.selectedCity$,
                    this.selectedDistrict$,
                    this.selectedUrban$
                ),
                tap((value) => this.debug('tap => onSelectedLocation()', value)),
                takeUntil(this.subs$)
            )
            .subscribe(
                ([_, province, city, district, urban]: [
                    string,
                    Province,
                    string,
                    string,
                    Urban
                ]) => {
                    this.selectedLocation.emit({ province, city, district, urban });
                }
            );
    }
}
