import { TNullable } from 'app/shared/models/global.model';

export interface ICatalogueWeightDimension {
    catalogueId?: string;
    catalogueDimension: TNullable<number>;
    catalogueWeight: TNullable<number>;
    packagedDimension: TNullable<number>;
    packagedWeight: TNullable<number>;
    dangerItem?: boolean;
}

export class CatalogueWeightDimension implements ICatalogueWeightDimension {
    catalogueId?: string;
    catalogueDimension: TNullable<number>;
    catalogueWeight: TNullable<number>;
    packagedDimension: TNullable<number>;
    packagedWeight: TNullable<number>;
    dangerItem?: boolean;

    constructor(data: ICatalogueWeightDimension) {
        const {
            catalogueId,
            catalogueDimension,
            catalogueWeight,
            packagedDimension,
            packagedWeight,
            dangerItem = false,
        } = data;

        this.catalogueId = catalogueId;
        this.catalogueDimension = catalogueDimension;
        this.catalogueWeight = catalogueWeight;
        this.packagedDimension = packagedDimension;
        this.packagedWeight = packagedWeight;
        this.dangerItem = dangerItem;
    }
}
