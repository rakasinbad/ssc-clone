export interface ICatalogueInformation {
    id?: string;
    externalId: string;
    name: string;
    description: string;
    information: string;
    detail: string;
    brandId: string;
    subBrandId: string;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    unitOfMeasureId: number;
    tags: Array<string>;
}

export class CatalogueInformation implements ICatalogueInformation {
    id?: string;
    externalId: string;
    name: string;
    description: string;
    information: string;
    detail: string;
    brandId: string;
    subBrandId: string;
    firstCatalogueCategoryId: number;
    lastCatalogueCategoryId: number;
    unitOfMeasureId: number;
    tags: Array<string>;

    constructor(data: ICatalogueInformation) {
        const {
            id,
            externalId,
            name,
            description,
            information,
            detail,
            brandId,
            subBrandId,
            firstCatalogueCategoryId,
            lastCatalogueCategoryId,
            unitOfMeasureId,
            tags = [],
        } = data;

        this.id = id;
        this.externalId = externalId;
        this.name = name;
        this.description = description;
        this.information = information;
        this.detail = detail;
        this.brandId = brandId;
        this.subBrandId = subBrandId;
        this.firstCatalogueCategoryId = firstCatalogueCategoryId;
        this.lastCatalogueCategoryId = lastCatalogueCategoryId;
        this.unitOfMeasureId = unitOfMeasureId;
        this.tags = tags;
    }
}
