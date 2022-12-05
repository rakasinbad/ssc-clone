// import { environment } from 'environments/environment';
import {
    // AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    // ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
// import { IQueryParams } from 'app/shared/models';
// import { UiActions } from 'app/shared/store/actions';
// import { UiSelectors } from 'app/shared/store/selectors';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, withLatestFrom, debounceTime } from 'rxjs/operators';

import { UpdateUser, User } from '../../models';

import { SettingsActions } from '../../store/actions';
import { fromSettings } from '../../store/reducers';
import { SettingsSelectors } from '../../store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';

@Component({
    selector: 'app-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'content-card'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasswordComponent implements OnInit, OnDestroy {

    form: FormGroup;
    isRequesting$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private fb: FormBuilder,
        private _cd: ChangeDetectorRef,
        private _$errorMessage: ErrorMessageService,
        private store: Store<fromSettings.FeatureState>,
    ) {
        this.isRequesting$ = this.store.select(SettingsSelectors.getRequestStatus);
    }

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();
        
        this.form = this.fb.group({
            userId: ['', RxwebValidators.required({
                message: this._$errorMessage.getErrorMessageNonState(
                    'default',
                    'required'
                )
            })],
            oldPassword: ['', RxwebValidators.required({
                message: this._$errorMessage.getErrorMessageNonState(
                    'default',
                    'required'
                )
            })],
            newPassword: ['', [
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                }),
                RxwebValidators.different({
                    fieldName: 'oldPassword',
                    message: this._$errorMessage.getErrorMessageNonState(
                        'new_password',
                        'different',
                        {
                            fieldComparedName: 'password'
                        }
                    )
                }),
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
            ]],
            confirmNewPassword: ['', [
                RxwebValidators.compare({
                    fieldName: 'newPassword',
                    message: this._$errorMessage.getErrorMessageNonState(
                        'default',
                        'confirm_password'
                    )
                })
            ]],
        });

        this.store
            .select(AuthSelectors.getUserState)
            .pipe(
                takeUntil(this._unSubs$)
            ).subscribe(userState => {
                if (!userState) {
                    return this.store.dispatch(SettingsActions.notifyError({
                        payload: 'Not authenticated'
                    }));
                }

                this.form.patchValue({
                    userId: userState.user.id
                });

                this._cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
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

    onSubmit(): void {
        if (this.form.invalid || this.form.pristine) {
            // Do something here ...
        } else {
            const inputs = this.form.getRawValue();
            const { userId } = inputs;
            delete inputs['userId'];

            this.store.dispatch(
                SettingsActions.patchUserRequest({
                    payload: {
                        id: userId,
                        data: inputs,
                        update: 'password'
                    }
                })
            );
        }
    }
}
