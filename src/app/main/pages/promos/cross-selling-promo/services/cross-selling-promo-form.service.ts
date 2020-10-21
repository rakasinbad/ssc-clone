import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { LogicRelation, SpecifiedTarget } from 'app/shared/models';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import * as numeral from 'numeral';
import { Observable } from 'rxjs';
import { CrossSellingPromoModule } from '../cross-selling-promo.module';
import { CrossSellingPromoFacadeService } from './cross-selling-promo-facade.service';

@Injectable({ providedIn: CrossSellingPromoModule })
export class CrossSellingPromoFormService {
    constructor(
        private fb: FormBuilder,
        private crossSellingPromoFacade: CrossSellingPromoFacadeService,
        private errorMessageService: ErrorMessageService,
        private helperService: HelperService
    ) {}

    get benefitType(): { id: BenefitType; label: string }[] {
        return this.helperService.benefitType();
    }

    get conditionBase(): { id: ConditionBase; label: string }[] {
        return this.helperService.conditionBase();
    }

    get invoiceGroups$(): Observable<InvoiceGroup[]> {
        return this.crossSellingPromoFacade.invoiceGroups$;
    }

    get logicRelation(): { id: LogicRelation; label: string }[] {
        return this.helperService.logicRelation();
    }

    get platformsSinbad(): { id: PlatformSinbad; label: string }[] {
        return this.helperService.platformSinbad();
    }

    get promoAllocation(): { id: PromoAllocation; label: string }[] {
        return this.helperService.promoAllocation();
    }

    get segmentationBase(): { id: SegmentationBase; label: string }[] {
        return this.helperService.segmentationBase();
    }

    get specifiedTarget(): { id: SpecifiedTarget; label: string }[] {
        return this.helperService.specifiedTarget();
    }

    get triggerBase(): { id: TriggerBase; label: string }[] {
        return this.helperService.triggerBase().filter((item) => item.id === TriggerBase.SKU);
    }

    createForm(): FormGroup {
        return this.fb.group({
            generalInformation: this.fb.group({
                promoAllocationType: [
                    PromoAllocation.NONE,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                promoSellerId: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        // first character letter next allow alphanumeric hyphen underscore
                        RxwebValidators.pattern({
                            expression: {
                                alphaNumHyphenUnderscore: /^[a-zA-Z]+[a-zA-Z0-9-_ ]*[a-zA-Z0-9]$/,
                            },
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        // max length 25 character
                        RxwebValidators.maxLength({
                            value: 25,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                promoName: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        // Alphanumeric & allow whitespace
                        RxwebValidators.alphaNumeric({
                            allowWhiteSpace: true,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        // max length 25 character
                        RxwebValidators.maxLength({
                            value: 25,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                platform: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.oneOf({
                            matchValues: [...this.platformsSinbad.map((v) => v.id)],
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                maxRedemption: [
                    null,
                    RxwebValidators.digit({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'numeric'
                        ),
                    }),
                ],
                promoBudget: null,
                startDate: [
                    { value: null, disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                endDate: [
                    { value: null, disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                imgSuggestion: [
                    null,
                    [
                        RxwebValidators.fileSize({
                            maxSize: Math.floor(2 * 1000 * 1000),
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'file_size_lte',
                                { size: numeral(2 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                            ),
                        }),
                    ],
                ],
                shortDescription: null,
                firstBuy: false,
            }),
            groupSetting: this.fb.group({
                groups: this.fb.array([this._createGroupForm(), this._createGroupForm()]),
            }),
            benefitSetting: this.fb.group({
                benefitType: [
                    BenefitType.QTY,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                // Benefit Type = Qty
                benefitCatalogueId: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                benefitBonusQty: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.digit({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'numeric'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                        // max length 5 character
                        RxwebValidators.maxLength({
                            value: 5,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                // Benefit Type = Rupiah
                benefitRebate: [
                    null,
                    [
                        RxwebValidators.numeric({
                            acceptValue: NumericValueType.PositiveNumber,
                            allowDecimal: true,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                        // max length 12 character
                        RxwebValidators.maxLength({
                            value: 12,
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'pattern'
                            ),
                        }),
                    ],
                ],
                // Benefit Type = Percent
                benefitDiscount: null,
                benefitMaxRebate: null,
            }),
            segmentSetting: this.fb.group({
                segmentationBase: [
                    SegmentationBase.SEGMENTATION,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                // Segmentation Base = Store
                chosenStore: null,
                // Segmentation Base = Segmentation
                chosenWarehouse: null,
                chosenStoreType: null,
                chosenStoreGroup: null,
                chosenStoreChannel: null,
                chosenStoreCluster: null,
                specifiedTarget: [
                    SpecifiedTarget.NONE,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageService.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
            }),
        });
    }

    private _createGroupForm(): FormGroup {
        return this.fb.group({
            conditionBase: [
                ConditionBase.QTY,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            invoiceGroup: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            triggerBase: [
                TriggerBase.SKU,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                ],
            ],
            chosenSku: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    // RxwebValidators.unique({
                    //     message: this.errorMessageService.getErrorMessageNonState(
                    //         'default',
                    //         'is_unique'
                    //     ),
                    // }),
                ],
            ],
            relation: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.logicRelation.map((v) => v.id)],
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'pattern'
                        ),
                    }),
                ],
            ],
            conditionQty: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'required'
                        ),
                    }),
                    RxwebValidators.digit({
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'numeric'
                        ),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'min_number',
                            { minValue: 1 }
                        ),
                    }),
                    // max length 5 character
                    RxwebValidators.maxLength({
                        value: 5,
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'pattern'
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
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'pattern'
                        ),
                    }),
                    // max length 12 character
                    RxwebValidators.maxLength({
                        value: 12,
                        message: this.errorMessageService.getErrorMessageNonState(
                            'default',
                            'pattern'
                        ),
                    }),
                ],
            ],
        });
    }
}