import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { select, Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { DropdownActions, UiActions } from 'app/shared/store/actions';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { Attendance } from '../models/attendance.model';
import { AttendanceActions } from '../store/actions';
import { fromAttendance } from '../store/reducers';
import { AttendanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-attendance-form',
    templateUrl: './attendance-form.component.html',
    styleUrls: ['./attendance-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceFormComponent implements OnInit, OnDestroy, AfterViewInit {
    attendance: Attendance;
    form: FormGroup;
    // locale: LocaleConfig = {
    //     daysOfWeek: moment.weekdaysMin(),
    //     monthNames: moment.monthsShort(),
    //     firstDay: moment.localeData().firstDayOfWeek(),
    //     format: 'MMM DD, YYYY HH:mm:ss'
    // };
    minCheckInDate: Date;
    maxCheckInDate: Date;
    minCheckOutDate: Date;
    maxCheckOutDate: Date;
    searchAccountCtrl: FormControl;
    toAccountHighlight: string;
    pageType: string;

    attendance$: Observable<any>;
    filteredAccounts$: Observable<Account[]>;
    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;
    private _selectedAccount: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private storage: StorageMap,
        private ngxPermissions: NgxPermissionsService,
        private router: Router,
        private store: Store<fromAttendance.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private errorMessageSvc: ErrorMessageService
    ) {
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
            const hasAccess = this.ngxPermissions.hasPermission('ATTENDANCE.CREATE');
            hasAccess.then(hasAccess => {
                if (!hasAccess) {
                    this.router.navigate(['/pages/errors/403'], {skipLocationChange: true});
                }
            });

            this.attendance$ = of(null);
            this.pageType = 'new';
        } else {
            const hasAccess = this.ngxPermissions.hasPermission('ATTENDANCE.UPDATE');
            hasAccess.then(hasAccess => {
                if (!hasAccess) {
                    this.router.navigate(['/pages/errors/403'], {skipLocationChange: true});
                }
            });

            this.attendance$ = this.store.pipe(
                select(AttendanceSelectors.getSelectedAttendance),
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

        this.form
            .get('searchAccount')
            .valueChanges.pipe(
                debounceTime(500),
                distinctUntilChanged(),
                map(v => {
                    const data: IQueryParams = {
                        paginate: false,
                        search: [
                            {
                                fieldName: 'email',
                                keyword: v ? v.toString().trim() : null
                            }
                        ]
                    };

                    this.toAccountHighlight = v ? v.toString().trim() : null;

                    this.store.dispatch(
                        DropdownActions.fetchSearchAccountRequest({
                            payload: data
                        })
                    );

                    return v;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe(value => {
                if (value) {
                    this.form.get('searchAccount').clearValidators();
                    this.form.get('searchAccount').updateValueAndValidity();

                    // tslint:disable-next-line: max-line-length
                    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    const valid =
                        value && value.email ? pattern.test(value.email) : pattern.test(value);

                    if (!valid) {
                        if (!this.form.get('searchAccount').hasError('email')) {
                            this.form.get('searchAccount').setValidators([
                                RxwebValidators.required({
                                    message: this.errorMessageSvc.getErrorMessageNonState(
                                        'account',
                                        !this._selectedAccount && value ? 'selected' : 'required'
                                    )
                                }),
                                RxwebValidators.email({
                                    message: this.errorMessageSvc.getErrorMessageNonState(
                                        'account',
                                        'email_pattern'
                                    )
                                })
                            ]);
                            this.form.get('searchAccount').updateValueAndValidity();
                        }
                    } else {
                        this.form.get('searchAccount').setValidators([
                            RxwebValidators.required({
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'account',
                                    !this._selectedAccount && value ? 'selected' : 'required'
                                )
                            })
                        ]);
                        this.form.get('searchAccount').updateValueAndValidity();
                    }

                    /* this.form.get('searchAccount').setValidators(
                        RxwebValidators.email({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'account',
                                'email_pattern'
                            )
                        })
                    );
                    this.form.get('searchAccount').updateValueAndValidity();this.form.get('searchAccount').setValidators(
                        RxwebValidators.email({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'account',
                                'email_pattern'
                            )
                        })
                    );
                    this.form.get('searchAccount').updateValueAndValidity(); */
                }
            });

        // this.filteredAccounts$ = this.store.pipe(
        //     select(DropdownSelectors.getAllSearchAccount),
        //     distinctUntilChanged(),
        //     takeUntil(this._unSubs$)
        // );
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

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
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
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

        if (this.form.get('checkOut').value) {
            const checkOutDate = moment(this.form.get('checkOut').value);

            if (checkInDate.isAfter(checkOutDate)) {
                this.form.get('checkOut').reset();
            }
        }

        this.minCheckOutDate = checkInDate.toDate();
    }

    onChangeCheckOutDate(ev: MatDatetimepickerInputEvent<any>): void {
        const checkOutDate = moment(ev.value);

        if (this.form.get('checkIn').value) {
            const checkInDate = moment(this.form.get('checkIn').value);

            if (checkOutDate.isBefore(checkInDate)) {
                this.form.get('checkIn').reset();
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
        formValue = {
            ...formValue,
            type: 'checkIn',
            checkIn:
                formValue.checkIn && moment.isMoment(formValue.checkIn)
                    ? formValue.checkIn.toISOString(true)
                    : null,
            checkOut:
                formValue.checkOut && moment.isMoment(formValue.checkOut)
                    ? formValue.checkOut.toISOString(true)
                    : null
        };

        if (this.form.invalid || !formValue.checkIn || !formValue.checkOut) {
            return;
        }

        const searchAccountField = this.form.get('searchAccount');
        const userIdField = this.form.get('userId');
        const checkInField = this.form.get('checkIn');
        const checkOutField = this.form.get('checkOut');
        const lngField = this.form.get('longitude');
        const latField = this.form.get('latitude');

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
                break;

            default:
                return;
        }

        // console.log(f);
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
            searchAccount: [
                '',
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
            userId: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('account', 'required')
                    })
                ]
            ],
            checkIn: [
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
            checkOut: [
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
            latitude: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('lat', 'required')
                    }),
                    RxwebValidators.latitude({
                        message: this.errorMessageSvc.getErrorMessageNonState('lat', 'pattern')
                    })
                ]
            ],
            longitude: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('lng', 'required')
                    }),
                    RxwebValidators.longitude({
                        message: this.errorMessageSvc.getErrorMessageNonState('lng', 'pattern')
                    })
                ]
            ]
        });
    }

    private initUpdateForm(): void {
        this.store
            .pipe(
                select(AttendanceSelectors.getSelectedAttendance),
                distinctUntilChanged(),
                takeUntil(this._unSubs$)
            )
            .subscribe(selectedAttendance => {
                if (selectedAttendance) {
                    console.log('SELECTED ATTENDANCE', selectedAttendance);
                    this.storage.set('selectedAttendance', selectedAttendance).subscribe(() => {});
                    this.form.patchValue({
                        userId: selectedAttendance.userId,
                        checkIn: selectedAttendance.checkIn,
                        checkOut: selectedAttendance.checkOut,
                        latitude: null,
                        longitude: null
                    });
                }
            });
    }
}
