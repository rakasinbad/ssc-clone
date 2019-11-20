// import {
//     ChangeDetectionStrategy,
//     Component,
//     OnDestroy,
//     OnInit,
//     ViewEncapsulation
// } from '@angular/core';
// import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
// import { MatCheckboxChange } from '@angular/material/checkbox';
// import { ActivatedRoute } from '@angular/router';
// import { fuseAnimations } from '@fuse/animations';
// import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
// import { select, Store } from '@ngrx/store';
// import { StorageMap } from '@ngx-pwa/local-storage';
// import { RxwebValidators } from '@rxweb/reactive-form-validators';
// import { ErrorMessageService } from 'app/shared/helpers';
// import { DropdownSelectors } from 'app/shared/store/selectors';
// import * as fromRoot from 'app/store/app.reducer';
// import * as _ from 'lodash';
// import { Observable, Subject } from 'rxjs';
// import { distinctUntilChanged, takeUntil, withLatestFrom } from 'rxjs/operators';

// import { IRole, Role } from '../../roles/role.model';
// import { locale as english } from '../i18n/en';
// import { Account } from '../models/account.model';
// import { AccountActions } from '../store/actions';
// import { AccountSelectors } from '../store/selectors';

// @Component({
//     selector: 'app-account-form',
//     templateUrl: './account-form.component.html',
//     styleUrls: ['./account-form.component.scss'],
//     animations: fuseAnimations,
//     encapsulation: ViewEncapsulation.None,
//     changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class AccountFormComponent implements OnInit, OnDestroy {
//     account: Account;
//     form: FormGroup;
//     pageType: string;

//     account$: Observable<Account>;
//     roles$: Observable<Role[]>;
//     isLoading$: Observable<boolean>;

//     private _unSubs$: Subject<void>;

//     constructor(
//         private formBuilder: FormBuilder,
//         private route: ActivatedRoute,
//         private storage: StorageMap,
//         private store: Store<fromRoot.State>,
//         private _fuseTranslationLoaderService: FuseTranslationLoaderService,
//         private errorMessageSvc: ErrorMessageService
//     ) {
//         this._fuseTranslationLoaderService.loadTranslations(english);
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Lifecycle hooks
//     // -----------------------------------------------------------------------------------------------------

//     ngOnInit(): void {
//         // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
//         // Add 'implements OnInit' to the class.

//         this._unSubs$ = new Subject<void>();
//         this.roles$ = this.store.select(DropdownSelectors.getRoleDropdownState);
//         this.isLoading$ = this.store.select(AccountSelectors.getIsLoading);

//         const { id } = this.route.snapshot.params;

//         this.initForm();

//         if (id === 'new') {
//             this.account = null;
//             this.pageType = 'new';
//         } else {
//             this.account$ = this.store.select(AccountSelectors.getSelectedAccount);
//             this.initUpdateForm();
//             this.pageType = 'edit';
//         }
//     }

//     ngOnDestroy(): void {
//         // Called once, before the instance is destroyed.
//         // Add 'implements OnDestroy' to the class.

//         if (this._unSubs$) {
//             this._unSubs$.next();
//             this._unSubs$.complete();
//         }
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     get formRole(): FormArray {
//         return this.form.get('roles') as FormArray;
//     }

//     getErrorMessage(field: string): string {
//         if (field) {
//             const { errors } = this.form.get(field);

//             console.log('GET ERR MESSAGE', errors);

//             if (errors) {
//                 const type = Object.keys(errors)[0];

//                 if (type) {
//                     return errors[type].message;
//                 }
//             }
//         }
//     }

//     onCheckRole(ev: MatCheckboxChange): void {
//         const rolesField = this.form.get('roles') as FormArray;

//         if (ev.checked) {
//             rolesField.push(this.formBuilder.control(ev.source.value));
//         } else {
//             // rolesField.controls.forEach((roleControl, i) => {
//             //     if (roleControl.value === ev.source.value) {
//             //         rolesField.removeAt(i);
//             //         return;
//             //     }
//             // });

//             const idx = rolesField.controls.findIndex(
//                 roleCtrl => roleCtrl.value === ev.source.value
//             );
//             rolesField.removeAt(idx);
//         }
//     }

//     onCheckedRoleValidate(valueA: IRole[], valueB: string): boolean {
//         if (!valueA || !valueB) {
//             return false;
//         }

//         const idx = valueA.findIndex(x => x.id === valueB);

//         return idx === -1 ? false : true;
//     }

//     onSubmit(action: string): void {
//         if (this.form.invalid) {
//             return;
//         }

//         const fullNameField = this.form.get('fullName');
//         const emailField = this.form.get('email');
//         const mobileField = this.form.get('mobilePhone');
//         const phoneField = this.form.get('phone');
//         const statusField = this.form.get('status');
//         const rolesField = this.form.get('roles');
//         const account = this.form.value;

//         switch (action) {
//             case 'new':
//                 if (
//                     (emailField.dirty && !emailField.value) ||
//                     (emailField.pristine && !emailField.value) ||
//                     (emailField.touched && !emailField.value)
//                 ) {
//                     delete account.email;
//                 }

//                 if (
//                     (phoneField.dirty && !phoneField.value) ||
//                     (phoneField.pristine && !phoneField.value) ||
//                     (phoneField.touched && !phoneField.value)
//                 ) {
//                     delete account.phone;
//                 }

//                 if (
//                     (statusField.dirty && !statusField.value) ||
//                     (statusField.pristine && !statusField.value) ||
//                     (statusField.touched && !statusField.value)
//                 ) {
//                     statusField.patchValue('inactive');
//                 }

//                 this.store.dispatch(AccountActions.createAccountRequest({ payload: account }));
//                 break;

//             case 'edit':
//                 const { id } = this.route.snapshot.params;

//                 this.storage.get('selectedAccount').subscribe({
//                     next: (prev: Account) => {
//                         if (
//                             (fullNameField.dirty && fullNameField.value === prev.fullName) ||
//                             (fullNameField.touched && fullNameField.value === prev.fullName) ||
//                             (fullNameField.pristine && fullNameField.value === prev.fullName)
//                         ) {
//                             delete account.fullname;
//                         }

//                         if (
//                             (emailField.dirty && emailField.value === prev.email) ||
//                             (emailField.touched && emailField.value === prev.email) ||
//                             (emailField.pristine && emailField.value === prev.email)
//                         ) {
//                             delete account.email;
//                         }

//                         if (
//                             (mobileField.dirty && mobileField.value === prev.mobilePhoneNo) ||
//                             (mobileField.touched && mobileField.value === prev.mobilePhoneNo) ||
//                             (mobileField.pristine && mobileField.value === prev.mobilePhoneNo)
//                         ) {
//                             delete account.mobilePhone;
//                         }

//                         if (
//                             (phoneField.dirty && phoneField.value === prev.phoneNo) ||
//                             (phoneField.touched && phoneField.value === prev.phoneNo) ||
//                             (phoneField.pristine && phoneField.value === prev.phoneNo)
//                         ) {
//                             delete account.phone;
//                         }

//                         if (
//                             (statusField.dirty && statusField.value === prev.status) ||
//                             (statusField.touched && statusField.value === prev.status) ||
//                             (statusField.pristine && statusField.value === prev.status)
//                         ) {
//                             delete account.status;
//                         }

//                         const prevRoles =
//                             prev.roles && prev.roles.length > 0
//                                 ? [...prev.roles.map(role => role.id)]
//                                 : [];

//                         if (
//                             (rolesField.dirty &&
//                                 _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles))) ||
//                             (rolesField.touched &&
//                                 _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles))) ||
//                             (rolesField.pristine &&
//                                 _.isEqual(_.sortBy(rolesField.value), _.sortBy(prevRoles)))
//                         ) {
//                             delete account.roles;
//                         }

//                         this.store.dispatch(
//                             AccountActions.updateAccountRequest({
//                                 payload: {
//                                     body: account,
//                                     id: id
//                                 }
//                             })
//                         );
//                     },
//                     error: err => {}
//                 });
//                 break;

//             default:
//                 return;
//         }

//         // this.form.get('roles').value.map((v, i) => {

//         //     return v ?
//         // })

//         // const rolesGroup = this.form.controls.roles as FormArray;
//     }

//     saveAccount(): void {}

//     // -----------------------------------------------------------------------------------------------------
//     // @ Private methods
//     // -----------------------------------------------------------------------------------------------------

//     private initForm(): void {
//         this.form = this.formBuilder.group({
//             fullName: [
//                 '',
//                 [
//                     RxwebValidators.required({
//                         message: this.errorMessageSvc.getErrorMessageNonState(
//                             'full_name',
//                             'required'
//                         )
//                     }),
//                     RxwebValidators.alpha({
//                         allowWhiteSpace: true,
//                         message: this.errorMessageSvc.getErrorMessageNonState(
//                             'full_name',
//                             'alpha_pattern'
//                         )
//                     }),
//                     RxwebValidators.maxLength({
//                         value: 30,
//                         message: this.errorMessageSvc.getErrorMessageNonState(
//                             'full_name',
//                             'max_length',
//                             30
//                         )
//                     })
//                 ]
//             ],
//             email: [
//                 '',
//                 RxwebValidators.email({
//                     message: this.errorMessageSvc.getErrorMessageNonState('email', 'email_pattern')
//                 })
//             ],
//             mobilePhone: [
//                 '',
//                 [
//                     RxwebValidators.required({
//                         message: this.errorMessageSvc.getErrorMessageNonState(
//                             'mobile_phone',
//                             'required'
//                         )
//                     }),
//                     RxwebValidators.pattern({
//                         expression: {
//                             mobilePhone: /^08[0-9]{8,12}$/
//                         },
//                         message: this.errorMessageSvc.getErrorMessageNonState(
//                             'mobile_phone',
//                             'mobile_phone_pattern',
//                             '08'
//                         )
//                     })
//                 ]
//             ],
//             phone: [''],
//             status: [''],
//             roles: this.formBuilder.array([])
//         });

//         this.form.controls.fullName.valueChanges.subscribe(x =>
//             console.log(this.form.get('fullName'))
//         );
//     }

//     private initUpdateForm(): void {
//         this.store
//             .pipe(
//                 select(AccountSelectors.getSelectedAccount),
//                 withLatestFrom(this.store.select(DropdownSelectors.getRoleDropdownState)),
//                 distinctUntilChanged(),
//                 takeUntil(this._unSubs$)
//             )
//             .subscribe(([selectedAccount, role]) => {
//                 if (selectedAccount && role) {
//                     this.storage.set('selectedAccount', selectedAccount).subscribe(() => {});
//                     this.form.patchValue({
//                         fullName: selectedAccount.fullName,
//                         email: selectedAccount.email,
//                         mobilePhone: selectedAccount.mobilePhoneNo,
//                         phone: selectedAccount.phoneNo,
//                         status: selectedAccount.status
//                     });

//                     const rolesGroup = this.form.get('roles') as FormArray;

//                     if (selectedAccount.roles && selectedAccount.roles.length > 0) {
//                         selectedAccount.roles
//                             .map((v, i) => {
//                                 return v && v.id
//                                     ? role.findIndex(r => r.id === v.id) === -1
//                                         ? null
//                                         : v.id
//                                     : null;
//                             })
//                             .filter(v => v !== null)
//                             .map(i => {
//                                 rolesGroup.push(this.formBuilder.control(i));
//                                 rolesGroup.updateValueAndValidity();
//                                 return i;
//                             });
//                     }

//                     if (this.form.get('fullName').errors) {
//                         this.form.get('fullName').markAsTouched();
//                     }

//                     if (this.form.get('email').errors) {
//                         this.form.get('email').markAsTouched();
//                     }

//                     if (this.form.get('mobilePhone').errors) {
//                         this.form.get('mobilePhone').markAsTouched();
//                     }

//                     if (this.form.get('phone').errors) {
//                         this.form.get('phone').markAsTouched();
//                     }

//                     if (this.form.get('status').errors) {
//                         this.form.get('status').markAsTouched();
//                     }

//                     if (this.form.get('roles').errors) {
//                         this.form.get('roles').markAsTouched();
//                     }
//                 }
//             });
//     }
// }
