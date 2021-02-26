import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

type PromoHierarchyStatus = 'active' | 'inactive';

interface IPromoHierarchy {
    id: string;
    name: string;
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
    triggerBase: string;
    conditionBase: string;
    conditionQty: string;
    conditionValue: string;
    benefitType: string;
    benefitQty: number;
    benefitDiscount: number;
    benefitSku: Array<any>;
    triggerCatalogues: Array<any>;
    benefitRebate: number;
    benefitMaxRebate: number;
    promoConditionCatalogues: IPromoConditionCatalogues[];
    layerInformation: IPromoLayerInformation[];
    // TODO: Under development because need more in-depth structure.
}

export class PromoHierarchy {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    name: string;
    promoSellerId: string;
    promoAllocation: string;
    promoBudget: number;
    planSlot: number;
    planBudget: number;
    promoSlot: number;
    promoType: string;
    status: PromoHierarchyStatus;
    layer: number;
    promoLayer: number;
    promoGroup: string;
    triggerBase: string;
    conditionBase: string;
    conditionQty: string;
    conditionValue: string;
    benefitType: string;
    benefitQty: number;
    benefitDiscount: number;
    benefitSku: Array<any>;
    triggerCatalogues: Array<any>;
    benefitRebate: number;
    benefitMaxRebate: number;
    promoConditionCatalogues: IPromoConditionCatalogues[];
    layerInformation: IPromoLayerInformation[];
    // TODO: Under development because need more in-depth structure.

    constructor(data: PromoHierarchy) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            name,
            promoAllocation,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoType,
            promoSellerId,
            promoGroup,
            layer,
            promoLayer,
            status,
            triggerBase,
            conditionBase,
            conditionQty,
            conditionValue,
            benefitType,
            benefitQty,
            benefitDiscount,
            benefitSku,
            triggerCatalogues,
            benefitRebate,
            benefitMaxRebate,
            promoConditionCatalogues,
            layerInformation
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.name = name;
        this.promoAllocation = promoAllocation || null;
        this.promoType = promoType || null;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.promoSellerId = promoSellerId;
        this.promoGroup = promoGroup || null;
        this.layer = layer || 0;
        this.promoLayer = promoLayer || 0;
        this.status = status;
        this.triggerBase = triggerBase || null;
        this.conditionBase = conditionBase;
        this.conditionQty = conditionQty || null;
        this.conditionValue = conditionValue || null;
        this.benefitType = benefitType;
        this.benefitQty = benefitQty || null;
        this.benefitDiscount = benefitDiscount || null;
        this.benefitSku = benefitSku || null;
        this.triggerCatalogues = triggerCatalogues || [];
        this.benefitRebate = benefitRebate || null;
        this.benefitMaxRebate = benefitMaxRebate || null;
        
        if (typeof promoConditionCatalogues !== 'undefined') {
            this.promoConditionCatalogues = promoConditionCatalogues;
        }

        if (typeof layerInformation !== 'undefined') {
            this.layerInformation = layerInformation;
        }
    }
}

interface IPromoHierarchyPayload {
    [key: string]: any;
}

export class PromoHierarchyPayload implements IPromoHierarchyPayload {
    [key: string]: any;
}

export interface IPromoConditionCatalogues {
    readonly id: NonNullable<string>;
    crossSellingGroup: string;
    conditionValue: number;
    conditionBase: string;
    fakturName: string;
    crossSellingGroupRelation: string;
    conditionQty: string;
    choosenSku: Array<any>;
}

export interface IPromoLayerInformation {
    readonly id: NonNullable<string>;
    layer0: number;
    layer1: number;
    layer2: number;
    layer3: number;
    layer4: number;
}

export class PromoHierarchyDetail {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    name: string;
    promoSellerId: string;
    promoAllocation: string;
    promoBudget: number;
    planSlot: number;
    planBudget: number;
    promoSlot: number;
    promoType: string;
    status: PromoHierarchyStatus;
    layer: number;
    promoLayer: number;
    promoGroup: string;
    triggerBase: string;
    conditionBase: string;
    conditionQty: string;
    conditionValue: string;
    benefitType: string;
    benefitQty: number;
    benefitDiscount: number;
    benefitSku: Array<any>;
    triggerCatalogues: Array<any>;
    benefitRebate: number;
    benefitMaxRebate: number;
    promoConditionCatalogues: IPromoConditionCatalogues[];
    layerInformation: IPromoLayerInformation[];
    // TODO: Under development because need more in-depth structure.

    constructor(data: PromoHierarchyDetail) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            name,
            promoAllocation,
            promoBudget,
            promoSlot,
            planBudget,
            planSlot,
            promoType,
            promoSellerId,
            promoGroup,
            layer,
            promoLayer,
            status,
            triggerBase,
            conditionBase,
            conditionQty,
            conditionValue,
            benefitType,
            benefitQty,
            benefitDiscount,
            benefitSku,
            triggerCatalogues,
            benefitRebate,
            benefitMaxRebate,
            promoConditionCatalogues,
            layerInformation
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.name = name;
        this.promoAllocation = promoAllocation || null;
        this.promoType = promoType || null;
        this.promoBudget = promoBudget || null;
        this.promoSlot = promoSlot || null;
        this.planBudget = planBudget || null;
        this.planSlot = planSlot || null;
        this.promoSellerId = promoSellerId;
        this.promoGroup = promoGroup || null;
        this.layer = layer || 0;
        this.promoLayer = promoLayer || 0;
        this.status = status;
        this.triggerBase = triggerBase;
        this.conditionBase = conditionBase;
        this.conditionQty = conditionQty || null;
        this.conditionValue = conditionValue || null;
        this.benefitType = benefitType;
        this.benefitQty = benefitQty || null;
        this.benefitDiscount = benefitDiscount || null;
        this.benefitSku = benefitSku || null;
        this.triggerCatalogues = triggerCatalogues || [];
        this.benefitRebate = benefitRebate || null;
        this.benefitMaxRebate = benefitMaxRebate || null;
        
        if (typeof promoConditionCatalogues !== 'undefined') {
            this.promoConditionCatalogues = promoConditionCatalogues;
        }

        if (typeof layerInformation !== 'undefined') {
            this.layerInformation = layerInformation;
        }
    }
}

