import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IWarehouse extends ITimestamp {
    id: string;
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
    status: string;
}

export class Warehouse implements IWarehouse {
    id: string;
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
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

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
            deletedAt,
        } = data;

        this.id = id;
        this.urbanId = urbanId;
        this.supplierId = supplierId;
        this.warehouseValueId = warehouseValueId;
        this.warehouseTemperatureId = warehouseTemperatureId;
        this.code = code;
        this.externalId = externalId;
        this.name = name;
        this.leadTime = leadTime;
        this.address = address;
        this.noteAddress = noteAddress;
        this.longitude = longitude;
        this.latitude = latitude;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
