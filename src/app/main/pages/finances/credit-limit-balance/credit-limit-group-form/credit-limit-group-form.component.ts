import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, LogService } from 'app/shared/helpers';
import { GeoParameter, GeoParameterType, Hierarchy, StoreSegment } from 'app/shared/models';
import { DropdownActions } from 'app/shared/store/actions';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { Observable, of, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { CreditLimitGroupForm } from '../models';
import { fromCreditLimitBalance } from '../store/reducers';
import { CreditLimitBalanceSelectors } from '../store/selectors';

@Component({
    selector: 'app-credit-limit-group-form',
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
        if (field) {
            // const { errors } = (this.form.get(parent) as FormArray).controls[idx].get(field);
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

        return this.store.select(DropdownSelectors.getIsError, { errorId: id }).pipe(
            tap(x => {
                this._$log.generateGroup(
                    'ERROR DROPDOWN',
                    {
                        error: {
                            type: 'log',
                            value: x
                        }
                    },
                    'groupCollapsed'
                );
            })
        );
    }

    onAddGeograph(): void {
        this.formGeographics.push(this.createGeoForm());
    }

    onDeleteGeoParameter(idx: number): void {
        if (idx > 0) {
            this.formGeographics.removeAt(idx);
            this.geoParameterSource$.splice(idx, 1);
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
        this._$log.generateGroup(
            `SUBMIT ${action.toUpperCase()}`,
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
                        'AUTH SELECTORS',
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
                            hierarchyId: body.hierarchy,
                            storeSegmentId: body.storeSegment,
                            name: body.groupName,
                            defaultCreditLimit: body.creditAmount,
                            defaultBalanceAmount: body.startingBalance,
                            termOfPayment: body.termOfPayment,
                            creditLimitArea: body.creditLimitArea
                        };

                        if (
                            !body.creditLimitArea ||
                            ((body.creditLimitArea as Array<{
                                unitType: string;
                                unitValue: string;
                            }>).length > 0 &&
                                !(body.creditLimitArea as Array<{
                                    unitType: string;
                                    unitValue: string;
                                }>)[0].unitType)
                        ) {
                            delete payload.creditLimitArea;
                        }

                        this._$log.generateGroup(
                            '[SUBMIT CREATE] CREDIT LIMIT GROUP',
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
        } else if (action === 'edit') {
            const payload: Partial<CreditLimitGroupForm> = {
                hierarchyId: body.hierarchy,
                storeSegmentId: body.storeSegment,
                name: body.groupName,
                defaultCreditLimit: body.creditAmount,
                defaultBalanceAmount: body.startingBalance,
                termOfPayment: body.termOfPayment,
                creditLimitArea: body.creditLimitArea
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

            if (!body.startingBalance) {
                delete payload.defaultBalanceAmount;
            }

            if (!body.termOfPayment) {
                delete payload.termOfPayment;
            }

            if (
                !body.creditLimitArea ||
                ((body.creditLimitArea as Array<{
                    unitType: string;
                    unitValue: string;
                }>).length > 0 &&
                    !(body.creditLimitArea as Array<{
                        unitType: string;
                        unitValue: string;
                    }>)[0].unitType)
            ) {
                delete payload.creditLimitArea;
            }

            this._$log.generateGroup(
                '[SUBMIT UPDATE] CREDIT LIMIT GROUP',
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
                        this.form.get('groupName').markAsTouched();
                    }

                    if (data.defaultCreditLimit) {
                        this.form
                            .get('creditAmount')
                            .patchValue(data.defaultCreditLimit.replace('.', ','));
                        this.form.get('creditAmount').markAsTouched();
                    }

                    if (data.defaultBalanceAmount) {
                        this.form
                            .get('startingBalance')
                            .patchValue(data.defaultBalanceAmount.replace('.', ','));
                        this.form.get('startingBalance').markAsTouched();
                    }

                    if (data.storeSegmentId) {
                        this.form.get('storeSegment').patchValue(data.storeSegmentId);
                        this.form.get('storeSegment').markAsTouched();
                    }

                    if (data.hierarchyId) {
                        this.form.get('hierarchy').patchValue(data.hierarchyId);
                        this.form.get('hierarchy').markAsTouched();
                    }

                    if (data.termOfPayment) {
                        this.form.get('termOfPayment').patchValue(data.termOfPayment);
                        this.form.get('termOfPayment').markAsTouched();
                    }

                    if (data.creditLimitAreas) {
                        if (data.creditLimitAreas.length > 0) {
                            const creditLimitAreas = data.creditLimitAreas;

                            creditLimitAreas.forEach((geo, index) => {
                                if (geo.unitType && geo.unitValue) {
                                    this.initSource(geo.unitType, index);

                                    if (index > 0) {
                                        this.formGeographics.push(
                                            this.formBuilder.group({
                                                unitType: [geo.unitType],
                                                unitValue: [
                                                    { value: geo.unitValue, disabled: true },
                                                    [
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
                                    } else {
                                        this.formGeographics
                                            .at(index)
                                            .get('unitType')
                                            .patchValue(geo.unitType);

                                        this.formGeographics
                                            .at(index)
                                            .get('unitValue')
                                            .patchValue(geo.unitValue);
                                    }

                                    this.form.get(['creditLimitArea', index, 'unitValue']).enable();

                                    this.formGeographics
                                        .at(index)
                                        .get('unitType')
                                        .markAsTouched();

                                    this.formGeographics
                                        .at(index)
                                        .get('unitValue')
                                        .markAsTouched();
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
