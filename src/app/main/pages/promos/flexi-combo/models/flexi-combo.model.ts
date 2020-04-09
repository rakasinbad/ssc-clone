import { EStatus, TNullable } from 'app/shared/models/global.model';
import { PlatformSinbad } from 'app/shared/models/platform.model';
import { SegmentationBase } from 'app/shared/models/segmentation-base.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';

interface IFlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;
}

export class FlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;

    constructor(data: IFlexiComboCreationPayload) {
        const { warehouseId, catalogueId, deletedCatalogue } = data;

        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.deletedCatalogue = deletedCatalogue;
    }
}

// export interface IFlexiCombo extends ITimestamp {
//     readonly id: NonNullable<string>;
//     base: TriggerBase;
//     channelId: string;
//     code: string;
//     endDate: string;
//     externalId: string;
//     firstBuy: boolean;
//     groupId: string;
//     imageUrl: string;
//     invoiceGroupId: string;
//     isComulative: boolean;
//     maxRedemptionPerStore: string;
//     name: string;
//     platform: PlatformSinbad;
//     promoBudget: number;
//     startDate: string;
//     supplierId: string;
//     target: SegmentationBase;
//     type: string;
//     voucherCombine: boolean;
// }

export class FlexiCombo implements ITimestamp {
    readonly id: NonNullable<string>;
    base: TriggerBase;
    channelId: string;
    code: string;
    endDate: string;
    externalId: string;
    firstBuy: boolean;
    groupId: string;
    imageUrl: string;
    invoiceGroupId: string;
    isComulative: boolean;
    maxRedemptionPerStore: string;
    name: string;
    platform: PlatformSinbad;
    promoBudget: number;
    startDate: string;
    status: EStatus;
    supplierId: string;
    target: SegmentationBase;
    type: string;
    voucherCombine: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: FlexiCombo) {
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
            isComulative,
            maxRedemptionPerStore,
            name,
            platform,
            promoBudget,
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
        this.isComulative = isComulative;
        this.maxRedemptionPerStore = maxRedemptionPerStore;
        this.name = name ? String(name).trim() : null;
        this.platform = platform;
        this.promoBudget = promoBudget;
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
