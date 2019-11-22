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
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import {
    Cluster,
    Province,
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
import { Store as Merchant } from '../models';
import { StoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { StoreSelectors } from '../store/selectors';

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

    stores$: Observable<Merchant>;
    provinces$: Observable<Province[]>;
    cities$: Observable<Urban[]>;
    districts$: Observable<Urban[]>;
    urbans$: Observable<Urban[]>;
    postcode$: Observable<string>;
    storeClusters$: Observable<Cluster[]>;
    storeGroups$: Observable<StoreGroup[]>;
    storeSegments$: Observable<StoreSegment[]>;
    storeTypes$: Observable<StoreType[]>;
    vehicleAccessibilities$: Observable<VehicleAccessibility[]>;

    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$log: LogService
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
                        },
                        goBack: {
                            label: 'Kembali',
                            active: true,
                            url: '/pages/account/stores'
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

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            this.stores$ = this.store.select(StoreSelectors.getStoreEdit);
            this.store.dispatch(StoreActions.fetchStoreEditRequest({ payload: id }));
        }

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

        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);

        this.numberOfEmployees = this._$helper.numberOfEmployee();

        this.store.dispatch(FormActions.resetFormStatus());
        this.form.statusChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(status => {
                // console.log('FORM STATUS 1', status);
                // console.log('FORM STATUS 2', this.form);

                this._$log.generateGroup(`[FORM STATUS]`, {
                    status: {
                        type: 'log',
                        value: status
                    },
                    form: {
                        type: 'log',
                        value: this.form
                    }
                });

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
                // console.log('CLICK RESET', isClick);

                this._$log.generateGroup(`[CLICK RESET]`, {
                    isClick: {
                        type: 'log',
                        value: isClick
                    }
                });

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
                this._$log.generateGroup(`[CLICK SUBMIT]`, {
                    isClick: {
                        type: 'log',
                        value: isClick
                    }
                });

                if (isClick) {
                    this.onSubmit();
                }
            });

        this._$log.generateGroup('INIT STORE FORM', '', 'default');
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._$log.generateGroup('DESTROY STORE FORM', '', 'default');

        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.resetBreadcrumb());
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

        // console.log('SELECT PROVINCE', ev);

        this._$log.generateGroup(`[SELECT PROVINCE]`, {
            selectedProvince: {
                type: 'log',
                value: ev
            }
        });

        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, {
                provinceId: ev.value
            })
            .pipe(
                tap(hasCity => {
                    // console.log('LIST CITIES', hasCity);

                    this._$log.generateGroup(`[LIST CITIES]`, {
                        cities: {
                            type: 'log',
                            value: hasCity
                        }
                    });

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

        // console.log('SELECT CITY', ev, provinceId);

        this._$log.generateGroup(`[SELECT CITY]`, {
            selectedCity: {
                type: 'log',
                value: ev
            },
            provinceId: {
                type: 'log',
                value: provinceId
            }
        });

        this.districts$ = this.store
            .select(DropdownSelectors.getDistrictDropdownState, {
                provinceId: provinceId,
                city: ev.value
            })
            .pipe(
                tap(hasDistrict => {
                    if (hasDistrict && hasDistrict.length > 0) {
                        // console.log('LIST DISTRICTS', hasDistrict);

                        this._$log.generateGroup(`[LIST DISTRICTS]`, {
                            districts: {
                                type: 'log',
                                value: hasDistrict
                            }
                        });

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

        // console.log('SELECT DISTRICT', ev, provinceId, city);

        this._$log.generateGroup(`[SELECT DISTRICT]`, {
            selectedDistrict: {
                type: 'log',
                value: ev
            },
            provinceId: {
                type: 'log',
                value: provinceId
            },
            city: {
                type: 'log',
                value: city
            }
        });

        this.urbans$ = this.store
            .select(DropdownSelectors.getUrbanDropdownState, {
                provinceId: provinceId,
                city: city,
                district: ev.value
            })
            .pipe(
                tap(hasUrban => {
                    if (hasUrban && hasUrban.length > 0) {
                        // console.log('LIST URBANS', hasUrban);

                        this._$log.generateGroup(`[LIST URBANS]`, {
                            urbans: {
                                type: 'log',
                                value: hasUrban
                            }
                        });

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

        // console.log('SELECT URBAN', ev, provinceId, city, district);

        this._$log.generateGroup(`[SELECT URBAN]`, {
            selectedUrban: {
                type: 'log',
                value: ev
            },
            provinceId: {
                type: 'log',
                value: provinceId
            },
            city: {
                type: 'log',
                value: city
            },
            district: {
                type: 'log',
                value: district
            }
        });

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
                    // console.log('POST CODE', postcode);
                    // this.form.get('storeInfo.address.postcode').enable();

                    this._$log.generateGroup(`[POST CODE]`, {
                        postcode: {
                            type: 'log',
                            value: postcode
                        }
                    });

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

        if (this.pageType === 'new') {
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
        } else {
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

            this.store
                .select(StoreSelectors.getStoreEdit)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(data => {
                    if (data) {
                        if (data.phoneNo) {
                            this.form.get('profileInfo.phoneNumber').patchValue(data.phoneNo);
                            this.form.get('profileInfo.phoneNumber').markAsTouched();
                        }

                        if (data.imageUrl) {
                            this.form.get('profileInfo.photos').clearValidators();
                            this.form.get('profileInfo.photos').updateValueAndValidity();
                        }

                        if (data.taxNo) {
                            this.form.get('profileInfo.npwpId').patchValue(data.taxNo);
                        }

                        if (data.storeCode) {
                            this.form.get('storeInfo.storeId.id').patchValue(data.storeCode);
                        }

                        if (data.name) {
                            this.form.get('storeInfo.storeId.storeName').patchValue(data.name);
                        }

                        if (data.urban) {
                            if (data.urban.province) {
                                const provinceId = data.urban.province.id;
                                const city = data.urban.city;
                                const district = data.urban.district;
                                const urbanId = data.urban.id;
                                const zipCode = data.urban.zipCode;

                                if (provinceId) {
                                    this.form
                                        .get('storeInfo.address.province')
                                        .patchValue(provinceId);

                                    this.store
                                        .select(DropdownSelectors.getProvinceDropdownState)
                                        .pipe(takeUntil(this._unSubs$))
                                        .subscribe(hasProvinces => {
                                            if (hasProvinces && hasProvinces.length > 0) {
                                                this.populateCity(
                                                    provinceId,
                                                    city,
                                                    district,
                                                    urbanId,
                                                    zipCode
                                                );
                                            }
                                        });
                                }
                            }
                        }

                        if (data.address) {
                            this.form.get('storeInfo.address.notes').patchValue(data.address);
                        }

                        if (data.largeArea) {
                            this.form
                                .get('storeInfo.physicalStoreInfo.physicalStoreInfo')
                                .patchValue(data.largeArea);
                        }

                        if (data.numberOfEmployee) {
                            this.form
                                .get('storeInfo.physicalStoreInfo.numberOfEmployee')
                                .patchValue(data.numberOfEmployee);
                        }

                        if (data.vehicleAccessibilityId) {
                            this.form
                                .get('storeInfo.physicalStoreInfo.vehicleAccessibility')
                                .patchValue(data.vehicleAccessibilityId);
                        }

                        if (data.storeType && data.storeType.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeType')
                                .patchValue(data.storeType.id);
                        }

                        if (data.storeGroup && data.storeGroup.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeGroup')
                                .patchValue(data.storeGroup.id);
                        }

                        if (data.storeClusters && data.storeClusters.length > 0) {
                            this.form
                                .get('storeInfo.storeClassification.storeCluster')
                                .patchValue(data.storeClusters[0].cluster.id);
                        }

                        if (data.storeSegment && data.storeSegment.id) {
                            this.form
                                .get('storeInfo.storeClassification.storeSegment')
                                .patchValue(data.storeSegment.id);
                        }
                    }
                });
        }
    }

    private onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.value;

        if (this.pageType === 'new') {
            this.store
                .select(AuthSelectors.getUserSupplier)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(({ supplierId }) => {
                    // console.log('AUTH SELECTORS', user);

                    this._$log.generateGroup(`[AUTH SELECTORS]`, {
                        supplierId: {
                            type: 'log',
                            value: supplierId
                        }
                    });

                    if (supplierId) {
                        // const createUser = new FormUser(
                        //     body.storeInfo.legalInfo.name,
                        //     body.storeInfo.legalInfo.npwpId,
                        //     body.storeInfo.legalInfo.identityPhoto,
                        //     body.storeInfo.legalInfo.identityPhotoSelfie,
                        //     body.profileInfo.phoneNumber,
                        //     'active',
                        //     ['1']
                        // );
                        // const createCluser = new FormCluster(
                        //     body.storeInfo.storeClassification.storeCluster
                        // );
                        // const createBrand = new FormBrand(user.data.userBrands[0].brandId);
                        // const payload = new FormStore(
                        //     body.storeInfo.storeId.id,
                        //     body.storeInfo.storeId.storeName,
                        //     body.profileInfo.photos,
                        //     body.profileInfo.npwpId,
                        //     body.storeInfo.address.notes,
                        //     body.profileInfo.phoneNumber,
                        //     'active',
                        //     body.storeInfo.storeClassification.storeType,
                        //     body.storeInfo.storeClassification.storeGroup,
                        //     body.storeInfo.storeClassification.storeSegment,
                        //     body.storeInfo.address.urban,
                        //     createUser,
                        //     createCluser,
                        //     createBrand,
                        //     body.storeInfo.physicalStoreInfo.physicalStoreInfo,
                        //     body.storeInfo.physicalStoreInfo.numberOfEmployee,
                        //     body.storeInfo.physicalStoreInfo.vehicleAccessibility
                        // );

                        // console.log('SUBMIT CREATE 1', body);
                        // console.log('SUBMIT CREATE 2', payload);

                        const payload = {
                            name: body.storeInfo.storeId.storeName,
                            storeCode: body.storeInfo.storeId.id,
                            image: body.profileInfo.photos,
                            taxNo: body.profileInfo.npwpId,
                            address: body.storeInfo.address.notes,
                            phoneNo: body.profileInfo.phoneNumber,
                            numberOfEmployee: body.storeInfo.physicalStoreInfo.numberOfEmployee,
                            largeArea: body.storeInfo.physicalStoreInfo.physicalStoreInfo,
                            status: 'active',
                            storeTypeId: body.storeInfo.storeClassification.storeType,
                            storeGroupId: body.storeInfo.storeClassification.storeGroup,
                            storeSegmentId: body.storeInfo.storeClassification.storeSegment,
                            vehicleAccessibilityId:
                                body.storeInfo.physicalStoreInfo.vehicleAccessibility,
                            urbanId: body.storeInfo.address.urban,
                            user: {
                                idNo: body.storeInfo.legalInfo.identityId,
                                fullName: body.storeInfo.legalInfo.name,
                                taxNo: body.storeInfo.legalInfo.npwpId,
                                idImage: body.storeInfo.legalInfo.identityPhoto,
                                selfieImage: body.storeInfo.legalInfo.identityPhotoSelfie,
                                phone: body.profileInfo.phoneNumber,
                                status: 'active',
                                roles: [1]
                            },
                            cluster: {
                                clusterId: body.storeInfo.storeClassification.storeCluster
                            },
                            supplier: {
                                supplierId: supplierId
                            }
                        };

                        if (!body.storeInfo.physicalStoreInfo.physicalStoreInfo) {
                            delete payload.largeArea;
                        }

                        if (!body.storeInfo.physicalStoreInfo.numberOfEmployee) {
                            delete payload.numberOfEmployee;
                        }

                        if (!body.storeInfo.physicalStoreInfo.vehicleAccessibility) {
                            delete payload.vehicleAccessibilityId;
                        }

                        this._$log.generateGroup(`[SUBMIT CREATE STORE]`, {
                            body: {
                                type: 'log',
                                value: body
                            },
                            payload: {
                                type: 'log',
                                value: payload
                            }
                        });

                        this.store.dispatch(StoreActions.createStoreRequest({ payload }));
                    }
                });
        }

        if (this.pageType === 'edit') {
            /* this.store
                .select(BrandStoreSelectors.getEditBrandStore)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(data => {
                    if (data) {

                    } else {

                    }
                }); */

            const { id } = this.route.snapshot.params;

            // const createCluser = new FormCluster(body.storeInfo.storeClassification.storeCluster);

            // const payload = new FormStoreEdit(
            //     body.storeInfo.storeId.id,
            //     body.storeInfo.storeId.storeName,
            //     body.profileInfo.photos,
            //     body.profileInfo.npwpId,
            //     body.storeInfo.address.notes,
            //     body.profileInfo.phoneNumber,
            //     body.storeInfo.storeClassification.storeType,
            //     body.storeInfo.storeClassification.storeGroup,
            //     body.storeInfo.storeClassification.storeSegment,
            //     body.storeInfo.address.urban,
            //     createCluser,
            //     body.storeInfo.physicalStoreInfo.physicalStoreInfo,
            //     body.storeInfo.physicalStoreInfo.numberOfEmployee,
            //     body.storeInfo.physicalStoreInfo.vehicleAccessibility
            // );

            // console.log('SUBMIT UPDATE 1', body);
            // console.log('SUBMIT UPDATE 2', payload);

            const payload = {
                storeCode: body.storeInfo.storeId.id,
                name: body.storeInfo.storeId.storeName,
                image: body.profileInfo.photos,
                taxNo: body.profileInfo.npwpId,
                address: body.storeInfo.address.notes,
                phoneNo: body.profileInfo.phoneNumber,
                numberOfEmployee: body.storeInfo.physicalStoreInfo.numberOfEmployee,
                largeArea: body.storeInfo.physicalStoreInfo.physicalStoreInfo,
                storeTypeId: body.storeInfo.storeClassification.storeType,
                storeGroupId: body.storeInfo.storeClassification.storeGroup,
                storeSegmentId: body.storeInfo.storeClassification.storeSegment,
                vehicleAccessibilityId: body.storeInfo.physicalStoreInfo.vehicleAccessibility,
                urbanId: body.storeInfo.address.urban,
                cluster: {
                    clusterId: body.storeInfo.storeClassification.storeCluster
                }
            };

            this._$log.generateGroup(`[SUBMIT UPDATE STORE]`, {
                body: {
                    type: 'log',
                    value: body
                },
                payload: {
                    type: 'log',
                    value: payload
                }
            });

            this.store.dispatch(
                StoreActions.updateStoreRequest({ payload: { id, body: payload } })
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

    private populateCity(
        provinceId: string,
        currentCity?: string,
        currentDistrict?: string,
        currentUrban?: string,
        currentPostcode?: string
    ): void {
        this.cities$ = this.store
            .select(DropdownSelectors.getCityDropdownState, {
                provinceId: provinceId
            })
            .pipe(
                tap(hasCity => {
                    if (hasCity && hasCity.length > 0) {
                        this.form.get('storeInfo.address.city').enable();

                        if (currentCity) {
                            this.form.get('storeInfo.address.city').patchValue(currentCity);

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
                provinceId: provinceId,
                city: city
            })
            .pipe(
                tap(hasDistrict => {
                    if (hasDistrict && hasDistrict.length > 0) {
                        this.form.get('storeInfo.address.district').enable();

                        if (currentDistrict) {
                            this.form.get('storeInfo.address.district').patchValue(currentDistrict);

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
                provinceId: provinceId,
                city: city,
                district: district
            })
            .pipe(
                tap(hasUrban => {
                    if (hasUrban && hasUrban.length > 0) {
                        this.form.get('storeInfo.address.urban').enable();

                        if (currentUrban) {
                            this.form.get('storeInfo.address.urban').patchValue(currentUrban);

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
                provinceId: provinceId,
                city: city,
                district: district,
                urbanId: urbanId
            })
            .pipe(takeUntil(this._unSubs$))
            .subscribe(postcode => {
                if (currentPostcode) {
                    this.form.get('storeInfo.address.postcode').patchValue(currentPostcode);
                } else if (postcode) {
                    this.form.get('storeInfo.address.postcode').patchValue(postcode);
                }
            });
    }
}