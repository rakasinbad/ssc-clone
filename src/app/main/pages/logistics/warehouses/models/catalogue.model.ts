import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ICatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    name: string;
    externalId: string;
    barcode: string;
    information: string;
    description: string;
    detail: string;
    catalogueWeight: number;
    catalogueDimension: string;
    packagedWeight: number;
    packagedDimension: string;
    sku: string;
    suggestedConsumerBuyingPrice: number;
    retailBuyingPrice: number;
    minQty: string;
    minQtyType: string;
    packagedQty: number;
    multipleQty: number;
    multipleQtyType: string;
    dangerItem: boolean;
    unitOfMeasureId: string;
    status: EStatus;
    catalogueTaxId: string;
    brandId: string;
    firstCatalogueCategoryId: string;
    lastCatalogueCategoryId: string;
    violationTypeId: string;
    violationSuggestion: string;
    violationReason: string;
    first_catalogue_category_id: string;
    last_catalogue_category_id: string;
    unit_of_measure_id: string;
}

export class Catalogue implements ICatalogue {
    readonly id: NonNullable<string>;
    name: string;
    externalId: string;
    barcode: string;
    information: string;
    description: string;
    detail: string;
    catalogueWeight: number;
    catalogueDimension: string;
    packagedWeight: number;
    packagedDimension: string;
    sku: string;
    suggestedConsumerBuyingPrice: number;
    retailBuyingPrice: number;
    minQty: string;
    minQtyType: string;
    packagedQty: number;
    multipleQty: number;
    multipleQtyType: string;
    dangerItem: boolean;
    unitOfMeasureId: string;
    status: EStatus;
    catalogueTaxId: string;
    brandId: string;
    firstCatalogueCategoryId: string;
    lastCatalogueCategoryId: string;
    violationTypeId: string;
    violationSuggestion: string;
    violationReason: string;
    // tslint:disable-next-line: variable-name
    first_catalogue_category_id: string;
    // tslint:disable-next-line: variable-name
    last_catalogue_category_id: string;
    // tslint:disable-next-line: variable-name
    unit_of_measure_id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: ICatalogue) {
        const {
            id,
            name,
            externalId,
            barcode,
            information,
            description,
            detail,
            catalogueWeight,
            catalogueDimension,
            packagedWeight,
            packagedDimension,
            sku,
            suggestedConsumerBuyingPrice,
            retailBuyingPrice,
            minQty,
            minQtyType,
            packagedQty,
            multipleQty,
            multipleQtyType,
            dangerItem,
            unitOfMeasureId,
            status,
            catalogueTaxId,
            brandId,
            firstCatalogueCategoryId,
            lastCatalogueCategoryId,
            violationTypeId,
            violationSuggestion,
            violationReason,
            first_catalogue_category_id,
            last_catalogue_category_id,
            unit_of_measure_id,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.name = name ? String(name).trim() : null;
        this.externalId = externalId;
        this.barcode = barcode ? String(barcode).trim() : null;
        this.information = information ? String(information).trim() : null;
        this.description = description ? String(description).trim() : null;
        this.detail = detail ? String(detail).trim() : null;
        this.catalogueWeight = catalogueWeight;
        this.catalogueDimension = catalogueDimension ? String(catalogueDimension).trim() : null;
        this.packagedWeight = packagedWeight;
        this.packagedDimension = packagedDimension ? String(packagedDimension).trim() : null;
        this.sku = sku ? String(sku).trim() : null;
        this.suggestedConsumerBuyingPrice = suggestedConsumerBuyingPrice;
        this.retailBuyingPrice = retailBuyingPrice;
        this.minQty = minQty;
        this.minQtyType = minQtyType ? String(minQtyType).trim() : null;
        this.packagedQty = packagedQty;
        this.multipleQty = multipleQty;
        this.multipleQtyType = multipleQtyType ? String(multipleQtyType).trim() : null;
        this.dangerItem = dangerItem;
        this.unitOfMeasureId = unitOfMeasureId;
        this.status = status;
        this.catalogueTaxId = catalogueTaxId;
        this.brandId = brandId;
        this.firstCatalogueCategoryId = firstCatalogueCategoryId;
        this.lastCatalogueCategoryId = lastCatalogueCategoryId;
        this.violationTypeId = violationTypeId;
        this.violationSuggestion = violationSuggestion ? String(violationSuggestion).trim() : null;
        this.violationReason = violationReason ? String(violationReason).trim() : null;
        this.first_catalogue_category_id = first_catalogue_category_id;
        this.last_catalogue_category_id = last_catalogue_category_id;
        this.unit_of_measure_id = unit_of_measure_id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    clear(): Catalogue {
        return new Catalogue(undefined);
    }
}
