import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, LogService } from 'app/shared/helpers';
import { Role, User } from 'app/shared/models';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { InternalActions } from '../store/actions';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';

// import { Role } from 'app/main/pages/roles/role.model';
@Component({
    selector: 'app-internal-form',
    templateUrl: './internal-form.component.html',
    styleUrls: ['./internal-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InternalFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEdit: boolean;
    pageType: string;

    employee$: Observable<User>;
    isLoading$: Observable<boolean>;
    roles$: Observable<Role[]>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private storage: StorageMap,
        private store: Store<fromInternal.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$log: LogService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
        /* this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor edit user',
                            active: true
                        },
                        value: {
                            active: true
                        },
                        active: false
                    },
                    action: {
                        save: {
                            label: 'Simpan',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: true
                        }
                    }
                }
            })
        );
        this.store.dispatch(UiActions.showFooterAction()); */

        const { id } = this.route.snapshot.params;

        if (id === 'new') {
            this.pageType = 'new';
        } else {
            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        //    {
                        //        title: 'Account',
                        //        translate: 'BREADCRUMBS.ACCOUNT'
                        //    },
                        {
                            title: 'Internal',
                            translate: 'BREADCRUMBS.INTERNAL'
                        },
                        {
                            title: 'Detail',
                            translate: 'BREADCRUMBS.DETAIL',
                            active: true
                        }
                    ]
                })
            );

            this.pageType = 'edit';
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this.isEdit = false;

        this.initForm();

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            this.employee$ = this.store.select(InternalSelectors.getInternalEmployee);
            this.store.dispatch(InternalActions.fetchInternalEmployeeRequest({ payload: id }));
        }

        this.roles$ = this.store.select(DropdownSelectors.getRoleDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownRoleRequest());

        this.isLoading$ = this.store.select(InternalSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(InternalActions.resetInternalEmployee());

        this.storage.delete('selected.internal.employee').subscribe(() => {});

        this._unSubs$.next();
        this._unSubs$.complete();
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

    onEdit(isEdit: boolean): void {
        this.isEdit = isEdit ? false : true;
        this.formStatus();
    }

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const { id } = this.route.snapshot.params;

        // const fullNameField = this.form.get('fullName');
        // const rolesField = this.form.get('roles');
        // const emailField = this.form.get('email');
        // const phoneNumberField = this.form.get('phoneNumber');
        const body = this.form.value;
        const {
            fullName: fullNameField,
            roles: rolesField,
            phoneNumber: phoneNumberField,
            email: emailField
        } = this.form.controls;

        if (this.pageType === 'new') {
            this.store
                .select(AuthSelectors.getUserSupplier)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(({ supplierId }) => {
                    // console.log('AUTH SELECTORS', user);

                    this._$log.generateGroup(`[AUTH SELECTORS]`, {
                        supplierId: {
                            type: 'log',
                            value: supplierId
                        }
                    });

                    if (supplierId) {
                        const payload = {
                            fullName: body.fullName,
                            mobilePhoneNo: body.phoneNumber,
                            email: body.email,
                            roles: body.roles,
                            supplierId: supplierId
                        };

                        this._$log.generateGroup(`[SUBMIT CREATE INTERNAL EMPLOYEE]`, {
                            body: {
                                type: 'log',
                                value: body
                            },
                            payload: {
                                type: 'log',
                                value: payload
                            }
                        });

                        this.store.dispatch(
                            InternalActions.createInternalEmployeeRequest({ payload })
                        );
                    }
                });
        }

        if (this.isEdit && this.pageType === 'edit') {
            this.storage.get('selected.internal.employee').subscribe({
                next: (prev: User) => {
                    this._$log.generateGroup('[SELECTED EMPLOYEE]', {
                        prev: {
                            type: 'log',
                            value: prev
                        }
                    });

                    this._$log.generateGroup('[BEFORE FILTER]', {
                        body: {
                            type: 'log',
                            value: body
                        }
                    });

                    if (
                        (fullNameField.dirty && fullNameField.value === prev.fullName) ||
                        (fullNameField.touched && fullNameField.value === prev.fullName) ||
                        (fullNameField.pristine && fullNameField.value === prev.fullName)
                    ) {
                        delete body.fullName;
                    }

                    if (
                        (phoneNumberField.dirty && phoneNumberField.value === prev.mobilePhoneNo) ||
                        (phoneNumberField.touched &&
                            phoneNumberField.value === prev.mobilePhoneNo) ||
                        (phoneNumberField.pristine && phoneNumberField.value === prev.mobilePhoneNo)
                    ) {
                        delete body.phoneNumber;
                    }

                    const prevRoles =
                        prev.roles && prev.roles.length > 0 ? prev.roles.map(role => role.id) : [];

                    if (
                        (rolesField.dirty &&
                            _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles))) ||
                        (rolesField.touched &&
                            _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles))) ||
                        (rolesField.pristine &&
                            _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles)))
                    ) {
                        delete body.roles;
                    }

                    if (
                        (emailField.dirty && emailField.value === prev.email) ||
                        (emailField.touched && emailField.value === prev.email) ||
                        (emailField.pristine && emailField.value === prev.email)
                    ) {
                        delete body.email;
                    }

                    const payload = {
                        fullName: body.fullName,
                        mobilePhoneNo: body.phoneNumber,
                        email: body.email,
                        roles: body.roles
                    };

                    if (!body.fullName) {
                        delete payload.fullName;
                    }

                    if (!body.email) {
                        delete payload.email;
                    }

                    if (!body.phoneNumber) {
                        delete payload.mobilePhoneNo;
                    }

                    if (!body.roles) {
                        delete payload.roles;
                    }

                    this._$log.generateGroup('[AFTER FILTER]', {
                        body: {
                            type: 'log',
                            value: body
                        },
                        payload: {
                            type: 'log',
                            value: payload
                        }
                    });

                    this.store.dispatch(
                        InternalActions.updateInternalEmployeeRequest({
                            payload: { id, body: payload }
                        })
                    );
                },
                error: err => {}
            });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.form = this.formBuilder.group({
            fullName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.alpha({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'alpha_pattern'
                        )
                    }),
                    RxwebValidators.maxLength({
                        value: 30,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
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
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.choice({
                        minLength: 1,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            email: [
                '',
                [
                    RxwebValidators.email({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'email_pattern'
                        )
                    })
                ]
            ],
            phoneNumber: [
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
            ]
        });

        if (this.pageType === 'edit') {
            this.initUpdateForm();
        }

        this.formStatus();
    }

    private initUpdateForm(): void {
        this.store
            .select(InternalSelectors.getInternalEmployee)
            .pipe(
                // withLatestFrom(this.store.select(DropdownSelectors.getRoleDropdownState)),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(employee => {
                if (employee) {
                    this.storage.set('selected.internal.employee', employee).subscribe(() => {});

                    this.form.patchValue({
                        fullName: employee.fullName,
                        phoneNumber: employee.mobilePhoneNo,
                        email: employee.email
                    });

                    const rolesGroup = this.form.get('roles');

                    this.store
                        .select(DropdownSelectors.getRoleDropdownState)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe(roles => {
                            if (employee.roles && employee.roles.length > 0) {
                                const currRoles = employee.roles
                                    .map((v, i) => {
                                        return v && v.id
                                            ? roles.findIndex(r => r.id === v.id) === -1
                                                ? null
                                                : v.id
                                            : null;
                                    })
                                    .filter(v => v !== null);

                                rolesGroup.patchValue(currRoles);
                                rolesGroup.updateValueAndValidity();
                            }

                            if (this.form.get('roles').errors) {
                                this.form.get('roles').markAsTouched();
                            }
                        });

                    if (this.form.get('fullName').errors) {
                        this.form.get('fullName').markAsTouched();
                    }

                    if (this.form.get('phoneNumber').errors) {
                        this.form.get('phoneNumber').markAsTouched();
                    }

                    if (this.form.get('email').errors) {
                        this.form.get('email').markAsTouched();
                    }
                }
            });
    }

    private formStatus(): void {
        if (this.isEdit === false && this.pageType === 'edit') {
            this.form.get('fullName').disable();
            this.form.get('roles').disable();
            this.form.get('email').disable();
            this.form.get('phoneNumber').disable();

            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Internal',
                            translate: 'BREADCRUMBS.INTERNAL'
                        },
                        {
                            title: 'Detail',
                            translate: 'BREADCRUMBS.DETAIL',
                            active: true
                        }
                    ]
                })
            );
        }

        if ((this.isEdit === true && this.pageType === 'edit') || this.pageType === 'new') {
            this.form.get('fullName').enable();
            this.form.get('roles').enable();
            this.form.get('email').enable();
            this.form.get('phoneNumber').enable();

            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Internal',
                            translate: 'BREADCRUMBS.INTERNAL'
                        },
                        {
                            title: this.pageType === 'edit' ? 'Edit' : 'Create',
                            translate:
                                this.pageType === 'edit'
                                    ? 'BREADCRUMBS.EDIT'
                                    : 'BREADCRUMBS.CREATE',
                            active: true
                        }
                    ]
                })
            );
        }
    }
}
