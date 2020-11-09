export interface ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: string;
}

export class CatalogueVisibility implements ICatalogueVisibility {
    catalogueId?: string;
    status: string;
    isBonus: string;

    constructor(data: ICatalogueVisibility) {
        const {
            catalogueId,
            status,
            isBonus,
        } = data;

        this.catalogueId = catalogueId;
        this.status = status;
        this.isBonus = isBonus;
    }
}
