export interface ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: boolean;
    isExclusive: boolean;
}

export class CatalogueVisibility implements ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: boolean;
    isExclusive: boolean;

    constructor(data: ICatalogueVisibility) {
        const { catalogueId, status, isBonus, isExclusive } = data;

        this.catalogueId = catalogueId;
        this.status = status;
        this.isBonus = isBonus;
        this.isBonus = isExclusive;
    }
}
