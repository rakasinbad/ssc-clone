import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { select, Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { Role, RolePlatform } from 'app/shared/models/role.model';
import { User } from 'app/shared/models/user.model';
import { DropdownActions, RegionActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, map, retry, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { IInternalEmployeeDetails } from '../models';
import { InternalActions, TeritoryActions } from '../store/actions';
import { fromInternal } from '../store/reducers';
import { InternalSelectors, TeritorySelectors } from '../store/selectors';
import { assetUrl } from 'single-spa/asset-url';
import { DialogWarehouseComponent } from '../dialog-warehouse/dialog-warehouse.component';
import { BranchWarehouse } from 'app/shared/models/branch.model';
import { WHDialogService } from '../services';
import { DELIVERY_APP, SELLER_CENTER } from './internal-form.const';
import { RoleApiService } from 'app/shared/helpers/role-api.service';
import { catchOffline } from '@ngx-pwa/offline';

@Component({
    selector: 'app-internal-form',
    templateUrl: './internal-form.component.html',
    styleUrls: ['./internal-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isEdit: boolean;
    pageType: string;
    warehouses: string[];

    // selectedWarehouse$: Observable<BranchWarehouse[]>;
    employee$: Observable<IInternalEmployeeDetails>;
    isLoading$: Observable<boolean>;

    allRoles: Array<Role>;
    roles$: Observable<Array<Role>>;

    selectedWarehouse: BranchWarehouse[] = [];
    selectedWarehouses$: Subscription;
    delivery_app = DELIVERY_APP;
    seller_center = SELLER_CENTER;

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
        private _$notice: NoticeService,
        private matDialog: MatDialog,
        private _$whDialog: WHDialogService,

        private _$roleApi: RoleApiService
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
                            title: 'Home',
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
                            active: true,
                        },
                    ],
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
            this.store.dispatch(InternalActions.fetchInternalWarehousesRequest({ payload: id }));
        }

        this.store.dispatch(DropdownActions.fetchDropdownRoleRequest());

        this.selectedWarehouses$ = this._$whDialog.currentSelectedWarehouses.subscribe((csw) => {
            this.selectedWarehouse = csw;

            const warehouses = this.form.get('warehouses');
            if (this.selectedWarehouse && this.selectedWarehouse.length > 0) {
                if (this.pageType === 'edit') {
                    warehouses.patchValue(
                        `${this.selectedWarehouse[0].warehouseName}${
                            this.selectedWarehouse.length - 1 > 1
                                ? ` & ${this.selectedWarehouse.length - 1} others`
                                : `${this.selectedWarehouse.length - 1 === 1 ? ` & 1 other` : ''}`
                        }`
                    );
                    warehouses.updateValueAndValidity();

                    if (warehouses.errors) {
                        warehouses.markAsTouched();
                    }
                } else {
                    warehouses.setValue(
                        `${this.selectedWarehouse[0].warehouseName}${
                            this.selectedWarehouse.length - 1 > 1
                                ? ` & ${this.selectedWarehouse.length - 1} others`
                                : `${this.selectedWarehouse.length - 1 === 1 ? ` & 1 other` : ''}`
                        }`
                    );
                }
            }
        });

        this.isLoading$ = this.store.select(InternalSelectors.getIsLoading);

        this.getRoles()
            .pipe(
                map(([rolesSsc, rolesDeliveryApp]) => {
                    return [...rolesSsc, ...rolesDeliveryApp];
                })
            )
            .subscribe((res) => {
                this.allRoles = res;

                this.roles$ = of(this.filterRolesByPlatform(res, SELLER_CENTER));
            });

        this.form.controls['platform'].valueChanges.subscribe((value) => {
            this.roles$ = of(this.filterRolesByPlatform(this.allRoles, value));

            if (value === this.delivery_app) {
                this.form.get('email').reset();
                this.form.get('email').disable();
            } else {
                this.form.get('email').enable();
            }
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.resetBreadcrumb());
        this.store.dispatch(InternalActions.resetInternalEmployee());
        this.store.dispatch(TeritoryActions.saveSelectedWarehouse({ payload: [] }));

        this.selectedWarehouses$.unsubscribe();
        this._$whDialog.reset();

        this.storage.delete('selected.internal.employee').subscribe(() => {});

        this._unSubs$.next();
        this._unSubs$.complete();
    }

    ngAfterViewInit(): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    private filterRolesByPlatform(data: Role[], platform: RolePlatform): Role[] {
        return data.filter((item) => item.platform === platform);
    }

    private getRoles(): Observable<any> {
        let supplierId = '';
        this.store
            .select(AuthSelectors.getUserState)
            .subscribe((res) => (supplierId = res.user.userSupplier.supplierId));

        const getRoleSsc = this._$roleApi
            .findAll<Role[]>(supplierId, { paginate: false, platform: 'sc' })
            .pipe(
                catchOffline(),
                retry(3),
                // map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                map((resp) => {
                    const newResp = resp && resp.length > 0 ? resp.map((row) => new Role(row)) : [];

                    return newResp;
                })
            );

        const getRoleDeliveryApp = this._$roleApi
            .findAll<Role[]>(supplierId, { paginate: false, platform: 'delivery-app' })
            .pipe(
                catchOffline(),
                retry(3),
                // map(resp => (!resp['data'] ? (resp as Role[]) : null)),
                map((resp) => {
                    const newResp = resp && resp.length > 0 ? resp.map((row) => new Role(row)) : [];

                    return newResp;
                })
            );

        return combineLatest([getRoleSsc, getRoleDeliveryApp]);
    }
    showDialogWarehouse() {
        const dialogWarehouseRef = this.matDialog.open<DialogWarehouseComponent, any, string>(
            DialogWarehouseComponent,
            {
                data: {
                    platform: this.form.get('platform').value,
                },
            }
        );
        return dialogWarehouseRef.afterClosed();
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

    onEdit(isEdit: boolean): void {
        if (!isEdit) {
            const { id } = this.route.snapshot.params;
            this.router.navigateByUrl(`/pages/account/internal/${id}/edit`);
        } else {
            this.onSubmit();
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
            email: emailField,
            platform: platformField,
        } = this.form.controls;

        if (this.pageType === 'new') {
            const canCreate = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.CREATE');

            canCreate.then((hasAccess) => {
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
                                    supplierId: supplierId,
                                    warehouses: this.selectedWarehouse.map((sw) =>
                                        sw.id.toString()
                                    ),
                                    platform: body.platform,
                                };

                                this.store.dispatch(
                                    InternalActions.createInternalEmployeeRequest({ payload })
                                );
                            }
                        });
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                }
            });
        }

        if (this.isEdit && this.pageType === 'edit') {
            const canUpdate = this.ngxPermissions.hasPermission('ACCOUNT.INTERNAL.UPDATE');

            canUpdate.then((hasAccess) => {
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
                                    ? prev.roles.map((role) => role.id)
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

                            if (
                                (platformField.dirty && platformField.value === prev.platform) ||
                                (platformField.touched && platformField.value === prev.platform) ||
                                (platformField.pristine && platformField.value === prev.platform)
                            ) {
                                delete body.platform;
                            }

                            // if (
                            //     (warehouseField.dirty) ||
                            //     (warehouseField.touched) ||
                            //     (warehouseField.pristine)
                            // ) {
                            //     delete body.warehouses;
                            // }

                            const payload = {
                                fullName: body.fullName,
                                mobilePhoneNo: body.phoneNumber,
                                email: body.email,
                                roles: body.roles,
                                warehouses: this.selectedWarehouse.map((sw) => sw.id.toString()),
                                platform: body.platform,
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

                            if (!body.platform) {
                                delete payload.platform;
                            }

                            // if (!body.warehouses) {
                            //     delete payload.warehouses
                            // }

                            this.store.dispatch(
                                InternalActions.updateInternalEmployeeRequest({
                                    payload: { id, body: payload },
                                })
                            );
                        },
                        error: (err) => {},
                    });
                } else {
                    this._$notice.open('Sorry, permission denied!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
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
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.alpha({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'alpha_pattern'
                        ),
                    }),
                    RxwebValidators.maxLength({
                        value: 30,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'max_length',
                            30
                        ),
                    }),
                ],
            ],
            platform: [
                'Sinbad Seller Center',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            roles: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.choice({
                        minLength: 1,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            email: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.email({
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'email_pattern'
                        ),
                    }),
                ],
            ],
            phoneNumber: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.pattern({
                        expression: {
                            mobilePhone: /^08[0-9]{8,12}$/,
                        },
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'mobile_phone_pattern',
                            '08'
                        ),
                    }),
                ],
            ],
            warehouses: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
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
            .subscribe((employee) => {
                if (employee) {
                    this.storage.set('selected.internal.employee', employee).subscribe(() => {});

                    this.form.patchValue({
                        fullName: employee.fullName,
                        phoneNumber: employee.mobilePhoneNo,
                        email: employee.email,
                    });

                    const rolesGroup = this.form.get('roles');

                    this.store
                        .select(DropdownSelectors.getRoleDropdownState)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe((roles) => {
                            if (employee.roleIds && employee.roleIds.length > 0) {
                                const currRoles = employee.roleIds
                                    .map((v) => {
                                        return v
                                            ? roles.findIndex((r) => r.id === v.toString()) === -1
                                                ? null
                                                : v.toString()
                                            : null;
                                    })
                                    .filter((v) => v !== null);

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

                    this.store
                        .select(InternalSelectors.getSelectedInternalRegionIds)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe((selectedRegion) => {
                            if (selectedRegion && selectedRegion.length > 0) {
                                this._$whDialog.changeRegions(
                                    selectedRegion.map((sr) => Number(sr))
                                );
                            }
                        });
                    this.store
                        .select(InternalSelectors.getSelectedInternalBranchIds)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe((selectedBranch) => {
                            if (selectedBranch && selectedBranch.length > 0) {
                                this._$whDialog.changeBranches(
                                    selectedBranch.map((sb) => Number(sb))
                                );
                            }
                        });

                    this.store
                        .select(InternalSelectors.getSelectedInternalWarehouses)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe((selectedWarehouses) => {
                            if (selectedWarehouses && selectedWarehouses.length > 0) {
                                this._$whDialog.changeWarehouses(selectedWarehouses);
                            }
                        });
                }
            });
    }

    private formStatus(): void {
        if (this.isEdit === false && this.pageType === 'edit') {
            this.form.get('fullName').disable();
            this.form.get('roles').disable();
            this.form.get('email').disable();
            this.form.get('phoneNumber').disable();
            this.form.get('warehouses').disable();

            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
                            // translate: 'BREADCRUMBS.HOME'
                        },
                        {
                            title: 'User Management',
                        },
                        {
                            title: 'Detail',
                            translate: 'BREADCRUMBS.DETAIL',
                            active: true,
                        },
                    ],
                })
            );
        }

        if ((this.isEdit === true && this.pageType === 'edit') || this.pageType === 'new') {
            this.form.get('fullName').enable();
            this.form.get('roles').enable();
            this.form.get('email').enable();
            this.form.get('phoneNumber').enable();
            this.form.get('warehouses').enable();

            // Set breadcrumbs
            this.store.dispatch(
                UiActions.createBreadcrumb({
                    payload: [
                        {
                            title: 'Home',
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
                            active: true,
                        },
                    ],
                })
            );
        }
    }
}
