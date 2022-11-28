export interface ICatalogueAmount {
    catalogueId?: string;
    largeUomId: number;
    unitOfMeasureId: number;
    enableLargeUom: boolean;
    packagedQty: number;
    minQty: number;
    minQtyType: string;
    multipleQty: number;
    multipleQtyType: string;
    isMaximum: boolean;
    maxQty: number
}


/**
 * model for form detail amount setting
 * @class
 */
export class CatalogueAmount implements ICatalogueAmount {
    catalogueId?: string;
    largeUomId: number;
    unitOfMeasureId: number;
    enableLargeUom: boolean;
    packagedQty: number;
    minQty: number;
    minQtyType: string;
    multipleQty: number;
    multipleQtyType: string;
    isMaximum: boolean;
    maxQty: number


    constructor(data: ICatalogueAmount) {
        const {
            catalogueId,
            largeUomId,
            unitOfMeasureId,
            enableLargeUom,
            packagedQty,
            minQty,
            minQtyType,
            multipleQty,
            multipleQtyType,
            isMaximum,
            maxQty

            // idCatalogueLargeUnit,
            // unit,
            // status
        } = data;

        this.catalogueId = catalogueId;
        this.largeUomId = largeUomId;
        this.unitOfMeasureId = unitOfMeasureId;
        this.enableLargeUom = enableLargeUom;
        this.packagedQty = packagedQty;
        this.minQty = minQty;
        this.minQtyType = minQtyType;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType;
        this.isMaximum = isMaximum;
        this.maxQty = maxQty;
        // this.idCatalogueLargeUnit = idCatalogueLargeUnit,
        // this.unit = unit,
        // this.status = status
    }
}
