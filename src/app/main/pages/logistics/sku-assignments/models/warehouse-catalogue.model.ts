import { TNullable } from 'app/shared/models/global.model';
import { SkuAssignmentsWarehouse } from '.';

interface IWarehouseCatalogue {
    id: string;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouse: TNullable<SkuAssignmentsWarehouse>;
    catalogue: TNullable<any>;
}

export class WarehouseCatalogue implements IWarehouseCatalogue {
    id: string;
    warehouseId: string;
    catalogueId: string;
    stock: number;
    unlimitedStock: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouse: TNullable<SkuAssignmentsWarehouse>;
    catalogue: TNullable<any>;

    constructor(data: IWarehouseCatalogue) {
        const {
            id,
            warehouseId,
            catalogueId,
            stock,
            unlimitedStock,
            createdAt,
            updatedAt,
            deletedAt,
            warehouse,
            catalogue,
        } = data;

        this.id = id;
        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.stock = stock;
        this.unlimitedStock = unlimitedStock;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.warehouse = warehouse ? new SkuAssignmentsWarehouse(warehouse) : null;
        this.catalogue = catalogue ? catalogue : null;
    }
}
