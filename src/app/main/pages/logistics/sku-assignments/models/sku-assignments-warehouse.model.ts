import { TNullable } from 'app/shared/models/global.model';

interface ISkuAssignmentsWarehouse {
    id: string;
    urbanId: string;
    supplierId: string;
    warehouseValueId: string;
    warehouseTemperatureId: string;
    code: string;
    name: string;
    leadTime: number;
    address: string;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouseCount: string;
}

export class SkuAssignmentsWarehouse implements ISkuAssignmentsWarehouse {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    urbanId: string;
    supplierId: string;
    warehouseValueId: string;
    warehouseTemperatureId: string;
    code: string;
    name: string;
    leadTime: number;
    address: string;
    noteAddress: string;
    longitude: number;
    latitude: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouseCount: string;

    constructor(data: ISkuAssignmentsWarehouse) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
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
            warehouseCount
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
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
        this.warehouseCount = warehouseCount;
    }
}
