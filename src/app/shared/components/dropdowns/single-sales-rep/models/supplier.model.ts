import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ISupplier extends ITimestamp {
    id: string;
    code: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: string;
    urbanId: string;
}

export class Supplier implements ISupplier {
    id: string;
    code: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: string;
    urbanId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: ISupplier) {
        const {
            id,
            code,
            name,
            address,
            longitude,
            latitude,
            phoneNo,
            status,
            urbanId,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phoneNo = phoneNo;
        this.status = status;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
