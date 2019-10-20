import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { ErrorMessageService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { fromMerchant } from '../store/reducers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

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
    pageType: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
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
                        }
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

        this.initForm();

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
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.form = this.formBuilder.group({
            profileInfo: this.formBuilder.group({
                username: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'username',
                                'required'
                            )
                        })
                    ]
                ],
                phoneNumber: [''],
                photos: [''],
                npwpId: ['']
            }),
            storeInfo: this.formBuilder.group({
                storeId: this.formBuilder.group({
                    id: [''],
                    storeName: ['']
                }),
                address: this.formBuilder.group({
                    province: [''],
                    city: [''],
                    district: [''],
                    urban: [''],
                    postcode: [''],
                    notes: [''],
                    geolocation: this.formBuilder.group({
                        lng: [''],
                        lat: ['']
                    })
                }),
                legalInfo: this.formBuilder.group({
                    identityId: [''],
                    identityPhoto: [''],
                    identityPhotoSelfie: [''],
                    npwpId: ['']
                }),
                physicalStoreInfo: this.formBuilder.group({
                    physicalStoreInfo: [''],
                    numberOfEmployee: [''],
                    vehicleAddress: ['']
                }),
                storeClassification: this.formBuilder.group({
                    storeType: [''],
                    storeGroup: [''],
                    storeCluster: [''],
                    storeSegment: ['']
                })
            })
        });
    }
}
