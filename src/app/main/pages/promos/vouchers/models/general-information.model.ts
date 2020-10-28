import { PlatformSupplierVoucer } from 'app/shared/models/platform.model';

interface IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: PlatformSupplierVoucer;
    maxRedemptionPerBuyer: string;
    maxVoucherRedemption: string;
    startDate: string;
    endDate: string;
    description: string;
    shortDescription: string;
    voucherAllocationType: string;
    voucherSlot: string;
    voucherBudget: string;
    voucherType: string;
    voucherHeader: string;
    category: string;
    termsAndConditions: [];
    instructions: [];
    voucherBanner: string;
    expiration: Boolean;
    expirationDays: string;
    availableCollectedFrom: string;
    availableCollectedTo: string;
    voucherTag: [];
}

export class VoucherGeneralInformation implements IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: PlatformSupplierVoucer;
    maxRedemptionPerBuyer: string;
    maxVoucherRedemption: string;
    startDate: string;
    endDate: string;
    description: string;
    shortDescription: string;
    voucherAllocationType: string;
    voucherSlot: string;
    voucherBudget: string;
    voucherType: string;
    voucherHeader: string;
    category: string;
    termsAndConditions: [];
    instructions: [];
    voucherBanner: string;
    expiration: Boolean;
    expirationDays: string;
    availableCollectedFrom: string;
    availableCollectedTo: string;
    voucherTag: [];

    constructor(data: IVoucherGeneralInformation) {
        const {
            id,
            externalId,
            name,
            platform,
            maxRedemptionPerBuyer,
            startDate,
            endDate,
            description,
            shortDescription,
            voucherAllocationType,
            voucherSlot,
            voucherBudget,
            voucherType,
            voucherHeader,
            category,
            termsAndConditions,
            instructions,
            voucherBanner,
            expiration,
            expirationDays,
            availableCollectedFrom,
            availableCollectedTo,
            voucherTag
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.platform = platform;
        this.maxRedemptionPerBuyer = maxRedemptionPerBuyer;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
        this.shortDescription = shortDescription;
        this.voucherAllocationType = voucherAllocationType;
        this.voucherSlot = voucherSlot || null;
        this.voucherBudget = voucherBudget || null;
        this.voucherType = voucherType;
        this.voucherHeader = voucherHeader || null;
        this.category = category || null;
        this.termsAndConditions = termsAndConditions || null;
        this.instructions = instructions || null;
        this.voucherBanner = voucherBanner || null;
        this.expiration = expiration;
        this.expirationDays = expirationDays || null;
        this.availableCollectedFrom = availableCollectedFrom;
        this.availableCollectedTo = availableCollectedTo;
        this.voucherTag = voucherTag || null;
    }
}
