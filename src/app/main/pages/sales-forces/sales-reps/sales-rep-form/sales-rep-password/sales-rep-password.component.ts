import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { SalesRep, SalesRepFormPasswordPut } from '../../models';
import { SalesRepActions } from '../../store/actions';
import * as fromSalesReps from '../../store/reducers';
import { SalesRepSelectors } from '../../store/selectors';

@Component({
    selector: 'app-sales-rep-password',
    templateUrl: './sales-rep-password.component.html',
    styleUrls: ['./sales-rep-password.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepPasswordComponent implements OnInit, OnDestroy {
    form: FormGroup;

    salesRep$: Observable<SalesRep>;

    @Input() readonly pageType: 'new' | 'edit' = 'edit';

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
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

        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this.form.statusChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(status => {
                this._setFormStatus(status);
            });

        // Handle save button action (footer)
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                this._onSubmit();
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
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SalesRepPasswordComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                if (this.pageType === 'edit') {
                    this.salesRep$ = this.store.select(SalesRepSelectors.getSelectedItem);
                }
                return;
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
            /* oldPassword: [
                '',
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ], */
            newPassword: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    /* RxwebValidators.different({
                        fieldName: 'oldPassword',
                        message: this._$errorMessage.getErrorMessageNonState(
                            'new_password',
                            'different',
                            {
                                fieldComparedName: 'Old Password'
                            }
                        )
                    }), */
                    RxwebValidators.password({
                        validation: {
                            alphabet: true,
                            digit: true,
                            lowerCase: true,
                            upperCase: true,
                            specialCharacter: true,
                            minLength: 8
                        },
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'password_unmeet_specification'
                        )
                    })
                ]
            ],
            confirmPassword: [
                '',
                RxwebValidators.compare({
                    fieldName: 'newPassword',
                    message: this._$errorMessage.getErrorMessageNonState(
                        'default',
                        'confirm_password'
                    )
                })
            ]
        });
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (this.pageType === 'edit') {
            const canUpdate = this.ngxPermissions.hasPermission('SRM.SR.UPDATE');

            canUpdate.then(hasAccess => {
                if (hasAccess) {
                    const { id } = this.route.snapshot.params;

                    const payload: SalesRepFormPasswordPut = {
                        // oldPassword: body.oldPassword,
                        password: body.newPassword,
                        confPassword: body.confirmPassword
                    };

                    if (Object.keys(payload).length === 3) {
                        this.store.dispatch(
                            SalesRepActions.changePasswordSalesRepRequest({
                                payload: { body: payload, id }
                            })
                        );
                    }
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
        }
    }

    private _setFormStatus(status: string): void {
        if (!status) {
            return;
        }

        if (status === 'VALID' || !this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID' || this.form.pristine) {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }
}
