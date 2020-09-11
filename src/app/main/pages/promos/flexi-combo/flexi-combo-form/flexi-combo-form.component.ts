import { Location } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { MatCheckboxChange, MatDialog, MatRadioChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import {
    Catalogue,
    StoreSegmentationChannel,
    StoreSegmentationCluster,
    StoreSegmentationGroup,
} from 'app/main/pages/catalogues/models';
import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { BenefitType, BenefitMultiType } from 'app/shared/models/benefit-type.model';
import { Brand } from 'app/shared/models/brand.model';
import { CalculationMechanism } from 'app/shared/models/calculation-mechanism.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import {
    EStatus,
    IBreadcrumbs,
    IFooterActionConfig,
    LifecyclePlatform,
} from 'app/shared/models/global.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { ConditionDto, CreateFlexiComboDto, FlexiCombo, PatchFlexiComboDto } from '../models';
import { FlexiComboActions } from '../store/actions';
import * as fromFlexiCombo from '../store/reducers';
import { FlexiComboSelectors } from '../store/selectors';

type TmpKey = 'imgSuggestion';

@Component({
    selector: 'app-flexi-combo-form',
    templateUrl: './flexi-combo-form.component.html',
    styleUrls: ['./flexi-combo-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboFormComponent implements OnInit, AfterViewInit, OnDestroy {
    form: FormGroup;
    conditionForm: FormArray;
    pageType: string;
    tmp: Partial<Record<TmpKey, FormControl>> = {};

    platformsSinbad = this._$helperService.platformSinbad();
    triggerBase = this._$helperService.triggerBase();
    eTriggerBase = TriggerBase;
    calculationMechanism = this._$helperService.calculationMechanism();
    conditionBase = this._$helperService.conditionBase();
    eConditionBase = ConditionBase;
    ratioBase = this._$helperService.buyRatioCondition();
    eBuyRatioCondition = RatioBaseCondition;
    benefitType = this._$helperService.benefitType();
    eBenefitType = BenefitType;
    benefitMultiType = this._$helperService.benefitMultiType();
    eBenefitMultiType = BenefitMultiType;
    segmentBase = this._$helperService.segmentationBase();
    eSegmentBase = SegmentationBase;
    promoAllocation = this._$helperService.promoAllocation();
    ePromoAllocation = PromoAllocation;

    minStartDate: Date = new Date();
    maxStartDate: Date = null;
    minEndDate: Date = new Date();
    maxEndDate: Date = null;

    flexiCombo: FlexiCombo = null;

    isLoading$: Observable<boolean>;

    private strictISOString = false;
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

    private footerConfig: IFooterActionConfig = {
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
    };

    private _unSubs$: Subject<void> = new Subject<void>();

    public listPromoAlloc: any = [
        { label: 'None', value: 'none', checked: true },
        { label: 'Promo Budget', value: 'promo_budget', checked: false },
        { label: 'Promo Slot', value: 'promo_slot', checked: false },
    ];
    public selectPromo: string;
    public selectNewStore = false;
    public selectActiveOutlet = false;
    public maxRedemStat = false;
    public multiStat = false;

    constructor(
        private cdRef: ChangeDetectorRef,
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private location: Location,
        private matDialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromFlexiCombo.FeatureState>,
        private _fuseProgressBarService: FuseProgressBarService,
        private _$applyDialogFactory: ApplyDialogFactoryService<ElementRef<HTMLElement>>,
        private _$errorMessage: ErrorMessageService,
        private _$helperService: HelperService,
        private _$notice: NoticeService
    ) {
        // this.store.dispatch(UiActions.showFooterAction());
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        
        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
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
        const conditions = this.conditions.getRawValue();

        if (conditions && conditions.length > 0) {
            const nextIdx = conditions.length;
            const prevIdx = conditions.length - 1;

            if (prevIdx >= 0) {
                // Disable prev Tier
                this.conditionsCtrl[prevIdx].disable({ onlySelf: true });

                const prevCondition = conditions[prevIdx] as ConditionDto;

                this.conditions.push(this._createConditions(new ConditionDto(prevCondition)));

                // Disable conditionBase control (New Tier)
                this.conditionsCtrl[nextIdx].get('conditionBase').disable({ onlySelf: true });

                // Disable benefitType control (New Tier)
                this.conditionsCtrl[nextIdx].get('benefitType').disable({ onlySelf: true });

                // Disable benefitCatalogueId control (New Tier)
                this.conditionsCtrl[nextIdx].get('benefitCatalogueId').disable({ onlySelf: true });

                // Handle validation FormControl (New Tier)
                this._newTierValidation(nextIdx);
            }

            return;
        }

        this.conditions.push(this._createConditions());
    }

    deleteCondition(idx: number): void {
        if (typeof idx !== 'number' || idx < 1) {
            return;
        }

        let lastIdx = idx;
        let prevLastIdx = idx;

        this.conditions.removeAt(idx);

        const conditions = this.conditions.getRawValue();

        if (conditions && conditions.length > 0) {
            const nextIdx = conditions.length;
            lastIdx = nextIdx - 1;
            prevLastIdx = nextIdx;
        }

        if (idx === prevLastIdx) {
            // Enable Last Tier
            this.conditionsCtrl[lastIdx].enable({
                onlySelf: true,
            });
        } else {
            if (lastIdx >= 1) {
                while (idx <= lastIdx) {
                    this._newTierValidation(idx);
                    idx++;
                }
            }
        }
    }

    getApplyBonusSku(idx: number): Selection {
        return this.form.get(['conditions', idx, 'benefitCatalogueId']).value || null;
    }

    getBenefitType(idx: number): BenefitType {
        return this.form.get(['conditions', idx, 'benefitType']).value;
    }

    // getBenefitMultiType(idx: number): BenefitMultiType {
    //     return this.form.get(['conditions', idx, 'benefitType']).value;
    // }

    getChosenBrand(): Selection[] {
        return this.form.get('chosenBrand').value || [];
    }

    getChosenFaktur(): Selection[] {
        return this.form.get('chosenInvoice').value || [];
    }

    getChosenSku(): Selection[] {
        return this.form.get('chosenSku').value || [];
    }

    getChosenStore(): Selection[] {
        return this.form.get('chosenStore').value || [];
    }

    getChosenStoreChannel(): Selection[] {
        return this.form.get('chosenStoreChannel').value || [];
    }

    getChosenStoreCluster(): Selection[] {
        return this.form.get('chosenStoreCluster').value || [];
    }

    getChosenStoreGroup(): Selection[] {
        return this.form.get('chosenStoreGroup').value || [];
    }

    getChosenStoreType(): Selection[] {
        return this.form.get('chosenStoreType').value || [];
    }

    getChosenWarehouse(): Selection[] {
        return this.form.get('chosenWarehouse').value || [];
    }

    /**
     *
     * Get condition base value (Tier)
     * @param {number} idx
     * @returns {string}
     * @memberof FlexiComboFormComponent
     */
    getConditionBase(idx: number): string {
        return this.form.get(['conditions', idx, 'conditionBase']).value;
    }

    /**
     *
     * Get buy ratio condition base value (Tier)
     * @param {number} idx
     * @returns {string}
     * @memberof FlexiComboFormComponent
     */
    getBuyRatioConditionBase(idx: number): string {
        return this.form.get(['conditions', idx, 'buyRatioCondition']).value;
    }

    /**
     *
     * Get segmentation base value
     * @returns {string}
     * @memberof FlexiComboFormComponent
     */
    getSegmentationBase(): string {
        return this.form.get('segmentationBase').value;
    }

     /**
     *
     * Get segmentation base value
     * @returns {string}
     * @memberof FlexiComboFormComponent
     */
    getPromoAllocation(): string {
        return this.form.get('promoAllocationType').value;
    }

    /**
     *
     * Get trigger base value
     * @returns {TriggerBase}
     * @memberof FlexiComboFormComponent
     */
    getTriggerBase(): TriggerBase {
        return this.form.get('base').value;
    }

    /* Start Handle Error Form */

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

    /* End Handle Error Form */

    /**
     *
     * Handle button Add Tier (false = Disable Button, true = Enable Button)
     * @returns {boolean}
     * @memberof FlexiComboFormComponent
     */
    canAddTier(): boolean {
        // Get all conditions value (Tier)
        const conditions = this.conditions.getRawValue();
        const nextIdx = conditions.length;
        const currIdx = conditions.length - 1;

        // Check total conditions item greater than 0
        if (conditions.length > 0) {
            // Get conditions has checked multiplication
            const hasMultiplication = conditions.filter(
                (condition) => condition.multiplication === true
            );

            // Check has multiplication so can't Add Tier
            if (hasMultiplication.length > 0) {
                return false;
            }

            // Get current conditions
            const currConditions = this.conditionsCtrl[currIdx];

            // Check current conditions is valid so can Add Tier
            if (currConditions.valid) {
                return true;
            }

            return false;
        }

        return false;
    }

    /**
     *
     * Handle checkbox Apply Same SKU (false = Hide Checkbox, true = Show Checkbox)
     * @returns {boolean}
     * @memberof FlexiComboFormComponent
     */
    canApplySameSku(): boolean {
        // Get Trigger Base Field value
        const triggerBase = this.form.get('base').value;

        // Check Trigger Base Field value is SKU
        if (triggerBase === TriggerBase.SKU) {
            // Get Chosen SKU Field value
            const chosenSku = this.form.get('chosenSku').value;

            // Check chosen sku item is equal 1
            if (chosenSku && chosenSku.length === 1) {
                return true;
            }

            return false;
        }

        return false;
    }

    isDisabledBonusSku(idx: number): boolean {
        return this.form.get(['conditions', idx, 'benefitCatalogueId']).disabled;
    }

    isBenefitType(benefitType: BenefitType, idx: number): boolean {
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');

        if (!benefitTypeCtrl) {
            return false;
        }

        const benefitTypeVal = benefitTypeCtrl.value;

        if (benefitTypeVal === benefitType) {
            return true;
        }

        return false;
    }

    isBenefitMultiType(benefitType: BenefitMultiType, idx: number): boolean {
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');

        if (!benefitTypeCtrl) {
            return false;
        }

        const benefitTypeVal = benefitTypeCtrl.value;

        if (benefitTypeVal === benefitType) {
            return true;
        }

        return false;
    }

    /**
     *
     * Handle open dialog in Calculation Mechanism Field
     * @param {TemplateRef<ElementRef>} elRef
     * @memberof FlexiComboFormComponent
     */
    openHint(elRef: TemplateRef<ElementRef>): void {
        this._$applyDialogFactory.open(
            {
                title: 'Calculation Mechanism',
                template: elRef,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '50vw',
                minWidth: '50vw',
                maxWidth: '50vw',
            }
        );
    }

    /**
     *
     * Handle selected event for Bonus SKU Field (Benefit Type - SKU)
     * @param {Catalogue} ev
     * @param {string} fieldName
     * @memberof FlexiComboFormComponent
     */
    onBenefitSkuSelected(ev: Catalogue, fieldName: string): void {
        this.form.get(fieldName).markAsDirty({ onlySelf: true });
        this.form.get(fieldName).markAsTouched({ onlySelf: true });

        if (!ev) {
            this.form.get(fieldName).setValue(null);
        } else {
            const newBenefitSku: Selection = {
                id: ev.id,
                label: ev.name,
                group: 'catalogues',
            };

            this.form.get(fieldName).setValue(newBenefitSku);
        }
    }

    /**
     *
     * Handle selected event for Base Field (Brand)
     * @param {Brand[]} ev
     * @memberof FlexiComboFormComponent
     */
    onBrandSelected(ev: Brand[]): void {
        this.form.get('chosenBrand').markAsDirty({ onlySelf: true });
        this.form.get('chosenBrand').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenBrand').setValue(null);
        } else {
            const newBrands: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'brand',
            }));

            this.form.get('chosenBrand').setValue(newBrands);
        }
    }

    /**
     *
     * Handle change event for Apply Same SKU Field (Benefit Type - SKU)
     * @param {MatCheckboxChange} ev
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    onChangeApplySameSku(ev: MatCheckboxChange, idx: number): void {
        const bonusSkuCtrl = this.form.get(['conditions', idx, 'benefitCatalogueId']);

        if (ev.checked === true && this.canApplySameSku()) {
            const chosenSku = this.form.get('chosenSku').value;

            bonusSkuCtrl.patchValue(chosenSku[0], { onlySelf: true });
            bonusSkuCtrl.disable({ onlySelf: true });
        } else if (!ev.checked && this.canApplySameSku()) {
            bonusSkuCtrl.reset();
            bonusSkuCtrl.enable({ onlySelf: true });
        }

        this.cdRef.detectChanges();
    }

    /**
     *
     * Handle change event for Benefit Type Field
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onChangeBenefitType(ev: MatRadioChange, idx: number): void {
        const benefitTypeVal = ev.value;

        if (!benefitTypeVal || typeof idx !== 'number') {
            return;
        }

        // Handle validation for Bonus Sku Field (Benefit Type - Qty) (FormControl = benefitCatalogueId)
        this._benefitBonusSkuValidationByBenefitType(benefitTypeVal, idx);

        // Handle validation for Bonus Qty Field (Benefit Type - Qty) (FormControl = benefitBonusQty)
        this._benefitBonusQtyValidationByBenefitType(benefitTypeVal, idx);

        // Handle validation for Rebate Field (Benefit Type - Amount Rp) (FormControl = benefitRebate)
        this._benefitRebateValidationByBenefitType(benefitTypeVal, idx);

        // Handle validation for Discount Field (Benefit Type - Percent) (FormControl = benefitDiscount)
        this._benefitDiscountValidationByBenefitType(benefitTypeVal, idx);

        // Handle validation for Max Rebate Field (Benefit Type - Percent) (FormControl = benefitMaxRebate)
        this._benefitMaxRebateValidationByBenefitType(benefitTypeVal, idx);
    }

    /**
     *
     * Handle change event for Condition Base Field
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onChangeConditionBase(ev: MatRadioChange, idx: number): void {
        const conditionBaseVal = ev.value;

        if (!conditionBaseVal || typeof idx !== 'number') {
            return;
        }

        // Handle validation for Qty Field (Condition Base - Qty) (FormControl = conditionQty)
        this._qtyValueValidationByConditionBase(conditionBaseVal, idx);

        // Handle validation for Order Value Field (Condition Base - Order Value) (FormControl = conditionValue)
        this._orderValueValidationByConditionBase(conditionBaseVal, idx);
    }

    /**
     *
     * Handle change event for Buy Ratio Condition Base Field
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onChangeRatioConditionBase(ev: MatRadioChange, idx: number): void {
        const ratioBaseVal = ev.value;

        if (!ratioBaseVal || typeof idx !== 'number') {
            return;
        }

        // Handle validation for Ratio Buy Qty Field (Condition Base - Qty) (FormControl = ratioQty)
        this._qtyValueValidationByRatioConditionBase(ratioBaseVal, idx);

        // Handle validation for Ratio Buy Order Value Field (Condition Base - Order Value) (FormControl = ratioValue)
        this._orderValueValidationByRatioConditionBase(ratioBaseVal, idx);
    }

    /**
     *
     * Handle change event for Order Value Field
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    onChangeOrderValue(idx: number): void {
        const prevIdx = idx > 0 ? idx - 1 : 0;

        if (idx > 0) {
            // Revalidate Rebate Field
            this._benefitRebateValidationNewTier(idx, prevIdx);

            // Revalidate Max Rebate Field
            this._benefitMaxRebateValidationNewTier(idx, prevIdx);
        } else {
            const benefitTypeVal = this.conditionsCtrl[idx].get('benefitType').value;

            // Revalidate Rebate Field
            this._benefitRebateValidationByBenefitType(benefitTypeVal, idx);

            // Revalidate Max Rebate Field
            this._benefitMaxRebateValidationByBenefitType(benefitTypeVal, idx);
        }

        return;
    }

     /**
     *
     * Handle change event for Buy Ratio Order Value Field
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    onChangeOrderValueRatio(idx: number): void {
        console.log('isi idx onChangeOrderValueRatio->', idx)
        const prevIdx = idx > 0 ? idx - 1 : 0;

        // if (idx > 0) {
        //     // Revalidate Rebate Field
        //     this._benefitRebateValidationNewTier(idx, prevIdx);

        //     // Revalidate Max Rebate Field
        //     this._benefitMaxRebateValidationNewTier(idx, prevIdx);
        // } else {
        //     const benefitTypeVal = this.conditionsCtrl[idx].get('benefitType').value;

        //     // Revalidate Rebate Field
        //     this._benefitRebateValidationByBenefitType(benefitTypeVal, idx);

        //     // Revalidate Max Rebate Field
        //     this._benefitMaxRebateValidationByBenefitType(benefitTypeVal, idx);
        // }

        return;
    }

    /**
     *
     * Handle change event for Segmentation Base Field
     * @param {MatRadioChange} ev
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onChangeSegmentBase(ev: MatRadioChange): void {
        this.form.get('segmentationBase').markAsDirty({ onlySelf: true });
        this.form.get('segmentationBase').markAsTouched({ onlySelf: true });

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

            this.form.get('chosenWarehouse').clearValidators();
            this.form.get('chosenStoreType').clearValidators();
            this.form.get('chosenStoreGroup').clearValidators();
            this.form.get('chosenStoreChannel').clearValidators();
            this.form.get('chosenStoreCluster').clearValidators();
        } else if (ev.value === SegmentationBase.SEGMENTATION) {
            this.form.get('chosenStore').clearValidators();

            // this.form.get('chosenWarehouse').setValidators([
            //     RxwebValidators.required({
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            //     RxwebValidators.choice({
            //         minLength: 1,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            // ]);

            // this.form.get('chosenStoreType').setValidators([
            //     RxwebValidators.required({
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            //     RxwebValidators.choice({
            //         minLength: 1,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            // ]);

            // this.form.get('chosenStoreGroup').setValidators([
            //     RxwebValidators.required({
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            //     RxwebValidators.choice({
            //         minLength: 1,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            // ]);

            // this.form.get('chosenStoreChannel').setValidators([
            //     RxwebValidators.required({
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            //     RxwebValidators.choice({
            //         minLength: 1,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            // ]);

            // this.form.get('chosenCluster').setValidators([
            //     RxwebValidators.required({
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            //     RxwebValidators.choice({
            //         minLength: 1,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            //     }),
            // ]);
        }

        this.form.get('chosenStore').updateValueAndValidity();
        this.form.get('chosenWarehouse').updateValueAndValidity();
        this.form.get('chosenStoreType').updateValueAndValidity();
        this.form.get('chosenStoreGroup').updateValueAndValidity();
        this.form.get('chosenStoreChannel').updateValueAndValidity();
        this.form.get('chosenStoreCluster').updateValueAndValidity();
    }

    /**
     *
     * Handle change event for Active To Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof FlexiComboFormComponent
     */
    onChangeEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        const endDate = ev.value;
        const startDate = this.form.get('startDate').value;

        if (startDate) {
            if (endDate.isBefore(startDate)) {
                this.form.get('startDate').reset();
            }
        }

        this.maxStartDate = endDate.subtract(1, 'minute').toDate();
    }

    /**
     *
     * Handle change event for Active From Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof FlexiComboFormComponent
     */
    onChangeStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const startDate = ev.value;
        const endDate = this.form.get('endDate').value;

        if (endDate) {
            if (startDate.isAfter(endDate)) {
                this.form.get('endDate').reset();
            }
        }

        this.minEndDate = startDate.add(1, 'minute').toDate();
    }

    /**
     *
     * Handle change event for Trigger Base Field
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    onChangeTriggerBase(ev: MatRadioChange): void {
        const triggerBaseVal = ev.value;

        if (!triggerBaseVal) {
            return;
        }

        // Handle validation for Chosen Brand Field (Trigger Base - Brand) (FormControl = chosenBrand)
        this._chosenBrandValidationByTriggerBase(triggerBaseVal);

        // Handle validation for Chosen Faktur Field (Trigger Base - Faktur) (FormControl = chosenInvoice)
        this._chosenInvoiceValidationByTriggerBase(triggerBaseVal);

        // Handle validation for Chosen Sku Field (Trigger Base - Sku) (FormControl = chosenSku)
        this._chosenSkuValidationByTriggerBase(triggerBaseVal);
    }

    /**
     *
     * Handle File Browse (Image / File)
     * @param {Event} ev
     * @param {string} type
     * @memberof FlexiComboFormComponent
     */
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

    /**
     *
     * Handle selected event for Base Field (Faktur)
     * @param {InvoiceGroup[]} ev
     * @memberof FlexiComboFormComponent
     */
    onInvoiceSelected(ev: InvoiceGroup[]): void {
        this.form.get('chosenInvoice').markAsDirty({ onlySelf: true });
        this.form.get('chosenInvoice').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenInvoice').setValue(null);
        } else {
            const newFaktur: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'faktur',
            }));

            this.form.get('chosenInvoice').setValue(newFaktur);
        }
    }

    /**
     *
     * Handle selected event for Base Field (SKU)
     * @param {Catalogue[]} ev
     * @memberof FlexiComboFormComponent
     */
    onSkuSelected(ev: Catalogue[]): void {
        this.form.get('chosenSku').markAsDirty({ onlySelf: true });
        this.form.get('chosenSku').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenSku').setValue(null);
        } else {
            const newSku: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'catalogues',
            }));

            this.form.get('chosenSku').setValue(newSku);
        }
    }

    /**
     *
     * Handle popup hybrid selected for Store Channel Field (Segmentation Base - Segmentation)
     * @param {StoreSegmentationChannel[]} ev
     * @memberof FlexiComboFormComponent
     */
    onStoreChannelSelected(ev: StoreSegmentationChannel[]): void {
        this.form.get('chosenStoreChannel').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreChannel').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenStoreChannel').setValue(null);
        } else {
            const newStoreChannels: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-channels',
            }));

            this.form.get('chosenStoreChannel').setValue(newStoreChannels);
        }
    }

    /**
     *
     * Handle popup hybrid selected for Store Cluster Field (Segmentation Base - Segmentation)
     * @param {StoreSegmentationCluster[]} ev
     * @memberof FlexiComboFormComponent
     */
    onStoreClusterSelected(ev: StoreSegmentationCluster[]): void {
        this.form.get('chosenStoreCluster').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreCluster').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenStoreCluster').setValue(null);
        } else {
            const newStoreClusters: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-clusters',
            }));

            this.form.get('chosenStoreCluster').setValue(newStoreClusters);
        }
    }

    /**
     *
     * Handle popup hybrid selected for Store Group Field (Segmentation Base - Segmentation)
     * @param {StoreSegmentationGroup[]} ev
     * @memberof FlexiComboFormComponent
     */
    onStoreGroupSelected(ev: StoreSegmentationGroup[]): void {
        this.form.get('chosenStoreGroup').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreGroup').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenStoreGroup').setValue(null);
        } else {
            const newStoreGroups: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-groups',
            }));

            this.form.get('chosenStoreGroup').setValue(newStoreGroups);
        }
    }

    /**
     *
     * Handle popup hybrid selected for Store Type Field (Segmentation Base - Segmentation)
     * @param {StoreSegmentationType[]} ev
     * @memberof FlexiComboFormComponent
     */
    onStoreTypeSelected(ev: StoreSegmentationType[]): void {
        this.form.get('chosenStoreType').markAsDirty({ onlySelf: true });
        this.form.get('chosenStoreType').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenStoreType').setValue(null);
        } else {
            const newStoreTypes: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-types',
            }));

            this.form.get('chosenStoreType').setValue(newStoreTypes);
        }
    }

    /**
     *
     * Handle popup hybrid selected for Store Field (Segmentation Base - Direct Store)
     * @param {SupplierStore[]} ev
     * @memberof FlexiComboFormComponent
     */
    onStoreSelected(ev: SupplierStore[]): void {
        this.form.get('chosenStore').markAsDirty({ onlySelf: true });
        this.form.get('chosenStore').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenStore').setValue(null);
        } else {
            const newStores: Selection[] = ev.map((item) => ({
                id: item.store.id,
                label: item.store.name,
                group: 'supplier-stores',
            }));

            this.form.get('chosenStore').setValue(newStores);
        }
    }

    /**
     *
     * Handle popup hybrid selected Warehouse Field (Segmentation Base - Segmentation)
     * @param {Warehouse[]} ev
     * @memberof FlexiComboFormComponent
     */
    onWarehouseSelected(ev: Warehouse[]): void {
        this.form.get('chosenWarehouse').markAsDirty({ onlySelf: true });
        this.form.get('chosenWarehouse').markAsTouched({ onlySelf: true });

        if (!ev.length) {
            this.form.get('chosenWarehouse').setValue(null);
        } else {
            const newWarehouses: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'warehouses',
            }));

            this.form.get('chosenWarehouse').setValue(newWarehouses);
        }
    }

    /**
     *
     * Handle change event for General Information Promo Allocation
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */

    selectPromoAlloc(ev: MatRadioChange): void {
        this.selectPromo = ev.value;
        console.log('isi selectPromo=>', this.selectPromo)
        this.form.get('promoAllocationType').setValidators([
            RxwebValidators.required({
                message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.choice({
                minLength: 1,
                message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
            }),
        ]);
    }

     /**
     *
     * Handle change event for Segmentatio
     * @param {mat-checkbox} ev
     * @param {string and type} 
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */

    checkSegmentation(ev, type): void {
        if (type === 'new_store' && ev.checked === true) {
            this.selectActiveOutlet = true;
            // this.form.
            // is_new_store
        } else if (type === 'active_outlet' && ev.checked === true) {
            this.selectNewStore = true;
        } else {
            this.selectNewStore = false;
            this.selectActiveOutlet = false;
        }
    }

    /**
     *
     * Handle change event for Multiplication
     * @param {mat-checkbox} ev
     * @param {event} 
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */

    selectMultiplication(event): void {
        if (event.checked === true) {
            this.maxRedemStat = true;
            this.multiStat = true;
            const conditions = this.conditions.getRawValue();
            // Get conditions has checked multiplication
            // conditions.filter(
            //     (condition) => condition.multiplication === true
            // );
            this.form.get('maxRedemption').setValue(1);
        } else {
            this.maxRedemStat = false;
            this.multiStat = false;
            // this.form.get('multiplication').setValue(false);
            this.form.get('maxRedemption').setValue('');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Handle validation FormControl New Tier (when Add Tier)
     * @private
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */
    private _newTierValidation(idx: number): void {
        // const conditionBase = this.conditionsCtrl[idx].get('conditionBase');
        const prevIdx = idx - 1;

        // Handle validation for Qty Field (New Tier) (FormControl = conditionQty)
        this._qtyValueValidationNewTier(idx, prevIdx);

        // Handle validation for Bonus Sku Field (New Tier) (FormControl = benefitCatalogueId)
        this._benefitBonusSkuValidationNewTier(idx, prevIdx);

        // Handle validation for Bonus Qty Field (New Tier) (FormControl = benefitBonusQty)
        this._benefitBonusQtyValidationNewTier(idx, prevIdx);

        // Handle validation for Order Value Field (New Tier) (FormControl = conditionValue)
        this._orderValueValidationNewTier(idx, prevIdx);

        // Handle validation for Rebate Field (New Tier) (FormControl = benefitRebate)
        this._benefitRebateValidationNewTier(idx, prevIdx);

        // Handle validation for Discount Field (New Tier) (FormControl = benefitDiscount)
        this._benefitDiscountValidationNewTier(idx, prevIdx);

        // Handle validation for Max Rebate Field (New Tier) (FormControl = benefitMaxRebate)
        this._benefitMaxRebateValidationNewTier(idx, prevIdx);

        //   switch (conditionBase.value) {
        //       case ConditionBase.QTY:
        //           // Handle validation for Qty Field (New Tier) (FormControl = conditionQty)
        //           this._qtyValueValidationNewTier(
        //               idx,
        //               prevIdx
        //           );

        //           // Handle validation for Bonus Qty Field (New Tier) (FormControl = benefitBonusQty)
        //           this._benefitBonusQtyValidationNewTier(
        //               idx,
        //               prevIdx
        //           );
        //           return;

        //       case ConditionBase.ORDER_VALUE:
        //           // Handle validation for Order Value Field (New Tier) (FormControl = conditionValue)
        //           this._orderValueValidationNewTier(
        //               idx,
        //               prevIdx
        //           );

        //           // Handle validation for Rebate Field (New Tier) (FormControl = benefitRebate)
        //           this._benefitRebateValidationNewTier(
        //               idx,
        //               prevIdx
        //           );
        //           return;

        //       default:
        //           return;
        //   }
    }

    /**
     *
     * Handle validation for Qty Field (New Tier) (FormControl = conditionQty) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _qtyValueValidationNewTier(idx: number, prevIdx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const conditionQtyCtrl = this.conditionsCtrl[idx].get('conditionQty');
        const prevConditionQtyCtrl = this.conditionsCtrl[prevIdx].get('conditionQty');
        const minNumber = +prevConditionQtyCtrl.value + 1;

        if (conditionBaseCtrl.value === ConditionBase.QTY) {
            conditionQtyCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.digit({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                }),
                RxwebValidators.minNumber({
                    value: minNumber,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'gt_number', {
                        minValue: +prevConditionQtyCtrl.value,
                    }),
                }),
            ]);
        } else {
            conditionQtyCtrl.clearValidators();
        }

        conditionQtyCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Order Value Field (New Tier) (FormControl = conditionValue) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _orderValueValidationNewTier(idx: number, prevIdx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const conditionValueCtrl = this.conditionsCtrl[idx].get('conditionValue');
        const prevConditionValue = this.conditionsCtrl[prevIdx].get('conditionValue');

        let limitNumber = +prevConditionValue.value - 1;

        if (conditionBaseCtrl.value === ConditionBase.ORDER_VALUE) {
            if (benefitTypeCtrl.value === BenefitType.QTY) {
                limitNumber = +prevConditionValue.value + 1;

                conditionValueCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.minNumber({
                        value: limitNumber,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'gt_number',
                            {
                                minValue: +prevConditionValue.value,
                            }
                        ),
                    }),
                ]);
            } else {
                conditionValueCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.maxNumber({
                        value: limitNumber,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'lt_number',
                            {
                                maxValue: +prevConditionValue.value,
                            }
                        ),
                    }),
                ]);
            }
        } else {
            conditionValueCtrl.clearValidators();
        }

        conditionValueCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Bonus Qty Field (New Tier) (FormControl = benefitBonusQty) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _benefitBonusQtyValidationNewTier(idx: number, prevIdx: number): void {
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const benefitBonusQtyCtrl = this.conditionsCtrl[idx].get('benefitBonusQty');
        const prevBenefitBonusQtyCtrl = this.conditionsCtrl[prevIdx].get('benefitBonusQty');
        const minNumber = +prevBenefitBonusQtyCtrl.value + 1;

        if (benefitTypeCtrl.value === BenefitType.QTY) {
            benefitBonusQtyCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.digit({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                }),
                RxwebValidators.minNumber({
                    value: minNumber,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'gt_number', {
                        minValue: +prevBenefitBonusQtyCtrl.value,
                    }),
                }),
            ]);
        } else {
            benefitBonusQtyCtrl.clearValidators();
        }

        benefitBonusQtyCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Bonus Sku Field (New Tier) (FormControl = benefitCatalogueId) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _benefitBonusSkuValidationNewTier(idx: number, prevIdx: number): void {
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const benefitBonusSkuCtrl = this.conditionsCtrl[idx].get('benefitCatalogueId');
        const prevBenefitBonusSkuCtrl = this.conditionsCtrl[prevIdx].get('benefitCatalogueId');

        if (benefitTypeCtrl.value === BenefitType.QTY) {
            benefitBonusSkuCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);

            benefitBonusSkuCtrl.setValue(prevBenefitBonusSkuCtrl.value);
        } else {
            benefitBonusSkuCtrl.clearValidators();
        }

        benefitBonusSkuCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Discount Field (New Tier) (FormControl - benefitDiscount) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _benefitDiscountValidationNewTier(idx: number, prevIdx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const benefitDiscountCtrl = this.conditionsCtrl[idx].get('benefitDiscount');

        if (benefitTypeCtrl.value === BenefitType.PERCENT) {
            benefitDiscountCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
                this._customValidationDiscountLimit(idx, conditionBaseCtrl.value),
            ]);
        } else {
            benefitDiscountCtrl.clearValidators();
        }

        benefitDiscountCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Max Rebate Field (New Tier) (FormControl - benefitMaxRebate) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _benefitMaxRebateValidationNewTier(idx: number, prevIdx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const benefitMaxRebateCtrl = this.conditionsCtrl[idx].get('benefitMaxRebate');

        if (benefitTypeCtrl.value === BenefitType.PERCENT) {
            benefitMaxRebateCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
                // NOTE E1AM-105
                // this._customValidationMaxRebateLimit(idx, conditionBaseCtrl.value),
            ]);
        } else {
            benefitMaxRebateCtrl.clearValidators();
        }

        benefitMaxRebateCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Rebate Field (New Tier) (FormControl - benefitRebate) Tier
     * @private
     * @param {number} idx
     * @param {number} prevIdx
     * @memberof FlexiComboFormComponent
     */
    private _benefitRebateValidationNewTier(idx: number, prevIdx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const benefitTypeCtrl = this.conditionsCtrl[idx].get('benefitType');
        const benefitRebateCtrl = this.conditionsCtrl[idx].get('benefitRebate');

        if (benefitTypeCtrl.value === BenefitType.AMOUNT) {
            benefitRebateCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
                this._customValidationRebateLimit(idx, conditionBaseCtrl.value),
            ]);
        } else {
            benefitRebateCtrl.clearValidators();
        }

        // if (conditionBaseCtrl.value === ConditionBase.ORDER_VALUE) {
        //     benefitRebateCtrl.setValidators([
        //         RxwebValidators.required({
        //             message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
        //         }),
        //         RxwebValidators.digit({
        //             message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
        //         }),
        //         this._customValidationRebateLimit(idx, conditionBaseCtrl.value),
        //     ]);
        // } else {
        //     benefitRebateCtrl.setValidators([
        //         RxwebValidators.required({
        //             message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
        //         }),
        //         RxwebValidators.digit({
        //             message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
        //         }),
        //     ]);
        // }

        benefitRebateCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Discount Field by Benefit Type (FormControl = benefitDiscount) Tier
     * @private
     * @param {BenefitType} benefitType
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _benefitDiscountValidationByBenefitType(benefitType: BenefitType, idx: number): void {
        const conditionBaseCtrl = this.conditionsCtrl[idx].get('conditionBase');
        const benefitDiscountCtrl = this.conditionsCtrl[idx].get('benefitDiscount');

        if (benefitType === BenefitType.PERCENT) {
            benefitDiscountCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
                this._customValidationDiscountLimit(idx, conditionBaseCtrl.value),
            ]);
        } else {
            benefitDiscountCtrl.clearValidators();
        }

        benefitDiscountCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Chosen Brand Field by Trigger Base (FormControl = chosenBrand)
     * @private
     * @param {TriggerBase} triggerBase
     * @memberof FlexiComboFormComponent
     */
    private _chosenBrandValidationByTriggerBase(triggerBase: TriggerBase): void {
        const chosenBrandCtrl = this.form.get('chosenBrand');

        if (triggerBase === TriggerBase.BRAND) {
            chosenBrandCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);
        } else {
            chosenBrandCtrl.clearValidators();
        }

        chosenBrandCtrl.updateValueAndValidity({ onlySelf: true });
    }

    /**
     *
     * Handle validation for Chosen Faktur Field by Trigger Base (FormControl = chosenInvoice)
     * @private
     * @param {TriggerBase} triggerBase
     * @memberof FlexiComboFormComponent
     */
    private _chosenInvoiceValidationByTriggerBase(triggerBase: TriggerBase): void {
        const chosenInvoiceCtrl = this.form.get('chosenInvoice');

        if (triggerBase === TriggerBase.INVOICE) {
            chosenInvoiceCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);
        } else {
            chosenInvoiceCtrl.clearValidators();
        }

        chosenInvoiceCtrl.updateValueAndValidity({ onlySelf: true });
    }

    /**
     *
     * Handle validation for Chosen Sku Field by Trigger Base (FormControl = chosenSku)
     * @private
     * @param {TriggerBase} triggerBase
     * @memberof FlexiComboFormComponent
     */
    private _chosenSkuValidationByTriggerBase(triggerBase: TriggerBase): void {
        const chosenSkuCtrl = this.form.get('chosenSku');

        if (triggerBase === TriggerBase.SKU) {
            chosenSkuCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);
        } else {
            chosenSkuCtrl.clearValidators();
        }

        chosenSkuCtrl.updateValueAndValidity({ onlySelf: true });
    }

    /**
     *
     * Handle validation for Qty Field by Condition Base (FormControl = conditionQty) Tier
     * @private
     * @param {ConditionBase} conditionBase
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _qtyValueValidationByConditionBase(conditionBase: ConditionBase, idx: number): void {
        const qtyValueCtrl = this.conditionsCtrl[idx].get('conditionQty');

        if (conditionBase === ConditionBase.QTY) {
            qtyValueCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);
        } else {
            qtyValueCtrl.clearValidators();

            // qtyValueCtrl.setValidators([
            //     RxwebValidators.numeric({
            //         acceptValue: NumericValueType.PositiveNumber,
            //         allowDecimal: true,
            //         message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
            //     }),
            // ]);
        }

        qtyValueCtrl.updateValueAndValidity();
    }

    
    /**
     *
     * Handle validation for Qty Field by Buy Ratio Condition Base (FormControl = ratioQty)
     * @private
     * @param {RatioBaseCondition} conditionBase
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _qtyValueValidationByRatioConditionBase(ratioBase: RatioBaseCondition, idx: number): void {
        const qtyValueCtrl = this.conditionsCtrl[idx].get('ratioQty');

        if (ratioBase === RatioBaseCondition.QTY) {
            qtyValueCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);
        } else {
            qtyValueCtrl.clearValidators();
        }

        qtyValueCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Order Value Field by Condition Base (FormControl = conditionValue) Tier
     * @private
     * @param {ConditionBase} conditionBase
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _orderValueValidationByConditionBase(conditionBase: ConditionBase, idx: number): void {
        const orderValueCtrl = this.conditionsCtrl[idx].get('conditionValue');

        if (conditionBase === ConditionBase.ORDER_VALUE) {
            orderValueCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);
        } else {
            orderValueCtrl.clearValidators();
        }

        orderValueCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Order Value Field by Ratio Condition Base (FormControl = ratioValue) 
     * @private
     * @param {RatioConditionBase} ratioBase
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _orderValueValidationByRatioConditionBase(ratioBase: RatioBaseCondition, idx: number): void {
        const orderValueCtrl = this.conditionsCtrl[idx].get('ratioValue');

        if (ratioBase === RatioBaseCondition.ORDER_VALUE) {
            orderValueCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);
        } else {
            orderValueCtrl.clearValidators();
        }

        orderValueCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Bonus SKU by Benefit Type (FormtControl = benefitCatalogueId) Tier
     * @private
     * @param {BenefitType} benefitType
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _benefitBonusSkuValidationByBenefitType(benefitType: BenefitType, idx: number): void {
        const benefitBonusSkuCtrl = this.conditionsCtrl[idx].get('benefitCatalogueId');

        if (benefitType === BenefitType.QTY) {
            benefitBonusSkuCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
            ]);
        } else {
            benefitBonusSkuCtrl.clearValidators();
        }

        benefitBonusSkuCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Bonus Qty Field by Benefit Type (FormControl = benefitBonusQty) Tier
     * @private
     * @param {BenefitType} benefitType
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _benefitBonusQtyValidationByBenefitType(benefitType: BenefitType, idx: number): void {
        const benefitBonusQtyCtrl = this.conditionsCtrl[idx].get('benefitBonusQty');

        if (benefitType === BenefitType.QTY) {
            let minNumberValidator = null;

            if (idx > 0) {
                const prevIdx = idx - 1;
                const prevBenefitBonusQtyCtrl = this.conditionsCtrl[prevIdx].get('benefitBonusQty');
                const minNumber = +prevBenefitBonusQtyCtrl.value + 1;

                minNumberValidator = RxwebValidators.minNumber({
                    value: minNumber,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'gt_number', {
                        minValue: +prevBenefitBonusQtyCtrl.value,
                    }),
                });
            } else {
                minNumberValidator = RxwebValidators.minNumber({
                    value: 1,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'min_number', {
                        minValue: 1,
                    }),
                });
            }

            benefitBonusQtyCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.digit({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                }),
                minNumberValidator,
            ]);
        } else {
            benefitBonusQtyCtrl.clearValidators();
        }

        benefitBonusQtyCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Max Rebate Field by Benefit Type (FormControl = benefitMaxRebate) Tier
     * @private
     * @param {BenefitType} benefitType
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _benefitMaxRebateValidationByBenefitType(benefitType: BenefitType, idx: number): void {
        const benefitMaxRebateCtrl = this.conditionsCtrl[idx].get('benefitMaxRebate');

        if (benefitType === BenefitType.PERCENT) {
            const conditionBaseVal = this.conditionsCtrl[idx].get('conditionBase').value;

            // NOTE E1AM-105
            /* if (conditionBaseVal === ConditionBase.ORDER_VALUE) {
                const conditionValue = this.conditionsCtrl[idx].get('conditionValue').value;

                benefitMaxRebateCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),

                    RxwebValidators.lessThan({
                        fieldName: 'conditionValue',
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'lt_number',
                            {
                                maxValue: conditionValue,
                            }
                        ),
                    }),
                ]);
            } else {
                benefitMaxRebateCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ]);
            } */

            benefitMaxRebateCtrl.setValidators([
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.numeric({
                    acceptValue: NumericValueType.PositiveNumber,
                    allowDecimal: true,
                    message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                }),
            ]);
        } else {
            benefitMaxRebateCtrl.clearValidators();
        }

        benefitMaxRebateCtrl.updateValueAndValidity();
    }

    /**
     *
     * Handle validation for Rebate Field by Benefit Type (FormControl = benefitRebateCtrl) Tier
     * @private
     * @param {BenefitType} benefitType
     * @param {number} idx
     * @memberof FlexiComboFormComponent
     */
    private _benefitRebateValidationByBenefitType(benefitType: BenefitType, idx: number): void {
        const benefitRebateCtrl = this.conditionsCtrl[idx].get('benefitRebate');

        if (benefitType === BenefitType.AMOUNT) {
            const conditionBaseVal = this.conditionsCtrl[idx].get('conditionBase').value;

            if (conditionBaseVal === ConditionBase.ORDER_VALUE) {
                const conditionValue = this.conditionsCtrl[idx].get('conditionValue').value;

                benefitRebateCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.lessThan({
                        fieldName: 'conditionValue',
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'lt_number',
                            {
                                maxValue: conditionValue,
                            }
                        ),
                    }),
                ]);
            } else {
                benefitRebateCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ]);
            }
        } else {
            benefitRebateCtrl.clearValidators();
        }

        benefitRebateCtrl.updateValueAndValidity();
    }

    private _createConditions(condition?: ConditionDto): FormGroup {
        return this.formBuilder.group({
            id: null,
            conditionBase: [
                (condition && condition.conditionBase) || ConditionBase.QTY,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            conditionQty: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'min_number',
                            { minValue: 1 }
                        ),
                    }),
                ],
            ],
            conditionValue: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            benefitType: [
                (condition && condition.benefitType) || BenefitType.QTY,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            benefitCatalogueId: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            benefitBonusQty: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'min_number',
                            { minValue: 1 }
                        ),
                    }),
                ],
            ],
            benefitRebate: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            benefitDiscount: null,
            benefitMaxRebate: null,
            multiplication: false,
            applySameSku: false,
            ratioBase: [
                (condition && condition.ratioBase) || ConditionBase.QTY || ConditionBase.ORDER_VALUE || null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            ratioValue: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            ratioQty: [
                null,
                [
                    // RxwebValidators.required({
                    //     message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    // }),
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'min_number',
                            { minValue: 1 }
                        ),
                    }),
                ],
            ],
        });
    }

    private _setFormStatus(status: string): void {
        // console.log(`Test Form ${status}`, this.form, this.form.getRawValue());

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
            case LifecyclePlatform.AfterViewInit:
                if (this.pageType === 'new') {
                    // Display footer action
                    this.store.dispatch(UiActions.showFooterAction());
                }
                break;

            case LifecyclePlatform.OnDestroy:
                this.store.dispatch(FormActions.resetClickCancelButton());

                this.store.dispatch(FormActions.resetCancelButtonAction());

                // Reset form status state
                this.store.dispatch(FormActions.resetFormStatus());

                // Reset click save button state
                this.store.dispatch(FormActions.resetClickSaveButton());

                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                // Reset core state flexiCombos
                this.store.dispatch(FlexiComboActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set footer action
                this.store.dispatch(
                    UiActions.setFooterActionConfig({ payload: this.footerConfig })
                );

                this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));

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

                    const parameter: IQueryParams = {};
                    parameter['splitRequest'] = true;

                    this.store.dispatch(
                        FlexiComboActions.fetchFlexiComboRequest({ payload: { id, parameter } })
                    );

                    this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading).pipe(
                        tap((isLoading) => {
                            if (isLoading) {
                                // this._fuseProgressBarService.show();
                                // Hide footer action
                                this.store.dispatch(UiActions.hideFooterAction());
                            } else {
                                // this._fuseProgressBarService.hide();
                                // Display footer action
                                this.store.dispatch(UiActions.showFooterAction());
                            }
                        })
                    );
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

                // merge(
                //     ...this.conditionsCtrl.map((ctrl: AbstractControl, idx: number) =>
                //         ctrl.valueChanges.pipe(map((value) => ({ rowIdx: idx, value })))
                //     )
                // )
                //     .pipe(takeUntil(this.conditions.valueChanges))
                //     .subscribe((changes) => {
                //         console.log(`Condition Changes`, changes);
                //     });
                console.log('isi form status changes->', this.form.statusChanges)
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
            promoId: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    /* ^[a-zA-Z]+[a-zA-Z0-9-_ ]*[a-zA-Z0-9]$ first character letter next allow alphanum hypen underscore */
                    /* ^[\w-]+$ only allow alphanum hyphen underscore */
                    RxwebValidators.pattern({
                        expression: {
                            alphaNumHyphenUnderscore: /^[a-zA-Z]+[a-zA-Z0-9-_ ]*[a-zA-Z0-9]$/,
                        },
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    // RxwebValidators.alphaNumeric({
                    //     allowWhiteSpace: false,
                    //     message: this._$errorMessage.getErrorMessageNonState(
                    //         'default',
                    //         'alpha_num_pattern'
                    //     ),
                    // }),
                ],
            ],
            promoName: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.alphaNumeric({
                        allowWhiteSpace: true,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    // RxwebValidators.alpha({
                    //     allowWhiteSpace: true,
                    //     message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    // }),
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
                    RxwebValidators.digit({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'numeric'),
                    }),
                ],
            ],
            promoAllocationType: [
                PromoAllocation.NONE || PromoAllocation.PROMOBUDGET || PromoAllocation.PROMOSLOT,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
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
            promoSlot: [
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
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            endDate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            shortDescription: null,
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
            base: [
                TriggerBase.SKU,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenSku: [
                null,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenBrand: null,
            chosenInvoice: null,
            calculationMechanism: [
                CalculationMechanism.NON_CUMULATIVE,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            conditions: this.formBuilder.array([this._createConditions()]),
            segmentationBase: [
                SegmentationBase.SEGMENTATION,
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStore: null,
            chosenWarehouse: null,
            chosenStoreType: null,
            chosenStoreGroup: null,
            chosenStoreChannel: null,
            chosenStoreCluster: null,
            is_new_store: false,
            is_active_store: false
        });

        this.conditionForm = this.form.get('conditions') as FormArray;

        console.log('isi this.conditions->', this.conditions)
        if (this.pageType === 'edit') {
            this._initEditForm();
        }
    }

    private _initEditForm(): void {
        this.store
            .select(FlexiComboSelectors.getSelectedItem)
            .pipe(
                filter((row) => !!row),
                tap((row) => {
                    this.flexiCombo = row;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe((row) => {
                // button promo allocation checke when edit
                this.listPromoAlloc[0].checked = false;
                this.listPromoAlloc[1].checked = true;
                this.listPromoAlloc[2].checked = false;
                this._setEditForm(row);
            });
    }

    private _setEditForm(row: FlexiCombo): void {
        // console.log('ROW', row);
        const promoSellerIdCtrl = this.form.get('promoId');
        const promoNameCtrl = this.form.get('promoName');
        const platformCtrl = this.form.get('platform');
        const maxRedemptionCtrl = this.form.get('maxRedemption');
        const promoBudgetCtrl = this.form.get('promoBudget');
        const startDateCtrl = this.form.get('startDate');
        const endDateCtrl = this.form.get('endDate');
        const shortDescriptionCtrl = this.form.get('shortDescription');
        const voucherCombineCtrl = this.form.get('allowCombineWithVoucher');
        const firstBuyCtrl = this.form.get('firstBuy');
        const triggerBaseCtrl = this.form.get('base');
        const chosenSkuCtrl = this.form.get('chosenSku');
        const chosenBrandCtrl = this.form.get('chosenBrand');
        const chosenFakturCtrl = this.form.get('chosenInvoice');
        const calculationMechanismCtrl = this.form.get('calculationMechanism');
        const segmentationBaseCtrl = this.form.get('segmentationBase');
        const chosenStoreCtrl = this.form.get('chosenStore');
        const chosenWarehouseCtrl = this.form.get('chosenWarehouse');
        const chosenStoreTypeCtrl = this.form.get('chosenStoreType');
        const chosenStoreGroupCtrl = this.form.get('chosenStoreGroup');
        const chosenStoreChannelCtrl = this.form.get('chosenStoreChannel');
        const chosenStoreClusterCtrl = this.form.get('chosenStoreCluster');
        const activeStoreCtrl = this.form.get('is_active_store');
        const newStoreCtrl = this.form.get('is_new_store');

        // Handle Active Store
        if (row.is_active_store) {
            activeStoreCtrl.setValue (row.is_active_store);
        }

        // Handle New Store
        if (row.is_new_store) {
            newStoreCtrl.setValue (row.is_new_store);
        }

        // Handle Promo Seller ID
        if (row.externalId) {
            promoSellerIdCtrl.setValue(row.externalId);
        }

        // Handle Promo Name
        if (row.name) {
            promoNameCtrl.setValue(row.name);
        }

        // Handle Platform
        if (row.platform) {
            platformCtrl.setValue(row.platform);
        }

        // Handle Max Redemption per Buyer
        if (row.maxRedemptionPerStore) {
            maxRedemptionCtrl.setValue(row.maxRedemptionPerStore);
        }

        // Handle Promo Budget
        if (row.promoBudget) {
            promoBudgetCtrl.setValue(row.promoBudget);
        }

        // Handle Start Date
        if (row.startDate) {
            startDateCtrl.setValue(moment(row.startDate));
        }

        // Handle End Date
        if (row.endDate) {
            endDateCtrl.setValue(moment(row.endDate));
        }

        // Handle Short Description
        if (row.shortDescription) {
            shortDescriptionCtrl.setValue(row.shortDescription);
        }

        // Handle Allow Combine with Voucher
        if (row.voucherCombine) {
            voucherCombineCtrl.setValue(row.voucherCombine);
        }

        // Handle First Buy
        if (row.firstBuy) {
            firstBuyCtrl.setValue(row.firstBuy);
        }

        // Handle Trigger Base
        if (row.base) {
            triggerBaseCtrl.setValue(row.base);

            this._chosenBrandValidationByTriggerBase(row.base);
            this._chosenInvoiceValidationByTriggerBase(row.base);
            this._chosenSkuValidationByTriggerBase(row.base);

            // Handle Trigger Base Sku
            if (row.base === TriggerBase.SKU) {
                // Handle Chosen Sku
                if (row.promoCatalogues && row.promoCatalogues.length > 0) {
                    const newCatalogues = _.orderBy(
                        row.promoCatalogues.map((item) => ({
                            id: item.catalogue.id,
                            label: item.catalogue.name,
                            group: 'catalogues',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenSkuCtrl.setValue(newCatalogues);
                }
            }

            // Handle Trigger Base Brand
            else if (row.base === TriggerBase.BRAND) {
                // Handle Chosen Brand
                if (row.promoBrands && row.promoBrands.length > 0) {
                    const newBrands = _.orderBy(
                        row.promoBrands.map((item) => ({
                            id: item.brand.id,
                            label: item.brand.name,
                            group: 'brand',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenBrandCtrl.setValue(newBrands);
                }
            }

            // Handle Trigger Base Faktur
            else if (row.base === TriggerBase.INVOICE) {
                // Handle Chosen Fakture
                if (row.promoInvoiceGroups && row.promoInvoiceGroups.length > 0) {
                    const newInvoiceGroups = _.orderBy(
                        row.promoInvoiceGroups.map((item) => ({
                            id: item.invoiceGroup.id,
                            label: item.invoiceGroup.name,
                            group: 'faktur',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenFakturCtrl.setValue(newInvoiceGroups);
                }
            }
        }

        // Handle Conditions & Benefit
        if (row.promoConditions && row.promoConditions.length > 0) {
            const newPromoConditions: ConditionDto[] = _.orderBy(
                row.promoConditions.map((item) => {
                    return new ConditionDto({
                        id: item.id,
                        conditionBase: item.conditionBase,
                        conditionQty: item.conditionQty,
                        conditionValue: item.conditionValue,
                        benefitType: item.benefitType,
                        benefitCatalogueId: item.benefitCatalogueId,
                        catalogue: item.catalogue
                            ? {
                                  id: item.catalogue.id,
                                  label: item.catalogue.name,
                                  group: 'catalogues',
                              }
                            : null,
                        benefitBonusQty: item.benefitBonusQty,
                        multiplication: item.multiplication,
                        benefitRebate: item.benefitRebate,
                        benefitDiscount: item.benefitDiscount,
                        benefitMaxRebate: item.benefitMaxRebate,
                        ratioBase: item.ratioBase,
                        ratioQty: item.ratioQty,
                        ratioValue: item.ratioValue,
                    });
                }),
                ['id'],
                ['asc']
            );

            this._setEditConditionForm(row, newPromoConditions);
        }

        // Handle Calculation Mechanism
        if (typeof row.isCumulative === 'boolean') {
            const newCalculationMechanism = row.isCumulative
                ? CalculationMechanism.CUMULATIVE
                : CalculationMechanism.NON_CUMULATIVE;

            calculationMechanismCtrl.setValue(newCalculationMechanism);
        }

        // Handle Segmentation Base
        if (row.target) {
            segmentationBaseCtrl.setValue(row.target);

            // Handle Segmentation Base Direct Store
            if (row.target === SegmentationBase.STORE) {
                // Handle Chosen Store
                if (row.promoStores && row.promoStores.length > 0) {
                    const newStores = _.orderBy(
                        row.promoStores.map((item) => ({
                            id: item.store.id,
                            label: item.store.name,
                            group: 'supplier-stores',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenStoreCtrl.setValue(newStores);
                } else {
                    chosenStoreCtrl.setValue([]);
                }

                chosenStoreCtrl.setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.choice({
                        minLength: 1,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ]);

                chosenStoreCtrl.updateValueAndValidity();
            }

            // Handle Segmentation Base Segmentation
            else if (row.target === SegmentationBase.SEGMENTATION) {
                // Handle Chosen Warehouse
                if (row.promoWarehouses && row.promoWarehouses.length > 0) {
                    const newWarehouses = _.orderBy(
                        row.promoWarehouses.map((item) => ({
                            id: item.warehouse.id,
                            label: item.warehouse.name,
                            group: 'warehouses',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenWarehouseCtrl.setValue(newWarehouses);
                } else {
                    chosenWarehouseCtrl.setValue([]);
                }

                // chosenWarehouseCtrl.setValidators([
                //     RxwebValidators.required({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                //     RxwebValidators.choice({
                //         minLength: 1,
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                // ]);

                // chosenWarehouseCtrl.updateValueAndValidity();

                // Handle Chosen Store Type
                if (row.promoTypes && row.promoTypes.length > 0) {
                    const newStoreTypes = _.orderBy(
                        row.promoTypes.map((item) => ({
                            id: item.type.id,
                            label: item.type.name,
                            group: 'store-segmentation-types',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenStoreTypeCtrl.setValue(newStoreTypes);
                } else {
                    chosenStoreTypeCtrl.setValue([]);
                }

                // chosenStoreTypeCtrl.setValidators([
                //     RxwebValidators.required({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                //     RxwebValidators.choice({
                //         minLength: 1,
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                // ]);

                // chosenStoreTypeCtrl.updateValueAndValidity();

                // Handle Chosen Store Group
                if (row.promoGroups && row.promoGroups.length > 0) {
                    const newStoreGroups = _.orderBy(
                        row.promoGroups.map((item) => ({
                            id: item.group.id,
                            label: item.group.name,
                            group: 'store-segmentation-groups',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenStoreGroupCtrl.setValue(newStoreGroups);
                } else {
                    chosenStoreGroupCtrl.setValue([]);
                }

                // chosenStoreGroupCtrl.setValidators([
                //     RxwebValidators.required({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                //     RxwebValidators.choice({
                //         minLength: 1,
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                // ]);

                // chosenStoreGroupCtrl.updateValueAndValidity();

                // Handle Chosen Store Channel
                if (row.promoChannels && row.promoChannels.length > 0) {
                    const newStoreChannels = _.orderBy(
                        row.promoChannels.map((item) => ({
                            id: item.channel.id,
                            label: item.channel.name,
                            group: 'store-segmentation-channels',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenStoreChannelCtrl.setValue(newStoreChannels);
                } else {
                    chosenStoreChannelCtrl.setValue([]);
                }

                // chosenStoreChannelCtrl.setValidators([
                //     RxwebValidators.required({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                //     RxwebValidators.choice({
                //         minLength: 1,
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                // ]);

                // chosenStoreChannelCtrl.updateValueAndValidity();

                // Handle Chosen Store Cluster
                if (row.promoClusters && row.promoClusters.length > 0) {
                    const newStoreClusters = _.orderBy(
                        row.promoClusters.map((item) => ({
                            id: item.cluster.id,
                            label: item.cluster.name,
                            group: 'store-segmentation-clusters',
                        })),
                        ['label'],
                        ['asc']
                    );

                    chosenStoreClusterCtrl.setValue(newStoreClusters);
                } else {
                    chosenStoreClusterCtrl.setValue([]);
                }

                // chosenStoreClusterCtrl.setValidators([
                //     RxwebValidators.required({
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                //     RxwebValidators.choice({
                //         minLength: 1,
                //         message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                //     }),
                // ]);

                // chosenStoreClusterCtrl.updateValueAndValidity();
            }
        }

        // Trigger Base
        // this.form.get('base').disable();
        // this.form.get('chosenSku').disable();
        // this.form.get('chosenBrand').disable();
        // this.form.get('chosenInvoice').disable();

        // Customer Segmentation Setting
        // this.form.get('segmentationBase').disable();
        // this.form.get('chosenStore').disable();
        // this.form.get('chosenWarehouse').disable();
        // this.form.get('chosenStoreType').disable();
        // this.form.get('chosenStoreGroup').disable();
        // this.form.get('chosenStoreChannel').disable();
        // this.form.get('chosenStoreCluster').disable();

        setTimeout(() => {
            if (this.form.invalid) {
                this.form.markAllAsTouched();
            }
        });
    }

    private _setEditConditionForm(row: FlexiCombo, promoConditions: ConditionDto[]): void {
        for (const [idx, item] of promoConditions.entries()) {
            const limitIdx =
                promoConditions && promoConditions.length > 0
                    ? promoConditions.length - 1
                    : promoConditions.length;
            const nextIdx = this.conditions && this.conditions.length;
            const currIdx = nextIdx - 1;

            if (nextIdx <= limitIdx) {
                // Handle add new FormControl for setValue index item 1
                this.conditions.push(this._createConditions());
            }

            // if (idx !== limitIdx) {
            //     // Disable not last tier
            //     this.conditionsCtrl[idx].disable({
            //         onlySelf: true,
            //     });
            // }

            // if (idx === limitIdx) {
            //     // Disable conditionBase control (New Tier)
            //     this.conditionsCtrl[idx].get('conditionBase').disable({
            //         onlySelf: true,
            //     });

            //     // Disable benefitType control (New Tier)
            //     this.conditionsCtrl[idx].get('benefitType').disable({
            //         onlySelf: true,
            //     });
            // }

            if (idx < limitIdx) {
                this.conditionsCtrl[idx].disable({ onlySelf: true });
            }

            if (promoConditions.length !== 1) {
                // Disable conditionBase control (New Tier)
                this.conditionsCtrl[idx].get('conditionBase').disable({ onlySelf: true });

                // Disable benefitType control (New Tier)
                this.conditionsCtrl[idx].get('benefitType').disable({ onlySelf: true });

                // Disable benefitCatalogueId control (New Tier)
                this.conditionsCtrl[idx].get('benefitCatalogueId').disable({ onlySelf: true });
            }

            this.conditions.at(idx).get('id').setValue(item.id);

            // Handle Condition Base Field
            this.conditions.at(idx).get('conditionBase').setValue(item.conditionBase);

            if (item.conditionBase === ConditionBase.QTY) {
                // Handle Qty Field
                this.conditions.at(idx).get('conditionQty').setValue(item.conditionQty);
            } else if (item.conditionBase === ConditionBase.ORDER_VALUE) {
                // Handle Order Value Field
                this.conditions.at(idx).get('conditionValue').setValue(item.conditionValue);
            }

            // Handle Benefit Type Field
            this.conditions.at(idx).get('benefitType').setValue(item.benefitType);

            if (item.benefitType === BenefitType.QTY) {
                // Handle Bonus Sku Field
                this.conditions.at(idx).get('benefitCatalogueId').setValue(item.catalogue);

                // Handle Bonus Qty Field
                this.conditions.at(idx).get('benefitBonusQty').setValue(item.benefitBonusQty);
            } else if (item.benefitType === BenefitType.AMOUNT) {
                // Handle Rebate Field
                this.conditions.at(idx).get('benefitRebate').setValue(item.benefitRebate);
            } else if (item.benefitType === BenefitType.PERCENT) {
                // Handle Benefit Discount Field
                this.conditions.at(idx).get('benefitDiscount').setValue(item.benefitDiscount);

                // Handle Benefit Max Rebate Field
                this.conditions.at(idx).get('benefitMaxRebate').setValue(item.benefitMaxRebate);
            }

            // Handle Qty Field Validation
            this._qtyValueValidationByConditionBase(item.conditionBase, idx);

            // Handle Order Value Field Validation
            this._orderValueValidationByConditionBase(item.conditionBase, idx);

            // Handle Bonus Sku Field Validation
            this._benefitBonusSkuValidationByBenefitType(item.benefitType, idx);

            // Handle Bonus Qty Field Validation
            this._benefitBonusQtyValidationByBenefitType(item.benefitType, idx);

            // Handle Rebate Field Validation
            this._benefitRebateValidationByBenefitType(item.benefitType, idx);

            // Handle Benefit Discount Field Validation
            this._benefitDiscountValidationByBenefitType(item.benefitType, idx);

            // Handle Benefit Max Rebate Field Validation
            this._benefitMaxRebateValidationByBenefitType(item.benefitType, idx);

            // Handle Ratio Buy Qty Field Validation
            this._qtyValueValidationByRatioConditionBase(item.ratioBase, idx);

             // Handle Ratio Buy Order Value Field Validation
            this._orderValueValidationByRatioConditionBase(item.ratioBase, idx);
        }
    }

    private _onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        const body = this.form.getRawValue();
        console.log('isi body onsubmit->', body)
        const {
            allowCombineWithVoucher,
            base,
            chosenBrand,
            chosenInvoice,
            chosenSku,
            chosenStore,
            chosenStoreChannel,
            chosenStoreCluster,
            chosenStoreGroup,
            chosenStoreType,
            chosenWarehouse,
            conditions,
            endDate,
            shortDescription,
            firstBuy,
            imgSuggestion,
            maxRedemption,
            platform,
            promoBudget,
            promoId,
            promoName,
            segmentationBase,
            startDate,
            promoAllocationType,
            promoSlot,
            is_new_store,
            is_active_store
        } = body;

        const newChosenSku =
            chosenSku && chosenSku.length > 0 && base === TriggerBase.SKU
                ? chosenSku.map((sku: Catalogue) => sku.id)
                : [];
        const newChosenBrand =
            chosenBrand && chosenBrand.length > 0 && base === TriggerBase.BRAND
                ? chosenBrand.map((brand: Brand) => brand.id)
                : [];
        const newChosenFaktur =
            chosenInvoice && chosenInvoice.length > 0 && base === TriggerBase.INVOICE
                ? chosenInvoice.map((invoice: Selection) => invoice.id)
                : [];
        const newChosenStore =
            chosenStore && chosenStore.length > 0 && segmentationBase === SegmentationBase.STORE
                ? chosenStore.map((store: Selection) => store.id)
                : [];
        const newChosenWarehouse =
            chosenWarehouse &&
            chosenWarehouse.length > 0 &&
            segmentationBase === SegmentationBase.SEGMENTATION
                ? chosenWarehouse.map((warehouse: Selection) => warehouse.id)
                : [];
        const newChosenStoreType =
            chosenStoreType &&
            chosenStoreType.length > 0 &&
            segmentationBase === SegmentationBase.SEGMENTATION
                ? chosenStoreType.map((storeType: Selection) => storeType.id)
                : [];
        const newChosenStoreGroup =
            chosenStoreGroup &&
            chosenStoreGroup.length > 0 &&
            segmentationBase === SegmentationBase.SEGMENTATION
                ? chosenStoreGroup.map((storeGroup: Selection) => storeGroup.id)
                : [];
        const newChosenStoreChannel =
            chosenStoreChannel &&
            chosenStoreChannel.length > 0 &&
            segmentationBase === SegmentationBase.SEGMENTATION
                ? chosenStoreChannel.map((storeChannel: Selection) => storeChannel.id)
                : [];
        const newChosenStoreCluster =
            chosenStoreCluster &&
            chosenStoreCluster.length > 0 &&
            segmentationBase === SegmentationBase.SEGMENTATION
                ? chosenStoreCluster.map((storeCluster: Selection) => storeCluster.id)
                : [];

        const newConditions =
            conditions && conditions.length > 0
                ? conditions.map((condition) => {
                      const {
                          conditionBase,
                          conditionQty,
                          conditionValue,
                          benefitType,
                          benefitCatalogueId,
                          benefitBonusQty,
                          multiplication,
                          benefitRebate,
                          benefitDiscount,
                          benefitMaxRebate,
                          id,
                          ratioBase,
                          ratioQty,
                          ratioValue,
                      } = condition;

                      let conditionObject = {};

                      if (conditionBase === ConditionBase.QTY) {
                          conditionObject = {
                              conditionQty,
                          };
                      } else if (conditionBase === ConditionBase.ORDER_VALUE) {
                          conditionObject = {
                              conditionValue,
                          };
                      } else if (ratioBase === RatioBaseCondition.QTY) {
                        conditionObject = {
                            ratioQty,
                        };
                      } else if (ratioBase === RatioBaseCondition.ORDER_VALUE) {
                        conditionObject = {
                            ratioValue,
                        };
                      }

                      const sameObj = {
                          conditionBase,
                          ratioBase,
                          ...conditionObject,
                          benefitType,
                          multiplication: this.multiStat,
                      };

                      if (this.pageType === 'edit') {
                          sameObj['id'] = id;
                      }

                      if (this.multiStat == false) {
                          sameObj['ratioBase'] = null;
                          sameObj['ratioQty'] = null;
                          sameObj['ratioValue'] = null;
                        // this.form.get('chosenStoreCluster').setValue(null);
                      }

                      if (benefitType === BenefitType.QTY) {
                          return {
                              ...sameObj,
                              benefitCatalogueId: benefitCatalogueId.id,
                              benefitBonusQty,
                          };
                      } else if (benefitType === BenefitType.AMOUNT) {
                          return {
                              ...sameObj,
                              benefitRebate,
                          };
                      } else if (benefitType === BenefitType.PERCENT) {
                          return {
                              ...sameObj,
                              benefitDiscount,
                              benefitMaxRebate,
                          };
                      }

                      return condition;
                  })
                : [];

        const newStartDate =
            startDate && moment.isMoment(startDate)
                ? startDate.toISOString(this.strictISOString)
                : null;
        const newEndDate =
            endDate && moment.isMoment(endDate) ? endDate.toISOString(this.strictISOString) : null;

        if (this.pageType === 'new') {
            const payload: CreateFlexiComboDto = {
                base,
                conditions: newConditions,
                dataBase: {},
                dataTarget: {},
                endDate: newEndDate,
                externalId: promoId,
                firstBuy,
                image: imgSuggestion || null,
                maxRedemptionPerStore: maxRedemption,
                name: promoName,
                platform,
                promoBudget,
                shortDescription: shortDescription || null,
                startDate: newStartDate,
                status: EStatus.ACTIVE,
                supplierId: null,
                target: segmentationBase,
                type: 'flexi',
                voucherCombine: allowCombineWithVoucher,
                promoAllocationType,
                promoSlot,
                is_new_store,
                is_active_store
            };

            if (base === TriggerBase.SKU) {
                payload.dataBase.catalogueId = newChosenSku;
            } else if (base === TriggerBase.BRAND) {
                payload.dataBase.brandId = newChosenBrand;
            } else if (base === TriggerBase.INVOICE) {
                payload.dataBase.invoiceGroupId = newChosenFaktur;
            }

            if (segmentationBase === SegmentationBase.STORE) {
                payload.dataTarget.storeId = newChosenStore;
            } else if (segmentationBase === SegmentationBase.SEGMENTATION) {
                payload.dataTarget.warehouseId = newChosenWarehouse;
                payload.dataTarget.typeId = newChosenStoreType;
                payload.dataTarget.groupId = newChosenStoreGroup;
                payload.dataTarget.channelId = newChosenStoreChannel;
                payload.dataTarget.clusterId = newChosenStoreCluster;
            }

            // console.log('[NEW] OnSubmit 1', body);
            // console.log('[NEW] OnSubmit 2', payload);
            console.log('isi payload save add new->', payload)
            this.store.dispatch(FlexiComboActions.createFlexiComboRequest({ payload }));
        } else if (this.pageType === 'edit') {
            const { id } = this.route.snapshot.params;

            const payload: PatchFlexiComboDto = {
                base,
                conditions: newConditions,
                dataBase: {},
                dataTarget: {},
                endDate: newEndDate,
                externalId: promoId,
                firstBuy,
                image: imgSuggestion || null,
                maxRedemptionPerStore: maxRedemption,
                name: promoName,
                platform,
                promoBudget,
                shortDescription,
                startDate: newStartDate,
                status: EStatus.ACTIVE,
                supplierId: null,
                target: segmentationBase,
                type: 'flexi',
                voucherCombine: allowCombineWithVoucher,
                promoAllocationType,
                promoSlot
            };

            if (!imgSuggestion) {
                delete payload.image;
            }

            if (base === TriggerBase.SKU) {
                payload.dataBase.catalogueId = newChosenSku;
            } else if (base === TriggerBase.BRAND) {
                payload.dataBase.brandId = newChosenBrand;
            } else if (base === TriggerBase.INVOICE) {
                payload.dataBase.invoiceGroupId = newChosenFaktur;
            }

            if (segmentationBase === SegmentationBase.STORE) {
                payload.dataTarget.storeId = newChosenStore;
            } else if (segmentationBase === SegmentationBase.SEGMENTATION) {
                payload.dataTarget.warehouseId = newChosenWarehouse;
                payload.dataTarget.typeId = newChosenStoreType;
                payload.dataTarget.groupId = newChosenStoreGroup;
                payload.dataTarget.channelId = newChosenStoreChannel;
                payload.dataTarget.clusterId = newChosenStoreCluster;
            }

            if (Object.keys(payload.dataBase).length < 1) {
                payload.dataBase = null;
            }

            if (Object.keys(payload.dataTarget).length < 1) {
                payload.dataTarget = null;
            }

            if (id && Object.keys(payload).length > 0) {
                this.store.dispatch(
                    FlexiComboActions.updateFlexiComboRequest({
                        payload: { id, body: payload },
                    })
                );
            }
        }
    }

    private _customValidationDiscountLimit(idx: number, conditionBase: ConditionBase): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (idx < 0) {
                return null;
            }

            const discountVal = +control.value;

            let minLimit = 0;
            let maxLimit = 100;

            if (idx === 0) {
                if (discountVal < minLimit || discountVal > maxLimit) {
                    return {
                        range: {
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'between_number',
                                {
                                    minValue: minLimit,
                                    maxValue: maxLimit,
                                }
                            ),
                        },
                        minValue: minLimit,
                        maxValue: maxLimit,
                    };
                }

                return null;
            }

            const prevIdx = idx - 1;
            const prevBenefitDiscountCtrl = this.conditionsCtrl[prevIdx].get('benefitDiscount');
            const prevBenefitDiscountVal = +prevBenefitDiscountCtrl.value;

            if (conditionBase === ConditionBase.ORDER_VALUE) {
                const conditionValueCtrl = this.conditionsCtrl[idx].get('conditionValue');
                const conditionValueVal = +conditionValueCtrl.value;

                maxLimit = prevBenefitDiscountVal;

                if (conditionValueVal < prevBenefitDiscountVal) {
                    maxLimit = conditionValueVal;
                }

                if (discountVal < minLimit || discountVal >= maxLimit) {
                    return {
                        range: {
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'range_lt_number',
                                {
                                    minValue: 0,
                                    maxValue: maxLimit,
                                }
                            ),
                        },
                        minValue: minLimit,
                        maxValue: maxLimit,
                    };
                }

                return null;
            }

            minLimit = prevBenefitDiscountVal;

            if (discountVal <= minLimit || discountVal > maxLimit) {
                return {
                    range: {
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'range_gt_number',
                            {
                                minValue: minLimit,
                                maxValue: maxLimit,
                            }
                        ),
                    },
                    minValue: minLimit,
                    maxValue: maxLimit,
                };
            }

            return null;
        };
    }

    private _customValidationMaxRebateLimit(
        idx: number,
        conditionBase: ConditionBase
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (idx < 1) {
                return null;
            }

            const maxRebateVal = +control.value;
            const prevIdx = idx - 1;
            const prevBenefitMaxRebateCtrl = this.conditionsCtrl[prevIdx].get('benefitMaxRebate');
            const prevBenefitMaxRebateVal = +prevBenefitMaxRebateCtrl.value;

            let limitNumber = prevBenefitMaxRebateVal;

            if (conditionBase === ConditionBase.ORDER_VALUE) {
                const conditionValueCtrl = this.conditionsCtrl[idx].get('conditionValue');
                const conditionValueVal = +conditionValueCtrl.value;

                // limitNumber = conditionValueVal;

                if (conditionValueVal < prevBenefitMaxRebateVal) {
                    limitNumber = conditionValueVal;
                }

                if (maxRebateVal >= limitNumber) {
                    return {
                        lte: {
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'lt_number',
                                {
                                    maxValue: limitNumber,
                                }
                            ),
                        },
                        maxVal: limitNumber,
                    };
                }

                return null;
            }

            if (maxRebateVal <= limitNumber) {
                return {
                    lte: {
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'gt_number',
                            {
                                minValue: limitNumber,
                            }
                        ),
                    },
                    minValue: limitNumber,
                };
            }

            return null;
        };
    }

    private _customValidationRebateLimit(idx: number, conditionBase: ConditionBase): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (idx < 1) {
                return null;
            }

            const rebateVal = +control.value;
            const prevIdx = idx - 1;
            const prevBenefitRebateCtrl = this.conditionsCtrl[prevIdx].get('benefitRebate');
            const prevBenefitRebateVal = +prevBenefitRebateCtrl.value;

            let limitNumber = prevBenefitRebateVal;

            if (conditionBase === ConditionBase.ORDER_VALUE) {
                const conditionValueCtrl = this.conditionsCtrl[idx].get('conditionValue');
                const conditionValueVal = +conditionValueCtrl.value;

                // limitNumber = conditionValueVal;

                if (conditionValueVal < prevBenefitRebateVal) {
                    limitNumber = conditionValueVal;
                }

                if (rebateVal >= limitNumber) {
                    return {
                        lte: {
                            message: this._$errorMessage.getErrorMessageNonState(
                                'default',
                                'lt_number',
                                {
                                    maxValue: limitNumber,
                                }
                            ),
                        },
                        maxVal: limitNumber,
                    };
                }

                return null;
            }

            if (rebateVal <= limitNumber) {
                return {
                    lte: {
                        message: this._$errorMessage.getErrorMessageNonState(
                            'default',
                            'gt_number',
                            {
                                minValue: limitNumber,
                            }
                        ),
                    },
                    minValue: limitNumber,
                };
            }

            return null;
        };
    }
}
