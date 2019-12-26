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
    selector: 'app-sales-rep-password',
    templateUrl: './sales-rep-password.component.html',
    styleUrls: ['./sales-rep-password.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepPasswordComponent implements OnInit {
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

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();

        this._initForm();
    }

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecycleHooks} [lifeCycle]
     * @memberof SalesRepPasswordComponent
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
     * @memberof SalesRepPasswordComponent
     */
    private _initForm(): void {
        this.form = this.formBuilder.group({
            password: '',
            confirmPassword: [
                '',
                RxwebValidators.compare({
                    fieldName: 'password',
                    message: this._$errorMessage.getErrorMessageNonState(
                        'default',
                        'confirm_password'
                    )
                })
            ]
        });
    }
}
