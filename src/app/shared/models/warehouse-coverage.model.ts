import { Warehouse } from 'app/main/pages/logistics/warehouses/models';

import { TNullable } from './global.model';
import { Urban } from './location.model';
import { ITimestamp } from './timestamp.model';

export interface IWarehouseCoverage extends ITimestamp {
    readonly id: NonNullable<string>;
    urban: Urban;
    urbanId: string;
    warehouse: Warehouse;
    warehouseId: string;
}

export class WarehouseCoverage implements IWarehouseCoverage {
    readonly id: NonNullable<string>;
    urban: Urban;
    urbanId: string;
    warehouse: Warehouse;
    warehouseId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouseCoverage) {
        const {
            id,
            urban,
            urbanId,
            warehouse,
            warehouseId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.urbanId = urbanId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setUrban = urban;
        this.setWarehouse = warehouse;
    }

    set setUrban(value: Urban) {
        this.urban = value ? new Urban(value) : null;
    }

    set setWarehouse(value: Warehouse) {
        this.warehouse = value ? new Warehouse(value) : null;
    }
}
