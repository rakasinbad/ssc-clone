import { LifecycleHooks } from '@angular/compiler/src/lifecycle_reflector';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import * as fromSalesReps from '../../store/reducers';

@Component({
    selector: 'app-sales-rep-info',
    templateUrl: './sales-rep-info.component.html',
    styleUrls: ['./sales-rep-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepInfoComponent implements OnInit {
    form: FormGroup;
    pageType: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();

        this._initForm();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecycleHooks} [lifeCycle]
     * @memberof SalesRepInfoComponent
     */
    private _initPage(lifeCycle?: LifecycleHooks): void {
        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }
    }

    /**
     *
     * Initialize form
     * @private
     * @memberof SalesRepInfoComponent
     */
    private _initForm(): void {
        this.form = this.formBuilder.group({
            name: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.alpha({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            phone: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
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
            nik: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            // area: '',
            status: ''
        });
    }
}
