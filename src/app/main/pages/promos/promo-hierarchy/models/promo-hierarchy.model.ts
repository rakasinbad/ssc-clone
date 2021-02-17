import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

type PromoHierarchyStatus = 'active' | 'inactive';

// id: string;
// name: string;
// supplier_id: string;
// status: string;
// promoAllocation: string;
// promoSlot: Number;
// planSlot: Number;
// promoBudget: Number;
// planBudget: Number;
// promoSellerId: string;
// promoType: string;
// layer: Number;

interface IPromoHierarchy extends Timestamp {
    id: string;
    supplierId: string;
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
    category: string;
    termsAndConditions?: Array<any>;
    instructions?: Array<any>;
    imageUrl: string;
    expirationDays: number;
    used: string;
    collected: string;
    promoAllocation: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    promoType: string;
    promoSellerId: string;
    promoGroup: string;

    layer: number;
    status: PromoHierarchyStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    // TODO: Under development because need more in-depth structure.
}

export class PromoHierarchy implements IPromoHierarchy {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    supplierId: string;
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
    category: string;
    termsAndConditions?: Array<any>;
    instructions?: Array<any>;
    imageUrl: string;
    expirationDays: number;
    used: string;
    collected: string;
    promoAllocation: string;
    promoBudget: number;
    planBudget: number;
    promoSlot: number;
    planSlot: number;
    promoType: string;
    promoSellerId: string;
    promoGroup: string;

    layer: number;
    status: PromoHierarchyStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    // TODO: Under development because need more in-depth structure.

    constructor(data: IPromoHierarchy) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            supplierId,
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
            category,
            termsAndConditions,
            instructions,
            expirationDays,
            used,
            collected,
            promoAllocation,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoType,
            promoSellerId,
            promoGroup,
            layer,
            status,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.supplierId = supplierId;
        this.externalId = externalId || null;
        this.code = code || null;
        this.name = name;
        this.platform = platform || null;
        this.maxCollectionPerStore = maxCollectionPerStore || null;
        this.maxVoucherRedemption = maxVoucherRedemption || null;
        this.description = description || null;
        this.shortDescription = shortDescription || null;
        this.category = category || null;
        this.termsAndConditions = termsAndConditions || null;
        this.instructions = instructions || null;
        this.expirationDays = expirationDays || null;
        this.startDate = startDate || null;
        this.endDate = endDate || null;
        this.used = used || null;
        this.collected = collected || null;
        this.promoAllocation = promoAllocation || null;
        this.promoType = promoType || null;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.promoSellerId = promoSellerId;
        this.promoGroup = promoGroup || null;
        this.layer = layer || 0;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

interface IPromoHierarchyPayload {
    [key: string]: any;
}

export class PromoHierarchyPayload implements IPromoHierarchyPayload {
    [key: string]: any;
}