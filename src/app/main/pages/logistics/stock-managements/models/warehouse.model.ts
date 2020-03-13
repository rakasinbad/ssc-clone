import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IWarehouse extends ITimestamp {
    readonly id: NonNullable<string>;
    urbanId: string;
    supplierId: string;
    warehouseValueId: string;
    warehouseTemperatureId: string;
    code: string;
    externalId: string;
    name: string;
    leadTime: number;
    address: string;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: EStatus;
}

export class Warehouse implements IWarehouse {
    readonly id: NonNullable<string>;
    urbanId: string;
    supplierId: string;
    warehouseValueId: string;
    warehouseTemperatureId: string;
    code: string;
    externalId: string;
    name: string;
    leadTime: number;
    address: string;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: EStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IWarehouse) {
        const {
            id,
            urbanId,
            supplierId,
            warehouseValueId,
            warehouseTemperatureId,
            code,
            externalId,
            name,
            leadTime,
            address,
            noteAddress,
            longitude,
            latitude,
            status,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.urbanId = urbanId;
        this.supplierId = supplierId;
        this.warehouseValueId = warehouseValueId;
        this.warehouseTemperatureId = warehouseTemperatureId;
        this.code = code ? String(code).trim() : null;
        this.externalId = externalId;
        this.name = name ? String(name).trim() : null;
        this.leadTime = leadTime;
        this.address = address ? String(address).trim() : null;
        this.noteAddress = noteAddress ? String(noteAddress).trim() : null;
        this.longitude = longitude;
        this.latitude = latitude;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    clear(): Warehouse {
        return new Warehouse(undefined);
    }
}
