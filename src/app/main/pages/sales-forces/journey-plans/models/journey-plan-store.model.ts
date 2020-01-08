import { ITimestamp, SupplierStore, TNullable, EStatus } from 'app/shared/models';

export interface IStorePortfolio extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    creatorId: string;
    externalId: string;
    imageUrl: string;
    largeArea: string;
    latitude: number;
    longitude: number;
    name: string;
    numberOfEmployee: string;
    parent: boolean;
    parentId: string;
    phoneNo: string;
    reason: string;
    status: EStatus;
    storeCode: string;
    storeGroupId: string;
    storeSegmentId: string;
    storeTypeId: string;
    taxImageUrl: string;
    taxNo: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    warehouseId: string;
}

export class StorePortfolio implements IStorePortfolio {
    readonly id: NonNullable<string>;
    address: string;
    creatorId: string;
    externalId: string;
    imageUrl: string;
    largeArea: string;
    latitude: number;
    longitude: number;
    name: string;
    numberOfEmployee: string;
    parent: boolean;
    parentId: string;
    phoneNo: string;
    reason: string;
    status: EStatus;
    storeCode: string;
    storeGroupId: string;
    storeSegmentId: string;
    storeTypeId: string;
    taxImageUrl: string;
    taxNo: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    warehouseId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStorePortfolio) {
        const {
            id,
            address,
            creatorId,
            externalId,
            imageUrl,
            largeArea,
            latitude,
            longitude,
            name,
            numberOfEmployee,
            parent,
            parentId,
            phoneNo,
            reason,
            status,
            storeCode,
            storeGroupId,
            storeSegmentId,
            storeTypeId,
            taxImageUrl,
            taxNo,
            urbanId,
            vehicleAccessibilityId,
            warehouseId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.address = address ? String(address).trim() : null;
        this.creatorId = creatorId;
        this.externalId = externalId;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.largeArea = largeArea ? String(largeArea).trim() : null;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name ? String(name).trim() : null;
        this.numberOfEmployee = numberOfEmployee ? String(numberOfEmployee).trim() : null;
        this.parent = parent;
        this.parentId = parentId;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.reason = reason ? String(reason).trim() : null;
        this.status = status ? status : EStatus.INACTIVE;
        this.storeCode = storeCode ? String(storeCode).trim() : null;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.storeTypeId = storeTypeId;
        this.taxImageUrl = taxImageUrl ? String(taxImageUrl).trim() : null;
        this.taxNo = taxNo ? String(taxNo).trim() : null;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
