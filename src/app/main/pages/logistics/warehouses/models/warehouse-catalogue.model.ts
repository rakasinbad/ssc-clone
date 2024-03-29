import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Catalogue } from './catalogue.model';

export interface IWarehouseCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    catalogue: Catalogue;
    catalogueId: string;
    status: EStatus;
    stock: number;
    unlimitedStock: boolean;
    warehouseId: string;
}

export class WarehouseCatalogue implements IWarehouseCatalogue {
    readonly id: NonNullable<string>;
    catalogue: Catalogue;
    catalogueId: string;
    status: EStatus;
    stock: number;
    unlimitedStock: boolean;
    warehouseId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseCatalogue) {
        const {
            id,
            catalogue,
            catalogueId,
            status,
            stock,
            unlimitedStock,
            warehouseId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.catalogueId = catalogueId;
        this.status = status;
        this.stock = stock;
        this.unlimitedStock = unlimitedStock;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setCatalogue = catalogue;
    }

    set setCatalogue(value: Catalogue) {
        this.catalogue = value ? new Catalogue(value) : null;
    }

    clear(): WarehouseCatalogue {
        return new WarehouseCatalogue(undefined);
    }
}
