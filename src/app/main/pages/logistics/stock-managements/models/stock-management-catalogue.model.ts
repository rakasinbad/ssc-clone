import { TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

import { Catalogue } from './catalogue.model';
import { Warehouse } from './warehouse.model';

export interface IStockManagementCatalogue extends ITimestamp {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    warehouse: Warehouse;
    catalogue: Catalogue;
}

export class StockManagementCatalogue implements IStockManagementCatalogue {
    readonly id: NonNullable<string>;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    warehouse: Warehouse;
    catalogue: Catalogue;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStockManagementCatalogue) {
        const {
            id,
            warehouseId,
            catalogueId,
            stock,
            unlimitedStock,
            warehouse,
            catalogue,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.stock = stock;
        this.unlimitedStock = unlimitedStock;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setCatalogue = catalogue;
        this.setWarehouse = warehouse;
    }

    set setCatalogue(value: Catalogue) {
        this.catalogue = value ? new Catalogue(value) : null;
    }

    set setWarehouse(value: Warehouse) {
        this.warehouse = value ? new Warehouse(value) : null;
    }

    clear(): StockManagementCatalogue {
        return new StockManagementCatalogue(undefined);
    }
}
