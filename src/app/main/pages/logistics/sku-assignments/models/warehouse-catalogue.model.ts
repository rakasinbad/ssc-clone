import { TNullable } from 'app/shared/models/global.model';
import { Catalogue } from 'app/main/pages/catalogues/models';
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
    catalogue: TNullable<Catalogue>;
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
    catalogue: TNullable<Catalogue>;

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
        this.catalogue = catalogue ? new Catalogue(catalogue) : null;
    }
}
