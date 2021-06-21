import {
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    Output,
    EventEmitter,
    SimpleChanges,
    ChangeDetectionStrategy,
    AfterViewInit,
    OnDestroy,
} from '@angular/core';
import { MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Observable, Subject, fromEvent } from 'rxjs';
import { Store } from '@ngrx/store';
import {
    debounceTime,
    distinctUntilChanged,
    takeUntil,
    tap,
    map,
    filter,
    withLatestFrom,
    startWith,
} from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { FormStatus } from 'app/shared/models/global.model';
import { FormSelectors } from 'app/shared/store/selectors';
import { FeatureState as GeolocationCoreState } from 'app/shared/components/geolocation/store/reducers';
import { GeolocationSelectors } from 'app/shared/components/geolocation/store/selectors';
import { GeolocationActions } from 'app/shared/components/geolocation/store/actions';
import { Urban } from 'app/shared/components/geolocation/models';
import { Province } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { ProfileSelectors } from '../../store/selectors';
import { fromProfile } from '../../store/reducers';
import { ProfileActions } from '../../store/actions';
@Component({
    selector: 'company-address-form-component',
    templateUrl: './company-address-form.component.html',
    styleUrls: ['./company-address-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyAddressFormComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() isEdit: boolean;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

    // tslint:disable-next-line: no-inferrable-types
    labelFlex: string = '20';

    form: FormGroup;
    profileID: string;

    profile$: Observable<any>;

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

    // Untuk menyimpan jumlah semua province.
    totalProvinces$: Observable<number>;
    // Untuk menyimpan jumlah semua city.
    totalCities$: Observable<number>;
    // Untuk menyimpan jumlah semua district.
    totalDistricts$: Observable<number>;
    // Untuk menyimpan jumlah semua urban.
    totalUrbans$: Observable<number>;

    // Mengambil state loading-nya province.
    isProvinceLoading$: Observable<boolean>;
    // Mengambil state loading-nya city.
    isCityLoading$: Observable<boolean>;
    // Mengambil state loading-nya district.
    isDistrictLoading$: Observable<boolean>;
    // Mengambil state loading-nya urban.
    isUrbanLoading$: Observable<boolean>;

    // AutoComplete for Province
    @ViewChild('triggerProvince', { static: true, read: MatAutocompleteTrigger })
    triggerProvince: MatAutocompleteTrigger;
    // AutoComplete for City
    @ViewChild('triggerCity', { static: true, read: MatAutocompleteTrigger })
    triggerCity: MatAutocompleteTrigger;
    // AutoComplete for District
    @ViewChild('triggerDistrict', { static: true, read: MatAutocompleteTrigger })
    triggerDistrict: MatAutocompleteTrigger;
    // AutoComplete for Urban
    @ViewChild('triggerUrban', { static: true, read: MatAutocompleteTrigger })
    triggerUrban: MatAutocompleteTrigger;

    private unSubs$: Subject<any> = new Subject();

    constructor(
        private store: Store<fromProfile.FeatureState>,
        private fb: FormBuilder,
        private helper$: HelperService,
        private errorMessage$: ErrorMessageService,
        private geolocationStore: Store<GeolocationCoreState>
    ) {
        // Mengambil state province yang terpilih.
        this.selectedProvince$ = this.geolocationStore
            .select(GeolocationSelectors.getSelectedProvinceEntity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED PROVINCE:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state city yang terpilih.
        this.selectedCity$ = this.geolocationStore
            .select(GeolocationSelectors.getSelectedCity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED CITY:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state district yang terpilih.
        this.selectedDistrict$ = this.geolocationStore
            .select(GeolocationSelectors.getSelectedDistrict)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED DISTRICT:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state district yang terpilih.
        this.selectedUrban$ = this.geolocationStore
            .select(GeolocationSelectors.getSelectedUrbanEntity)
            .pipe(
                debounceTime(100),
                tap((val) => this.debug('SELECTED URBAN:', val)),
                takeUntil(this.unSubs$)
            );

        this.availableProvinces$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllProvinces)
            .pipe(
                tap((val) => this.debug('AVAILABLE PROVINCES:', val)),
                takeUntil(this.unSubs$)
            );

        this.availableCities$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllCities)
            .pipe(
                tap((val) => this.debug('AVAILABLE CITIES:', val)),
                takeUntil(this.unSubs$)
            );

        this.availableDistricts$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllDistricts)
            .pipe(
                tap((val) => this.debug('AVAILABLE DISTRICTS:', val)),
                takeUntil(this.unSubs$)
            );

        this.availableUrbans$ = this.geolocationStore
            .select(GeolocationSelectors.selectAllUrbans)
            .pipe(
                tap((val) => this.debug('AVAILABLE URBANS:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil total province di database.
        this.totalProvinces$ = this.geolocationStore
            .select(GeolocationSelectors.getProvinceTotal)
            .pipe(takeUntil(this.unSubs$));

        // Mengambil total city di database.
        this.totalCities$ = this.geolocationStore
            .select(GeolocationSelectors.getCityTotal)
            .pipe(takeUntil(this.unSubs$));

        // Mengambil total district di database.
        this.totalDistricts$ = this.geolocationStore
            .select(GeolocationSelectors.getDistrictTotal)
            .pipe(takeUntil(this.unSubs$));

        // Mengambil total urban di database.
        this.totalUrbans$ = this.geolocationStore
            .select(GeolocationSelectors.getUrbanTotal)
            .pipe(takeUntil(this.unSubs$));

        // Mengambil state loading-nya province.
        this.isProvinceLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getProvinceLoadingState)
            .pipe(
                tap((val) => this.debug('IS PROVINCE LOADING?', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state loading-nya city.
        this.isCityLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getCityLoadingState)
            .pipe(
                tap((val) => this.debug('IS CITY LOADING?', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state loading-nya district.
        this.isDistrictLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getDistrictLoadingState)
            .pipe(
                tap((val) => this.debug('IS DISTRICT LOADING?', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state loading-nya urban.
        this.isUrbanLoading$ = this.geolocationStore
            .select(GeolocationSelectors.getUrbanLoadingState)
            .pipe(
                tap((val) => this.debug('IS URBAN LOADING?', val)),
                takeUntil(this.unSubs$)
            );

        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile);
    }

    ngOnInit() {
        this.initForm();
        this.initFormValue();
        this.initFormCheck();
        this.searchLocation('province', '');

        // Handle Province's Form Control
        (this.form.get('address.urban.province').valueChanges as Observable<string>)
            .pipe(distinctUntilChanged(), debounceTime(200), takeUntil(this.unSubs$))
            .subscribe((value) => {
                this.searchLocation('province', value);
            });

        // Handle City's Form Control
        (this.form.get('address.urban.city').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(this.selectedProvince$),
                filter(([_, selectedProvince]) => {
                    if (!selectedProvince) {
                        return false;
                    }
                    return true;
                }),
                tap(([value, _]: [string, Province]) => {
                    this.searchLocation('city', value);
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe();

        // Handle District's Form Control
        (this.form.get('address.urban.district').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(
                    this.selectedCity$,
                    this.selectedDistrict$,
                    (districtForm, selectedCity, selectedDistrict) =>
                        [districtForm, selectedCity, selectedDistrict] as [string, string, string]
                ),
                filter(([_, selectedCity, __]) => {
                    if (!selectedCity) {
                        this.form.get('address.urban.id').patchValue(null);
                        this.form.get('address.urban.zipCode').patchValue(null);
                        return false;
                    }
                    return true;
                }),
                tap(([value, _, __]: [string, string, string]) => {
                    this.searchLocation('district', value);
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe();

        // Handle Urban's Form Control
        (this.form.get('address.urban.urban').valueChanges as Observable<string>)
            .pipe(
                startWith(''),
                debounceTime(200),
                distinctUntilChanged(),
                withLatestFrom(
                    this.selectedCity$,
                    this.selectedDistrict$,
                    (urbanForm, selectedCity, selectedDistrict) =>
                        [urbanForm, selectedCity, selectedDistrict] as [string, string, string]
                ),
                filter(([_, selectedCity, selectedDistrict]) => {
                    if (!selectedCity || !selectedDistrict) {
                        return false;
                    }
                    return true;
                }),
                tap(([value, _, __]: [string, string, string]) => {
                    this.searchLocation('urban', value);
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {}

    ngAfterViewInit(): void {
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((isClick) => {
                if (this.isEdit && isClick) {
                    this.onSubmit();
                }
            });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
        this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());
        this.geolocationStore.dispatch(GeolocationActions.truncateCities());
        this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());
        this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());
        this.geolocationStore.dispatch(GeolocationActions.deselectProvince());
        this.geolocationStore.dispatch(GeolocationActions.deselectCity());
        this.geolocationStore.dispatch(GeolocationActions.deselectDistrict());
        this.geolocationStore.dispatch(GeolocationActions.deselectUrban());
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

    private searchLocation(
        location: 'province' | 'city' | 'district' | 'urban',
        keyword: string
    ): void {
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 100,
            skip: 0,
        };
        if (keyword) {
            newQuery['keyword'] = keyword;
        }

        if (location === 'province') {
            // Mengosongkan province pada state.
            this.geolocationStore.dispatch(GeolocationActions.truncateProvinces());

            this.geolocationStore.dispatch(
                GeolocationActions.fetchProvincesRequest({
                    payload: newQuery,
                })
            );
        } else if (location === 'city') {
            // Mengosongkan city pada state.
            this.geolocationStore.dispatch(GeolocationActions.truncateCities());

            this.geolocationStore.dispatch(
                GeolocationActions.fetchCitiesRequest({
                    payload: newQuery,
                })
            );
        } else if (location === 'district') {
            // Mengosongkan district pada state.
            this.geolocationStore.dispatch(GeolocationActions.truncateDistricts());

            this.geolocationStore.dispatch(
                GeolocationActions.fetchDistrictsRequest({
                    payload: newQuery,
                })
            );
        } else if (location === 'urban') {
            // Mengosongkan urban pada state.
            this.geolocationStore.dispatch(GeolocationActions.truncateUrbans());

            this.geolocationStore.dispatch(
                GeolocationActions.fetchUrbansRequest({
                    payload: newQuery,
                })
            );
        }
    }

    private initCity(): void {
        // Menyiapkan query untuk pencarian city.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 100,
            skip: 0,
        };

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

    private initDistrict(): void {
        // Menyiapkan query untuk pencarian district.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 100,
            skip: 0,
        };

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

    private initUrban(): void {
        // Menyiapkan query untuk pencarian district.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 100,
            skip: 0,
        };

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

    private initForm(): void {
        this.form = this.fb.group({
            address: this.fb.group({
                urban: this.fb.group({
                    id: [
                        null,
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    province: [
                        null,
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    city: [
                        null,
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    district: [
                        null,
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    urban: [
                        null,
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                    zipCode: [
                        { value: null, disabled: true },
                        [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                    ],
                }),
                address: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.maxLength({
                            value: 160,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'max_length',
                                160
                            ),
                        }),
                    ],
                ],
            }),
        });
    }

    private initFormValue(): void {
        this.profile$.subscribe((dataProfile) => {
            const dataAddress = dataProfile.address;
            this.form.patchValue({
                address: {
                    urban: {
                        id: dataAddress.urban.id,
                        province: dataAddress.urban.province,
                        city: dataAddress.urban.city,
                        district: dataAddress.urban.district,
                        urban: dataAddress.urban.urban,
                        zipCode: dataAddress.urban.zipCode,
                    },
                    address: dataAddress.address,
                },
            });

            this.geolocationStore.dispatch(
                GeolocationActions.selectUrban({ payload: dataAddress.urban.id })
            );

            this.profileID = dataProfile.id;
        });

        this.form.markAllAsTouched();
        this.form.markAsPristine();
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                tap((value) =>
                    HelperService.debug('[COMPANY ADDRESS] FORM STATUS CHANGED:', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                tap((value) =>
                    HelperService.debug('[BEFORE MAP] COMPANY ADDRESS FORM VALUE CHANGED', value)
                ),
                map((value) => {
                    return value;
                }),
                tap((value) =>
                    HelperService.debug('[AFTER MAP] COMPANY ADDRESS FORM VALUE CHANGED', value)
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((_) => {
                this.formStatusChange.emit(this.form.status as FormStatus);
            });
    }

    enableLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (
            location === 'province' ||
            location === 'city' ||
            location === 'district' ||
            location === 'urban'
        ) {
            this.form.get(`address.urban.${location}`).enable();
            this.form.get(`address.urban.${location}`).reset();
        }
    }

    clearLocationForm(location: 'province' | 'city' | 'district' | 'urban'): void {
        if (
            location === 'province' ||
            location === 'city' ||
            location === 'district' ||
            location === 'urban'
        ) {
            this.form.get(`address.urban.${location}`).disable();
            this.form.get(`address.urban.${location}`).reset();
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

    onSelectedProvince(event: MatAutocompleteSelectedEvent): void {
        console.warn('event', event);
        const province: Province = event.option.value;

        if (!province) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectProvince({ payload: province.id }));
        this.form.get('address.urban.province').patchValue(province.name);

        // this.autocompleteTrigger.closePanel();
        this.triggerProvince.closePanel();

        this.initCity();
    }

    onSelectedCity(event: MatAutocompleteSelectedEvent): void {
        const city: string = event.option.value;

        if (!city) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectCity({ payload: city }));

        this.triggerCity.closePanel();

        this.initDistrict();
    }

    onSelectedDistrict(event: MatAutocompleteSelectedEvent): void {
        const district: string = event.option.value;

        if (!district) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectDistrict({ payload: district }));

        this.triggerDistrict.closePanel();

        this.initUrban();
    }

    onSelectedUrban(event: MatAutocompleteSelectedEvent): void {
        const urban: Urban = event.option.value;

        if (!urban) {
            return;
        }

        this.geolocationStore.dispatch(GeolocationActions.selectUrban({ payload: urban.id }));
        this.form.get('address.urban.id').patchValue(urban.id);
        this.form.get('address.urban.urban').patchValue(urban.urban);
        this.form.get('address.urban.zipCode').patchValue(urban.zipCode);

        this.triggerUrban.closePanel();
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    onSubmit(): void {
        this.store.dispatch(ProfileActions.setLoading({ payload: true }));

        const body = this.form.value;

        if (Object.keys(body).length > 0) {
            this.store.dispatch(
                ProfileActions.updateProfileRequest({
                    payload: { body: body, id: this.profileID },
                })
            );
        }
    }
}
