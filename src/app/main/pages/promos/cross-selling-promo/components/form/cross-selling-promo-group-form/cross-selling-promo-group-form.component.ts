import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    OnChanges,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation,
    SimpleChanges
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatRadioChange, MatSelect, MatSelectChange } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { CataloguesDropdownComponent } from 'app/shared/components/dropdowns/catalogues/catalogues.component';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { MultipleSelectionComponent } from 'app/shared/components/multiple-selection/multiple-selection.component';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { FormMode, FormStatus, LogicRelation } from 'app/shared/models';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupFormDto, SegmentSettingFormDto, SettingTargetDto } from '../../../models';
import { CrossSellingPromoFormService } from '../../../services';
import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models/warehouse.model';
import { MAT_MENU_SCROLL_STRATEGY_FACTORY } from '@angular/material/menu/typings/menu-trigger';
import { CrossSellingPromoFormPageComponent } from '../../../pages/cross-selling-promo-form-page/cross-selling-promo-form-page.component'
@Component({
    selector: 'app-cross-selling-promo-group-form',
    templateUrl: './cross-selling-promo-group-form.component.html',
    styleUrls: ['./cross-selling-promo-group-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingPromoGroupFormComponent implements OnInit, OnChanges, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    readonly prefixPayloadGroup: string = 'Group';
    readonly prefixInvoiceGroup: string = 'invoice-';
    readonly prefixLogic: string = 'logic-';
    readonly prefixSku: string = 'sku-';
    readonly limitMaxGroupSku: number = 5;

    conditionBase: { id: ConditionBase; label: string }[];
    logicRelation: { id: LogicRelation; label: string }[];
    triggerBase: { id: TriggerBase; label: string }[];
    invoiceGroups: InvoiceGroup[];
    conditionBaseType = ConditionBase;
    groups: FormArray;
    hiddenInoviceGroup: boolean = false;
    warehouseSelected = [];
    errorWarehouse: boolean = false;
    statusMulti: boolean = false;

    @Input() getGeneral: FormGroup;
    @Output() getGeneralChange = new EventEmitter();
    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValue: EventEmitter<GroupFormDto> = new EventEmitter();

    @Output()
    fakturName: EventEmitter<string> = new EventEmitter();

    @ViewChild('beforeLimit', { static: false })
    beforeLimit: TemplateRef<any>;

    @ViewChild('afterLimit', { static: false })
    afterLimit: TemplateRef<any>;

    @ViewChildren('selectInvoice')
    selectInvoice: QueryList<MatSelect>;

    @ViewChildren('selectLogic')
    selectLogic: QueryList<MatSelect>;

    @ViewChildren('selectSku')
    selectSku: QueryList<CataloguesDropdownComponent>;
    
    constructor(
        private crossSellingPromoFormService: CrossSellingPromoFormService,
        private applyDialogFactoryService: ApplyDialogFactoryService,
        private errorMessageService: ErrorMessageService,
        private helperService: HelperService,
        private cdRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.conditionBase = this.crossSellingPromoFormService.conditionBase;
        this.logicRelation = this.crossSellingPromoFormService.logicRelation;
        this.triggerBase = this.crossSellingPromoFormService.triggerBase;
        this.crossSellingPromoFormService.invoiceGroups$
            .pipe(takeUntil(this.unSubs$))
            .subscribe((item) => (this.invoiceGroups = item));

        this.groups = this.form.get('groups') as FormArray;
        this.form.statusChanges.pipe(takeUntil(this.unSubs$)).subscribe((status: FormStatus) => {
            if (status === 'VALID') {
                this._handleFormValue();
            }

            this.formStatus.emit(status);
        });
         // Mark for check
         this.cdRef.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['getGeneral'].currentValue) {
            this.statusMulti = this.getGeneral['multiplication'];
        }
         
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onWarehouseSelected(ev: Warehouse[]): void {
        const chosenWarehouseCtrl = this.form.get('chosenWarehouse');
        // chosenWarehouseCtrl.markAsDirty();
        // chosenWarehouseCtrl.markAsTouched();
        if (!ev.length) {
            // chosenWarehouseCtrl.setValue('');
            this.errorWarehouse = true;
            this.warehouseSelected = [];
        } else {
            this.errorWarehouse = false;
            const newWarehouses: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'warehouses',
            }));
            
            this.warehouseSelected = newWarehouses;
            // chosenWarehouseCtrl.setValue(this.warehouseSelected);
        }
    }

    onApplySku(value: Selection[], idx: number): void {
        this._ruleShowAlert(value, idx);
    }

    onClosedSku(ev: ApplyDialogService<MultipleSelectionComponent>, idx: number): void {
        const selectSkuCtrl = this.selectSku.toArray()[idx];

        if (selectSkuCtrl) {
            selectSkuCtrl.dialog.close();
        }
    }

    onChangeConditionBase(ev: MatRadioChange, idx: number): void {
        if (this.statusMulti == true) {
            const choosenBase = this.form.get(['groups', 1, 'conditionBase']);
                if (ev.value === ConditionBase.ORDER_VALUE) {
                    choosenBase.setValue('value');
                    this._clearOrderQtyValidation(0);
                    this._clearOrderQtyValidation(1);
                    this._setOrderValueValidation(0);
                    this._setOrderValueValidation(1);
                } else {
                    choosenBase.setValue('qty');
                    this._clearOrderValueValidation(0);
                    this._clearOrderValueValidation(1);
                    this._setOrderQtyValidation(0);
                    this._setOrderQtyValidation(1);
                }
        } else {
            if (ev.value === ConditionBase.ORDER_VALUE) {
                this._clearOrderQtyValidation(idx);
                this._setOrderValueValidation(idx);
            } else {
                this._clearOrderValueValidation(idx);
                this._setOrderQtyValidation(idx);
            }
        }
    }

    onChangeInvoiceGroup(ev: MatSelectChange, idx: number): void {
        if (!ev.value || !this.invoiceGroups || !this.invoiceGroups.length) {
            // Reset faktur select in Group 2
            this._resetFakturGroup2();
            return;
        }

        const invoiceIdx = this.invoiceGroups.findIndex((source) => source.id === ev.value);

        if (this.invoiceGroups[invoiceIdx]) {
            this.fakturName.emit(this.invoiceGroups[invoiceIdx].name || null);

            if (idx === 0) {
                // Disable faktur select in Group 2
                this.selectInvoice.last.ngControl.control.setValue(ev.value);
                this.selectInvoice.last.ngControl.control.disable();
            } else if (idx === 1) {
                this.selectInvoice.first.ngControl.control.setValue(ev.value);
                this.selectInvoice.last.ngControl.control.disable();
            }
        }
    }

    onSkuSelected(ev: Catalogue[], idx: number): void {
        const chosenSkuCtrl = this.form.get(['groups', idx, 'chosenSku']);

        chosenSkuCtrl.markAsDirty();
        chosenSkuCtrl.markAsTouched();

        if (!ev.length) {
            chosenSkuCtrl.setValue(null);
        } else {
            const selectLogicControl = this.selectLogic.toArray()[idx];

            if (ev.length === 1) {
                if (selectLogicControl) {
                    selectLogicControl.ngControl.control.setValue(LogicRelation.NA);
                }
            } else {
            }

            const newSku: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'catalogues',
            }));

            chosenSkuCtrl.setValue(newSku);
        }
    }

    private _handleFormValue(): void {
        const { groups } = this.form.getRawValue();
        const payloadWarehouse = {
            dataTarget: {}
        };

        payloadWarehouse['dataTarget'] = this._payloadTypeSegment(payloadWarehouse['dataTarget'], this.warehouseSelected);

        const groupOne = groups && groups.length ? groups[0] : null;
        const skuGroupOne = groupOne['chosenSku'];
        const newGroupOne =
            groupOne && skuGroupOne && skuGroupOne.length
                ? skuGroupOne
                      .map((item) => ({
                          crossSellingGroup: `${this.prefixPayloadGroup} 1`,
                          crossSellingGroupRelation:
                              (skuGroupOne.length === 1 && LogicRelation.AND) ||
                              groupOne['relation'],
                          catalogueId: +item['id'] || null,
                          conditionBase: groupOne['conditionBase'],
                          conditionQty:
                              (groupOne['conditionBase'] === ConditionBase.QTY &&
                                  +groupOne['conditionQty']) ||
                              null,
                          conditionValue:
                              (groupOne['conditionBase'] === ConditionBase.ORDER_VALUE &&
                                  +groupOne['conditionValue']) ||
                              null,
                      }))
                      .filter((item) => item.catalogueId)
                : [];

        const groupTwo = groups && groups.length ? groups[1] || null : null;
        const skuGroupTwo = groupTwo && groupTwo['chosenSku'];
        const newGroupTwo =
            groupTwo && skuGroupTwo && skuGroupTwo.length
                ? skuGroupTwo
                      .map((item) => ({
                          crossSellingGroup: `${this.prefixPayloadGroup} 2`,
                          crossSellingGroupRelation:
                              (skuGroupTwo.length === 1 && LogicRelation.AND) ||
                              groupTwo['relation'],
                          catalogueId: +item['id'] || null,
                          conditionBase: groupTwo['conditionBase'],
                          conditionQty:
                              (groupTwo['conditionBase'] === ConditionBase.QTY &&
                                  +groupTwo['conditionQty']) ||
                              null,
                          conditionValue:
                              (groupTwo['conditionBase'] === ConditionBase.ORDER_VALUE &&
                                  +groupTwo['conditionValue']) ||
                              null,
                      }))
                      .filter((item) => item.catalogueId)
                : [];

        const payload: GroupFormDto = {
            dataBase: {
                catalogueId: [...newGroupOne, ...newGroupTwo].map((item) => item.catalogueId),
            },
            promoConditionCatalogues: [...newGroupOne, ...newGroupTwo],
            dataTarget: payloadWarehouse['dataTarget']
        };
        this.formValue.emit(payload);
    }

    private _payloadTypeSegment(payloadSegment: SettingTargetDto, chosenWarehouse: any): SettingTargetDto {
        delete payloadSegment['chosenStore'];

        // Warehouse
        const newWarehouse =
            chosenWarehouse && chosenWarehouse.length
                ? chosenWarehouse.map((item: Selection) => +item.id)
                : [];
        payloadSegment['warehouseId'] = newWarehouse;
        payloadSegment['channelId'] = [];
        payloadSegment['clusterId'] = [];
        payloadSegment['groupId'] = [];
        payloadSegment['typeId'] = [];

        return payloadSegment;
    }

    private _ruleShowAlert(value: Selection[], idx: number): void {
        // Rule for group 1
        if (idx === 0) {
            const nextIdx = idx + 1;
            const nextChosenSkuCtrl = this.form.get(['groups', nextIdx, 'chosenSku']);
            const nextLength = (nextChosenSkuCtrl.value && nextChosenSkuCtrl.value.length) || 0;
            const totalLength = value.length + nextLength;

            if (value.length) {
                if (nextLength && totalLength > this.limitMaxGroupSku) {
                    this._showAlertAfterLimit();
                } else if (value.length > 4) {
                    this._showAlertBeforeLimit();
                } else {
                    this.selectSku.toArray()[idx].dialog.apply();
                }
            } else {
                this._showAlertAfterLimit();
            }
        }
        // Rule for group 2
        else if (idx === 1) {
            const beforeIdx = idx - 1;
            const beforeChosenSkuCtrl = this.form.get(['groups', beforeIdx, 'chosenSku']);
            const beforeLength =
                (beforeChosenSkuCtrl.value && beforeChosenSkuCtrl.value.length) || 0;
            const totalLength = value.length + beforeLength;

            if (value.length) {
                if (beforeLength && totalLength > this.limitMaxGroupSku) {
                    this._showAlertAfterLimit();
                } else if (value.length > 4) {
                    this._showAlertBeforeLimit();
                } else {
                    this.selectSku.toArray()[idx].dialog.apply();
                }
            } else {
                this._showAlertAfterLimit();
            }
        }
    }

    private _showAlertBeforeLimit(): void {
        this.applyDialogFactoryService.open(
            {
                title: 'Alert',
                template: this.beforeLimit,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: true,
                panelClass: 'dialog-container-no-padding',
            }
        );
    }

    private _showAlertAfterLimit(): void {
        this.applyDialogFactoryService.open(
            {
                title: 'Alert',
                template: this.afterLimit,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: true,
                panelClass: 'dialog-container-no-padding',
            }
        );
    }

    private _resetFakturGroup2(): void {
        this.selectInvoice.last.ngControl.reset();
    }

    private _setOrderQtyValidation(idx: number): void {
        this.form.get(['groups', idx, 'conditionQty']).setValidators([
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.digit({
                message: this.errorMessageService.getErrorMessageNonState('default', 'numeric'),
            }),
            RxwebValidators.minNumber({
                value: 1,
                message: this.errorMessageService.getErrorMessageNonState('default', 'min_number', {
                    minValue: 1,
                }),
            }),
            // max length 5 character
            RxwebValidators.maxLength({
                value: 5,
                message: this.errorMessageService.getErrorMessageNonState('default', 'pattern'),
            }),
        ]);
        this.form.get(['groups', idx, 'conditionQty']).updateValueAndValidity();
    }

    private _clearOrderQtyValidation(idx: number): void {
        this.form.get(['groups', idx, 'conditionQty']).clearValidators();
        this.form.get(['groups', idx, 'conditionQty']).updateValueAndValidity();
    }

    private _setOrderValueValidation(idx: number): void {
        this.form.get(['groups', idx, 'conditionValue']).setValidators([
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.numeric({
                acceptValue: NumericValueType.PositiveNumber,
                allowDecimal: true,
                message: this.errorMessageService.getErrorMessageNonState('default', 'pattern'),
            }),
            // max length 12 character
            RxwebValidators.maxLength({
                value: 12,
                message: this.errorMessageService.getErrorMessageNonState('default', 'pattern'),
            }),
        ]);
        this.form.get(['groups', idx, 'conditionValue']).updateValueAndValidity();
    }

    private _clearOrderValueValidation(idx: number): void {
        this.form.get(['groups', idx, 'conditionValue']).clearValidators();
        this.form.get(['groups', idx, 'conditionValue']).updateValueAndValidity();
    }
}
