export interface ICatalogueAmount {
    catalogueId?: string;
    minQtyValue: number,
    isMaximum: boolean,
    uomSmallUnit: string,
    amountIncrease: number,
    isEnableLargeUnit: boolean,
    uomLargeUnit: string,
    consistOfQtyLargeUnit: number,
    maxQtyValue: number
}
//ICatalogueLargeUnit ada kalau isEnableLargeUnit true
export interface ICatalogueLargeUnit{
    idCatalogueLargeUnit: number,
    unit: string,
    status: string
}
/**
 * model for form detail amount setting
 * @class
 */
export class CatalogueAmount implements ICatalogueAmount {
    catalogueId?: string;
    minQtyValue: number;
    isMaximum: boolean;
    uomSmallUnit: string;
    amountIncrease: number;
    isEnableLargeUnit: boolean;
    uomLargeUnit: string;
    consistOfQtyLargeUnit: number;
    maxQtyValue: number;
    // idCatalogueLargeUnit: number;
    // unit: string;
    // status: string;
    // packagedQty: string;
    // minQty: string;
    // minQtyType: string;
    // multipleQty: string;
    // multipleQtyType: string;

    constructor(data: ICatalogueAmount) {
        const {
            catalogueId,
            minQtyValue,
            isMaximum,
            uomSmallUnit,
            amountIncrease,
            isEnableLargeUnit,
            uomLargeUnit,
            consistOfQtyLargeUnit,
            maxQtyValue,
            // idCatalogueLargeUnit,
            // unit,
            // status
        } = data;

        this.catalogueId = catalogueId;
        this.minQtyValue = minQtyValue,
        this.isMaximum = isMaximum,
        this.uomSmallUnit = uomSmallUnit,
        this.amountIncrease = amountIncrease,
        this.isEnableLargeUnit = isEnableLargeUnit,
        this.uomLargeUnit = uomLargeUnit,
        this.consistOfQtyLargeUnit = consistOfQtyLargeUnit,
        this.maxQtyValue = maxQtyValue
        // this.idCatalogueLargeUnit = idCatalogueLargeUnit,
        // this.unit = unit,
        // this.status = status
    }
}
