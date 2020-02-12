import { AgmGeocoder, GeocoderResult, MapsAPILoader, MouseEvent } from '@agm/core';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatCheckboxChange
} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import {
    District,
    IBreadcrumbs,
    IQueryParams,
    LifecyclePlatform,
    SupplierStore,
    Urban
} from 'app/shared/models';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import * as fromWarehouses from '../store/reducers';
import { WarehouseSelectors } from '../store/selectors';
import { Location } from '@angular/common';

@Component({
    selector: 'app-warehouse-form',
    templateUrl: './warehouse-form.component.html',
    styleUrls: ['./warehouse-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    searchAddress: FormControl = new FormControl();
    pageType: string;

    opts = {
        minZoom: 3,
        maxZoom: 18,
        zoom: 5,
        lat: -2.5,
        lng: 117.86,
        icon: {
            url: 'assets/images/marker.png',
            scaledSize: {
                width: 18,
                height: 30
            }
        }
    };

    draggAble = true;
    isManually = false;
    editAddress = false;

    districtHighlight: string;
    urbanHighlight: string;

    isDistrictTyping = false;
    isUrbanTyping = false;

    lat: number;
    lng: number;

    districts$: Observable<Array<District>>;
    store$: Observable<SupplierStore>;
    urbans$: Observable<Array<Urban>>;
    isEdit$: Observable<boolean>;
    isLoading$: Observable<boolean>;
    isLoadingDistrict$: Observable<boolean>;

    @ViewChild('autoDistrict', { static: false }) autoDistrict: MatAutocomplete;
    @ViewChild('triggerDistrict', { static: false, read: MatAutocompleteTrigger })
    triggerDistrict: MatAutocompleteTrigger;
    @ViewChild('triggerUrban', { static: false, read: MatAutocompleteTrigger })
    triggerUrban: MatAutocompleteTrigger;

    @ViewChild('search', { static: false }) searchElRef: ElementRef;

    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Logistics'
        },
        {
            title: 'Warehouse List'
        },
        {
            title: 'Add Warehouse'
        }
    ];

    private _unSubs$: Subject<void> = new Subject<void>();
    private _selectedDistrict = null;
    private _selectedUrban = null;
    private _timer: Array<NodeJS.Timer> = [];

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private agmGeocoder: AgmGeocoder,
        private store: Store<fromWarehouses.FeatureState>,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
    ) {
        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: false
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
                            active: true
                        }
                    }
                }
            })
        );

        this.store.dispatch(UiActions.showFooterAction());

        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        console.log('Loc', this.location.getState());

        this._initPage();

        this._initForm();

        this.districts$ = this.store.select(DropdownSelectors.getAllDistrict).pipe(
            tap(sources => {
                if (sources && sources.length > 0) {
                    const districtCtrl = this.form.get('district').value as Urban;
                    const filterDistrict = sources.filter(
                        v =>
                            String(v.district)
                                .trim()
                                .toUpperCase() ===
                                String(districtCtrl.district)
                                    .trim()
                                    .toUpperCase() &&
                            String(v.city)
                                .trim()
                                .toUpperCase() ===
                                String(districtCtrl.city)
                                    .trim()
                                    .toUpperCase()
                    );
                    const urbanSources =
                        filterDistrict && filterDistrict.length > 0
                            ? filterDistrict[0].urbans
                            : null;

                    if (urbanSources) {
                        this.store.dispatch(
                            DropdownActions.setUrbanSource({
                                payload: urbanSources
                            })
                        );
                    }
                }
            })
        );

        this.urbans$ = this.store.select(DropdownSelectors.getAllUrban);

        this.isLoadingDistrict$ = this.store.select(DropdownSelectors.getIsLoadingDistrict);

        this.isLoading$ = this.store.select(WarehouseSelectors.getIsLoading);

        // Handle search district autocomplete & try request to endpoint
        this.form
            .get('district')
            .valueChanges.pipe(
                filter(v => {
                    this.districtHighlight = v;
                    return v && v.length >= 3;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                this._onSearchDistrict(v);
            });

        // Handle search urban autocomplete & refresh source data with filter
        this.form
            .get('urban')
            .valueChanges.pipe(takeUntil(this._unSubs$))
            .subscribe(v => {
                this.urbanHighlight = v;

                this._onSearchUrban(v);
            });

        // Handle cancel button action (footer)
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                this.router.navigate(['/pages/logistics/warehouses'], { replaceUrl: true });

                this.store.dispatch(FormActions.resetClickCancelButton());
                this.store.dispatch(FormActions.resetCancelButtonAction());
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    displayDistrictOption(item: District, isHtml = false): string {
        if (!isHtml) {
            return `${item.province.name}, ${item.city}, ${item.district}`;
        }

        return `<span class="subtitle">${item.province.name}, ${item.city}, ${item.district}</span>`;
    }

    displayUrbanOption(item: Urban, isHtml = false): string {
        return `${item.urban}`;
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    onChangeAddress(isEdit: boolean): void {
        this.editAddress = !isEdit;

        this.cdRef.detectChanges();

        if (this.editAddress && !this.isManually) {
            this._handleAutocomplete();
        }
    }

    onChangeManually(ev: MatCheckboxChange): void {
        this.isManually = ev.checked;

        if (ev.checked === true) {
            this.draggAble = false;

            this.cdRef.detectChanges();
            this._handleTrigger();
        } else {
            this.draggAble = true;

            // this.store
            //     .select(StoreSelectors.getSelectedStore)
            //     .pipe(takeUntil(this._unSubs$))
            //     .subscribe(data => {
            //         console.log(data);

            //         if (data && data.store) {
            //             this.form.get('address').setValue(data.store.address);
            //             this.form.get('notes').setValue(data.store.noteAddress);

            //             if (data.store.urban) {
            //                 this._onSearchDistrict(data.store.urban.district);

            //                 this.form.get('district').setValue(data.store.urban);
            //                 this.form.get('urban').setValue(data.store.urban);
            //                 this.form.get('postcode').setValue(data.store.urban.zipCode);
            //             }

            //             this.lat = data.store.latitude;
            //             this.lng = data.store.longitude;

            //             this.form.markAsPristine();

            //             this.cdRef.detectChanges();
            //         }
            //     });
        }

        this.form.get('district').updateValueAndValidity();
        this.form.get('urban').updateValueAndValidity();
        this.form.get('postcode').updateValueAndValidity();
        this.form.get('lat').updateValueAndValidity();
        this.form.get('lng').updateValueAndValidity();

        this.form.markAsPristine();
    }

    onDisplayDistrict(item: District): string {
        if (!item || !item.province) {
            return;
        }

        return HelperService.truncateText(
            `${item.province.name}, ${item.city}, ${item.district}`,
            40,
            'start'
        );
    }

    onDragEnd(ev: MouseEvent): void {
        if (ev.coords.lat && ev.coords.lng) {
            this._getAddress(ev.coords.lat, ev.coords.lng);
        }
    }

    onDisplayUrban(item: Urban): string {
        if (!item) {
            return;
        }

        return item.urban;
    }

    onKeydown(ev: KeyboardEvent, field: string): void {
        if (!field) {
            return;
        }

        clearTimeout(this._timer[field]);
    }

    onKeyup(ev: KeyboardEvent, field: string): void {
        switch (field) {
            case 'district':
                {
                    if (!(ev.target as any).value || (ev.target as any).value.length < 3) {
                        this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isDistrictTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isDistrictTyping = false;

                        // Detect change manually
                        this.cdRef.markForCheck();
                    }, 100);
                }
                break;

            case 'urban':
                {
                    if (!(ev.target as any).value) {
                        // this.store.dispatch(DropdownActions.resetDistrictsState());
                        return;
                    }

                    this.isUrbanTyping = true;

                    clearTimeout(this._timer[field]);

                    this._timer[field] = setTimeout(() => {
                        this.isUrbanTyping = false;

                        // Detect change manually
                        this.cdRef.markForCheck();
                    }, 100);
                }
                break;

            default:
                return;
        }
    }

    onMapReady(map: any): void {
        this._getCurrentPosition();
    }

    onOpenAutocomplete(field: string): void {
        switch (field) {
            case 'district':
                {
                    if (this.autoDistrict && this.autoDistrict.panel && this.triggerDistrict) {
                        fromEvent(this.autoDistrict.panel.nativeElement, 'scroll')
                            .pipe(
                                map(x => this.autoDistrict.panel.nativeElement.scrollTop),
                                withLatestFrom(
                                    this.store.select(DropdownSelectors.getTotalDistrictEntity),
                                    this.store.select(DropdownSelectors.getTotalDistrict)
                                ),
                                takeUntil(this.triggerDistrict.panelClosingActions)
                            )
                            .subscribe(([x, skip, total]) => {
                                const scrollTop = this.autoDistrict.panel.nativeElement.scrollTop;
                                const scrollHeight = this.autoDistrict.panel.nativeElement
                                    .scrollHeight;
                                const elementHeight = this.autoDistrict.panel.nativeElement
                                    .clientHeight;
                                const atBottom = scrollHeight === scrollTop + elementHeight;

                                if (atBottom && skip && total && skip < total) {
                                    const data: IQueryParams = {
                                        limit: 10,
                                        skip: skip
                                    };

                                    data['paginate'] = true;

                                    if (this.districtHighlight) {
                                        data['search'] = [
                                            {
                                                fieldName: 'keyword',
                                                keyword: this.districtHighlight
                                            }
                                        ];

                                        this.store.dispatch(
                                            DropdownActions.fetchScrollDistrictRequest({
                                                payload: data
                                            })
                                        );
                                    }
                                }
                            });
                    }
                }
                break;

            default:
                return;
        }
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent, field: string): void {
        switch (field) {
            case 'district':
                {
                    const value = (ev.option.value as District) || '';

                    this.form.get('urban').reset();
                    this.form.get('postcode').reset();

                    if (!value) {
                        this.form.get('district').reset();
                    } else {
                        if (value.urbans.length > 0) {
                            // this.form.get('urban').enable();

                            this.store.dispatch(
                                DropdownActions.setUrbanSource({ payload: value.urbans })
                            );
                        }
                    }

                    this._selectedDistrict = value ? JSON.stringify(value) : '';
                }
                break;

            case 'urban':
                {
                    const value = (ev.option.value as Urban) || '';

                    this.form.get('postcode').reset();

                    if (!value) {
                        this.form.get('urban').reset();
                    } else {
                        this.form.get('postcode').setValue(value.zipCode);
                    }

                    this._selectedUrban = value ? JSON.stringify(value) : '';
                }
                break;

            default:
                return;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                this.store.dispatch(UiActions.hideFooterAction());

                // Reset district state
                this.store.dispatch(DropdownActions.resetDistrictsState());

                // Reset urban state
                this.store.dispatch(DropdownActions.resetUrbansState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                const { id } = this.route.snapshot.params;

                if (id === 'new') {
                    this.pageType = 'new';
                } else if (Math.sign(id) === 1) {
                    this.pageType = 'edit';

                    this._breadCrumbs = [
                        {
                            title: 'Home'
                        },
                        {
                            title: 'Logistics'
                        },
                        {
                            title: 'Warehouse List'
                        },
                        {
                            title: 'Edit Warehouse'
                        }
                    ];
                } else {
                    this.router.navigateByUrl('/pages/logistics/warehouses');
                }

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            address: '',
            manually: false,
            district: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            urban: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            postcode: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.minLength({
                        value: 5,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.maxLength({
                        value: 5,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            lat: [
                '',
                [
                    RxwebValidators.latitude({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            lng: [
                '',
                [
                    RxwebValidators.longitude({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            notes: ''
        });
    }

    private _addressValid(): boolean {
        // console.log('CHECK', this.form.pristine, this.form.dirty);

        if (this.isManually) {
            return (
                this.form.get('district').valid &&
                this.form.get('urban').valid &&
                this.form.get('postcode').value &&
                !this.form.pristine
            );
        } else {
            if (this.draggAble) {
                return this.form.pristine;
            } else {
                return !this.form.pristine;
            }
        }
    }

    private _decomposeAddress(address: Array<GeocoderResult>, lat: number, lng: number): void {
        if (address.length === 0) {
            this._$notice.open('No results found', 'error', {
                verticalPosition: 'bottom',
                horizontalPosition: 'right'
            });
            return;
        }

        const formatAddress = address[0].formatted_address;
        const addressComponent = address[0].address_components;

        this.form.get('address').setValue(formatAddress);
        this.cdRef.detectChanges();

        const locSearch = {
            province: '',
            city: '',
            district: '',
            urban: ''
        };

        for (const item of addressComponent) {
            if (item.types.length === 0 && !item.types) {
                continue;
            }

            if (item.types.indexOf('administrative_area_level_1') > -1) {
                locSearch.province = item.long_name;
                continue;
            }

            if (item.types.indexOf('administrative_area_level_2') > -1) {
                locSearch.city = item.long_name;
                continue;
            }

            if (item.types.indexOf('administrative_area_level_3') > -1) {
                locSearch.district = item.long_name;
                continue;
            }

            if (item.types.indexOf('administrative_area_level_4') > -1) {
                locSearch.urban = item.long_name;
                continue;
            }
        }

        this.store.dispatch(DropdownActions.fetchLocationRequest({ payload: locSearch }));

        this.store
            .select(DropdownSelectors.getLocationState)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(x => {
                if (x) {
                    this._onSearchDistrict(x.district);

                    this.form.get('district').setValue(x);
                    this.form.get('urban').setValue(x);
                    this.form.get('postcode').setValue(x.zipCode);
                    this.form.get('lat').setValue(lat);
                    this.form.get('lng').setValue(lng);

                    this.lat = lat;
                    this.lng = lng;
                }

                this._setFormStatus(this.form.status);

                this.cdRef.detectChanges();

                this.form.markAsPristine();
            });
    }

    private _filterUrban(source: Array<Urban>, value: string): Array<Urban> {
        if (!value || !source || (source && source.length < 1)) {
            return source;
        }

        const filterValue = String(value).toLowerCase();

        return source.filter(r =>
            String(r.urban)
                .toLowerCase()
                .includes(filterValue)
        );
    }

    private _getAddress(lat: number, lng: number): void {
        // this.fitBoundService.getBounds$.subscribe(x => {
        //     console.log('Fit Bound', x);
        // });
        this.agmGeocoder
            .geocode({ location: { lat, lng } })
            .pipe(takeUntil(this._unSubs$))
            .subscribe({
                next: res => {
                    this._decomposeAddress(res, lat, lng);
                },
                error: err => {
                    this._$notice.open('Failed geocoder', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
    }

    private _getCurrentPosition(): void {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;

                this.cdRef.markForCheck();
            });
        }
    }

    private _handleAutocomplete(): void {
        if (this.searchElRef) {
            const autoComplete = new google.maps.places.Autocomplete(
                this.searchElRef.nativeElement,
                {
                    types: ['address']
                }
            );

            autoComplete.addListener('place_changed', () => {
                const place = autoComplete.getPlace();

                if (place.geometry === undefined || place.geometry === null) {
                    return;
                }

                this.lat = place.geometry.location.lat();
                this.lng = place.geometry.location.lng();

                if (this.lat && this.lng) {
                    this._getAddress(this.lat, this.lng);
                }

                this.editAddress = false;

                this.cdRef.markForCheck();
            });
        }
    }

    private _handleTrigger(): void {
        // Handle trigger autocomplete district force selected from options
        if (this.triggerDistrict) {
            this.triggerDistrict.panelClosingActions.pipe(takeUntil(this._unSubs$)).subscribe(e => {
                const value = this.form.get('district').value;

                if (!this._selectedDistrict || this._selectedDistrict !== JSON.stringify(value)) {
                    // Set input district empty
                    this.form.get('district').setValue('');

                    // Reset input urban
                    this.form.get('urban').reset();

                    // Reset input postcode
                    this.form.get('postcode').reset();

                    // Reset state urban
                    this.store.dispatch(DropdownActions.resetUrbansState());

                    // Set selected district empty (helper check User is choose from option or not)
                    this._selectedDistrict = '';
                }
            });
        }

        // Handle trigger autocomplete urban force selected from options
        if (this.triggerUrban) {
            this.triggerUrban.panelClosingActions.pipe(takeUntil(this._unSubs$)).subscribe(e => {
                const value = this.form.get('urban').value;

                if (!this._selectedUrban || this._selectedUrban !== JSON.stringify(value)) {
                    // Set input urban empty
                    this.form.get('urban').setValue('');

                    // Reset input postcode
                    this.form.get('postcode').reset();

                    // Set selected urban empty (helper check User is choose from option or not)
                    this._selectedUrban = '';
                }
            });
        }
    }

    private _setFormStatus(status: string): void {
        // console.log('TEST FORM', this._addressValid());

        if (!status) {
            return;
        }

        if (status === 'VALID' && this._addressValid()) {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID' || !this._addressValid()) {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }

    private _onSearchDistrict(v: string): void {
        if (v) {
            const data: IQueryParams = {
                limit: 10,
                skip: 0
            };

            data['paginate'] = true;

            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: v
                }
            ];

            this.districtHighlight = v;

            this.store.dispatch(DropdownActions.searchDistrictRequest({ payload: data }));
        }
    }

    private _onSearchUrban(v: string): void {
        this.urbans$ = this.store
            .select(DropdownSelectors.getAllUrban)
            .pipe(map(source => this._filterUrban(source, v)));
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const { id } = this.route.parent.snapshot.params;
        const body = this.form.getRawValue();
        const urban = body.urban as Urban;
        const payload = {
            urbanId: urban.id,
            longitude: body.lng,
            latitude: body.lat,
            noteAddress: body.notes,
            address: body.address
        };

        if (!body.longitude) {
            delete payload.longitude;
        }

        if (!body.latitude) {
            delete payload.latitude;
        }

        if (!body.address) {
            delete payload.address;
        }

        if (!body.notes) {
            delete payload.noteAddress;
        }

        if (id && Object.keys(payload).length > 0) {
            // this.store.dispatch(
            //     StoreActions.updateStoreRequest({ payload: { id, body: payload } })
            // );
        }
    }
}
