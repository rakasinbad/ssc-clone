import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatRadioChange, MatSelectChange } from '@angular/material';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import { Hierarchy } from 'app/shared/models/customer-hierarchy.model';
import { GeoParameter, GeoParameterType } from 'app/shared/models/global.model';
import { StoreSegment } from 'app/shared/models/store-segment.model';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { CreditLimitGroupForm } from '../models';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    // selector: 'app-credit-limit-group-form',
    templateUrl: './credit-limit-group-form.component.html',
    styleUrls: ['./credit-limit-group-form.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditLimitGroupFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;
    unitParameters: { id: string; label: string }[];
    unitParameterTypes: { id: string; label: string }[];

    storeSegments$: Observable<StoreSegment[]>;
    hierarchies$: Observable<Hierarchy[]>;
    geoParameterSource$: Array<Observable<GeoParameter>>;
    geoParameterProvince$: Observable<GeoParameter>;

    isLoading$: Observable<boolean>;

    private _unSubs$: Subject<void>;

    @ViewChild(CdkVirtualScrollViewport, { static: false })
    cdkVirtualScrollViewPort: CdkVirtualScrollViewport;

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
        this.geoParameterSource$ = [];

        if (this.data.id === 'new') {
            this.pageType = 'new';
        } else {
            this.pageType = 'edit';
        }

        this.storeSegments$ = this.store.select(DropdownSelectors.getStoreSegmentDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());

        this.hierarchies$ = this.store.select(DropdownSelectors.getHierarchyDropdownState);
        this.store.dispatch(DropdownActions.fetchDropdownHierarchyRequest());

        this.geoParameterSource$[0] = of(null);
        this.geoParameterProvince$ = this.store.select(DropdownSelectors.getGeoParameterProvince);

        // Fetch request geo parameter province
        this.store.dispatch(
            DropdownActions.fetchDropdownGeoParameterProvinceRequest({
                payload: {
                    id: GeoParameterType.PROVINCE,
                    type: GeoParameterType.PROVINCE
                }
            })
        );

        // Fetch request geo parameter city
        this.store.dispatch(
            DropdownActions.fetchDropdownGeoParameterCityRequest({
                payload: { id: GeoParameterType.CITY, type: GeoParameterType.CITY }
            })
        );

        // Fetch request geo parameter district
        this.store.dispatch(
            DropdownActions.fetchDropdownGeoParameterDistrictRequest({
                payload: {
                    id: GeoParameterType.DISTRICT,
                    type: GeoParameterType.DISTRICT
                }
            })
        );

        // Fetch request geo parameter urban
        this.store.dispatch(
            DropdownActions.fetchDropdownGeoParameterUrbanRequest({
                payload: {
                    id: GeoParameterType.URBAN,
                    type: GeoParameterType.URBAN
                }
            })
        );

        this.isLoading$ = this.store.select(CreditLimitBalanceSelectors.getIsLoading);

        this.unitParameters = this._$helper.unitParameter();
        this.unitParameterTypes = this._$helper.unitParameterType();

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

    get formGeographics(): FormArray {
        return this.form.get('creditLimitArea') as FormArray;
    }

    get geoControls(): AbstractControl[] {
        return (this.form.get('creditLimitArea') as FormArray).controls;
    }

    getErrorMessageArray(parent: string, field: string, idx: number): string {
        if (!parent && !field && typeof idx !== 'number') {
            return;
        }

        const parentArr = parent.split('.');

        if (parentArr.length > 1) {
            const { errors } = (this.form.get(parent) as FormArray).at(idx).get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get([parent, idx, field]);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
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

    isDropdownErrors$(id: string): Observable<boolean> {
        if (!id) {
            return of(false);
        }

        return this.store.select(DropdownSelectors.getIsError, { errorId: id });
    }

    onAddGeograph(): void {
        this.formGeographics.push(this.createGeoForm());
    }

    onChangeGeoStatus(ev: MatRadioChange): void {
        if (!ev.value || typeof ev.value !== 'string') {
            return;
        }

        const geoStatus = ev.value;

        if (geoStatus === 'all') {
            for (const [idx, row] of this.geoControls.entries()) {
                this.handleStatusAll(idx);
            }
        } else if (geoStatus === 'manually') {
            for (const [idx, row] of this.geoControls.entries()) {
                this.handleStatusManually(idx);
            }
        }
    }

    onDeleteGeoParameter(idx: number): void {
        if (idx > 0) {
            this.formGeographics.removeAt(idx);
            this.geoParameterSource$.splice(idx, 1);
        }
    }

    onOpenChangeUnitValue(ev: boolean): void {
        if (ev) {
            this.cdkVirtualScrollViewPort.scrollToIndex(0);
            this.cdkVirtualScrollViewPort.checkViewportSize();
        }
    }

    onSelectUnit(ev: MatSelectChange, idx: number): void {
        if (!ev.value) {
            return;
        }

        // Enable unit value parameter
        // this.formGeographics
        //     .at(idx)
        //     .get('unitValue')
        //     .enable();
        this.form.get(['creditLimitArea', idx, 'unitValue']).enable();

        switch (ev.value) {
            case GeoParameterType.PROVINCE:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterProvince)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.CITY:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterCity)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.DISTRICT:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterDistrict)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.URBAN:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterUrban)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            default:
                break;
        }
    }

    onSubmit(action: string): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();

        if (action === 'new') {
            this.store
                .select(AuthSelectors.getUserSupplier)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(({ supplierId }) => {
                    if (supplierId) {
                        const newCreditLimitArea =
                            body.creditLimitArea && body.creditLimitArea.length > 0
                                ? body.creditLimitArea.map(row => {
                                      return {
                                          unitType:
                                              body.unitParameterType === 'all'
                                                  ? 'all'
                                                  : row.unitType,
                                          unitValue:
                                              body.unitParameterType === 'all'
                                                  ? null
                                                  : row.unitValue
                                      };
                                  })
                                : [];

                        const payload = {
                            supplierId,
                            hierarchyId: body.hierarchy,
                            storeSegmentId: body.storeSegment,
                            name: body.groupName,
                            defaultCreditLimit: body.creditAmount,
                            // defaultBalanceAmount: body.startingBalance,
                            termOfPayment: body.termOfPayment,
                            creditLimitArea: newCreditLimitArea
                        };

                        // if (
                        //     !body.creditLimitArea ||
                        //     ((body.creditLimitArea as Array<{
                        //         unitType: string;
                        //         unitValue: string;
                        //     }>).length > 0 &&
                        //         !(body.creditLimitArea as Array<{
                        //             unitType: string;
                        //             unitValue: string;
                        //         }>)[0].unitType)
                        // ) {
                        //     delete payload.creditLimitArea;
                        // }

                        if (payload.creditLimitArea && payload.creditLimitArea.length > 0) {
                            if (body.unitParameterType === 'all') {
                                payload.creditLimitArea = [{ ...newCreditLimitArea[0] }];
                            } else {
                                payload.creditLimitArea = payload.creditLimitArea
                                    .map(row => {
                                        if (!row.unitValue) {
                                            return null;
                                        }

                                        return row;
                                    })
                                    .filter(v => v);
                            }
                        }

                        this.dialogRef.close({ action, payload });
                    }
                });
        } else if (action === 'edit') {
            const newCreditLimitArea =
                body.creditLimitArea && body.creditLimitArea.length > 0
                    ? body.creditLimitArea.map(row => {
                          return {
                              unitType: body.unitParameterType === 'all' ? 'all' : row.unitType,
                              unitValue: body.unitParameterType === 'all' ? null : row.unitValue
                          };
                      })
                    : [];

            const payload: Partial<CreditLimitGroupForm> = {
                hierarchyId: body.hierarchy,
                storeSegmentId: body.storeSegment,
                name: body.groupName,
                defaultCreditLimit: body.creditAmount,
                // defaultBalanceAmount: body.startingBalance,
                termOfPayment: body.termOfPayment,
                creditLimitArea: newCreditLimitArea
            };

            if (!body.hierarchy) {
                delete payload.hierarchyId;
            }

            if (!body.storeSegment) {
                delete payload.storeSegmentId;
            }

            if (!body.groupName) {
                delete payload.name;
            }

            if (!body.creditAmount) {
                delete payload.defaultCreditLimit;
            }

            // if (!body.startingBalance) {
            //     delete payload.defaultBalanceAmount;
            // }

            if (!body.termOfPayment) {
                delete payload.termOfPayment;
            }

            // if (
            //     !body.creditLimitArea ||
            //     ((body.creditLimitArea as Array<{
            //         unitType: string;
            //         unitValue: string;
            //     }>).length > 0 &&
            //         !(body.creditLimitArea as Array<{
            //             unitType: string;
            //             unitValue: string;
            //         }>)[0].unitType)
            // ) {
            //     delete payload.creditLimitArea;
            // }

            if (payload.creditLimitArea && payload.creditLimitArea.length > 0) {
                if (body.unitParameterType === 'all') {
                    payload.creditLimitArea = [{ ...newCreditLimitArea[0] }];
                } else {
                    payload.creditLimitArea = payload.creditLimitArea
                        .map(row => {
                            if (!row.unitValue) {
                                return null;
                            }

                            return row;
                        })
                        .filter(v => v);
                }
            }

            this.dialogRef.close({ action, payload });
        }
    }

    onTrackBy(idx: number): number {
        return idx;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private createGeoForm(): FormGroup {
        return this.formBuilder.group({
            unitType: [
                '',
                [
                    RxwebValidators.oneOf({
                        matchValues: [...this._$helper.unitParameter().map(r => r.id), 'all'],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            unitValue: [
                { value: '', disabled: true },
                [
                    RxwebValidators.unique({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'is_unique')
                    })
                ]
            ]
        });
    }

    private handleStatusAll(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        // Handle unitType Field
        this.formGeographics
            .at(idx)
            .get('unitType')
            .reset();

        this.formGeographics
            .at(idx)
            .get('unitType')
            .clearValidators();

        this.formGeographics
            .at(idx)
            .get('unitType')
            .updateValueAndValidity();

        // Handle unitValue Field
        this.formGeographics
            .at(idx)
            .get('unitValue')
            .reset();

        this.formGeographics
            .at(idx)
            .get('unitValue')
            .clearValidators();

        this.formGeographics
            .at(idx)
            .get('unitValue')
            .updateValueAndValidity();
    }

    private handleStatusManually(idx: number): void {
        if (typeof idx !== 'number') {
            return;
        }

        // Handle unitType Field
        this.formGeographics
            .at(idx)
            .get('unitType')
            .reset();

        this.formGeographics
            .at(idx)
            .get('unitType')
            .enable();

        this.formGeographics
            .at(idx)
            .get('unitType')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                }),
                RxwebValidators.oneOf({
                    matchValues: [...this.unitParameters.map(r => r.id), 'all'],
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                })
            ]);

        if (this.formGeographics.at(idx).get('unitType').invalid) {
            this.formGeographics
                .at(idx)
                .get('unitType')
                .markAsTouched();
        }

        // Handle unitValue Field
        this.formGeographics
            .at(idx)
            .get('unitValue')
            .reset();

        this.formGeographics
            .at(idx)
            .get('unitValue')
            .disable();

        this.formGeographics
            .at(idx)
            .get('unitValue')
            .setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                }),
                RxwebValidators.unique({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'is_unique')
                })
            ]);

        if (this.formGeographics.at(idx).get('unitValue').invalid) {
            this.formGeographics
                .at(idx)
                .get('unitValue')
                .markAsTouched();
        }
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            groupName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.alphaNumeric({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'alpha_num_pattern'
                        )
                    })
                ]
            ],
            creditAmount: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            // startingBalance: [
            //     '',
            //     [
            //         RxwebValidators.required({
            //             message: this._$errorMessage.getErrorMessageNonState('default', 'required')
            //         })
            //     ]
            // ],
            storeSegment: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            hierarchy: [
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
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric')
                    })
                ]
            ],
            unitParameterType: ['all'],
            creditLimitArea: this.formBuilder.array([this.createGeoForm()])
        });

        if (this.pageType === 'edit') {
            this.store
                .select(CreditLimitBalanceSelectors.getSelectedCreditLimitGroup)
                .pipe(
                    filter(data => !!data),
                    takeUntil(this._unSubs$)
                )
                .subscribe(data => {
                    if (data.name) {
                        this.form.get('groupName').patchValue(data.name);

                        if (this.form.get('groupName').invalid) {
                            this.form.get('groupName').markAsTouched();
                        }
                    }

                    if (data.defaultCreditLimit) {
                        this.form
                            .get('creditAmount')
                            .patchValue(data.defaultCreditLimit.replace('.', ','));

                        if (this.form.get('creditAmount').invalid) {
                            this.form.get('creditAmount').markAsTouched();
                        }
                    }

                    // if (data.defaultBalanceAmount) {
                    //     this.form
                    //         .get('startingBalance')
                    //         .patchValue(data.defaultBalanceAmount.replace('.', ','));
                    //     this.form.get('startingBalance').markAsTouched();
                    // }

                    if (data.storeSegmentId) {
                        this.form.get('storeSegment').patchValue(data.storeSegmentId);

                        if (this.form.get('storeSegment').invalid) {
                            this.form.get('storeSegment').markAsTouched();
                        }
                    }

                    if (data.hierarchyId) {
                        this.form.get('hierarchy').patchValue(data.hierarchyId);

                        if (this.form.get('hierarchy').invalid) {
                            this.form.get('hierarchy').markAsTouched();
                        }
                    }

                    if (data.termOfPayment) {
                        this.form.get('termOfPayment').patchValue(data.termOfPayment);

                        if (this.form.get('termOfPayment').invalid) {
                            this.form.get('termOfPayment').markAsTouched();
                        }
                    }

                    if (data.creditLimitAreas) {
                        if (data.creditLimitAreas.length > 0) {
                            const creditLimitAreas = data.creditLimitAreas;

                            creditLimitAreas.forEach((geo, index) => {
                                if (geo.unitType && geo.unitValue) {
                                    this.initSource(geo.unitType, index);

                                    if (index > 0) {
                                        if (geo.unitType !== 'all') {
                                            this.formGeographics.push(
                                                this.formBuilder.group({
                                                    unitType: [
                                                        '',
                                                        [
                                                            RxwebValidators.required({
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'required'
                                                                )
                                                            }),
                                                            RxwebValidators.oneOf({
                                                                matchValues: [
                                                                    ...this._$helper
                                                                        .unitParameter()
                                                                        .map(r => r.id),
                                                                    'all'
                                                                ],
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'pattern'
                                                                )
                                                            })
                                                        ]
                                                    ],
                                                    unitValue: [
                                                        {
                                                            value: '',
                                                            disabled: true
                                                        },
                                                        [
                                                            RxwebValidators.required({
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'required'
                                                                )
                                                            }),
                                                            RxwebValidators.unique({
                                                                message: this._$errorMessage.getErrorMessageNonState(
                                                                    'default',
                                                                    'is_unique'
                                                                )
                                                            })
                                                        ]
                                                    ]
                                                })
                                            );

                                            // Handle to matching response unitType from DB with source parameter
                                            if (
                                                this.unitParameters &&
                                                this.unitParameters.length > 0
                                            ) {
                                                const unitIdx = this.unitParameters.findIndex(v => {
                                                    return (
                                                        String(v.id).toLowerCase() ===
                                                        String(geo.unitType).toLowerCase()
                                                    );
                                                });

                                                if (unitIdx !== -1) {
                                                    this.formGeographics
                                                        .at(index)
                                                        .get('unitType')
                                                        .patchValue(geo.unitType);
                                                }
                                            }

                                            // Handle to matching response unitValue from DB with source parameter
                                            this.geoParameterSource$[index]
                                                .pipe(
                                                    filter(v => !!v),
                                                    takeUntil(this._unSubs$)
                                                )
                                                .subscribe(resp => {
                                                    const sourceIdx = resp.source.findIndex(
                                                        source => {
                                                            return (
                                                                String(source).toLowerCase() ===
                                                                String(geo.unitValue).toLowerCase()
                                                            );
                                                        }
                                                    );

                                                    if (sourceIdx !== -1) {
                                                        this.formGeographics
                                                            .at(index)
                                                            .get('unitValue')
                                                            .patchValue(geo.unitValue);
                                                    }
                                                });
                                        }
                                    } else {
                                        if (geo.unitType === 'all') {
                                            this.form.get('unitParameterType').patchValue('all');

                                            this.formGeographics
                                                .at(index)
                                                .get('unitType')
                                                .patchValue('all');
                                        } else {
                                            this.form
                                                .get('unitParameterType')
                                                .patchValue('manually');

                                            this.formGeographics
                                                .at(index)
                                                .get('unitType')
                                                .setValidators([
                                                    RxwebValidators.required({
                                                        message: this._$errorMessage.getErrorMessageNonState(
                                                            'default',
                                                            'required'
                                                        )
                                                    }),
                                                    RxwebValidators.oneOf({
                                                        matchValues: [
                                                            ...this._$helper
                                                                .unitParameter()
                                                                .map(r => r.id),
                                                            'all'
                                                        ],
                                                        message: this._$errorMessage.getErrorMessageNonState(
                                                            'default',
                                                            'pattern'
                                                        )
                                                    })
                                                ]);

                                            // Handle to matching response unitType from DB with source parameter
                                            if (
                                                this.unitParameters &&
                                                this.unitParameters.length > 0
                                            ) {
                                                const unitIdx = this.unitParameters.findIndex(v => {
                                                    return (
                                                        String(v.id).toLowerCase() ===
                                                        String(geo.unitType).toLowerCase()
                                                    );
                                                });

                                                if (unitIdx !== -1) {
                                                    this.formGeographics
                                                        .at(index)
                                                        .get('unitType')
                                                        .patchValue(geo.unitType);
                                                }
                                            }

                                            this.formGeographics
                                                .at(index)
                                                .get('unitValue')
                                                .setValidators([
                                                    RxwebValidators.required({
                                                        message: this._$errorMessage.getErrorMessageNonState(
                                                            'default',
                                                            'required'
                                                        )
                                                    }),
                                                    RxwebValidators.unique({
                                                        message: this._$errorMessage.getErrorMessageNonState(
                                                            'default',
                                                            'is_unique'
                                                        )
                                                    })
                                                ]);

                                            // Handle to matching response unitValue from DB with source parameter
                                            this.geoParameterSource$[index]
                                                .pipe(
                                                    filter(v => !!v),
                                                    takeUntil(this._unSubs$)
                                                )
                                                .subscribe(resp => {
                                                    const sourceIdx = resp.source.findIndex(
                                                        source => {
                                                            return (
                                                                String(source).toLowerCase() ===
                                                                String(geo.unitValue).toLowerCase()
                                                            );
                                                        }
                                                    );

                                                    if (sourceIdx !== -1) {
                                                        this.formGeographics
                                                            .at(index)
                                                            .get('unitValue')
                                                            .patchValue(geo.unitValue);
                                                    }
                                                });
                                        }
                                    }

                                    this.form.get(['creditLimitArea', index, 'unitValue']).enable();

                                    if (this.formGeographics.at(index).get('unitType').invalid) {
                                        this.formGeographics
                                            .at(index)
                                            .get('unitType')
                                            .markAsTouched();
                                    }

                                    this.formGeographics
                                        .at(index)
                                        .get('unitType')
                                        .updateValueAndValidity();

                                    if (this.formGeographics.at(index).get('unitValue').invalid) {
                                        this.formGeographics
                                            .at(index)
                                            .get('unitValue')
                                            .markAsTouched();
                                    }

                                    this.formGeographics
                                        .at(index)
                                        .get('unitValue')
                                        .updateValueAndValidity();
                                }
                            });
                        }
                    }
                });
        }
    }

    private initSource(value: string, idx: number): void {
        if (!value) {
            return;
        }

        switch (value) {
            case GeoParameterType.PROVINCE:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterProvince)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.CITY:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterCity)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.DISTRICT:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterDistrict)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            case GeoParameterType.URBAN:
                this.geoParameterSource$[idx] = this.store
                    .select(DropdownSelectors.getGeoParameterUrban)
                    .pipe(
                        map(state => {
                            return state && state.source.length > 0 ? state : null;
                        })
                    );
                break;

            default:
                break;
        }
    }
}
