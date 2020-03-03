import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatSelect, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete, MatSelectChange, MatDialog } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, fromEvent, Subscription, combineLatest } from 'rxjs';
import { takeUntil, map, tap, debounceTime, withLatestFrom, filter, startWith, distinctUntilChanged, take, exhaustMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Province, IQueryParams, IBreadcrumbs } from 'app/shared/models';
import { FeatureState as WarehouseCoverageCoreState } from '../../store/reducers';
import { LocationSelectors } from '../../store/selectors';
import { LocationActions, WarehouseCoverageActions } from '../../store/actions';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { ActivatedRoute } from '@angular/router';
import { UiActions, FormActions, WarehouseActions } from 'app/shared/store/actions';
import { Warehouse } from '../../../warehouses/models';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { FormSelectors } from 'app/shared/store/selectors';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { MultipleSelectionComponent } from 'app/shared/components/multiple-selection/multiple-selection.component';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';

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

    // Untuk menyimpan daftar warehouse yang tersedia.
    availableWarehouses$: Observable<Array<Warehouse>>;

    // Untuk menyimpan warehouse yang terpilih.
    selectedWarehouse: Warehouse;
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
    // Mengambil state loading-nya urban.
    isUrbanLoading$: Observable<boolean>;

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
    // Untuk menyimpan jumlah semua urban.
    totalUrbans$: Observable<number>;
    
    // Untuk menyimpan province yang tersedia.
    availableProvinces$: Observable<Array<Province>>;
    // Untuk menyimpan city yang tersedia.
    availableCities$: Observable<Array<string>>;
    // Untuk menyimpan district yang tersedia.
    availableDistricts$: Observable<Array<string>>;
    // Untuk menyimpan urban yang tersedia.
    availableUrbans$: Observable<Array<string>>;

    initialSelectedOptions: Array<Selection> = [];
    availableOptions: Array<Selection> = [];
    // selectedOptions: Array<Selection> = [];
    // tslint:disable-next-line: no-inferrable-types
    isAvailableOptionsLoading: boolean = true;

    // AutoComplete for Province
    @ViewChild('provinceAutoComplete', { static: true }) provinceAutoComplete: MatAutocomplete;
    // AutoComplete for City
    @ViewChild('cityAutoComplete', { static: true }) cityAutoComplete: MatAutocomplete;
    // AutoComplete for District
    @ViewChild('districtAutoComplete', { static: true }) districtAutoComplete: MatAutocomplete;

    @ViewChild(MatAutocompleteTrigger, { static: true }) autocompleteTrigger: MatAutocompleteTrigger;
    @ViewChild(MultipleSelectionComponent, { static: true }) multipleSelection;

    // Subject for subscription
    subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan menangani
    loadMore$: Subject<string> = new Subject<string>();
    // Untuk keperluan mat dialog ref.
    dialogRef$: Subject<string> = new Subject<string>();

    // Warehouse Dropdown
    @ViewChild('warehouse', { static: false }) invoiceGroup: MatSelect;
    warehouseSub: Subject<string> = new Subject<string>();

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private locationStore: NgRxStore<WarehouseCoverageCoreState>,
        private helper$: HelperService,
        private notice$: NoticeService,
        private multiple$: MultipleSelectionService,
        private errorMessageSvc: ErrorMessageService,
        private matDialog: MatDialog,
    ) {
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
                // translate: 'BREADCRUMBS.HOME',
                active: false
            },
            {
                title: 'Logistics',
                // translate: 'BREADCRUMBS.CATALOGUE',
                // url: '/pages/logistics/warehouse-coverages'
            },
            {
                title: 'Warehouse Coverage',
                // translate: 'BREADCRUMBS.CATALOGUE',
                url: '/pages/logistics/warehouse-coverages'
            },
        ];

        if (this.route.snapshot.url.filter(url => url.path === 'edit').length > 0) {
            breadcrumbs.push({
                title: 'Edit Warehouse Coverage',
                // translate: 'BREADCRUMBS.EDIT_PRODUCT',
                active: true
            });
        } else {
            breadcrumbs.push({
                title: 'Add Warehouse Coverage',
                // translate: 'BREADCRUMBS.ADD_PRODUCT',
                active: true
            });
        }

        this.locationStore.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );

        this.locationStore.dispatch(
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
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Cancel',
                            active: false
                        },
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/logistics/warehouse-coverages'
                        }
                    }
                }
            })
        );

        this.locationStore.dispatch(FormActions.resetFormStatus());

        this.locationStore.dispatch(FormActions.resetClickSaveButton());

        this.locationStore.dispatch(UiActions.showFooterAction());

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

        // Mengambil total urban di database.
        this.totalUrbans$ = this.locationStore.select(
            LocationSelectors.getUrbanTotal
        ).pipe(
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya province.
        this.isProvinceLoading$ = this.locationStore.select(
            LocationSelectors.getProvinceLoadingState
        ).pipe(
            tap(val => this.debug('IS PROVINCE LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya city.
        this.isCityLoading$ = this.locationStore.select(
            LocationSelectors.getCityLoadingState
        ).pipe(
            tap(val => this.debug('IS CITY LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya district.
        this.isDistrictLoading$ = this.locationStore.select(
            LocationSelectors.getDistrictLoadingState
        ).pipe(
            tap(val => this.debug('IS DISTRICT LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state loading-nya urban.
        this.isUrbanLoading$ = this.locationStore.select(
            LocationSelectors.getUrbanLoadingState
        ).pipe(
            tap(val => this.debug('IS URBAN LOADING?', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state province yang terpilih.
        this.selectedProvince$ = this.locationStore.select(
            LocationSelectors.getSelectedProvince
        ).pipe(
            tap(val => this.debug('SELECTED PROVINCE:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state city yang terpilih.
        this.selectedCity$ = this.locationStore.select(
            LocationSelectors.getSelectedCity
        ).pipe(
            tap(val => this.debug('SELECTED CITY:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil state district yang terpilih.
        this.selectedDistrict$ = this.locationStore.select(
            LocationSelectors.getSelectedDistrict
        ).pipe(
            tap(val => this.debug('SELECTED DISTRICT:', val)),
            takeUntil(this.subs$)
        );

        // Mengambil daftar warehouse dari state.
        this.locationStore.dispatch(WarehouseActions.fetchWarehousesRequest({
            payload: {
                paginate: true,
                limit: 100,
                skip: 0,
            }
        }));
        this.availableWarehouses$ = this.locationStore.select(
            WarehouseSelectors.selectAll
        ).pipe(
            tap(values => this.debug('SELECT WAREHOUSE', values)),
            takeUntil(this.subs$)
        );

        this.loadMore$.pipe(
            withLatestFrom(this.totalUrbans$),
            filter(([message, totalUrbans]) => {
                if (message === 'load-more-available') {
                    return !!message && totalUrbans > this.availableOptions.length;
                }

                return true;
            }),
            takeUntil(this.subs$)
        ).subscribe(([message]) => {
            if (message === 'load-more-available') {
                // Menyiapkan query untuk pencarian district.
                const newQuery: IQueryParams = {
                    paginate: true,
                    limit: 30,
                    skip: this.availableOptions.length
                };

                // Mengirim state untuk melakukan request urban.
                this.locationStore.dispatch(
                    LocationActions.fetchUrbansRequest({
                        payload: newQuery
                    })
                );

                this.cdRef.markForCheck();
            }
        });

        // Melakukan observe terhadap dialogRef$ untuk menangani dialog ref.
        this.dialogRef$.pipe(
            exhaustMap(subjectValue => {
                // tslint:disable-next-line: no-inferrable-types
                let dialogTitle: string = '';
                // tslint:disable-next-line: no-inferrable-types
                let dialogMessage: string = '';

                if (subjectValue === 'clear-all') {
                    dialogTitle = 'Clear Selected Options';
                    dialogMessage = 'It will clear all your selected options. Are you sure?';
                }

                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: dialogTitle,
                        message: dialogMessage,
                        id: subjectValue
                    }, disableClose: true
                });
        
                return dialogRef.afterClosed().pipe(
                    tap(value => {
                        if (value === 'clear-all') {
                            this.form.patchValue({
                                selectedUrbans: [],
                                removedUrbans: []
                            });

                            this.multiple$.clearAllSelectedOptions();

                            this.notice$.open('Your selected options has been cleared.', 'success', {
                                horizontalPosition: 'right',
                                verticalPosition: 'bottom',
                                duration: 5000
                            });

                            this.cdRef.markForCheck();
                        }
                    })
                );
            }),
            takeUntil(this.subs$)
        ).subscribe();
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

    private clearAvailableOptions(): void {
        this.availableOptions = [];
        this.cdRef.markForCheck();
    }

    private initProvince(): void {
        // Menyiapkan query untuk pencarian province.
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        this.form.get('province').enable();
        this.form.get('province').reset();

        // Mengirim state untuk melepas province yang telah dipilih sebelumnya.
        this.locationStore.dispatch(
            LocationActions.deselectProvince()
        );

        // Mengosongkan province pada state.
        this.locationStore.dispatch(
            LocationActions.truncateProvinces()
        );

        // Mengirim state untuk melakukan request province.
        this.locationStore.dispatch(
            LocationActions.fetchProvincesRequest({
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

        this.form.get('city').enable();
        this.form.get('city').reset();

        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.locationStore.dispatch(
            LocationActions.deselectCity()
        );

        // Mengosongkan city pada state.
        this.locationStore.dispatch(
            LocationActions.truncateCities()
        );

        // Mengirim state untuk melakukan request city.
        this.locationStore.dispatch(
            LocationActions.fetchCitiesRequest({
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

        this.form.get('district').enable();
        this.form.get('district').reset();

        // Mengirim state untuk melepas city yang telah dipilih sebelumnya.
        this.locationStore.dispatch(
            LocationActions.deselectDistrict()
        );

        // Mengosongkan district pada state.
        this.locationStore.dispatch(
            LocationActions.truncateDistricts()
        );

        // Mengirim state untuk melakukan request district.
        this.locationStore.dispatch(
            LocationActions.fetchDistrictsRequest({
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

        // Mengosongkan urban pada state.
        this.locationStore.dispatch(
            LocationActions.truncateUrbans()
        );

        // Mengirim state untuk melakukan request urban.
        this.locationStore.dispatch(
            LocationActions.fetchUrbansRequest({
                payload: newQuery
            })
        );
    }

    clearLocationForm(location: 'city' | 'district'): void {
        if (location === 'city' || location === 'district') {
            this.form.get(location).disable();
            this.form.get(location).reset();
        }
    }

    onClearAll(): void {
        this.dialogRef$.next('clear-all');
    }

    onSearch($event: string): void {
        const newQuery: IQueryParams = {
            paginate: true,
            limit: 30,
            skip: 0
        };

        newQuery['keyword'] = $event;
        
        this.locationStore.dispatch(
            LocationActions.truncateUrbans()
        );

        this.locationStore.dispatch(
            LocationActions.fetchUrbansRequest({
                payload: newQuery
            })
        );
    }

    onAvailableOptionLoadMore(): void {
        this.loadMore$.next('load-more-available');
    }

    onSelectedOptionLoadMore(): void {
        this.loadMore$.next('load-more-selected');
    }

    onSelectedWarehouse(warehouse: Warehouse): void {
        this.selectedWarehouse = warehouse;
    }

    onSelectedProvince(event: MatAutocompleteSelectedEvent): void {
        const province: Province = event.option.value;

        if (!province) {
            return;
        }

        this.locationStore.dispatch(LocationActions.selectProvince({ payload: province.id }));

        this.autocompleteTrigger.closePanel();

        this.initCity();
    }

    displayProvince(item: Province): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    onSelectionChanged($event: { added: Array<Selection>; removed: Array<Selection> }): void {
        this.debug('onSelectionChanged', $event);

        this.form.patchValue({
            selectedUrbans: $event.added,
            removedUrbans: $event.removed,
        });
    }

    onSelectedCity(event: MatAutocompleteSelectedEvent): void {
        const city: string = event.option.value;

        if (!city) {
            return;
        }

        this.locationStore.dispatch(LocationActions.selectCity({ payload: city }));

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

        this.locationStore.dispatch(LocationActions.selectDistrict({ payload: district }));

        this.autocompleteTrigger.closePanel();

        this.initUrban();
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
            fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    tap(() => this.debug(`fromEvent<Event>(this.districtAutoComplete.panel.nativeElement, 'scroll')`)),
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
        setTimeout(() => this.processCityAutoComplete());
    }

    listenDistrictAutoComplete(): void {
        setTimeout(() => this.processDistrictAutoComplete());
    }
// 
    submitWarehouseCoverage(): void {
        // Mendapatkan nilai dari form.
        const formValue = this.form.getRawValue();
        // Mendapatkan urban yang terpilih.
        const urbans = (formValue.selectedUrbans as Array<Selection>);

        this.locationStore.dispatch(WarehouseCoverageActions.createWarehouseCoverageRequest({
            payload: {
                urbanId: urbans.map(u => +u.id),
                warehouseId: formValue.warehouse
            }
        }));
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
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            district: [
                { value: '', disabled: true },
            ],
            selectedUrbans: [
                { value: [], disabled: false },
                [
                    RxwebValidators.choice({
                        minLength: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            removedUrbans: [
                { value: '', disabled: false }, []
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
                    this.clearAvailableOptions();
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
                    this.clearAvailableOptions();
                    this.clearLocationForm('district');
                }

                return true;
            }),
            tap(([value, _]: [string, string]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.locationStore.dispatch(
                    LocationActions.truncateCities()
                );

                this.locationStore.dispatch(
                    LocationActions.fetchCitiesRequest({
                        payload: queryParams
                    })
                );
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
            filter(([_, selectedCity, selectedDistrict]) => {
                if (!selectedCity || selectedDistrict) {
                    return false;
                }

                this.clearAvailableOptions();
                return true;
            }),
            tap(([value]: [string, string, string]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0
                };

                queryParams['keyword'] = value;

                this.locationStore.dispatch(
                    LocationActions.truncateDistricts()
                );

                this.locationStore.dispatch(
                    LocationActions.fetchDistrictsRequest({
                        payload: queryParams
                    })
                );
            }),
            takeUntil(this.subs$)
        ).subscribe();

        this.form.valueChanges
        .pipe(
            debounceTime(100),
            takeUntil(this.subs$)
        ).subscribe(() => {
            if (this.form.valid) {
                this.locationStore.dispatch(FormActions.setFormStatusValid());
            } else {
                this.locationStore.dispatch(FormActions.setFormStatusInvalid());
            }
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.locationStore.dispatch(LocationActions.deselectProvince());
        this.locationStore.dispatch(LocationActions.deselectCity());
        this.locationStore.dispatch(LocationActions.deselectDistrict());
        this.locationStore.dispatch(LocationActions.deselectUrban());
        this.locationStore.dispatch(LocationActions.truncateProvinces());
        this.locationStore.dispatch(LocationActions.truncateCities());
        this.locationStore.dispatch(LocationActions.truncateDistricts());
        this.locationStore.dispatch(LocationActions.truncateUrbans());

        this.locationStore.dispatch(UiActions.hideFooterAction());
        this.locationStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.locationStore.dispatch(UiActions.hideCustomToolbar());
        this.locationStore.dispatch(FormActions.resetFormStatus());
    }

    ngAfterViewInit(): void {
        this.availableProvinces$ = this.locationStore.select(
            LocationSelectors.selectAllProvices
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

        this.availableCities$ = this.locationStore.select(
            LocationSelectors.selectAllCities
        ).pipe(
            takeUntil(this.subs$)
        );

        this.availableDistricts$ = this.locationStore.select(
            LocationSelectors.selectAllDistricts
        ).pipe(
            takeUntil(this.subs$)
        );

        this.locationStore.select(
            LocationSelectors.selectAllUrbans
        ).pipe(
            tap(urbans => {
                if (urbans) {
                    this.availableOptions = urbans.map<Selection>(d => ({ id: d.id, group: 'urban', label: d.urban }));
                }
            }),
            takeUntil(this.subs$)
        ).subscribe();

        this.locationStore.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            filter(isClick => !!isClick),
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.submitWarehouseCoverage();
        });


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
