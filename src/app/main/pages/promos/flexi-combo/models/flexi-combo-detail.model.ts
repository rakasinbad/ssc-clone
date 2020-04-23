import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';

interface IPromoCondition extends ITimestamp {
    readonly id: NonNullable<string>;
    benefitBonusQty: string;
    benefitCatalogueId: string;
    benefitDiscount: string;
    benefitMaxRebate: string;
    benefitRebate: string;
    benefitType: string;
    conditionBase: string;
    conditionQty: string;
    conditionValue: number;
    multiplication: boolean;
    promoId: string;
}

export class FlexiComboDetail implements ITimestamp {
    readonly id: NonNullable<string>;
    base: TriggerBase;
    channelId: string;
    clusterId: string;
    code: string;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    isCumulative: boolean;
    maxRedemptionPerStore: string;
    name: string;
    platform: PlatformSinbad;
    promoBudget: number;
    promoConditions: IPromoCondition[];
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: SegmentationBase;
    type: string;
    voucherCombine: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: FlexiComboDetail) {
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
            promoBudget,
            promoConditions,
            startDate,
            status,
            supplierId,
            target,
            type,
            voucherCombine,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
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
        this.promoBudget = promoBudget;
        this.promoConditions = promoConditions;
        this.startDate = startDate;
        this.status = status;
        this.supplierId = supplierId;
        this.target = target;
        this.type = type;
        this.voucherCombine = voucherCombine;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
