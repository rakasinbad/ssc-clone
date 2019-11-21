import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import { Hierarchy, StoreSegment } from 'app/shared/models';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-limit-group-form',
    templateUrl: './credit-limit-group-form.component.html',
    styleUrls: ['./credit-limit-group-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupFormComponent implements OnInit {
    form: FormGroup;
    pageType: string;
    unitParameters: { id: string; label: string }[];

    storeSegments$: Observable<StoreSegment[]>;
    hierarchies$: Observable<Hierarchy[]>;

    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    constructor(
        private dialogRef: MatDialogRef<CreditLimitGroupFormComponent>,
        private formBuilder: FormBuilder,
        private store: Store<fromCreditLimitBalance.FeatureState>,
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

        this._unSubs$ = new Subject<void>();

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.initForm();

        this.storeSegments$ = this.store.select(DropdownSelectors.getStoreSegmentDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());

        this.hierarchies$ = this.store.select(DropdownSelectors.getHierarchyDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownHierarchyRequest());

        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

        this.unitParameters = this._$helper.unitParameter();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get formGeographics(): FormArray {
        return this.form.get('creditLimitArea') as FormArray;
    }

    get geoControls(): AbstractControl[] {
        return (this.form.get('creditLimitArea') as FormArray).controls;
    }

    getErrorMessageArray(parent: string, field: string, idx: number): string {
        console.log((this.form.get(parent) as FormArray).controls[idx].get(field));

        if (field) {
            const { errors } = (this.form.get(parent) as FormArray).controls[idx].get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    getErrorMessage(field: string): string {
        console.log(this.form);
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

    isDropdownErrors$(id: string): Observable<boolean> {
        if (!id) {
            return of(false);
        }

        return this.store.select(DropdownSelectors.getIsError, { errorId: id }).pipe(
            tap(x => {
                console.log('ERROR DROPDOWN', x);
            })
        );
    }

    onAddGeograph(): void {
        this.formGeographics.push(this.createGeoForm());
    }

    onSubmit(action: string): void {
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

        const body = this.form.value;

        if (action === 'new') {
            this.store
                .select(AuthSelectors.getUserSupplier)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(({ supplierId }) => {
                    this._$log.generateGroup(
                        `[AUTH SELECTORS]`,
                        {
                            supplierId: {
                                type: 'log',
                                value: supplierId
                            }
                        },
                        'groupCollapsed'
                    );

                    if (supplierId) {
                        const payload = {
                            supplierId,
                            hierarchyId: body.customerHierarchy,
                            storeSegmentId: body.storeSegment,
                            name: body.groupName,
                            defaultCreditLimit: body.creditAmount,
                            defaultBalanceAmount: body.startingBalance,
                            termOfPayment: body.termOfPayment
                            // creditLimitArea: body.creditLimitArea
                        };

                        this._$log.generateGroup(
                            `[SUBMIT CREATE CREDIT LIMIT GROUP]`,
                            {
                                body: {
                                    type: 'log',
                                    value: body
                                },
                                payload: {
                                    type: 'log',
                                    value: payload
                                }
                            },
                            'groupCollapsed'
                        );

                        this.dialogRef.close({ action, payload });
                    }
                });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private createGeoForm(): FormGroup {
        return this.formBuilder.group({
            unitType: [
                ''
                // [
                //     RxwebValidators.unique({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'is_unique')
                //     })
                // ]
            ],
            unitValue: ['']
        });
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            groupName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            creditAmount: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            startingBalance: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            storeSegment: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            customerHierarchy: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            termOfPayment: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ]
            // creditLimitArea: this.formBuilder.array([this.createGeoForm()])
        });
    }
}
