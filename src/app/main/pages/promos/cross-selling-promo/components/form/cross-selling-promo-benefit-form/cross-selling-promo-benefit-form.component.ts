import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { FormMode, FormStatus } from 'app/shared/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BenefitFormDto } from '../../../models';
import { CrossSellingPromoFormService } from '../../../services';

@Component({
    selector: 'app-cross-selling-promo-benefit-form',
    templateUrl: './cross-selling-promo-benefit-form.component.html',
    styleUrls: ['./cross-selling-promo-benefit-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingPromoBenefitFormComponent implements OnInit, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    benefitType: { id: BenefitType; label: string }[];
    conditionBenefitType = BenefitType;

    @Input()
    fakturName: string;

    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValue: EventEmitter<BenefitFormDto> = new EventEmitter();

    constructor(
        private crossSellingPromoFormService: CrossSellingPromoFormService,
        private errorMessageService: ErrorMessageService,
        private noticeService: NoticeService
    ) {}

    ngOnInit(): void {
        this.benefitType = this.crossSellingPromoFormService.benefitType;

        this.form.statusChanges.pipe(takeUntil(this.unSubs$)).subscribe((status: FormStatus) => {
            if (status === 'VALID') {
                this._handleFormValue();
            }

            this.formStatus.emit(status);
        });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onChangeBenefitType(ev: MatRadioChange): void {
        switch (ev.value) {
            case BenefitType.AMOUNT:
                this._setRuleTypeAmount();
                return;

            case BenefitType.PERCENT:
                this._setRuleTypePercent();
                return;

            case BenefitType.QTY:
                this._setRuleTypeQty();
                return;

            default:
                this.noticeService.open('Sorry, unknown benefit type!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
                return;
        }
    }

    onSkuFocusOut(ev: FocusEvent): void {
        const chosenSkuCtrl = this.form.get('benefitCatalogueId');

        if (!chosenSkuCtrl.touched) {
            chosenSkuCtrl.markAsTouched();
        }
    }

    onSkuSelected(ev: Catalogue): void {
        const chosenSkuCtrl = this.form.get('benefitCatalogueId');

        chosenSkuCtrl.markAsDirty();
        chosenSkuCtrl.markAsTouched();

        if (!ev) {
            chosenSkuCtrl.setValue(null);
        } else {
            const newSku: Selection = {
                id: ev.id,
                label: ev.name,
                group: 'catalogues',
            };

            chosenSkuCtrl.setValue(newSku);
        }
    }

    private _handleFormValue(): void {
        const body = this.form.getRawValue();

        let payload: BenefitFormDto = {
            benefitType: body['benefitType'],

            // Must be send as payload
            conditionBase: 'qty',
            conditionQty: '11',
        };

        switch (payload['benefitType']) {
            case BenefitType.AMOUNT:
                payload = this._payloadTypeAmount(payload, body);
                break;

            case BenefitType.PERCENT:
                payload = this._payloadTypePercent(payload, body);
                break;

            case BenefitType.QTY:
                payload = this._payloadTypeQty(payload, body);
                break;

            default:
                this.noticeService.open('Sorry, unknown benefit type!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
                return;
        }

        this.formValue.emit(payload);
    }

    private _payloadTypeAmount(payload: BenefitFormDto, body: any): BenefitFormDto {
        delete payload['benefitCatalogueId'];
        delete payload['benefitBonusQty'];
        delete payload['benefitDiscount'];
        delete payload['benefitMaxRebate'];

        payload['benefitRebate'] = body['benefitRebate'];

        return payload;
    }

    private _payloadTypePercent(payload: BenefitFormDto, body: any): BenefitFormDto {
        delete payload['benefitCatalogueId'];
        delete payload['benefitBonusQty'];
        delete payload['benefitRebate'];

        payload['benefitDiscount'] = body['benefitDiscount'];
        payload['benefitMaxRebate'] = body['benefitMaxRebate'];

        return payload;
    }

    private _payloadTypeQty(payload: BenefitFormDto, body: any): BenefitFormDto {
        delete payload['benefitRebate'];
        delete payload['benefitDiscount'];
        delete payload['benefitMaxRebate'];

        const newCatalogue: Selection = body['benefitCatalogueId'];

        payload['benefitCatalogueId'] = (newCatalogue && newCatalogue['id']) || null;
        payload['benefitBonusQty'] = body['benefitBonusQty'];

        return payload;
    }

    private _setRuleTypeQty(): void {
        this._clearRuleTypeAmount();
        this._clearRuleTypePercent();
        this._setBenefitCatalogueValidation();
        this._setBenefitBonusQtyValidation();
    }

    private _clearRuleTypeQty(): void {
        this._clearBenefitCatalogueValidation();
        this._clearBenefitBonusQtyValidation();
    }

    private _setRuleTypeAmount(): void {
        this._clearRuleTypeQty();
        this._clearRuleTypePercent();
        this._setBenefitRebateValidation();
    }

    private _clearRuleTypeAmount(): void {
        this._clearBenefitRebateValidation();
    }

    private _setRuleTypePercent(): void {
        this._clearRuleTypeQty();
        this._clearRuleTypeAmount();
        this._setBenefitDiscountValidation();
        this._setBenefitMaxRebateValidation();
    }

    private _clearRuleTypePercent(): void {
        this._clearBenefitDiscountValidation();
        this._clearBenefitMaxRebateValidation();
    }

    private _setBenefitCatalogueValidation(): void {
        this.form.get('benefitCatalogueId').setValidators(
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            })
        );
        this.form.get('benefitCatalogueId').updateValueAndValidity();
    }

    private _clearBenefitCatalogueValidation(): void {
        this.form.get('benefitCatalogueId').clearValidators();
        this.form.get('benefitCatalogueId').updateValueAndValidity();
    }

    private _setBenefitBonusQtyValidation(): void {
        this.form.get('benefitBonusQty').setValidators([
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
        this.form.get('benefitBonusQty').updateValueAndValidity();
    }

    private _clearBenefitBonusQtyValidation(): void {
        this.form.get('benefitBonusQty').clearValidators();
        this.form.get('benefitBonusQty').updateValueAndValidity();
    }

    private _setBenefitRebateValidation(): void {
        this.form.get('benefitRebate').setValidators([
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
        this.form.get('benefitRebate').updateValueAndValidity();
    }

    private _clearBenefitRebateValidation(): void {
        this.form.get('benefitRebate').clearValidators();
        this.form.get('benefitRebate').updateValueAndValidity();
    }

    private _setBenefitDiscountValidation(): void {
        this.form.get('benefitDiscount').setValidators([
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.numeric({
                acceptValue: NumericValueType.PositiveNumber,
                allowDecimal: true,
                message: this.errorMessageService.getErrorMessageNonState('default', 'pattern'),
            }),
            RxwebValidators.maxNumber({
                value: 100,
                message: this.errorMessageService.getErrorMessageNonState('default', 'lt_number', {
                    maxValue: 100,
                }),
            }),
            RxwebValidators.minNumber({
                value: 0,
                message: this.errorMessageService.getErrorMessageNonState('default', 'min_number', {
                    minValue: 0,
                }),
            }),
        ]);
        this.form.get('benefitDiscount').updateValueAndValidity();
    }

    private _clearBenefitDiscountValidation() {
        this.form.get('benefitDiscount').clearValidators();
        this.form.get('benefitDiscount').updateValueAndValidity();
    }

    private _setBenefitMaxRebateValidation(): void {
        this.form.get('benefitMaxRebate').setValidators([
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
        this.form.get('benefitMaxRebate').updateValueAndValidity();
    }

    private _clearBenefitMaxRebateValidation(): void {
        this.form.get('benefitMaxRebate').clearValidators();
        this.form.get('benefitMaxRebate').updateValueAndValidity();
    }
}