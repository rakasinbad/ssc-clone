import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { select, Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { Role } from 'app/shared/models/role.model';
import { User } from 'app/shared/models/user.model';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { IInternalEmployeeDetails } from '../models';
import { InternalActions } from '../store/actions';
import { fromInternal } from '../store/reducers';
import { InternalSelectors } from '../store/selectors';
import { assetUrl } from 'single-spa/asset-url';

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

    employee$: Observable<IInternalEmployeeDetails>;
    isLoading$: Observable<boolean>;
    roles$: Observable<Array<Role>>;

    private _unSubs$: Subject<void> = new Subject<void>();

    // Assets
    sinbadProfileDefault = assetUrl('images/avatars/profile.jpg');

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private ngxPermissions: NgxPermissionsService,
        private storage: StorageMap,
        private store: Store<fromInternal.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
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

        const { type } = this.route.snapshot.data;

        if (type === 'new') {
            this.pageType = 'new';
        } else {
            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home'
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        //    {
                        //        title: 'Account',
                        //        translate: 'BREADCRUMBS.ACCOUNT'
                        //    },
                        {
                            title: 'User Management',
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
        const { type } = this.route.snapshot.data;
        this.isEdit = false;

        if (type === 'edit') {
            this.isEdit = true;
        }

        this.initForm();

        if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            this.employee$ = this.store.select(InternalSelectors.getInternalEmployee);
            this.store.dispatch(InternalActions.fetchInternalEmployeeRequest({ payload: id }));
        }

        this.roles$ = this.store.pipe(select(DropdownSelectors.getRoleDropdownStateByType('2')));
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
        if (!isEdit) {
            const { id } = this.route.snapshot.params;
            this.router.navigateByUrl(`/pages/account/internal/${id}/edit`);
        }
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
            const canCreate = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.CREATE');

            canCreate.then(hasAccess => {
                if (hasAccess) {
                    this.store
                        .select(AuthSelectors.getUserSupplier)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe(({ supplierId }) => {
                            if (supplierId) {
                                const payload = {
                                    fullName: body.fullName,
                                    mobilePhoneNo: body.phoneNumber,
                                    email: body.email,
                                    roles: body.roles,
                                    supplierId: supplierId
                                };

                                this.store.dispatch(
                                    InternalActions.createInternalEmployeeRequest({ payload })
                                );
                            }
                        });
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
            });
        }

        if (this.isEdit && this.pageType === 'edit') {
            const canUpdate = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.UPDATE');

            canUpdate.then(hasAccess => {
                if (hasAccess) {
                    this.storage.get('selected.internal.employee').subscribe({
                        next: (prev: User) => {
                            if (
                                (fullNameField.dirty && fullNameField.value === prev.fullName) ||
                                (fullNameField.touched && fullNameField.value === prev.fullName) ||
                                (fullNameField.pristine && fullNameField.value === prev.fullName)
                            ) {
                                delete body.fullName;
                            }

                            if (
                                (phoneNumberField.dirty &&
                                    phoneNumberField.value === prev.mobilePhoneNo) ||
                                (phoneNumberField.touched &&
                                    phoneNumberField.value === prev.mobilePhoneNo) ||
                                (phoneNumberField.pristine &&
                                    phoneNumberField.value === prev.mobilePhoneNo)
                            ) {
                                delete body.phoneNumber;
                            }

                            const prevRoles =
                                prev.roles && prev.roles.length > 0
                                    ? prev.roles.map(role => role.id)
                                    : [];

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

                            this.store.dispatch(
                                InternalActions.updateInternalEmployeeRequest({
                                    payload: { id, body: payload }
                                })
                            );
                        },
                        error: err => {}
                    });
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                }
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
            platform: [
                'Sinbad Seller Center',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
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
                            if (employee.roleIds && employee.roleIds.length > 0) {
                                const currRoles = employee.roleIds
                                    .map((v) => {
                                        return v
                                            ? roles.findIndex(r => r.id === v.toString()) === -1
                                                ? null
                                                : v.toString()
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
                            title: 'Home'
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'User Management',
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
                            title: 'Home'
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'User Management',
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
