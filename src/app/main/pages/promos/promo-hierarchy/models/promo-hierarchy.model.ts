import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

interface IPromoHierarchy extends Timestamp {
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
    // status: VoucherStatus;
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
}

export class PromoHierarchy implements IPromoHierarchy {
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
    // status: VoucherStatus;
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

    constructor(data: IPromoHierarchy) {
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
            // status,
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
        // this.status = status;
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
    }
}

interface IPromoHierarchyPayload {
    [key: string]: any;
}

export class PromoHierarchyPayload implements IPromoHierarchyPayload {
    [key: string]: any;
}