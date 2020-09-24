import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

interface ICrossSellingPromoBenefit extends ITimestamp {
    readonly id: NonNullable<string>;
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitDiscount: string;
    benefitMaxRebate: string;
    benefitRebate: string;
    benefitType: string;
    promoId: string;
}

export class CrossSellingPromoDetail implements ITimestamp {
    readonly id: NonNullable<string>;
    base: TriggerBase;
    supplierId: string;
    channelId: string;
    clusterId: string;
    code: string;
    externalId: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    isCumulative: boolean;
    maxRedemptionPerStore: string;
    name: string;
    platform: PlatformSinbad;
    promoAllocationType: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    promoBenefit: ICrossSellingPromoBenefit[];
    startDate: string;
    endDate: string;
    status: EStatus;
    target: SegmentationBase;
    type: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: CrossSellingPromoDetail) {
        const {
            id,
            base,
            channelId,
            code,
            endDate,
            externalId,
            firstBuy,
            groupId,
            imageUrl,
            invoiceGroupId,
            isCumulative,
            maxRedemptionPerStore,
            name,
            platform,
            promoAllocationType,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoBenefit,
            startDate,
            status,
            supplierId,
            target,
            type,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.base = base;
        this.channelId = channelId;
        this.code = code ? String(code).trim() : null;
        this.endDate = endDate;
        this.externalId = externalId;
        this.firstBuy = firstBuy;
        this.groupId = groupId;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.invoiceGroupId = invoiceGroupId;
        this.isCumulative = isCumulative;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name ? String(name).trim() : null;
        this.platform = platform;
        this.promoAllocationType = promoAllocationType;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.promoBenefit = promoBenefit;
        this.startDate = startDate;
        this.status = status;
        this.target = target;
        this.type = type;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
