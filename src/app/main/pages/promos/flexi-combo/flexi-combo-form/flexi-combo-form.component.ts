import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatRadioChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import {
    Catalogue,
    StoreSegmentationChannel,
    StoreSegmentationCluster,
    StoreSegmentationGroup,
} from 'app/main/pages/catalogues/models';
import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { EStatus, IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import * as numeral from 'numeral';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { CreateFlexiComboDto } from '../models';
import { FlexiComboActions } from '../store/actions';
import * as fromFlexiCombo from '../store/reducers';

type TmpKey = 'imgSuggestion';

@Component({
    selector: 'app-flexi-combo-form',
    templateUrl: './flexi-combo-form.component.html',
    styleUrls: ['./flexi-combo-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboFormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    pageType: string;
    tmp: Partial<Record<TmpKey, FormControl>> = {};

    platformsSinbad = this._$helperService.platformSinbad();
    triggerBase = this._$helperService.triggerBase();
    calculationMechanism = this._$helperService.calculationMechanism();
    conditionBase = this._$helperService.conditionBase();
    benefitType = this._$helperService.benefitType();
    segmentBase = this._$helperService.segmentationBase();

    minCheckInDate: Date;
    maxCheckInDate: Date;
    minCheckOutDate: Date;
    maxCheckOutDate: Date;

    isEdit$: Observable<boolean>;
    isLoading$: Observable<boolean>;
    isLoadingDistrict$: Observable<boolean>;

    private _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Promo',
        },
        {
            title: 'Flexi Combo',
        },
        {
            title: 'Add Flexi Combo',
            active: true,
        },
    ];

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private cdRef: ChangeDetectorRef,
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private location: Location,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromFlexiCombo.FeatureState>,
        private _$errorMessage: ErrorMessageService,
        private _$helperService: HelperService,
        private _$notice: NoticeService
    ) {
        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: false,
                        },
                        value: {
                            active: false,
                        },
                        active: false,
                    },
                    action: {
                        save: {
                            label: 'Save',
                            active: true,
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false,
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true,
                        },
                    },
                },
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

    get conditions(): FormArray {
        return this.form.get('conditions') as FormArray;
    }

    get conditionsCtrl(): AbstractControl[] {
        return this.conditions.controls;
    }

    addCondition(): void {
        this.conditions.push(this._createConditions());
    }

    getErrorMessage(fieldName: string, parentName?: string, index?: number): string {
        if (!fieldName) {
            return;
        }

        if (parentName && typeof index === 'number') {
            const formParent = this.form.get(parentName) as FormArray;
            const { errors } = formParent.at(index).get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get(fieldName);

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

    onChangeSegmentBase(ev: MatRadioChange): void {
        if (!ev.value) {
            return;
        }

        if (ev.value === SegmentationBase.STORE) {
            this.form.get('chosenStore').setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.choice({
                    minLength: 1,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);
            this.form.get('chosenStore').updateValueAndValidity({ onlySelf: true });
        } else if (ev.value === SegmentationBase.SEGMENTATION) {
            this.form.get('chosenStore').clearValidators();
            this.form.get('chosenStore').updateValueAndValidity({ onlySelf: true });
        }
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'imgSuggestion':
                        {
                            const imgSuggestionField = this.form.get('imgSuggestion');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                imgSuggestionField.setValue(fileReader.result);
                                this.tmp['imgSuggestion'].setValue({
                                    name: file.name,
                                    url: this.domSanitizer.bypassSecurityTrustUrl(
                                        window.URL.createObjectURL(file)
                                    ),
                                });

                                if (imgSuggestionField.invalid) {
                                    imgSuggestionField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    default:
                        break;
                }
            }
        } else {
            switch (type) {
                case 'imgSuggestion':
                    {
                        this.form.get('imgSuggestion').reset();
                        this.tmp['imgSuggestion'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    onSkuSelected(ev: Catalogue[]): void {
        this.form.get('chosenSku').markAsDirty({ onlySelf: true });
        this.form.get('chosenSku').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenSku').setValue(null);
        } else {
            this.form.get('chosenSku').setValue(ev);
        }
    }

    onStoreChannelSelected(ev: StoreSegmentationChannel[]): void {
        this.form.get('chosenStoreChannel').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreChannel').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStoreChannel').setValue(null);
        } else {
            this.form.get('chosenStoreChannel').setValue(ev);
        }
    }

    onStoreClusterSelected(ev: StoreSegmentationCluster[]): void {
        this.form.get('chosenStoreCluster').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreCluster').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStoreCluster').setValue(null);
        } else {
            this.form.get('chosenStoreCluster').setValue(ev);
        }
    }

    onStoreGroupSelected(ev: StoreSegmentationGroup[]): void {
        this.form.get('chosenStoreGroup').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreGroup').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStoreGroup').setValue(null);
        } else {
            this.form.get('chosenStoreGroup').setValue(ev);
        }
    }

    onStoreTypeSelected(ev: StoreSegmentationType[]): void {
        this.form.get('chosenStoreType').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreType').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStoreType').setValue(null);
        } else {
            this.form.get('chosenStoreType').setValue(ev);
        }
    }

    onStoreSelected(ev: SupplierStore[]): void {
        this.form.get('chosenStore').markAsDirty({ onlySelf: true });
        this.form.get('chosenStore').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStore').setValue(null);
        } else {
            this.form.get('chosenStore').setValue(ev);
        }
    }

    onWarehouseSelected(ev: Warehouse[]): void {
        this.form.get('chosenWarehouse').markAsDirty({ onlySelf: true });
        this.form.get('chosenWarehouse').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenWarehouse').setValue(null);
        } else {
            this.form.get('chosenWarehouse').setValue(ev);
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _createConditions(): FormGroup {
        return this.formBuilder.group({
            conditionBase: null,
            conditionQty: null,
            conditionValue: null,
            benefitType: null,
            benefitCatalogueId: null,
            benefitBonusQty: null,
            multiplication: false,
        });
    }

    private _setFormStatus(status: string): void {
        console.log(`Test Form ${status}`, this.form);

        if (!status) {
            return;
        }

        if (status === 'VALID') {
            this.store.dispatch(FormActions.setFormStatusValid());
        }

        if (status === 'INVALID') {
            this.store.dispatch(FormActions.setFormStatusInvalid());
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
                            title: 'Home',
                        },
                        {
                            title: 'Promo',
                        },
                        {
                            title: 'Flexi Combo',
                        },
                        {
                            title: 'Edit Flexi Combo',
                            active: true,
                        },
                    ];

                    // this.store.dispatch(WarehouseActions.fetchWarehouseRequest({ payload: id }));
                } else {
                    this.router.navigateByUrl('/pages/promos/flexi-combo');
                }

                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs,
                    })
                );

                this._initForm();

                // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
                this.form.statusChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe((status) => {
                        this._setFormStatus(status);
                    });

                // Handle cancel button action (footer)
                this.store
                    .select(FormSelectors.getIsClickCancelButton)
                    .pipe(
                        filter((isClick) => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((isClick) => {
                        this.location.back();

                        this.store.dispatch(FormActions.resetClickCancelButton());
                        this.store.dispatch(FormActions.resetCancelButtonAction());
                    });

                // Handle save button action (footer)
                this.store
                    .select(FormSelectors.getIsClickSaveButton)
                    .pipe(
                        filter((isClick) => !!isClick),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((isClick) => {
                        this._onSubmit();
                    });
                break;
        }
    }

    private _initForm(): void {
        this.tmp['imgSuggestion'] = new FormControl({ value: '', disabled: true });

        this.form = this.formBuilder.group({
            promoId: null,
            promoName: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            platform: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.platformsSinbad.map((v) => v.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            maxRedemption: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                ],
            ],
            promoBudget: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            startDate: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            endDate: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            imgSuggestion: [
                null,
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(5 * 1000 * 1000),
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        ),
                    }),
                ],
            ],
            allowCombineWithVoucher: false,
            firstBuy: false,
            base: null,
            chosenSku: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            calculationMechanism: null,
            conditions: this.formBuilder.array([this._createConditions()]),
            segmentationBase: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStore: [''],
            chosenWarehouse: [''],
            chosenStoreType: [''],
            chosenStoreGroup: [''],
            chosenStoreChannel: [''],
            chosenStoreCluster: [],
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
        const {
            base,
            conditions,
            chosenSku,
            firstBuy,
            imgSuggestion,
            maxRedemption,
            platform,
            promoId,
            promoBudget,
            promoName,
            allowCombineWithVoucher,
        } = body;
        const newChosenSku =
            chosenSku && chosenSku.length > 0 ? chosenSku.map((sku) => sku.id) : [];

        if (this.pageType === 'new') {
            const payload: CreateFlexiComboDto = {
                base,
                conditions: null,
                dataBase: {
                    catalogueId: newChosenSku,
                },
                dataTarget: {
                    storeId: [],
                },
                endDate: null,
                externalId: promoId,
                firstBuy,
                image: imgSuggestion || null,
                maxRedemptionPerUser: maxRedemption,
                name: promoName,
                platform,
                promoBudget,
                startDate: null,
                status: EStatus.ACTIVE,
                supplierId: null,
                target: 'store',
                type: 'flexi',
                voucherCombine: allowCombineWithVoucher,
            };

            console.log('[NEW] OnSubmit 1', body);
            console.log('[NEW] OnSubmit 2', payload);

            this.store.dispatch(FlexiComboActions.createFlexiComboRequest({ payload }));
        } else if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            // const payload = {
            //     urbanId: urban.id,
            //     warehouseValueId: body.whValue ? body.whValue : null,
            //     warehouseTemperatureId: body.temperature ? body.temperature : null,
            //     code: body.whId,
            //     name: body.whName,
            //     leadTime: body.leadTime,
            //     longitude: body.lng,
            //     latitude: body.lat,
            //     noteAddress: body.notes,
            //     address: body.address,
            //     invoiceGroup: body.invoices,
            //     // deletedInvoiceGroup: this._deletedInvoiceGroups,
            //     status: 'active',
            // };

            // if (!body.longitude) {
            //     delete payload.longitude;
            // }

            // if (!body.latitude) {
            //     delete payload.latitude;
            // }

            // if (!body.address) {
            //     delete payload.address;
            // }

            // if (!body.notes) {
            //     delete payload.noteAddress;
            // }

            // if (id && Object.keys(payload).length > 0) {
            //     // this.store.dispatch(
            //     //     WarehouseActions.updateWarehouseRequest({
            //     //         payload: { id, body: payload }
            //     //     })
            //     // );
            // }
        }
    }
}
