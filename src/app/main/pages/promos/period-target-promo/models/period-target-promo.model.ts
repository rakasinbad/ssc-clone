import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';
// import { Catalogue, StoreSegmentationGroup, StoreSegmentationChannel, StoreSegmentationCluster } from 'app/main/pages/catalogues/models';
import { Brand } from 'app/shared/models/brand.model';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Store } from 'app/shared/models/store.model';
// import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';
import { StoreSegmentationType } from 'app/shared/components/selection-tree/store-segmentation/models';

type PromoStatus = 'active' | 'inactive';

interface IPeriodTargetPromo extends Timestamp {
    id: string;
    supplierId: string;
    externalId: string;
    code: string;
    name: string;
    platform: string;
    isCumulative: boolean;
    maxRedemptionPerBuyer: string;
    promoBudget: number;
    startDate: string;
    endDate: string;
    imageUrl: string;
    voucherCombine: boolean;
    firstBuy: boolean;
    base: string;
    type: string;
    target: string;
    status: PromoStatus;
    clusterId: TNullable<string>;
    groupId: TNullable<string>;
    channelId: TNullable<string>;
    invoiceGroupId: TNullable<string>;
    // TODO: Under development because need more in-depth structure.
    promoConditions?: Array<any>;
    storeTargetCoupons?: Array<any>;
    promoStores?: Array<any>;
    promoWarehouses?: Array<any>;
    promoTypes?: Array<any>;
    promoGroups?: Array<any>;
    promoClusters?: Array<any>;
    promoChannels?: Array<any>;
    promoCatalogues?: Array<any>;
    promoBrands?: Array<any>;
    promoInvoiceGroups?: Array<any>;
}

export class PeriodTargetPromo implements IPeriodTargetPromo {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    supplierId: string;
    externalId: string;
    code: string;
    name: string;
    platform: string;
    isCumulative: boolean;
    maxRedemptionPerBuyer: string;
    promoBudget: number;
    startDate: string;
    endDate: string;
    imageUrl: string;
    voucherCombine: boolean;
    firstBuy: boolean;
    base: string;
    type: string;
    target: string;
    status: PromoStatus;
    clusterId: TNullable<string>;
    groupId: TNullable<string>;
    channelId: TNullable<string>;
    invoiceGroupId: TNullable<string>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    // TODO: Under development because need more in-depth structure.
    promoConditions?: Array<any>;
    storeTargetCoupons?: Array<any>;
    promoStores?: Array<{ store: Store }>;
    promoWarehouses?: Array<{ warehouse: any }>;
    promoTypes?: Array<{ type: StoreSegmentationType }>;
    promoGroups?: Array<{ group: any }>;
    promoClusters?: Array<{ cluster: any }>;
    promoChannels?: Array<{ channel: any }>;
    promoCatalogues?: Array<{ catalogue: any }>;
    promoBrands?: Array<{ brand: Brand }>;
    promoInvoiceGroups?: Array<{ invoiceGroup: InvoiceGroup }>;

    constructor(data: IPeriodTargetPromo) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            supplierId,
            externalId,
            code,
            name,
            platform,
            isCumulative,
            maxRedemptionPerBuyer,
            promoBudget,
            startDate,
            endDate,
            imageUrl,
            voucherCombine,
            firstBuy,
            base,
            type,
            target,
            status,
            clusterId,
            groupId,
            channelId,
            invoiceGroupId,
            createdAt,
            updatedAt,
            deletedAt,
            promoConditions = [],
            storeTargetCoupons = [],
            promoStores = [],
            promoWarehouses = [],
            promoTypes = [],
            promoGroups = [],
            promoClusters = [],
            promoChannels = [],
            promoCatalogues = [],
            promoBrands = [],
            promoInvoiceGroups = [],
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.supplierId = supplierId;
        this.externalId = externalId;
        this.code = code;
        this.name = name;
        this.platform = platform;
        this.isCumulative = isCumulative;
        this.maxRedemptionPerBuyer = maxRedemptionPerBuyer;
        this.promoBudget = promoBudget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.imageUrl = imageUrl;
        this.voucherCombine = voucherCombine;
        this.firstBuy = firstBuy;
        this.base = base;
        this.type = type;
        this.target = target;
        this.status = status;
        this.clusterId = clusterId;
        this.groupId = groupId;
        this.channelId = channelId;
        this.invoiceGroupId = invoiceGroupId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        // TODO: Under development because need more in-depth structure.
        this.promoConditions = promoConditions;
        this.storeTargetCoupons = storeTargetCoupons;
        this.promoStores = promoStores;
        this.promoWarehouses = promoWarehouses;
        this.promoTypes = promoTypes;
        this.promoGroups = promoGroups;
        this.promoClusters = promoClusters;
        this.promoChannels = promoChannels;
        this.promoCatalogues = promoCatalogues;
        this.promoBrands = promoBrands;
        this.promoInvoiceGroups = promoInvoiceGroups;
    }
}

interface IPeriodTargetPromoPayload {
    [key: string]: any;
}

export class PeriodTargetPromoPayload implements IPeriodTargetPromoPayload {
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
//     maxRedemptionPerStore: +generalInformationValue.maxRedemptionPerBuyer,
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
