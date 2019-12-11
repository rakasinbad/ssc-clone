import { Platform } from '@angular/cdk/platform';
import { isPlatformBrowser } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { Observable, Subject } from 'rxjs';

import { AuthActions } from '../store/actions';
import { fromAuth } from '../store/reducers';
import { AuthSelectors } from '../store/selectors';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';

/**
 *
 *
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
    /**
     *
     *
     * @type {FormGroup}
     * @memberof LoginComponent
     */
    form: FormGroup;

    /**
     *
     *
     * @type {Observable<boolean>}
     * @memberof LoginComponent
     */
    isLoading$: Observable<boolean>;

    /**
     *
     *
     * @private
     * @type {Subject<void>}
     * @memberof LoginComponent
     */
    private _unSubs$: Subject<void>;

    /**
     * Creates an instance of LoginComponent.
     * @param {FormBuilder} formBuilder
     * @param {Store<fromAuth.FeatureState>} store
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {ErrorMessageService} errorMessageSvc
     * @memberof LoginComponent
     */
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private formBuilder: FormBuilder,
        private platform: Platform,
        private store: Store<fromAuth.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
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

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * OnInit
     * @memberof LoginComponent
     */
    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.isLoading$ = this.store.select(AuthSelectors.getIsLoading);

        this.form = this.formBuilder.group({
            username: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.email({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'email_pattern'
                        )
                    })
                ]
            ],
            password: [
                '',
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                })
            ]
        });
    }

    /**
     *
     * OnDestroy
     * @memberof LoginComponent
     */
    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     *
     * @param {NgForm} form
     * @returns {void}
     * @memberof LoginComponent
     */
    onLogin(form: NgForm): void {
        if (form.invalid) {
            return;
        }

        this.handlePrivateWindow()
            .then(res => {
                this.handleLogin(form);
            })
            .catch(err => {
                this._$notice.open('Please exit from Private Window', 'warning', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            });
    }

    /**
     *
     *
     * @param {string} field
     * @returns {string}
     * @memberof LoginComponent
     */
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

    private handleLogin(form: NgForm): void {
        this.store.dispatch(
            AuthActions.authLoginRequest({
                payload: {
                    username: form.value.username,
                    password: form.value.password
                }
            })
        );
    }

    private handlePrivateWindow(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (isPlatformBrowser(this.platformId)) {
                if (this.platform.FIREFOX) {
                    const db = indexedDB.open('test');

                    db.onerror = () => {
                        /* Firefox PB enabled */
                        reject('Private Browser is enable!');
                    };

                    db.onsuccess = () => {
                        /* Not enabled */
                        indexedDB.deleteDatabase('test');
                        resolve(true);
                    };
                } else if (this.platform.SAFARI) {
                    const storage = window.sessionStorage;

                    try {
                        storage.setItem('someKeyHere', 'test');
                        storage.removeItem('someKeyHere');
                        resolve(true);
                    } catch (e) {
                        if (e.code === DOMException.QUOTA_EXCEEDED_ERR && storage.length === 0) {
                            // Private here
                            reject('Private Browser is enable!');
                        }
                    }
                } else if (this.platform.EDGE) {
                    if (
                        !window.indexedDB &&
                        ((window as any).PointerEvent || (window as any).MSPointerEvent)
                    ) {
                        // Privacy Mode
                        reject('Private Browser is enable!');
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    }
}
