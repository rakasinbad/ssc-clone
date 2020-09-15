import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    templateUrl: './payment-status-form.component.html',
    styleUrls: ['./payment-status-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentStatusFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;
    paymentStatuses: Array<{ id: string; label: string }>;

    isDisabled = true;
    minDate: Date;
    maxDate: Date;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _cd: ChangeDetectorRef,
        private dialogRef: MatDialogRef<PaymentStatusFormComponent>,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private ngxPermissions: NgxPermissionsService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$notice: NoticeService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.minDate = moment(this.data.item.createdAt).toDate();
        this.maxDate = moment().toDate();

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.paymentStatuses = this._$helper.paymentStatus();

        this.initForm();

        // this.onCheckMinDate();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

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

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onCheckMinDate(orderDate: string): Date {
        if (!orderDate) {
            return;
        }

        const passDate = moment()
            .subtract(5, 'days')
            .toDate();
        const momentOrderDate = moment(orderDate);

        if (momentOrderDate.isSameOrAfter(passDate)) {
            return momentOrderDate.toDate();
        } else {
            return passDate;
        }
    }

    onSubmit(action: string): void {
        if (this.form.invalid) {
            return;
        }

        const { statusPayment, paidDate } = this.form.getRawValue();

        if (action === 'new') {
        } else if (action === 'edit') {
            const canUpdate = this.ngxPermissions.hasPermission('FINANCE.PS.UPDATE');
            canUpdate.then(hasAccess => {
                if (hasAccess) {
                    const payload = {
                        statusPayment,
                        paidTime: moment(paidDate).toISOString()
                    };

                    if (!statusPayment) {
                        delete payload.statusPayment;
                        delete payload.paidTime;
                    }

                    if (statusPayment !== 'paid') {
                        delete payload.paidTime;
                    }

                    if (!paidDate) {
                        delete payload.paidTime;
                    }

                    if (payload) {
                        const dialogRef = this.matDialog.open<ChangeConfirmationComponent,
                            any,
                            {
                                id: string;
                                change: {
                                    statusPayment: string;
                                    paidTime: any;
                                };
                            }>(ChangeConfirmationComponent, {
                            data: {
                                title: 'Confirmation',
                                message: 'Are you sure want to change ?',
                                id: this.data.id,
                                change: payload
                            },
                            disableClose: true
                        });

                        dialogRef
                            .afterClosed()
                            .pipe(takeUntil(this._unSubs$))
                            .subscribe(({ id, change }) => {
                                if (id && change) {
                                    this.dialogRef.close({ action, payload });
                                }
                            });
                    }
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
            statusPayment: [
                '',
                [
                    RxwebValidators.oneOf({
                        matchValues: [...this.paymentStatuses.map(v => v.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            // amount: [''],
            paidDate: [{ value: '', disabled: true }, RxwebValidators.required]
            // paymentMethod: ['']
        });

        if (this.data.item) {
            if (this.data.item.statusPayment) {
                // this.paymentStatuses = this._$helper
                //     .paymentStatus()
                //     .filter(x => x.id !== this.data.item.statusPayment);

                this.form.get('statusPayment').patchValue(this.data.item.statusPayment);
                this.form.get('statusPayment').markAsTouched();
            }

            if (this.data.item.paidTime) {
                this.form.get('paidDate').patchValue(this.data.item.paidTime);
                this.form.get('paidDate').markAsTouched();
            }
        }

        this.form.valueChanges
            .pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this._unSubs$))
            .subscribe(value => {
                if (this.pageType === 'edit') {
                    if (value.statusPayment !== 'paid') {
                        this.isDisabled = this.form.invalid || this.form.pristine;
                    } else {
                        this.isDisabled = !moment(this.form.get('paidDate').value).isValid();
                    }
                } else {
                    this.isDisabled = this.form.invalid;
                }

                this._cd.markForCheck();
            });
    }

    private filterPaymentStatus(element, index, array): boolean{
        return element.id !== 'all';
    }
}
