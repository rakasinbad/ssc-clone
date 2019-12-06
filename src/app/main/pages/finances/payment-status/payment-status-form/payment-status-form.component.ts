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
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import * as moment from 'moment';
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

    private _unSubs$: Subject<void>;

    constructor(
        private _cd: ChangeDetectorRef,
        private dialogRef: MatDialogRef<PaymentStatusFormComponent>,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$log: LogService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.minDate = moment(this.data.item.createdAt).toDate();
        this.maxDate = moment().toDate();

        this._unSubs$ = new Subject<void>();

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.paymentStatuses = this._$helper.paymentStatus();

        this.initForm();
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

    onSubmit(action: string): void {
        if (this.form.invalid) {
            return;
        }

        const { statusPayment, paidDate } = this.form.getRawValue();

        if (action === 'new') {
        } else if (action === 'edit') {
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
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    {
                        id: string;
                        change: {
                            statusPayment: string;
                            paidTime: any;
                        };
                    }
                >(ChangeConfirmationComponent, {
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
        }
    }

    safeValue(item: any): any {
        return item ? item : '-';
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
}
