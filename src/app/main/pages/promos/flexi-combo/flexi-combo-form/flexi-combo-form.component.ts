import { AgmGeocoder, GeocoderResult, MouseEvent } from '@agm/core';
import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
    MatCheckboxChange,
    MatDialog,
    MatOptionSelectionChange,
    MatSelect
} from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { District, Urban } from 'app/shared/models/location.model';
import { IQueryParams } from 'app/shared/models/query.model';
// import { SupplierStore } from 'app/shared/models/supplier.model';
// import { Temperature } from 'app/shared/models/temperature.model';
// import { PayloadWarehouseConfirmation } from 'app/shared/models/warehouse-confirmation.model';
// import { WarehouseValue } from 'app/shared/models/warehouse-value.model';
import {
    // DropdownActions,
    FormActions,
    // TemperatureActions,
    UiActions
    // WarehouseValueActions
} from 'app/shared/store/actions';
import { DropdownSelectors, FormSelectors } from 'app/shared/store/selectors';
// import { TemperatureSelectors, WarehouseValueSelectors } from 'app/shared/store/selectors/sources';
import { combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    takeUntil,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { FlexiComboActions } from '../store/actions';
import * as fromFlexiCombo from '../store/reducers';
import { FlexiComboSelectors } from '../store/selectors';

@Component({
    selector: 'app-flexi-combo-form',
    templateUrl: './flexi-combo-form.component.html',
    styleUrls: ['./flexi-combo-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlexiComboFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;

    isEdit$: Observable<boolean>;
    isLoading$: Observable<boolean>;
    isLoadingDistrict$: Observable<boolean>;

    private _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Promo'
        },
        {
            title: 'Flexi Combo'
        },
        {
            title: 'Add Flexi Combo'
        }
    ];

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private cdRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromFlexiCombo.FeatureState>,
        private _$errorMessage: ErrorMessageService,
        private _$notice: NoticeService
    ) {
        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: false
                        },
                        value: {
                            active: false
                        },
                        active: false
                    },
                    action: {
                        save: {
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true
                        }
                    }
                }
            })
        );

        this.store.dispatch(UiActions.showFooterAction());

        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
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

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _setFormStatus(status: string): void {
        // console.log('TEST FORM', status, this._addressValid(), this.form);

        if (!status) {
            return;
        }
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                const { id } = this.route.snapshot.params;

                if (id === 'new') {
                    this.pageType = 'new';
                } else if (Math.sign(id) === 1) {
                    this.pageType = 'edit';

                    this._breadCrumbs = [
                        {
                            title: 'Home'
                        },
                        {
                            title: 'Warehouse'
                        },
                        {
                            title: 'Warehouse List'
                        },
                        {
                            title: 'Edit Warehouse'
                        }
                    ];

                    // this.store.dispatch(WarehouseActions.fetchWarehouseRequest({ payload: id }));
                } else {
                    this.router.navigateByUrl('/pages/promos/flexi-combo');
                }

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );

                this._initForm();

                // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
                this.form.statusChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe(status => {
                        this._setFormStatus(status);
                    });

                // Handle cancel button action (footer)
                this.store
                    .select(FormSelectors.getIsClickCancelButton)
                    .pipe(
                        filter(isClick => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(isClick => {
                        this.store.dispatch(FormActions.resetClickCancelButton());
                        this.store.dispatch(FormActions.resetCancelButtonAction());
                    });

                // Handle save button action (footer)
                this.store
                    .select(FormSelectors.getIsClickSaveButton)
                    .pipe(
                        filter(isClick => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(isClick => {
                        this._onSubmit();
                    });
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            whId: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            whName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            leadTime: [
                '',
                [
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric')
                    })
                ]
            ],
            invoices: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            temperature: [''],
            whValue: [''],
            address: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            manually: false,
            district: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            urban: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            postcode: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.minLength({
                        value: 5,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    }),
                    RxwebValidators.maxLength({
                        value: 5,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            lat: [
                '',
                [
                    RxwebValidators.latitude({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            lng: [
                '',
                [
                    RxwebValidators.longitude({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]
            ],
            notes: ''
        });

        if (this.pageType === 'edit') {
            this._initEditForm();
        }
    }

    private _initEditForm(): void {
        // combineLatest([
        //     this.store.select(FlexiComboSelectors.getAllFlexiCombo),
        //     this.store.select(DropdownSelectors.getInvoiceGroupDropdownState)
        // ])
        //     .pipe(
        //         filter(([row, invoices, temperatures, whValues]) => !!row),
        //         takeUntil(this._unSubs$)
        //     )
        //     .subscribe(([row, invoices, temperatures, whValues]) => {
        //         const whIdField = this.form.get('whId');
        //         const whNameField = this.form.get('whName');
        //         const leadTimeField = this.form.get('leadTime');
        //         const invoiceField = this.form.get('invoices');
        //         const temperatureField = this.form.get('temperature');
        //         const whValueField = this.form.get('whValue');
        //         const addressField = this.form.get('address');
        //         const notesField = this.form.get('notes');
        //         const districtField = this.form.get('district');
        //         const urbanField = this.form.get('urban');
        //         const postcodeField = this.form.get('postcode');
        //         const lngField = this.form.get('lng');
        //         const latField = this.form.get('lat');
        //         if (row) {
        //             if (row.code) {
        //                 whIdField.setValue(row.code);
        //             }
        //             if (whIdField.invalid) {
        //                 whIdField.markAsTouched();
        //             }
        //             if (row.name) {
        //                 whNameField.setValue(row.name);
        //             }
        //             if (whNameField.invalid) {
        //                 whNameField.markAsTouched();
        //             }
        //             if (row.leadTime) {
        //                 leadTimeField.setValue(row.leadTime);
        //             }
        //             if (leadTimeField.invalid) {
        //                 leadTimeField.markAsTouched();
        //             }
        //             if (row.warehouseInvoiceGroups && row.warehouseInvoiceGroups.length > 0) {
        //                 const currInvoices = row.warehouseInvoiceGroups
        //                     .map((v, i) => {
        //                         return v && v.invoiceGroup.id
        //                             ? invoices.findIndex(r => r.id === v.invoiceGroup.id) === -1
        //                                 ? null
        //                                 : v.invoiceGroup.id
        //                             : null;
        //                     })
        //                     .filter(v => v !== null);
        //                 invoiceField.setValue(currInvoices);
        //                 if (invoiceField.invalid) {
        //                     invoiceField.markAsTouched();
        //                 }
        //             }
        //             if (row.warehouseTemperatureId) {
        //                 temperatureField.setValue(row.warehouseTemperatureId);
        //             }
        //             if (temperatureField.invalid) {
        //                 temperatureField.markAsTouched();
        //             }
        //             if (row.warehouseValueId) {
        //                 whValueField.setValue(row.warehouseValueId);
        //             }
        //             if (whValueField.invalid) {
        //                 whValueField.markAsTouched();
        //             }
        //             if (row.address) {
        //                 addressField.setValue(row.address);
        //             }
        //             if (addressField.invalid) {
        //                 addressField.markAsTouched();
        //             }
        //             if (row.noteAddress) {
        //                 notesField.setValue(row.noteAddress);
        //             }
        //             if (notesField.invalid) {
        //                 notesField.markAsTouched();
        //             }
        //             if (row.longitude) {
        //                 lngField.setValue(row.longitude);
        //             }
        //             if (lngField.invalid) {
        //                 lngField.markAsTouched();
        //             }
        //             if (row.latitude) {
        //                 latField.setValue(row.latitude);
        //             }
        //             if (latField.invalid) {
        //                 latField.markAsTouched();
        //             }
        //             if (row.urban) {
        //                 if (row.urban.provinceId) {
        //                     districtField.setValue(row.urban);
        //                     urbanField.setValue(row.urban);
        //                     postcodeField.setValue(row.urban.zipCode);
        //                 }
        //             }
        //             this.form.markAsPristine();
        //         }
        //     });
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();
        const urban = body.urban as Urban;

        if (this.pageType === 'new') {
            const payload = {
                urbanId: urban.id,
                warehouseValueId: body.whValue ? body.whValue : null,
                warehouseTemperatureId: body.temperature ? body.temperature : null,
                code: body.whId,
                name: body.whName,
                leadTime: body.leadTime,
                longitude: body.lng,
                latitude: body.lat,
                noteAddress: body.notes,
                address: body.address,
                invoiceGroup: body.invoices,
                status: 'active'
            };

            // this.store.dispatch(WarehouseActions.createWarehouseRequest({ payload }));
        } else if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            const payload = {
                urbanId: urban.id,
                warehouseValueId: body.whValue ? body.whValue : null,
                warehouseTemperatureId: body.temperature ? body.temperature : null,
                code: body.whId,
                name: body.whName,
                leadTime: body.leadTime,
                longitude: body.lng,
                latitude: body.lat,
                noteAddress: body.notes,
                address: body.address,
                invoiceGroup: body.invoices,
                // deletedInvoiceGroup: this._deletedInvoiceGroups,
                status: 'active'
            };

            if (!body.longitude) {
                delete payload.longitude;
            }

            if (!body.latitude) {
                delete payload.latitude;
            }

            if (!body.address) {
                delete payload.address;
            }

            if (!body.notes) {
                delete payload.noteAddress;
            }

            if (id && Object.keys(payload).length > 0) {
                // this.store.dispatch(
                //     WarehouseActions.updateWarehouseRequest({
                //         payload: { id, body: payload }
                //     })
                // );
            }
        }
    }
}
