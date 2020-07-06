interface IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: string;
    maxRedemptionPerBuyer: string;
    maxVoucherRedemption: string;
    activeStartDate: string;
    activeEndDate: string;
    description: string;
    shortDescription: string;
}

export class VoucherGeneralInformation implements IVoucherGeneralInformation {
    id?: string;
    externalId: string;
    name: string;
    platform: string;
    maxRedemptionPerBuyer: string;
    maxVoucherRedemption: string;
    activeStartDate: string;
    activeEndDate: string;
    description: string;
    shortDescription: string;

    constructor(data: IVoucherGeneralInformation) {
        const {
            id,
            externalId,
            name,
            platform,
            maxRedemptionPerBuyer,
            activeStartDate,
            activeEndDate,
            description,
            shortDescription
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.platform = platform;
        this.maxRedemptionPerBuyer = maxRedemptionPerBuyer;
        this.activeStartDate = activeStartDate;
        this.activeEndDate = activeEndDate;
        this.description = description;
        this.shortDescription = shortDescription;
    }
}
