import { PlatformSupplierVoucer } from 'app/shared/models/platform.model';

interface IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: PlatformSupplierVoucer;
    maxCollectionPerStore: string;
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
    imageUrl: string;
    expirationDays: number;
    voucherTag: [];
    code: string;
}

export class VoucherGeneralInformation implements IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: PlatformSupplierVoucer;
    maxCollectionPerStore: string;
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
    imageUrl: string;
    expirationDays: number;
    voucherTag: [];
    code: string;

    constructor(data: IVoucherGeneralInformation) {
        const {
            id,
            externalId,
            name,
            platform,
            maxCollectionPerStore,
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
            imageUrl,
            expirationDays,
            voucherTag,
            code
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.platform = platform;
        this.maxCollectionPerStore = maxCollectionPerStore || null;
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
        this.imageUrl = imageUrl || null;
        if (this.voucherType == 'direct') {
            this.expirationDays = null;
        }
        if (this.voucherType == "collectible") {
            this.expirationDays = expirationDays || null;
        }
        this.startDate = startDate|| null;
        this.endDate = endDate|| null;
        this.voucherTag = voucherTag || null;
        this.code = code || null;
    }
}
