export interface ICatalogueInformation {
    id?: string;
    externalId: string;
    name: string;
    description: string;
    information: string;
    detail: string;
    brandId: string;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    unitOfMeasureId: number;
}

export class CatalogueInformation implements ICatalogueInformation {
    id?: string;
    externalId: string;
    name: string;
    description: string;
    information: string;
    detail: string;
    brandId: string;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    unitOfMeasureId: number;

    constructor(data: ICatalogueInformation) {
        const {
            id,
            externalId,
            name,
            description,
            information,
            detail,
            brandId,
            firstCatalogueCategoryId,
            lastCatalogueCategoryId,
            unitOfMeasureId,
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.description = description;
        this.information = information;
        this.detail = detail;
        this.brandId = brandId;
        this.firstCatalogueCategoryId = firstCatalogueCategoryId;
        this.lastCatalogueCategoryId = lastCatalogueCategoryId;
        this.unitOfMeasureId = unitOfMeasureId;
    }
}
