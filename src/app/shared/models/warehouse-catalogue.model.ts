import { Catalogue } from './../../main/pages/catalogues/models/catalogue.model';
import { EStatus, TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export interface IWarehouseCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    status: EStatus;
    catalogoue: Catalogue;
}

export class WarehouseCatalogue implements IWarehouseCatalogue {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    status: EStatus;
    catalogoue: Catalogue;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseCatalogue) {
        const {
            id,
            warehouseId,
            catalogueId,
            stock,
            unlimitedStock,
            status,
            catalogoue,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.stock = stock;
        this.unlimitedStock = unlimitedStock;
        this.status = status;
        this.catalogoue = catalogoue;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setCatalogue = catalogoue;
    }

    set setCatalogue(value: Catalogue) {
        this.catalogoue = value ? new Catalogue(value) : null;
    }
}
