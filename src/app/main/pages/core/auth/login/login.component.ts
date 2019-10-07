import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { select, Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { AuthActions } from '../store/actions';
import { fromAuth } from '../store/reducers';
import { AuthSelectors } from '../store/selectors';
import { locale as english } from './i18n/en';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
    form: FormGroup;

    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<fromAuth.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private errorMessageSvc: ErrorMessageService
    ) {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        this._fuseTranslationLoaderService.loadTranslations(english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.isLoading$ = this.store.pipe(
            select(AuthSelectors.getIsLoading),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        this.form = this.formBuilder.group({
            username: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('email', 'required')
                    })
                    // RxwebValidators.email({
                    //     message: this.errorMessageSvc.getErrorMessageNonState(
                    //         'email',
                    //         'email_pattern'
                    //     )
                    // })
                ]
            ],
            password: [
                '',
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('password', 'required')
                })
            ]
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        if (this._unSubs$) {
            this._unSubs$.next();
            this._unSubs$.complete();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onLogin(form: NgForm): void {
        if (form.invalid) {
            return;
        }

        this.store.dispatch(
            AuthActions.authLoginRequest({
                payload: {
                    username: form.value.username,
                    password: form.value.password
                }
            })
        );
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
