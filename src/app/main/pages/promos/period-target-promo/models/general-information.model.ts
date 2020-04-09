interface IPeriodTargetPromoGeneralInformation {
    id?: string;
    sellerId: string;
    name: string;
    platform: string;
    maxRedemptionPerUser: string;
    budget: string;
    activeStartDate: string;
    activeEndDate: string;
    imageSuggestion: string;
    isAllowCombineWithVoucher: boolean;
    isFirstBuy: boolean;
}

export class PeriodTargetPromoGeneralInformation implements IPeriodTargetPromoGeneralInformation {
    id?: string;
    sellerId: string;
    name: string;
    platform: string;
    maxRedemptionPerUser: string;
    budget: string;
    activeStartDate: string;
    activeEndDate: string;
    imageSuggestion: string;
    isAllowCombineWithVoucher: boolean;
    isFirstBuy: boolean;

    constructor(data: IPeriodTargetPromoGeneralInformation) {
        const {
            id,
            sellerId,
            name,
            platform,
            maxRedemptionPerUser,
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
        this.maxRedemptionPerUser = maxRedemptionPerUser;
        this.budget = budget;
        this.activeStartDate = activeStartDate;
        this.activeEndDate = activeEndDate;
        this.imageSuggestion = imageSuggestion;
        this.isAllowCombineWithVoucher = !!isAllowCombineWithVoucher;
        this.isFirstBuy = !!isFirstBuy;
    }
}
