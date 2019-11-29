import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, LogService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    templateUrl: './order-qty-form.component.html',
    styleUrls: ['./order-qty-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderQtyFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;

    private _unSubs$: Subject<void>;

    constructor(
        private dialogRef: MatDialogRef<OrderQtyFormComponent>,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _$errorMessage: ErrorMessageService,
        private _$log: LogService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._unSubs$ = new Subject<void>();

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.form = this.formBuilder.group({
            qty: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ]
        });

        if (this.pageType === 'edit') {
            if (this.data.qty) {
                this.form.get('qty').patchValue(this.data.qty);
                this.form.get('qty').markAsTouched();
            }
        }
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
        if (this.form.invalid || !action) {
            return;
        }

        this._$log.generateGroup(
            `[SUBMIT ${action.toUpperCase()}]`,
            {
                form: {
                    type: 'log',
                    value: this.form
                }
            },
            'groupCollapsed'
        );

        const { qty } = this.form.value;

        if (action === 'edit') {
            const dialogRef = this.matDialog.open(ChangeConfirmationComponent, {
                data: {
                    title: 'Confirmation',
                    message: 'Are you sure want to change ?',
                    id: this.data.id,
                    change: qty
                },
                disableClose: true
            });

            dialogRef
                .afterClosed()
                .pipe(takeUntil(this._unSubs$))
                .subscribe(resp => {
                    this._$log.generateGroup(
                        'AFTER CLOSED DIALOG CONFIRMATION EDIT QTY',
                        {
                            response: {
                                type: 'log',
                                value: resp
                            }
                        },
                        'groupCollapsed'
                    );

                    if (resp.id && resp.change) {
                        this.dialogRef.close({ action, payload: +qty });
                    }
                });
        }
    }
}
