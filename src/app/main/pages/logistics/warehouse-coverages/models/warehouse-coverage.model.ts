import { TNullable } from 'app/shared/models/global.model';

export interface Warehouse {
    id: string;
    urbanId: string;
    supplierId: string;
    warehouseValueId: null;
    warehouseTemperatureId: null;
    code: string;
    name: string;
    leadTime: number;
    address: null;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class Warehouse implements Warehouse {
    id: string;
    urbanId: string;
    supplierId: string;
    warehouseValueId: null;
    warehouseTemperatureId: null;
    code: string;
    name: string;
    leadTime: number;
    address: null;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: Warehouse) {
        const {
            id,
            urbanId,
            supplierId,
            warehouseValueId,
            warehouseTemperatureId,
            code,
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

export interface Province {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
}

export class Province implements Province {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: Province) {
        const {
            id,
            name,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export interface Urban {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    province: Province;
}

export class Urban implements Urban {
    id: string;
    zipCode: string;
    city: string;
    district: string;
    urban: string;
    provinceId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    province: Province;

    constructor(data: Urban) {
        const {
            id,
            zipCode,
            city,
            district,
            urban,
            provinceId,
            createdAt,
            updatedAt,
            deletedAt,
            province,
        } = data;

        this.id = id;
        this.zipCode = zipCode;
        this.city = city;
        this.district = district;
        this.urban = urban;
        this.provinceId = provinceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.province = new Province(province);
    }
}

export interface WarehouseCoverage {
    id: string;
    warehouseId: string;
    urbanId: string;
    createdAt: string;
    updatedAt: string;
    warehouse: Warehouse;
    urban: Urban;
}

export class WarehouseCoverage implements WarehouseCoverage {
    id: string;
    warehouseId: string;
    urbanId: string;
    createdAt: string;
    updatedAt: string;
    warehouse: Warehouse;
    urban: Urban;

    constructor(data: WarehouseCoverage) {
        const {
            id,
            warehouseId,
            urbanId,
            createdAt,
            updatedAt,
            warehouse,
            urban,
        } = data;

        this.id = id;
        this.warehouseId = warehouseId;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.warehouse = new Warehouse(warehouse);
        this.urban = new Urban(urban);
    }
}

interface ICheckAvailabilityWarehouseCoverageResponse {
    available: boolean;
    message?: string;
    urban: string;
    urbanId: number;
    warehouseName: string;
}

export class CheckAvailabilityWarehouseCoverageResponse implements ICheckAvailabilityWarehouseCoverageResponse {
    available: boolean;
    message?: string;
    urban: string;
    urbanId: number;
    warehouseName: string;
}
