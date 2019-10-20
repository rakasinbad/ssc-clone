import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { Role } from 'app/main/pages/roles/role.model';
import { ErrorMessageService } from 'app/shared/helpers';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { Observable } from 'rxjs';
import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { fromMerchant } from '../store/reducers';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { UiActions } from 'app/shared/store/actions';

@Component({
    selector: 'app-merchant-employee',
    templateUrl: './merchant-employee.component.html',
    styleUrls: ['./merchant-employee.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantEmployeeComponent implements OnInit, OnDestroy {
    form: FormGroup;

    roles$: Observable<Role[]>;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {
        // Configure the layout
        // this._fuseConfigService.config = {
        //     layout: {
        //         footer: {
        //             hidden: false
        //         }
        //     }
        // };
        // this.store.dispatch(UiActions.showFooterAction());
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
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE'
                    },
                    {
                        title: 'Edit',
                        translate: 'BREADCRUMBS.EDIT',
                        active: true
                    }
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // /^(08[0-9]{8,12}|[0-9]{6,8})?$/
        this.roles$ = this.store.select(DropdownSelectors.getRoleDropdownState);
        this.form = this.formBuilder.group({
            fullName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'full_name',
                            'required'
                        )
                    }),
                    RxwebValidators.alpha({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'full_name',
                            'alpha_pattern'
                        )
                    }),
                    RxwebValidators.maxLength({
                        value: 30,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'full_name',
                            'max_length',
                            30
                        )
                    })
                ]
            ],
            roles: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('role', 'required')
                    })
                ]
            ],
            phoneNumber: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'phone_number',
                            'required'
                        )
                    }),
                    RxwebValidators.pattern({
                        expression: {
                            mobilePhone: /^08[0-9]{8,12}$/
                        },
                        message: this._$errorMessage.getErrorMessageNonState(
                            'phone_number',
                            'mobile_phone_pattern',
                            '08'
                        )
                    })
                ]
            ]
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        // this.store.dispatch(UiActions.hideFooterAction());

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
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
}
