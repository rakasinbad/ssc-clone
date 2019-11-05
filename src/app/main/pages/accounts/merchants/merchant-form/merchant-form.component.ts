import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import {
    Province,
    StoreCluster,
    StoreGroup,
    StoreSegment,
    StoreType,
    Urban,
    VehicleAccessibility
} from 'app/shared/models';
import { DropdownActions, FormActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { fromMerchant } from '../store/reducers';
import { CreateStore, CreateUser, CreateCluster } from '../models';

@Component({
    selector: 'app-merchant-form',
    templateUrl: './merchant-form.component.html',
    styleUrls: ['./merchant-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    tmpPhoto: FormControl;
    tmpIdentityPhoto: FormControl;
    tmpIdentityPhotoSelfie: FormControl;
    pageType: string;
    numberOfEmployees: { id: string; label: string }[];

    provinces$: Observable<Province[]>;
    cities$: Observable<Urban[]>;
    districts$: Observable<Urban[]>;
    urbans$: Observable<Urban[]>;
    postcode$: Observable<string>;
    storeClusters$: Observable<StoreCluster[]>;
    storeGroups$: Observable<StoreGroup[]>;
    storeSegments$: Observable<StoreSegment[]>;
    storeTypes$: Observable<StoreType[]>;
    vehicleAccessibilities$: Observable<VehicleAccessibility[]>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: true
                        },
                        value: {
                            active: true
                        },
                        active: false
                    },
                    action: {
                        save: {
                            label: 'Simpan',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: true
                        }
                    }
                }
            })
        );

        this.store.dispatch(UiActions.showFooterAction());

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Add Store',
                            translate: 'BREADCRUMBS.ADD_STORE',
                            active: true
                        }
                    ]
                })
            );
            this.pageType = 'new';
        } else {
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Edit Store',
                            translate: 'BREADCRUMBS.EDIT_STORE',
                            active: true
                        }
                    ]
                })
            );
            this.pageType = 'edit';
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.initForm();

        this.provinces$ = this.store.select(DropdownSelectors.getProvinceDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownProvinceRequest());

        this.storeTypes$ = this.store.select(DropdownSelectors.getStoreTypeDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreTypeRequest());

        this.storeGroups$ = this.store.select(DropdownSelectors.getStoreGroupDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreGroupRequest());

        this.storeClusters$ = this.store.select(DropdownSelectors.getStoreClusterDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreClusterRequest());

        this.storeSegments$ = this.store.select(DropdownSelectors.getStoreSegmentDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());

        this.vehicleAccessibilities$ = this.store.select(
            DropdownSelectors.getVehicleAccessibilityDropdownState
        );
        this.store.dispatch(DropdownActions.fetchDropdownVehicleAccessibilityRequest());

        this.numberOfEmployees = this._$helper.numberOfEmployee();

        this.store.dispatch(FormActions.resetFormStatus());
        this.form.statusChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000)
            )
            .subscribe(status => {
                console.log('FORM STATUS 1', status);
                console.log('FORM STATUS 2', this.form);

                if (status === 'VALID' && this.addressValid()) {
                    this.store.dispatch(FormActions.setFormStatusValid());
                }

                if (status === 'INVALID' || !this.addressValid()) {
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                }
            });

        this.store
            .select(FormSelectors.getIsClickResetButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                console.log('CLICK RESET', isClick);

                if (isClick) {
                    this.form.reset();
                    this.tmpPhoto.reset();
                    this.store.dispatch(FormActions.resetClickResetButton());
                }
            });

        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                console.log('CLICK SUBMIT', isClick);

                if (isClick) {
                    this.onSubmit();
                }
            });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(FormActions.resetFormStatus());

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

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'photo':
                        {
                            const photoField = this.form.get('profileInfo.photos');

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpPhoto.patchValue(file.name);
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'identityPhoto':
                        {
                            const photoField = this.form.get('storeInfo.legalInfo.identityPhoto');

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpIdentityPhoto.patchValue(file.name);
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    case 'identityPhotoSelfie':
                        {
                            const photoField = this.form.get(
                                'storeInfo.legalInfo.identityPhotoSelfie'
                            );

                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                photoField.patchValue(fileReader.result);
                                this.tmpIdentityPhotoSelfie.patchValue(file.name);
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    default:
                        break;
                }
            }
        }

        return;
    }

    onSelectProvince(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.city').reset();
        this.form.get('storeInfo.address.district').reset();
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        if (!ev.value) {
            return;
        }

        console.log('SELECT PROVINCE', ev);

        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, {
                provinceId: ev.value
            })
            .pipe(
                tap(hasCity => {
                    console.log('LIST CITIES', hasCity);
                    if (hasCity && hasCity.length > 0) {
                        this.form.get('storeInfo.address.city').enable();
                    }
                })
            );
    }

    onSelectCity(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.district').reset();
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;

        if (!ev.value || !provinceId) {
            return;
        }

        console.log('SELECT CITY', ev, provinceId);

        this.districts$ = this.store
            .select(DropdownSelectors.getDistrictDropdownState, {
                provinceId: provinceId,
                city: ev.value
            })
            .pipe(
                tap(hasDistrict => {
                    if (hasDistrict && hasDistrict.length > 0) {
                        console.log('LIST DISTRICTS', hasDistrict);
                        this.form.get('storeInfo.address.district').enable();
                    }
                })
            );
    }

    onSelectDistrict(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.urban').reset();
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;
        const city = this.form.get('storeInfo.address.city').value;

        if (!ev.value || !provinceId || !city) {
            return;
        }

        console.log('SELECT DISTRICT', ev, provinceId, city);

        this.urbans$ = this.store
            .select(DropdownSelectors.getUrbanDropdownState, {
                provinceId: provinceId,
                city: city,
                district: ev.value
            })
            .pipe(
                tap(hasUrban => {
                    if (hasUrban && hasUrban.length > 0) {
                        console.log('LIST URBANS', hasUrban);
                        this.form.get('storeInfo.address.urban').enable();
                    }
                })
            );
    }

    onSelectUrban(ev: MatSelectChange): void {
        this.form.get('storeInfo.address.postcode').reset();

        const provinceId = this.form.get('storeInfo.address.province').value;
        const city = this.form.get('storeInfo.address.city').value;
        const district = this.form.get('storeInfo.address.district').value;

        if (!ev.value || !provinceId || !city || !district) {
            return;
        }

        console.log('SELECT URBAN', ev, provinceId, city, district);

        this.store
            .select(DropdownSelectors.getPostcodeDropdownState, {
                provinceId: provinceId,
                city: city,
                district: district,
                urbanId: ev.value
            })
            .pipe(takeUntil(this._unSubs$))
            .subscribe(postcode => {
                if (postcode) {
                    console.log('POST CODE', postcode);
                    // this.form.get('storeInfo.address.postcode').enable();
                    this.form.get('storeInfo.address.postcode').patchValue(postcode);
                }
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.tmpPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhoto = new FormControl({ value: '', disabled: true });
        this.tmpIdentityPhotoSelfie = new FormControl({ value: '', disabled: true });

        this.form = this.formBuilder.group({
            profileInfo: this.formBuilder.group({
                // username: [
                //     '',
                //     [
                //         RxwebValidators.required({
                //             message: this._$errorMessage.getErrorMessageNonState(
                //                 'username',
                //                 'required'
                //             )
                //         })
                //     ]
                // ],
                phoneNumber: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.pattern({
                            expression: {
                                mobilePhone: /^08[0-9]{8,12}$/
                            },
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'mobile_phone_pattern',
                                '08'
                            )
                        })
                    ]
                ],
                photos: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                npwpId: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        }),
                        RxwebValidators.maxLength({
                            value: 15,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        })
                    ]
                ]
            }),
            storeInfo: this.formBuilder.group({
                storeId: this.formBuilder.group({
                    id: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    storeName: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ]
                }),
                address: this.formBuilder.group({
                    province: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    city: [
                        { value: '', disabled: true },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    district: [
                        { value: '', disabled: true },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    urban: [
                        { value: '', disabled: true },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    postcode: [
                        { value: '', disabled: true },
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.digit({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.minLength({
                                value: 5,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.maxLength({
                                value: 5,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ],
                    notes: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ]
                    // geolocation: this.formBuilder.group({
                    //     lng: [''],
                    //     lat: ['']
                    // })
                }),
                legalInfo: this.formBuilder.group({
                    name: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.alpha({
                                allowWhiteSpace: true,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ],
                    identityId: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.digit({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.minLength({
                                value: 16,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.maxLength({
                                value: 16,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ],
                    identityPhoto: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    identityPhotoSelfie: [''],
                    npwpId: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.minLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            }),
                            RxwebValidators.maxLength({
                                value: 15,
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                )
                            })
                        ]
                    ]
                }),
                physicalStoreInfo: this.formBuilder.group({
                    physicalStoreInfo: [''],
                    numberOfEmployee: [''],
                    vehicleAccessibility: ['']
                }),
                storeClassification: this.formBuilder.group({
                    storeType: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    storeGroup: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    storeCluster: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ],
                    storeSegment: [
                        '',
                        [
                            RxwebValidators.required({
                                message: this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]
                    ]
                })
            })
        });
    }

    private onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.value;

        if (this.pageType === 'new') {
            const createUser = new CreateUser(
                body.storeInfo.legalInfo.name,
                body.storeInfo.legalInfo.identityPhoto,
                body.storeInfo.legalInfo.identityPhotoSelfie,
                body.profileInfo.phoneNumber,
                'active',
                ['1']
            );

            const createCluser = new CreateCluster(body.storeInfo.storeClassification.storeCluster);

            console.log('SUBMIT CREATE 1', body);
            console.log(
                'SUBMIT CREATE 2',
                new CreateStore(
                    body.storeInfo.storeId.storeName,
                    body.profileInfo.photos,
                    body.storeInfo.address.notes,
                    body.profileInfo.phoneNumber,
                    'active',
                    body.storeInfo.storeClassification.storeType,
                    body.storeInfo.storeClassification.storeGroup,
                    body.storeInfo.storeClassification.storeSegment,
                    body.storeInfo.address.urban,
                    createUser,
                    createCluser,
                    body.storeInfo.physicalStoreInfo.physicalStoreInfo,
                    body.storeInfo.physicalStoreInfo.numberOfEmployee,
                    body.storeInfo.physicalStoreInfo.vehicleAccessibility
                )
            );
        }

        console.log(this.form.value);
    }

    private addressValid(): boolean {
        return (
            this.form.get('storeInfo.address.province').value &&
            this.form.get('storeInfo.address.city').value &&
            this.form.get('storeInfo.address.district').value &&
            this.form.get('storeInfo.address.urban').value &&
            this.form.get('storeInfo.address.postcode').value &&
            this.form.get('storeInfo.address').valid
        );
    }
}
