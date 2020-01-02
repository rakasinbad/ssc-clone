import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { LifecyclePlatform, UserStatus, EStatus } from 'app/shared/models';
import { FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import * as numeral from 'numeral';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { locale as english } from '../../i18n/en';
import { locale as indonesian } from '../../i18n/id';
import { SalesRep, SalesRepForm, SalesRepFormPatch } from '../../models';
import { SalesRepActions } from '../../store/actions';
import * as fromSalesReps from '../../store/reducers';
import { SalesRepSelectors } from '../../store/selectors';

type TmpKey = 'photo';

@Component({
    selector: 'app-sales-rep-info',
    templateUrl: './sales-rep-info.component.html',
    styleUrls: ['./sales-rep-info.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepInfoComponent implements OnInit, OnDestroy {
    form: FormGroup;
    tmp: Partial<Record<TmpKey, FormControl>> = {};

    salesRep$: Observable<SalesRep>;

    @Input() readonly pageType: 'new' | 'edit' = 'new';
    @Output() fullNameValue = new EventEmitter();

    private _unSubs$: Subject<void>;

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

        this._unSubs$ = new Subject<void>();

        this._initPage();

        this._initForm();

        // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
        this.form.statusChanges
            .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(status => {
                this._setFormStatus(status);
            });

        // Handle fullName value
        this.form
            .get('name')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
            .subscribe(v => {
                this.fullNameValue.emit(v);
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

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        // console.log('CHANGE', inputEl.files.length);

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            // console.log('URL', window.URL.createObjectURL(file));

            if (file) {
                switch (type) {
                    case 'photo':
                        {
                            const photoField = this.form.get('photo');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                photoField.setValue(fileReader.result);
                                this.tmp['photo'].setValue(file.name);

                                if (photoField.invalid) {
                                    photoField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    default:
                        break;
                }
            }
        } else {
            switch (type) {
                case 'photo':
                    {
                        this.form.get('photo').reset();
                        this.tmp['photo'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SalesRepInfoComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        const { id } = this.route.snapshot.params;

        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
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
     * @memberof SalesRepInfoComponent
     */
    private _initForm(): void {
        if (this.pageType === 'new') {
            this.tmp['photo'] = new FormControl({ value: '', disabled: true });

            this.form = this.formBuilder.group({
                name: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.alpha({
                            allowWhiteSpace: true,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        })
                    ]
                ],
                phone: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
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
                newPassword: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
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
                    ]
                ],
                confirmPassword: [
                    '',
                    [
                        RxwebValidators.compare({
                            fieldName: 'newPassword',
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'confirm_password'
                            )
                        })
                    ]
                ],
                photo: [
                    '',
                    [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(5 * 1000 * 1000),
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                            )
                        })
                    ]
                ],
                identityId: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.digit({
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        }),
                        RxwebValidators.minLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        }),
                        RxwebValidators.maxLength({
                            value: 16,
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'pattern'
                            )
                        })
                    ]
                ],
                // area: '',
                status: ''
            });
        } else {
            this._initEditForm();
        }
    }

    private _initEditForm(): void {
        this.tmp['photo'] = new FormControl({ value: '', disabled: true });

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
            photo: [
                '',
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(5 * 1000 * 1000),
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        )
                    })
                ]
            ],
            identityId: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.minLength({
                        value: 16,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.maxLength({
                        value: 16,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            // area: '',
            status: ''
        });

        this.store
            .select(SalesRepSelectors.getSelectedItem)
            .pipe(
                filter(v => !!v),
                takeUntil(this._unSubs$)
            )
            .subscribe(row => {
                const nameField = this.form.get('name');
                const phoneField = this.form.get('phone');
                const identityIdField = this.form.get('identityId');
                const statusField = this.form.get('status');

                if (row.user) {
                    if (row.user.fullName) {
                        nameField.setValue(row.user.fullName);
                    }

                    if (nameField.invalid) {
                        nameField.markAsTouched();
                    }

                    if (row.user.mobilePhoneNo) {
                        phoneField.setValue(row.user.mobilePhoneNo);
                    }

                    if (phoneField.invalid) {
                        phoneField.markAsTouched();
                    }

                    if (row.user.idNo) {
                        identityIdField.setValue(row.user.idNo);
                    }

                    if (identityIdField.invalid) {
                        identityIdField.markAsTouched();
                    }
                }

                if (row.status) {
                    const status = row.status === 'active' ? true : false;

                    statusField.setValue(status);
                }

                if (statusField.invalid) {
                    statusField.markAsTouched();
                }

                this._setFormStatus(this.form.status);
            });
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (this.pageType === 'new') {
            const payload: SalesRepForm = {
                fullName: body.name,
                mobilePhoneNo: body.phone,
                password: body.newPassword,
                confPassword: body.confirmPassword,
                idNo: body.identityId,
                image: body.photo,
                status: body.status ? EStatus.ACTIVE : EStatus.INACTIVE,
                supplierId: null
            };

            this.store.dispatch(SalesRepActions.createSalesRepRequest({ payload }));
        }

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            const payload: SalesRepFormPatch = {
                fullName: body.name,
                mobilePhoneNo: body.phone,
                idNo: body.identityId,
                image: body.photo,
                status: body.status ? EStatus.ACTIVE : EStatus.INACTIVE
            };

            if (!body.name) {
                delete payload.fullName;
            }

            if (!body.phone) {
                delete payload.mobilePhoneNo;
            }

            if (!body.identityId) {
                delete payload.idNo;
            }

            if (!body.photo) {
                delete payload.image;
            }

            if (typeof body.status !== 'boolean') {
                delete payload.status;
            }

            if (Object.keys(payload).length > 0) {
                this.store.dispatch(
                    SalesRepActions.updateSalesRepRequest({ payload: { body: payload, id } })
                );
            }
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
