import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { select, Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import * as moment from 'moment';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';

import { Attendance } from '../models/attendance.model';
import { AttendanceActions } from '../store/actions';
import { fromAttendance } from '../store/reducers';
import { AttendanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-attendance-employee-form',
    templateUrl: './attendance-employee-form.component.html',
    styleUrls: ['./attendance-employee-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceEmployeeFormComponent implements OnInit, OnDestroy, AfterViewInit {
    storeId: string;
    employeeId: string;
    activityId: string;

    attendance: Attendance;
    form: FormGroup;
    minCheckInDate: Date;
    maxCheckInDate: Date;
    minCheckOutDate: Date;
    maxCheckOutDate: Date;
    searchAccountCtrl: FormControl;
    toAccountHighlight: string;
    pageType: string;

    attendance$: Observable<Attendance>;
    filteredAccounts$: Observable<Account[]>;
    isLoading$: Observable<boolean>;

    attendanceTypes: Array<{ value: string; text: string }> = [
        {
            value: 'absent',
            text: 'Tidak Hadir'
        },
        {
            value: 'present',
            text: 'Hadir'
        },
        {
            value: 'leave',
            text: 'Cuti'
        }
    ];

    locationTypes: Array<{ value: string; text: string }> = [
        {
            value: 'inside',
            text: 'Kerja di Toko'
        },
        {
            value: 'outside',
            text: 'Kerja di Luar Toko'
        },
        {
            value: 'others',
            text: 'Lainnya'
        }
    ];

    private _unSubs$: Subject<void>;
    private _selectedAccount: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private storage: StorageMap,
        private store: Store<fromAttendance.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private errorMessageSvc: ErrorMessageService
    ) {
        const { storeId, employeeId, activityId } = this.route.snapshot.params;
        this.storeId = storeId;
        this.employeeId = employeeId;
        this.activityId = activityId;

        this.store.dispatch(AttendanceActions.fetchAttendanceRequest({ payload: this.activityId }));

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();
        this._selectedAccount = '';
        this.isLoading$ = this.store.pipe(
            select(AttendanceSelectors.getIsLoading),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );

        this.minCheckInDate = null;
        this.minCheckOutDate = null;
        this.maxCheckOutDate = new Date();
        this.maxCheckInDate = this.maxCheckOutDate;

        // this.searchAccountCtrl = new FormControl('', [
        //     RxwebValidators.required({
        //         message: this.errorMessageSvc.getErrorMessageNonState('account', 'required')
        //     }),
        //     RxwebValidators.email({
        //         conditionalExpression: (x, y) => {
        //             // tslint:disable-next-line: max-line-length
        //             const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //             const valid = pattern.test(x.email);
        //             return valid === true;
        //         },
        //         message: this.errorMessageSvc.getErrorMessageNonState('account', 'email_pattern')
        //     })
        // ]);

        this.toAccountHighlight = '';

        const { id } = this.route.snapshot.params;

        this.initForm();

        if (id === 'new') {
            this.attendance$ = of(null);
            this.pageType = 'new';
        } else {
            this.attendance$ = this.store.pipe(
                select(AttendanceSelectors.getAttendance),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            );
            this.initUpdateForm();
            this.pageType = 'edit';
        }

        // this.searchAccountCtrl.valueChanges
        //     .pipe(
        //         debounceTime(500),
        //         distinctUntilChanged(),
        //         map(v => {
        //             const data: IQueryParams = {
        //                 paginate: false,
        //                 search: [
        //                     {
        //                         fieldName: 'email',
        //                         keyword: v ? v.toString().trim() : null
        //                     }
        //                 ]
        //             };

        //             this.toAccountHighlight = v ? v.toString().trim() : null;

        //             this.store.dispatch(
        //                 DropdownActions.fetchSearchAccountRequest({
        //                     payload: data
        //                 })
        //             );

        //             return v;
        //         }),
        //         takeUntil(this._unSubs$)
        //     )
        //     .subscribe();

        // this.form
        //     .get('searchAccount')
        //     .valueChanges.pipe(
        //         debounceTime(500),
        //         distinctUntilChanged(),
        //         map(v => {
        //             const data: IQueryParams = {
        //                 paginate: false,
        //                 search: [
        //                     {
        //                         fieldName: 'email',
        //                         keyword: v ? v.toString().trim() : null
        //                     }
        //                 ]
        //             };

        //             this.toAccountHighlight = v ? v.toString().trim() : null;

        //             this.store.dispatch(
        //                 DropdownActions.fetchSearchAccountRequest({
        //                     payload: data
        //                 })
        //             );

        //             return v;
        //         }),
        //         takeUntil(this._unSubs$)
        //     )
        //     .subscribe(value => {
        //         if (value) {
        //             this.form.get('searchAccount').clearValidators();
        //             this.form.get('searchAccount').updateValueAndValidity();

        //             // tslint:disable-next-line: max-line-length
        //             const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //             const valid =
        //                 value && value.email ? pattern.test(value.email) : pattern.test(value);

        //             if (!valid) {
        //                 if (!this.form.get('searchAccount').hasError('email')) {
        //                     this.form.get('searchAccount').setValidators([
        //                         RxwebValidators.required({
        //                             message: this.errorMessageSvc.getErrorMessageNonState(
        //                                 'account',
        //                                 !this._selectedAccount && value ? 'selected' : 'required'
        //                             )
        //                         }),
        //                         RxwebValidators.email({
        //                             message: this.errorMessageSvc.getErrorMessageNonState(
        //                                 'account',
        //                                 'email_pattern'
        //                             )
        //                         })
        //                     ]);
        //                     this.form.get('searchAccount').updateValueAndValidity();
        //                 }
        //             } else {
        //                 this.form.get('searchAccount').setValidators([
        //                     RxwebValidators.required({
        //                         message: this.errorMessageSvc.getErrorMessageNonState(
        //                             'account',
        //                             !this._selectedAccount && value ? 'selected' : 'required'
        //                         )
        //                     })
        //                 ]);
        //                 this.form.get('searchAccount').updateValueAndValidity();
        //             }

        //             /* this.form.get('searchAccount').setValidators(
        //                 RxwebValidators.email({
        //                     message: this.errorMessageSvc.getErrorMessageNonState(
        //                         'account',
        //                         'email_pattern'
        //                     )
        //                 })
        //             );
        //             this.form.get('searchAccount').updateValueAndValidity();this.form.get('searchAccount').setValidators(
        //                 RxwebValidators.email({
        //                     message: this.errorMessageSvc.getErrorMessageNonState(
        //                         'account',
        //                         'email_pattern'
        //                     )
        //                 })
        //             );
        //             this.form.get('searchAccount').updateValueAndValidity(); */
        //         }
        //     });

        // this.filteredAccounts$ = this.store.pipe(
        //     select(DropdownSelectors.getAllSearchAccount),
        //     distinctUntilChanged(),
        //     takeUntil(this._unSubs$)
        // );
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: null
            })
        );

        if (this._unSubs$) {
            this._unSubs$.next();
            this._unSubs$.complete();
        }
    }

    ngAfterViewInit(): void {
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Attendances',
                        translate: 'BREADCRUMBS.ATTENDANCES',
                        active: true
                    }
                ]
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get selectedAccount(): string {
        return this._selectedAccount;
    }

    getErrorMessage(field: string, formCtrl?: boolean): string {
        if (!formCtrl) {
            if (field) {
                const { errors } = this.form.get(field);

                if (errors) {
                    const type = Object.keys(errors)[0];

                    if (type) {
                        return errors[type].message;
                    }
                }
            }
        } else {
            if (field === 'searchAccountCtrl') {
                const { errors } = this.searchAccountCtrl;

                if (errors) {
                    const type = Object.keys(errors)[0];

                    if (type) {
                        return errors[type].message;
                    }
                }
            }
        }
    }

    // displayFilterAccount(account?: Account): string | undefined {
    //     return account ? account.email : undefined;
    // }

    onBlurAccount(): void {
        if (!this._selectedAccount || this._selectedAccount !== this.form.get('userId').value) {
            this.form.get('searchAccount').patchValue('');
            this.form.get('userId').patchValue('');
        }

        this._selectedAccount = '';
    }

    onClickAccount(): void {
        this.form.get('userId').markAsTouched();
        this.form.get('userId').updateValueAndValidity();
    }

    onChangeCheckInDate(ev: MatDatetimepickerInputEvent<any>): void {
        const checkInDate = moment(ev.value);

        if (this.form.get('checkOutTime').value) {
            const checkOutDate = moment(this.form.get('checkOutTime').value);

            if (checkInDate.isAfter(checkOutDate)) {
                this.form.get('checkOutTime').reset();
            }
        }

        this.minCheckOutDate = checkInDate.toDate();
    }

    onChangeCheckOutDate(ev: MatDatetimepickerInputEvent<any>): void {
        const checkOutDate = moment(ev.value);

        if (this.form.get('checkInTime').value) {
            const checkInDate = moment(this.form.get('checkInTime').value);

            if (checkOutDate.isBefore(checkInDate)) {
                this.form.get('checkInTime').reset();
            }
        }

        this.maxCheckInDate = checkOutDate.toDate();
    }

    onMarkAsTouched(field: string): void {
        if (!this.form.get(field).touched) {
            // this.searchAccountCtrl.setErrors
            // console.log('TOUCHED', this.form.get(field));
            // this.form.get(field).markAsDirty();
            // this.form.get(field).markAsTouched();
            // this.form.get(field).updateValueAndValidity();
        }
    }

    onSelectedAccount(ev: MatAutocompleteSelectedEvent): void {
        if (ev.option.viewValue) {
            const { id } = ev.option.value;

            if (id) {
                this._selectedAccount = id;
                this.form.get('userId').patchValue(id);
            }
            // this.searchAccountCtrl.patchValue(ev.option.viewValue);
            // this.searchAccountCtrl.updateValueAndValidity();
        }
    }

    onSubmit(action: string): void {
        let formValue = this.form.getRawValue();
        const attendanceData = Attendance.patch({
            date: moment(formValue.checkDate).toISOString(),
            checkIn: moment(formValue.checkInTime).toISOString(),
            checkOut: moment(formValue.checkOutTime).toISOString(),
            locationType: formValue.locationType,
            attendanceType: formValue.attendanceType
        });

        if (this.form.invalid || !formValue.checkInTime || !formValue.checkOutTime) {
            return;
        }


        switch (action) {
            case 'new':
                if (formValue.searchAccount) {
                    delete formValue.searchAccount;
                }

                this.store.dispatch(
                    AttendanceActions.createAttendanceRequest({ payload: formValue })
                );
                break;

            case 'edit':
                this.store.dispatch(
                    AttendanceActions.patchAttendanceRequest({ payload: { id: formValue.id, data: attendanceData } })
                );
                break;

            default:
                return;
        }
    }

    createAttendanceForm(): FormGroup {
        return this.formBuilder.group({
            id: [],
            checkIn: [],
            checkOut: [],
            checkDate: []
        });
    }

    addAttendance(): void {}

    saveAttendance(): void {}

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private initForm(): void {
        this.form = this.formBuilder.group({
            // checkTime: [
            //     {
            //         checkIn: moment(),
            //         checkOut: moment()
            //     }
            // ],
            id: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('account', 'required')
                    })
                    // RxwebValidators.email({
                    //     conditionalExpression: (x, y) => {
                    //         // tslint:disable-next-line: max-line-length
                    //         const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    //         const valid =
                    //             x.searchAccount && x.searchAccount.email
                    //                 ? pattern.test(x.searchAccount.email)
                    //                 : pattern.test(x.searchAccount);
                    //         return valid === true;
                    //     },
                    //     message: this.errorMessageSvc.getErrorMessageNonState(
                    //         'account',
                    //         'email_pattern'
                    //     )
                    // })
                ]
            ],
            checkDate: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('checkDate', 'required')
                    })
                ]
            ],
            checkInTime: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'check_in',
                            'required'
                        )
                    })
                ]
            ],
            checkOutTime: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            'check_out',
                            'required'
                        )
                    })
                ]
            ],
            locationType: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('locationType', 'required')
                    })
                ]
            ],
            attendanceType: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('attendanceType', 'required')
                    })
                ]
            ]
        });
    }

    private initUpdateForm(): void {
        this.store
            .pipe(
                select(AttendanceSelectors.getAttendance),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(selectedAttendance => {
                if (selectedAttendance) {
                    // console.log('SELECTED ATTENDANCE', selectedAttendance);
                    // this.storage.set('selectedAttendance', selectedAttendance).subscribe(() => {});
                    this.form.patchValue({
                        id: selectedAttendance.id,
                        checkDate: selectedAttendance.date,
                        checkInTime: selectedAttendance.checkIn,
                        checkOutTime: selectedAttendance.checkOut,
                        locationType: selectedAttendance.locationType,
                        attendanceType: selectedAttendance.attendanceType
                    });
                }
            });
    }
}
