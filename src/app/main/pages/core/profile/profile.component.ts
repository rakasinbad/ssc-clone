import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Province, Urban } from 'app/shared/models/location.model';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { ProfileActions } from './store/actions';
import { fromProfile } from './store/reducers';
import { ProfileSelectors } from './store/selectors';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEdit: boolean;

    profile$: Observable<any>;
    provinces$: Observable<Array<Province>>;
    cities$: Observable<Array<Urban>>;
    districts$: Observable<Array<Urban>>;
    urbans$: Observable<Array<Urban>>;
    postcode$: Observable<string>;
    isLoading$: Observable<boolean>;

    private _profile: any;
    private _unSubs$: Subject<void>;

    @ViewChild('cdkProvince', { static: false }) cdkProvince: CdkVirtualScrollViewport;
    @ViewChild('cdkCity', { static: false }) cdkCity: CdkVirtualScrollViewport;
    @ViewChild('cdkDistrict', { static: false }) cdkDistrict: CdkVirtualScrollViewport;
    @ViewChild('cdkUrban', { static: false }) cdkUrban: CdkVirtualScrollViewport;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<fromProfile.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'My Account'
                        //   translate: 'BREADCRUMBS.ORDER_MANAGEMENTS'
                    },
                    {
                        title: 'Informasi Supplier',
                        //   translate: 'BREADCRUMBS.ORDER_DETAILS',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.isEdit = false;

        // Get selector profile
        this.profile$ = this.store.select(ProfileSelectors.getProfile).pipe(
            tap(data => {
                this._profile = data;
            })
        );
        // Fetch request profile
        this.store.dispatch(ProfileActions.fetchProfileRequest());

        // Get selector dropdown province
        this.provinces$ = this.store.select(DropdownSelectors.getProvinceDropdownState);
        // Fetch request province
        this.store.dispatch(DropdownActions.fetchDropdownProvinceRequest());

        // Get selector loading
        this.isLoading$ = this.store.select(ProfileSelectors.getIsLoading);

        this.initForm();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.resetBreadcrumb());

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

    onEdit(isEdit: boolean): void {
        this.isEdit = isEdit ? false : true;

        if (this.isEdit) {
            this.handleForm();
            this.form.markAsPristine();
        }
    }

    onOpenChange(ev: boolean, field: string): void {
        switch (field) {
            case 'province':
                {
                    if (ev) {
                        this.cdkProvince.scrollToIndex(0);
                        this.cdkProvince.checkViewportSize();
                    }
                }
                break;

            case 'city':
                {
                    if (ev) {
                        this.cdkCity.scrollToIndex(0);
                        this.cdkCity.checkViewportSize();
                    }
                }
                break;

            case 'district':
                {
                    if (ev) {
                        this.cdkDistrict.scrollToIndex(0);
                        this.cdkDistrict.checkViewportSize();
                    }
                }
                break;

            case 'urban':
                {
                    if (ev) {
                        this.cdkUrban.scrollToIndex(0);
                        this.cdkUrban.checkViewportSize();
                    }
                }
                break;

            default:
                break;
        }
    }

    onSelect(ev: MatSelectChange, field: string): void {
        if (!field) {
            return;
        }

        this.handleResetForm(field);

        switch (field) {
            case 'province':
                {
                    const provinceId = ev.value;

                    if (!provinceId) {
                        return;
                    }

                    this.cities$ = this.store
                        .select(DropdownSelectors.getCityDropdownState, { provinceId })
                        .pipe(
                            filter(v => v && v.length > 0),
                            tap(_ => {
                                this.form.get('city').enable();
                            })
                        );
                }
                break;

            case 'city':
                {
                    const provinceId = this.form.get('province').value;
                    const city = ev.value;

                    if (!city || !provinceId) {
                        return;
                    }

                    this.districts$ = this.store
                        .select(DropdownSelectors.getDistrictDropdownState, {
                            provinceId,
                            city
                        })
                        .pipe(
                            filter(v => v && v.length > 0),
                            tap(_ => {
                                this.form.get('district').enable();
                            })
                        );
                }
                break;

            case 'district':
                {
                    const provinceId = this.form.get('province').value;
                    const city = this.form.get('city').value;
                    const district = ev.value;

                    if (!district || !provinceId || !city) {
                        return;
                    }

                    this.urbans$ = this.store
                        .select(DropdownSelectors.getUrbanDropdownState, {
                            provinceId,
                            city,
                            district
                        })
                        .pipe(
                            filter(v => v && v.length > 0),
                            tap(_ => {
                                this.form.get('urban').enable();
                            })
                        );
                }
                break;

            case 'urban':
                {
                    const provinceId = this.form.get('province').value;
                    const city = this.form.get('city').value;
                    const district = this.form.get('district').value;
                    const urbanId = ev.value;

                    if (!urbanId || !provinceId || !city || !district) {
                        return;
                    }

                    this.store
                        .select(DropdownSelectors.getPostcodeDropdownState, {
                            provinceId,
                            city,
                            district,
                            urbanId
                        })
                        .pipe(
                            filter(v => !!v),
                            takeUntil(this._unSubs$)
                        )
                        .subscribe(postcode => {
                            this.form.get('postcode').setValue(postcode);
                        });
                }
                break;

            default:
                break;
        }
    }

    onSubmit(): void {
        if (this.form.invalid || typeof this.isEdit !== 'boolean') {
            return;
        }

        const body = this.form.getRawValue();

        if (this.isEdit) {
            const payload = {
                urbanId: body.urban,
                address: body.notes
            };

            if (!body.urban) {
                delete payload.urbanId;
            }

            if (!body.notes) {
                delete payload.address;
            }

            if (Object.keys(payload).length > 0) {
                this.store.dispatch(
                    ProfileActions.updateProfileRequest({
                        payload: { body: payload, id: this._profile.id }
                    })
                );

                this.onEdit(this.isEdit);
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.form = this.formBuilder.group({
            province: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            city: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            district: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            urban: [
                { value: '', disabled: true },
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
            notes: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ]
        });

        this.store
            .select(ProfileSelectors.getProfile)
            .pipe(
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(data => {
                this.initUpdateForm(data);
            });
    }

    private initUpdateForm(data: any): void {
        if (data.urban) {
            const provinceId = data.urban.province.id;
            const city = data.urban.city;
            const district = data.urban.district;
            const urbanId = data.urban.id;
            const zipCode = data.urban.zipCode;

            if (provinceId) {
                this.populateProvince(provinceId, city, district, urbanId, zipCode);
            }
        }

        if (data.address) {
            this.form.get('notes').setValue(data.address);

            if (this.form.get('notes').invalid) {
                this.form.get('notes').markAsTouched();
            }
        }
    }

    private handleForm(): void {
        this.form.get('province').enable();
    }

    private handleResetForm(field: string): void {
        if (!field) {
            return;
        }

        switch (field) {
            case 'province':
                this.form.get('city').reset();
                this.form.get('city').setValue(null);

                this.form.get('district').reset();
                this.form.get('district').setValue(null);

                this.form.get('urban').reset();
                this.form.get('urban').setValue(null);

                this.form.get('postcode').reset();
                this.form.get('postcode').setValue(null);
                break;

            case 'city':
                this.form.get('district').reset();
                this.form.get('urban').reset();
                this.form.get('postcode').reset();
                break;

            case 'district':
                this.form.get('urban').reset();
                this.form.get('postcode').reset();
                break;

            case 'urban':
                this.form.get('postcode').reset();
                break;

            default:
                break;
        }
    }

    private populateProvince(
        provinceId: string,
        currentCity?: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.form.get('province').setValue(provinceId);

        if (this.form.get('province').invalid) {
            this.form.get('province').markAsTouched();
        } else {
            this.store
                .select(DropdownSelectors.getProvinceDropdownState)
                .pipe(
                    filter(v => v && v.length > 0),
                    takeUntil(this._unSubs$)
                )
                .subscribe(_ => {
                    this.populateCity(
                        provinceId,
                        currentCity,
                        currentDistrict,
                        currentUrban,
                        currentPostcode
                    );
                });
        }
    }

    private populateCity(
        provinceId: string,
        currentCity?: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, { provinceId })
            .pipe(
                filter(v => v && v.length > 0),
                tap(_ => {
                    this.form.get('city').enable();

                    if (currentCity) {
                        this.form.get('city').setValue(currentCity);

                        if (this.form.get('city').invalid) {
                            this.form.get('city').markAsTouched();
                        } else {
                            this.populateDistrict(
                                provinceId,
                                currentCity,
                                currentDistrict,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    }

    private populateDistrict(
        provinceId: string,
        city: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.districts$ = this.store
            .select(DropdownSelectors.getDistrictDropdownState, {
                provinceId,
                city
            })
            .pipe(
                filter(v => v && v.length > 0),
                tap(_ => {
                    this.form.get('district').enable();

                    if (currentDistrict) {
                        this.form.get('district').setValue(currentDistrict);

                        if (this.form.get('district').invalid) {
                            this.form.get('district').markAsTouched();
                        } else {
                            this.populateUrban(
                                provinceId,
                                city,
                                currentDistrict,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    }

    private populateUrban(
        provinceId: string,
        city: string,
        district: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.urbans$ = this.store
            .select(DropdownSelectors.getUrbanDropdownState, {
                provinceId,
                city,
                district
            })
            .pipe(
                filter(v => v && v.length > 0),
                tap(_ => {
                    this.form.get('urban').enable();

                    if (currentUrban) {
                        this.form.get('urban').setValue(currentUrban);

                        if (this.form.get('urban').invalid) {
                            this.form.get('urban').markAsTouched();
                        } else {
                            this.populatePostcode(
                                provinceId,
                                city,
                                district,
                                currentUrban,
                                currentPostcode
                            );
                        }
                    }
                })
            );
    }

    private populatePostcode(
        provinceId: string,
        city: string,
        district: string,
        urbanId: string,
        currentPostcode?: string
    ): void {
        this.store
            .select(DropdownSelectors.getPostcodeDropdownState, {
                provinceId,
                city,
                district,
                urbanId
            })
            .pipe(
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(postcode => {
                if (currentPostcode) {
                    this.form.get('postcode').setValue(currentPostcode);
                } else if (postcode) {
                    this.form.get('postcode').setValue(postcode);
                }
            });
    }
}
