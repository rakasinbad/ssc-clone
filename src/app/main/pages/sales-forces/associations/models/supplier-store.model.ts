import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface ISupplierStore extends ITimestamp {
    id: string;
    supplierId: string;
    storeId: string;
    externalId: string;
    name: string;
    address: string;
    noteAddress: string;
    taxNo: string;
    longitude: number;
    latitude: number;
    largeArea: string;
    phoneNo: string;
    imageUrl: string;
    taxImageUrl: string;
    numberOfEmployee: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    vehicleAccessibilityAmount: string;
    creatorId: string;
    warehouseId: string;
    topSellingBrand: string;
    mostWantedBrand: string;
    platformCreated: string;
    status: string;
    approvalStatus: string;
}

export class SupplierStore implements ISupplierStore {
    id: string;
    supplierId: string;
    storeId: string;
    externalId: string;
    name: string;
    address: string;
    noteAddress: string;
    taxNo: string;
    longitude: number;
    latitude: number;
    largeArea: string;
    phoneNo: string;
    imageUrl: string;
    taxImageUrl: string;
    numberOfEmployee: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    vehicleAccessibilityAmount: string;
    creatorId: string;
    warehouseId: string;
    topSellingBrand: string;
    mostWantedBrand: string;
    platformCreated: string;
    status: string;
    approvalStatus: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;

    constructor(data: ISupplierStore) {
        const {
            id,
            supplierId,
            storeId,
            externalId,
            name,
            address,
            noteAddress,
            taxNo,
            longitude,
            latitude,
            largeArea,
            phoneNo,
            imageUrl,
            taxImageUrl,
            numberOfEmployee,
            urbanId,
            vehicleAccessibilityId,
            vehicleAccessibilityAmount,
            creatorId,
            warehouseId,
            topSellingBrand,
            mostWantedBrand,
            platformCreated,
            status,
            approvalStatus,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.storeId = storeId;
        this.externalId = externalId;
        this.name = name;
        this.address = address;
        this.noteAddress = noteAddress;
        this.taxNo = taxNo;
        this.longitude = longitude;
        this.latitude = latitude;
        this.largeArea = largeArea;
        this.phoneNo = phoneNo;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.numberOfEmployee = numberOfEmployee;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.vehicleAccessibilityAmount = vehicleAccessibilityAmount;
        this.creatorId = creatorId;
        this.warehouseId = warehouseId;
        this.topSellingBrand = topSellingBrand;
        this.mostWantedBrand = mostWantedBrand;
        this.platformCreated = platformCreated;
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
