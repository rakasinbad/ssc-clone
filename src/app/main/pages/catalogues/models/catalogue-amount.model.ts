export interface ICatalogueAmount {
    catalogueId?: string;
    packagedQty: string;
    minQty: string;
    minQtyType: string;
    multipleQty: string;
    multipleQtyType: string;
    largeUomId: string,
    enableLargeUom: boolean
}


/**
 * model for form detail amount setting
 * @class
 */
export class CatalogueAmount implements ICatalogueAmount {
    catalogueId?: string;
    packagedQty: string;
    minQty: string;
    minQtyType: string;
    multipleQty: string;
    multipleQtyType: string;
    largeUomId: string;
    enableLargeUom: boolean;


    constructor(data: ICatalogueAmount) {
        const {
            catalogueId,
            packagedQty,
            minQty,
            minQtyType,
            multipleQty,
            multipleQtyType,
            largeUomId,
            enableLargeUom

            // idCatalogueLargeUnit,
            // unit,
            // status
        } = data;

        this.catalogueId = catalogueId;
        this.packagedQty = packagedQty;
        this.minQty = minQty;
        this.minQtyType = minQtyType;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType;
        this.largeUomId = largeUomId,
        this.enableLargeUom = enableLargeUom

        // this.idCatalogueLargeUnit = idCatalogueLargeUnit,
        // this.unit = unit,
        // this.status = status
    }
}
