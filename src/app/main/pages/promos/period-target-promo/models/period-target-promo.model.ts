import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

type PromoStatus = 'active' | 'inactive';

interface IPeriodTargetPromo extends Timestamp {
    id: string;
    supplierId: string;
    externalId: string;
    code: string;
    name: string;
    platform: string;
    isComulative: boolean;
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
    isComulative: boolean;
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
    promoStores?: Array<any>;
    promoWarehouses?: Array<any>;
    promoTypes?: Array<any>;
    promoGroups?: Array<any>;
    promoClusters?: Array<any>;
    promoChannels?: Array<any>;
    promoCatalogues?: Array<any>;
    promoBrands?: Array<any>;
    promoInvoiceGroups?: Array<any>;

    constructor(data: IPeriodTargetPromo) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            supplierId,
            externalId,
            code,
            name,
            platform,
            isComulative,
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
        this.isComulative = isComulative;
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
