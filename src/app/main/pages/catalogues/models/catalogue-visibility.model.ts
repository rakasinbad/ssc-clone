export interface ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: boolean;
    isExclusive: boolean;
    platformVisibility?: string;
}

export class CatalogueVisibility implements ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: boolean;
    isExclusive: boolean;
    platformVisibility?: string;

    constructor(data: ICatalogueVisibility) {
        const { catalogueId, status, platformVisibility, isBonus, isExclusive } = data;

        this.catalogueId = catalogueId;
        this.status = status;
        this.platformVisibility = platformVisibility;
        this.isBonus = isBonus;
        this.isExclusive = isExclusive;
    }
}
