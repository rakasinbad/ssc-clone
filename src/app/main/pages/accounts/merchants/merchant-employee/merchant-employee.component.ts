import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Role, User } from 'app/shared/models';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { MerchantApiService } from '../services';
import { StoreActions } from '../store/actions';
import { fromMerchant } from '../store/reducers';
import { StoreSelectors } from '../store/selectors';

// import { Role } from 'app/main/pages/roles/role.model';
@Component({
    selector: 'app-merchant-employee',
    templateUrl: './merchant-employee.component.html',
    styleUrls: ['./merchant-employee.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantEmployeeComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEdit: boolean;

    employee$: Observable<User>;
    isLoading$: Observable<boolean>;
    roles$: Observable<Role[]>;

    private _unSubs$: Subject<void>;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private storage: StorageMap,
        private store: Store<fromMerchant.FeatureState>,
        private _fuseConfigService: FuseConfigService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$errorMessage: ErrorMessageService,
        private _$merchantApi: MerchantApiService
    ) {
        // Configure the layout
        // this._fuseConfigService.config = {
        //     layout: {
        //         footer: {
        //             hidden: false
        //         }
        //     }
        // };
        // this.store.dispatch(UiActions.showFooterAction());
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Account',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE'
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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        // /^(08[0-9]{8,12}|[0-9]{6,8})?$/

        this._unSubs$ = new Subject<void>();
        this.isEdit = false;

        const { id } = this.route.snapshot.params;

        this.roles$ = this.store.select(DropdownSelectors.getRoleDropdownState);
        this.employee$ = this.store.select(StoreSelectors.getEmployeeEdit);
        this.isLoading$ = this.store.select(StoreSelectors.getIsLoading);
        this.store.dispatch(DropdownActions.fetchDropdownRoleRequest());
        this.store.dispatch(StoreActions.fetchStoreEmployeeEditRequest({ payload: id }));

        this.initForm();
        this.initUpdateForm();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // this.store.dispatch(UiActions.hideFooterAction());

        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(StoreActions.resetStoreEmployee());

        this.storage.delete('selected.store.employee').subscribe(() => {});

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get userId(): string {
        const { id } = this.route.snapshot.params;
        return id;
    }

    get storeId(): string {
        const { storeId } = this.route.snapshot.params;
        return storeId;
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

    goEmployeePage(): void {
        const { storeId } = this.route.snapshot.params;

        this.store.dispatch(StoreActions.goPage({ payload: 'employee' }));
        this.router.navigate(['/pages/account/stores', storeId, 'detail']);
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

        const fullNameField = this.form.get('fullName');
        const rolesField = this.form.get('roles');
        const phoneNumberField = this.form.get('phoneNumber');
        const body = this.form.value;

        this.storage.get('selected.store.employee').subscribe({
            next: (prev: User) => {
                console.log('SELECTED EMPLOYEE', prev);
                console.log('BEFORE FILTER', body);

                if (
                    (fullNameField.dirty && fullNameField.value === prev.fullName) ||
                    (fullNameField.touched && fullNameField.value === prev.fullName) ||
                    (fullNameField.pristine && fullNameField.value === prev.fullName)
                ) {
                    delete body.fullName;
                }

                if (
                    (phoneNumberField.dirty && phoneNumberField.value === prev.mobilePhoneNo) ||
                    (phoneNumberField.touched && phoneNumberField.value === prev.mobilePhoneNo) ||
                    (phoneNumberField.pristine && phoneNumberField.value === prev.mobilePhoneNo)
                ) {
                    delete body.phoneNumber;
                }

                const prevRoles =
                    prev.roles && prev.roles.length > 0 ? [...prev.roles.map(role => role.id)] : [];

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

                // if (body.roles) {
                //     if (body.roles.length < 1) {
                //         console.log('REMOVE ROLES 1', body.roles, rolesField);
                //         rolesField.patchValue(null);
                //         rolesField.updateValueAndValidity();
                //         return;
                //     }
                //     console.log('REMOVE ROLES 2', body.roles);
                // }

                console.log('AFTER FILTER', body);

                // this.store.dispatch(
                //     StoreActions.updateStoreEmployeeRequest({ payload: { body, id } })
                // );
            },
            error: err => {}
        });
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

        this.formStatus();
    }

    private initUpdateForm(): void {
        this.store
            .select(StoreSelectors.getEmployeeEdit)
            .pipe(
                // withLatestFrom(this.store.select(DropdownSelectors.getRoleDropdownState)),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(employee => {
                if (employee) {
                    this.storage.set('selected.store.employee', employee).subscribe(() => {});

                    this.form.patchValue({
                        fullName: employee.fullName,
                        phoneNumber: employee.mobilePhoneNo
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

                    // if (employee.roles && employee.roles.length > 0) {
                    //     const roles = employee.roles
                    //         .map((v, i) => {
                    //             return v && v.id
                    //                 ? role.findIndex(r => r.id === v.id) === -1
                    //                     ? null
                    //                     : v.id
                    //                 : null;
                    //         })
                    //         .filter(v => v !== null);
                    //     // .map(i => {
                    //     //     console.log('MAP', i);
                    //     //     // rolesGroup.patchValue(i);
                    //     //     // rolesGroup.updateValueAndValidity();
                    //     //     return i;
                    //     // });

                    //     rolesGroup.patchValue(roles);
                    //     rolesGroup.updateValueAndValidity();
                    // }

                    if (this.form.get('fullName').errors) {
                        this.form.get('fullName').markAsTouched();
                    }

                    if (this.form.get('phoneNumber').errors) {
                        this.form.get('phoneNumber').markAsTouched();
                    }

                    // if (this.form.get('roles').errors) {
                    //     this.form.get('roles').markAsTouched();
                    // }
                }
            });
    }

    private formStatus(): void {
        if (!this.isEdit) {
            this.form.get('fullName').disable();
            this.form.get('roles').disable();
            this.form.get('phoneNumber').disable();

            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Store',
                            translate: 'BREADCRUMBS.STORE'
                        },
                        {
                            title: 'Detail',
                            translate: 'BREADCRUMBS.DETAIL',
                            active: true
                        }
                    ]
                })
            );
        } else {
            this.form.get('fullName').enable();
            this.form.get('roles').enable();
            this.form.get('phoneNumber').enable();

            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'Account',
                            translate: 'BREADCRUMBS.ACCOUNT'
                        },
                        {
                            title: 'Store',
                            translate: 'BREADCRUMBS.STORE'
                        },
                        {
                            title: 'Edit',
                            translate: 'BREADCRUMBS.EDIT',
                            active: true
                        }
                    ]
                })
            );
        }
    }
}
