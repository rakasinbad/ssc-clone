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

    constructor(data: IVoucherGeneralInformation) {
        const {
            id,
            externalId,
            name,
            platform,
            maxRedemptionPerBuyer,
            activeStartDate,
            activeEndDate,
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.platform = platform;
        this.maxRedemptionPerBuyer = maxRedemptionPerBuyer;
        this.activeStartDate = activeStartDate;
        this.activeEndDate = activeEndDate;
    }
}
