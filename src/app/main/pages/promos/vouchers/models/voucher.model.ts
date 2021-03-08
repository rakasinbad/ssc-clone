import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

type VoucherStatus = 'active' | 'inactive';

interface ISupplierVoucher extends Timestamp {
    id: string;
    supplierId: string;
    storeCouponId: string;
    externalId: string;
    code: string;
    name: string;
    platform: string;
    maxCollectionPerStore: string;
    maxVoucherRedemption: number;
    startDate: string;
    endDate: string;
    description: string;
    shortDescription: string;
    // imageUrl: string;
    voucherAllocationType: string;
    voucherSlot: number;
    voucherBudget: number;
    voucherType: string;
    voucherHeader: string;
    category: string;
    termsAndConditions?: Array<any>;
    instructions?: Array<any>;
    imageUrl: string;
    expirationDays: number;
    voucherTag?: Array<any>;
    totalOrderValue: number;
    used: string;
    collected: string;

    base: string;
    conditionBase: string;
    conditionQty: TNullable<string>;
    conditionValue: TNullable<number>;
    benefitType: string;
    benefitDiscount: TNullable<number>;
    benefitMaxRebate: TNullable<number>;
    benefitRebate: TNullable<number>;
    benefitCatalogueId: TNullable<string>;
    benefitBonusQty: TNullable<number>;
    target: string;
    status: VoucherStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    // TODO: Under development because need more in-depth structure.
    voucherCatalogues?: Array<any>;
    voucherBrands?: Array<any>;
    voucherInvoiceGroups?: Array<any>;
    voucherStores?: Array<any>;
    voucherWarehouses?: Array<any>;
    voucherTypes?: Array<any>;
    voucherGroups?: Array<any>;
    voucherClusters?: Array<any>;
    voucherChannels?: Array<any>;

    promoLayer: number;
    promoOwner: string;
}

export class SupplierVoucher implements ISupplierVoucher {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    supplierId: string;
    storeCouponId: string;
    externalId: string;
    code: string;
    name: string;
    platform: string;
    maxCollectionPerStore: string;
    maxVoucherRedemption: number;
    startDate: string;
    endDate: string;
    description: string;
    shortDescription: string;
    // imageUrl: string;
    voucherAllocationType: string;
    voucherSlot: number;
    voucherBudget: number;
    voucherType: string;
    voucherHeader: string;
    category: string;
    termsAndConditions?: Array<any>;
    instructions?: Array<any>;
    imageUrl: string;
    expirationDays: number;
    voucherTag?: Array<any>;
    totalOrderValue: number;
    used: string;
    collected: string;

    base: string;
    conditionBase: string;
    conditionQty: TNullable<string>;
    conditionValue: TNullable<number>;
    benefitType: string;
    benefitDiscount: TNullable<number>;
    benefitMaxRebate: TNullable<number>;
    benefitRebate: TNullable<number>;
    benefitCatalogueId: TNullable<string>;
    benefitBonusQty: TNullable<number>;
    target: string;
    status: VoucherStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    // TODO: Under development because need more in-depth structure.
    voucherCatalogues?: Array<any>;
    voucherBrands?: Array<any>;
    voucherInvoiceGroups?: Array<any>;
    voucherStores?: Array<any>;
    voucherWarehouses?: Array<any>;
    voucherTypes?: Array<any>;
    voucherGroups?: Array<any>;
    voucherClusters?: Array<any>;
    voucherChannels?: Array<any>;

    promoLayer: number;
    promoOwner: string;

    constructor(data: ISupplierVoucher) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            supplierId,
            storeCouponId,
            externalId,
            code,
            name,
            platform,
            maxCollectionPerStore,
            maxVoucherRedemption,
            startDate,
            endDate,
            description,
            shortDescription,
            // imageUrl,
            voucherAllocationType,
            voucherSlot,
            voucherBudget,
            voucherType,
            voucherHeader,
            category,
            termsAndConditions,
            instructions,
            imageUrl,
            expirationDays,
            voucherTag,
            totalOrderValue,
            used,
            collected,

            base,
            conditionBase,
            conditionQty,
            conditionValue,
            benefitType,
            benefitDiscount,
            benefitMaxRebate,
            benefitRebate,
            benefitCatalogueId,
            benefitBonusQty,
            target,
            status,
            createdAt,
            updatedAt,
            deletedAt,
            voucherCatalogues = [],
            voucherBrands = [],
            voucherInvoiceGroups = [],
            voucherStores = [],
            voucherWarehouses = [],
            voucherTypes = [],
            voucherGroups = [],
            voucherClusters = [],
            voucherChannels = [],
            
            promoLayer,
            promoOwner
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.supplierId = supplierId;
        this.storeCouponId = storeCouponId;
        this.externalId = externalId;
        this.code = code;
        this.name = name;
        this.platform = platform;
        this.maxCollectionPerStore = maxCollectionPerStore;
        this.maxVoucherRedemption = maxVoucherRedemption;
        // this.startDate = startDate;
        // this.endDate = endDate;
        this.description = description;
        this.shortDescription = shortDescription;
        // this.imageUrl = imageUrl;
        this.voucherAllocationType = voucherAllocationType;
        this.voucherSlot = voucherSlot || null;
        this.voucherBudget = voucherBudget || null;
        this.voucherType = voucherType;
        this.voucherHeader = voucherHeader || null;
        this.category = category || null;
        this.termsAndConditions = termsAndConditions || null;
        this.instructions = instructions || null;
        this.imageUrl = imageUrl || null;
        this.expirationDays = expirationDays || null;
        this.startDate = startDate || null;
        this.endDate = endDate || null;
        this.voucherTag = voucherTag || null;
        this.totalOrderValue = totalOrderValue || null;
        this.used = used || null;
        this.collected = collected || null;
        
        this.base = base;
        this.conditionBase = conditionBase;
        this.conditionQty = conditionQty;
        this.conditionValue = conditionValue;
        this.benefitType = benefitType;
        this.benefitDiscount = benefitDiscount;
        this.benefitMaxRebate = benefitMaxRebate;
        this.benefitRebate = benefitRebate;
        this.benefitCatalogueId = benefitCatalogueId;
        this.benefitBonusQty = benefitBonusQty;
        this.target = target;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.voucherCatalogues = voucherCatalogues;
        this.voucherBrands = voucherBrands;
        this.voucherInvoiceGroups = voucherInvoiceGroups;
        this.voucherStores = voucherStores;
        this.voucherWarehouses = voucherWarehouses;
        this.voucherTypes = voucherTypes;
        this.voucherGroups = voucherGroups;
        this.voucherClusters = voucherClusters;
        this.voucherChannels = voucherChannels;

        this.promoLayer = promoLayer || 0;
        this.promoOwner = promoOwner || 'none';
    }
}

interface ISupplierVoucherPayload {
    [key: string]: any;
}

export class SupplierVoucherPayload implements ISupplierVoucherPayload {
    [key: string]: any;
}

// TODO: Membuat add payload untuk Period Target Promo.
// const payload = {
//     // MASTER
//     supplierId,
//     // GENERAL INFORMATON
//     externalId: generalInformationValue.sellerId,
//     name: generalInformationValue.name,
//     platform: generalInformationValue.platform,
//     maxCollectionPerStore: +generalInformationValue.maxCollectionPerStore,
//     promoBudget: +generalInformationValue.budget,
//     startDate: (generalInformationValue.activeStartDate as unknown as moment.Moment).toISOString(),
//     endDate: (generalInformationValue.activeEndDate as unknown as moment.Moment).toISOString(),
//     image: generalInformationValue.imageSuggestion,
//     voucherCombine: !!generalInformationValue.isAllowCombineWithVoucher,
//     firstBuy: !!generalInformationValue.isFirstBuy,
//     // TRIGGER INFORMATION
//     base: triggerInformationValue.base === 'sku' ? 'sku'
//             : triggerInformationValue.base === 'brand' ? 'brand'
//             : triggerInformationValue.base === 'faktur' ? 'invoiceGroup'
//             : 'unknown',
//     dataBase: {},
//     // CONDITION & BENEFIT SETTINGS
//     conditions: [],
//     // REWARD INFORMATION
//     reward: {
//         name: generalInformationValue.name,
//         startDate: (rewardValue.rewardValidDate.activeStartDate as unknown as moment.Moment).toISOString(),
//         endDate: (rewardValue.rewardValidDate.activeEndDate as unknown as moment.Moment).toISOString(),
//         triggerBase: rewardValue.trigger.base === 'sku' ? 'sku'
//                     : rewardValue.trigger.base === 'brand' ? 'brand'
//                     : rewardValue.trigger.base === 'faktur' ? 'invoiceGroup'
//                     : 'unknown',
//         conditionBase: rewardValue.condition.base === 'qty' ? 'qty'
//                     : rewardValue.condition.base === 'order-value' ? 'value'
//                     : 'unknown',
//         termCondition: rewardValue.miscellaneous.description,
//         image: rewardValue.miscellaneous.couponImage,
//     },
//     // CUSTOMER SEGMENTATION SETTINGS
//     target: customerSegmentationValue.segmentationBase === 'direct-store' ? 'store'
//             : customerSegmentationValue.segmentationBase === 'segmentation' ? 'segmentation'
//             : 'unknown',
//     dataTarget: {},
// };

// const isMultiplication = conditionBenefitValue.conditionBenefit[0].benefit.qty.multiplicationOnly;

// // Klasifikasi "conditions" untuk Condition & Benefit Settings
// for (const [index, { condition, benefit }] of conditionBenefitValue.conditionBenefit.entries()) {
//     if ((isMultiplication && index === 0) || !isMultiplication) {
//         // Condition Payload Master.
//         const conditionPayload = {
//             conditionBase: condition.base === 'qty' ? 'qty'
//                             : condition.base === 'order-value' ? 'value'
//                             : 'unknown',
//             benefitType: benefit.base === 'qty' ? 'qty'
//                             : benefit.base === 'cash' ? 'amount'
//                             : benefit.base === 'percent' ? 'percent'
//                             : 'unknown',
//             multiplication: isMultiplication,
//         };

//         // Payload untuk Condition.
//         if (conditionPayload.conditionBase === 'qty') {
//             conditionPayload['conditionQty'] = +condition.qty;
//         } else if (conditionPayload.conditionBase === 'value') {
//             conditionPayload['conditionValue'] = +condition.value;
//         }

//         // Payload untuk Benefit.
//         if (conditionPayload.benefitType === 'qty') {
//             conditionPayload['benefitCatalogueId'] = +benefit.qty.bonusSku.id;
//             conditionPayload['benefitBonusQty'] = +benefit.qty.bonusQty;
//         } else if (conditionPayload.benefitType === 'amount') {
//             conditionPayload['benefitRebate'] = +benefit.cash.rebate;
//         } else if (conditionPayload.benefitType === 'percent') {
//             conditionPayload['benefitDiscount'] = +benefit.percent.percentDiscount;
//             conditionPayload['benefitMaxRebate'] = +benefit.percent.maxRebate;
//         }
//     }
// }

// // Klasifikasi "reward -> conditionBase" untuk Reward Information.
// if (payload.reward.conditionBase === 'qty') {
//     payload.reward['conditionQty'] = rewardValue.condition.qty;
// } else if (payload.reward.conditionBase === 'value') {
//     payload.reward['conditionValue'] = rewardValue.condition.value;
// }

// // Klasifikasi "reward -> triggerBase" untuk Trigger Information.
// if (payload.reward.triggerBase === 'sku') {
//     payload.reward['catalogueId'] = rewardValue.trigger.chosenSku.map(sku => sku.id);
// } else if (payload.reward.triggerBase === 'brand') {
//     payload.reward['brandId'] = rewardValue.trigger.chosenBrand.map(brand => brand.id);
// } else if (payload.reward.triggerBase === 'invoiceGroup') {
//     payload.reward['invoiceGroupId'] = rewardValue.trigger.chosenFaktur.map(faktur => faktur.id);
// }

// // Klasifikasi "dataBase" untuk Trigger Information.
// if (payload.base === 'sku') {
//     payload.dataBase = {
//         catalogueId: triggerInformationValue.chosenSku.map(sku => sku.id),
//     };
// } else if (payload.base === 'brand') {
//     payload.dataBase = {
//         brandId: triggerInformationValue.chosenBrand.map(brand => brand.id),
//     };
// } else if (payload.base === 'invoiceGroup') {
//     payload.dataBase = {
//         invoiceGroupId: triggerInformationValue.chosenFaktur.map(faktur => faktur.id),
//     };
// }

// // Klasifikasi "dataTarget" untuk Customer Segmentation Settings.
// if (payload.target === 'store') {
//     payload.dataTarget = {
//         storeId: customerSegmentationValue.chosenStore.map(supplierStore => supplierStore.storeId)
//     };
// } else if (payload.target === 'segmentation') {
//     payload.dataTarget = {
//         warehouseId: customerSegmentationValue.chosenWarehouse.map(warehouse => warehouse.id),
//         typeId: customerSegmentationValue.chosenStoreType.map(storeType => storeType.id),
//         groupId: customerSegmentationValue.chosenStoreGroup.map(storeGroup => storeGroup.id),
//         clusterId: customerSegmentationValue.chosenStoreCluster.map(storeCluster => storeCluster.id),
//         channelId: customerSegmentationValue.chosenStoreChannel.map(storeChannel => storeChannel.id),
//     };
// }
