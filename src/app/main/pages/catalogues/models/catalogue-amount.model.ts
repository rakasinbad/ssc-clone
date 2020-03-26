export interface ICatalogueAmount {
    catalogueId?: string;
    packagedQty: string;
    minQty: string;
    minQtyType: string;
    multipleQty: string;
    multipleQtyType: string;
}

export class CatalogueAmount implements ICatalogueAmount {
    catalogueId?: string;
    packagedQty: string;
    minQty: string;
    minQtyType: string;
    multipleQty: string;
    multipleQtyType: string;

    constructor(data: ICatalogueAmount) {
        const {
            catalogueId,
            packagedQty,
            minQty,
            minQtyType,
            multipleQty,
            multipleQtyType,
        } = data;

        this.catalogueId = catalogueId;
        this.packagedQty = packagedQty;
        this.minQty = minQty;
        this.minQtyType = minQtyType;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType;
    }
}
