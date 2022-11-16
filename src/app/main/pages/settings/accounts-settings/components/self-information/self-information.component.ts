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

import { VerifyPasswordComponent } from '../verify-password/verify-password.component';

@Component({
    selector: 'app-self-information',
    templateUrl: './self-information.component.html',
    styleUrls: ['./self-information.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'content-card'
    },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfInformationComponent implements OnInit, OnDestroy {

    form: FormGroup;
    user$: Observable<User>;
    isRequesting$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private fb: FormBuilder,
        private matDialog: MatDialog,
        private _cd: ChangeDetectorRef,
        private _$errorMessage: ErrorMessageService,
        private store: Store<fromSettings.FeatureState>,
    ) {}

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();
        
        this.form = this.fb.group({
            userId: ['', RxwebValidators.required({
                message: this._$errorMessage.getErrorMessageNonState(
                    'default',
                    'required'
                )
            })],
            oldEmail: [''],
            newEmail: [''],
            oldPhone: [''],
            newPhone: [''],
            photo: ['']
        });

        this.form.get('newEmail')
            .valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                takeUntil(this._unSubs$)
            ).subscribe(value => {
                if (value) {
                    this.form.get('newEmail').setValidators(
                        RxwebValidators.email({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'email_pattern'
                            )
                        })
                    );
                } else {
                    this.form.get('newEmail').setValidators([]);
                }

                this._cd.markForCheck();
                this.form.get('newEmail').updateValueAndValidity();
            });

        this.form.get('newPhone')
            .valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                takeUntil(this._unSubs$)
            ).subscribe(value => {
                if (value) {
                    this.form.get('newPhone').setValidators(
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
                    );
                } else {
                    this.form.get('newPhone').setValidators([]);
                }

                this._cd.markForCheck();
                this.form.get('newPhone').updateValueAndValidity();
            });

        this.form
            .valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                takeUntil(this._unSubs$)
            ).subscribe(({ newEmail, newPhone, photo }) => {
                if (!newEmail && !newPhone && !photo) {
                    this.form.markAsPristine();
                }

                this._cd.markForCheck();
            });


        this.isRequesting$ = this.store.select(SettingsSelectors.getRequestStatus);
    
        this.store
            .select(SettingsSelectors.getUser)
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserState),
                    (user, userState) => ({ user, userState })
                ),
                takeUntil(this._unSubs$)
            ).subscribe(({ user, userState }) => {
                if (!userState) {
                    return this.store.dispatch(SettingsActions.notifyError({
                        payload: 'Not authenticated'
                    }));
                }

                if (!user.data) {
                    this.store.dispatch(SettingsActions.fetchUserRequest({
                        payload: userState.user.id
                    }));
                } else {
                    this.form.patchValue({
                        userId: user.data.id,
                        oldEmail: user.data.email,
                        oldPhone: user.data.mobilePhoneNo
                    });
                }

                this._cd.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unSubs$.next();
        this._unSubs$.complete();
    }

    onFileBrowse($event: Event): void {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            const photo = this.form.get('photo');
            const fileReader = new FileReader();

            fileReader.onload = () => {
                photo.patchValue(fileReader.result);
                this.form.markAsTouched();
                this._cd.markForCheck();

            };

            fileReader.readAsDataURL(file);
        }

        return;
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
            const data: Partial<UpdateUser> = {
                userId: inputs.userId
            };

            if (inputs['newEmail']) {
                data['email'] = inputs['newEmail'];
            }

            if (inputs['newPhone']) {
                data['mobilePhoneNo'] = inputs['newPhone'];
            }

            if (inputs['photo']) {
                data['image'] = inputs['photo'];
            }

            this.matDialog.open(VerifyPasswordComponent, { width: '1366px', data });
        }
    }
}
