interface IVoucherGeneralInformation {
    id?: string;
    sellerId: string;
    name: string;
    platform: string;
    maxRedemptionPerBuyer: string;
    budget: string;
    activeStartDate: string;
    activeEndDate: string;
    imageSuggestion: string;
    isAllowCombineWithVoucher: boolean;
    isFirstBuy: boolean;
}

export class VoucherGeneralInformation implements IVoucherGeneralInformation {
    id?: string;
    sellerId: string;
    name: string;
    platform: string;
    maxRedemptionPerBuyer: string;
    budget: string;
    activeStartDate: string;
    activeEndDate: string;
    imageSuggestion: string;
    isAllowCombineWithVoucher: boolean;
    isFirstBuy: boolean;

    constructor(data: IVoucherGeneralInformation) {
        const {
            id,
            sellerId,
            name,
            platform,
            maxRedemptionPerBuyer,
            budget,
            activeStartDate,
            activeEndDate,
            imageSuggestion,
            isAllowCombineWithVoucher,
            isFirstBuy,
        } = data;

        this.id = id;
        this.sellerId = sellerId;
        this.name = name;
        this.platform = platform;
        this.maxRedemptionPerBuyer = maxRedemptionPerBuyer;
        this.budget = budget;
        this.activeStartDate = activeStartDate;
        this.activeEndDate = activeEndDate;
        this.imageSuggestion = imageSuggestion;
        this.isAllowCombineWithVoucher = !!isAllowCombineWithVoucher;
        this.isFirstBuy = !!isFirstBuy;
    }
}
