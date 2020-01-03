import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    Input
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { LifecyclePlatform } from 'app/shared/models';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import * as fromJourneyPlans from '../../store/reducers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';

@Component({
    selector: 'app-journey-plan-store',
    templateUrl: './journey-plan-store.component.html',
    styleUrls: ['./journey-plan-store.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JourneyPlanStoreComponent implements OnInit {
    form: FormGroup;

    @Input() readonly pageType: 'new' | 'edit' = 'new';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
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

        return !value ? true : value.length <= minLength;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        if (this.pageType === 'new') {
            this.form = this.formBuilder.group({
                startDate: [
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
                endDate: '',
                portfolio: ''
            });
        }
    }
}
