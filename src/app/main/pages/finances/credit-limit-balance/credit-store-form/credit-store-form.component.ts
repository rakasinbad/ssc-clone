import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, LogService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CreditLimitStore } from '../models';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-store-form',
    templateUrl: './credit-store-form.component.html',
    styleUrls: ['./credit-store-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditStoreFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;

    private _unSubs$: Subject<void>;

    constructor(
        private dialogRef: MatDialogRef<CreditStoreFormComponent>,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private storage: StorageMap,
        private store: Store<fromCreditLimitBalance.FeatureState>,
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

        this.resetStorage();
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
        // const { limit: creditLimit, balance: balanceAmount, top: termOfPayment } = this.form.value;
        const { limit: creditLimit, top: termOfPayment } = this.form.value;
        const payload = CreditLimitStore.patch({
            creditLimit,
            termOfPayment
        });
        // const { limit: limitField, balance: balanceField, top: topField } = this.form.controls;
        const { limit: limitField, top: topField } = this.form.controls;

        if (action === 'edit') {
            this.storage.get('selected.credit.limit.store').subscribe({
                next: (prev: CreditLimitStore) => {
                    if (
                        (limitField.dirty && limitField.value === prev.creditLimit) ||
                        (limitField.touched && limitField.value === prev.creditLimit) ||
                        (limitField.pristine && limitField.value === prev.creditLimit)
                    ) {
                        delete payload.creditLimit;
                    }

                    // if (
                    //     (balanceField.dirty && balanceField.value === prev.balanceAmount) ||
                    //     (balanceField.touched && balanceField.value === prev.balanceAmount) ||
                    //     (balanceField.pristine && balanceField.value === prev.balanceAmount)
                    // ) {
                    //     delete payload.balanceAmount;
                    // }

                    if (
                        (topField.dirty && topField.value === prev.termOfPayment) ||
                        (topField.touched && topField.value === prev.termOfPayment) ||
                        (topField.pristine && topField.value === prev.termOfPayment)
                    ) {
                        delete payload.termOfPayment;
                    }

                    const dialogRef = this.matDialog.open<
                        ChangeConfirmationComponent,
                        any,
                        {
                            id: string;
                            change: {
                                balanceAmount?: string;
                                creditLimit?: string;
                                termOfPayment?: number;
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
                        .subscribe(resp => {
                            if (resp.id && resp.change) {
                                this.dialogRef.close({ action, payload });
                            }
                            // else {
                            //     this.dialogRef.close();
                            // }
                        });
                },
                error: err => {}
            });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private resetStorage(): void {
        this.storage.delete('selected.credit.limit.store').subscribe(() => {});
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            limit: [
                '',
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            // balance: [
            //     '',
            //     [
            //         RxwebValidators.numeric({
            //             acceptValue: NumericValueType.PositiveNumber,
            //             allowDecimal: true,
            //             message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
            //         })
            //     ]
            // ],
            top: [
                '',
                [
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ]
        });

        if (this.pageType === 'edit') {
            this.store
                .select(CreditLimitBalanceSelectors.getSelectedCreditLimitStore)
                .pipe(
                    filter(data => !!data),
                    takeUntil(this._unSubs$)
                )
                .subscribe(data => {
                    this.storage.set('selected.credit.limit.store', data).subscribe(() => {});

                    if (data.creditLimit) {
                        this.form.get('limit').patchValue(data.creditLimit.replace('.', ','));
                        this.form.get('limit').markAsTouched();
                    }

                    // if (data.balanceAmount) {
                    //     this.form.get('balance').patchValue(data.balanceAmount.replace('.', ','));
                    //     this.form.get('balance').markAsTouched();
                    // }

                    if (data.termOfPayment) {
                        this.form.get('top').patchValue(data.termOfPayment);
                        this.form.get('top').markAsTouched();
                    }
                });
        }
    }
}
