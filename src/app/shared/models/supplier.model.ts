import { TNullable } from './global.model';
import { ITimestamp } from './timestamp.model';

export class Supplier implements ITimestamp {
    id: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    status: string;
    urbanId: string;
    createdAt: TNullable<string>;
    updatedAt: TNullable<string>;
    deletedAt: TNullable<string>;

    constructor(
        id: string,
        name: string,
        address: string,
        longitude: number,
        latitude: number,
        phoneNo: string,
        status: string,
        urbanId: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        this.id = id;
        this.name = name ? name.trim() : name;
        this.address = address ? address.trim() : address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.status = status ? status.trim() : status;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class SupplierAssocUser implements ITimestamp {
    id: string;
    userId: string;
    supplierId: string;
    status: string;
    createdAt: TNullable<string>;
    updatedAt: TNullable<string>;
    deletedAt: TNullable<string>;
    supplier: Supplier;

    constructor(
        id: string,
        userId: string,
        supplierId: string,
        status: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>,
        supplier: Supplier
    ){
        this.id = id;
        this.userId = userId;
        this.supplierId = supplierId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.supplier = supplier ? new Supplier(
            supplier.id,
            supplier.name,
            supplier.address,
            supplier.longitude,
            supplier.latitude,
            supplier.phoneNo,
            supplier.status,
            supplier.urbanId,
            supplier.createdAt,
            supplier.updatedAt,
            supplier.deletedAt
        ) : supplier;
    }
}
