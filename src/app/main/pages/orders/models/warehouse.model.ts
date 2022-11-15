import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';
import { WarehouseInvoiceGroup } from 'app/shared/models/warehouse-invoice-group.model';

export interface IWarehouse extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    code: string;
    externalId: string;
    latitude: number;
    leadTime: number;
    longitude: number;
    name: string;
    noteAddress: string;
    status: EStatus;
    supplierId: string;
    urbanId: string;
    warehouseInvoiceGroups: Array<WarehouseInvoiceGroup>;
    warehouseTemperatureId: string;
    warehouseValueId: string;
}

export class Warehouse implements IWarehouse {
    readonly id: NonNullable<string>;
    address: string;
    code: string;
    externalId: string;
    latitude: number;
    leadTime: number;
    longitude: number;
    name: string;
    noteAddress: string;
    status: EStatus;
    supplierId: string;
    urbanId: string;
    warehouseInvoiceGroups: Array<WarehouseInvoiceGroup>;
    warehouseTemperatureId: string;
    warehouseValueId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouse) {
        const {
            id,
            address,
            code,
            externalId,
            latitude,
            leadTime,
            longitude,
            name,
            noteAddress,
            status,
            supplierId,
            urbanId,
            warehouseInvoiceGroups,
            warehouseTemperatureId,
            warehouseValueId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.address = address ? String(address).trim() : null;
        this.code = code ? String(code).trim() : null;
        this.externalId = externalId ? String(externalId).trim() : null;
        this.latitude = latitude;
        this.leadTime = leadTime;
        this.longitude = longitude;
        this.name = name ? String(name).trim() : null;
        this.noteAddress = noteAddress ? String(noteAddress).trim() : null;
        this.status = status;
        this.supplierId = supplierId;
        this.urbanId = urbanId;
        this.warehouseTemperatureId = warehouseTemperatureId;
        this.warehouseValueId = warehouseValueId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.setWarehouseInvoiceGroups = warehouseInvoiceGroups;
    }

    set setWarehouseInvoiceGroups(value: Array<WarehouseInvoiceGroup>) {
        this.warehouseInvoiceGroups =
            value && value.length > 0 ? value.map(v => new WarehouseInvoiceGroup(v)) : [];
    }

    clear(): Warehouse {
        return new Warehouse(undefined);
    }
}