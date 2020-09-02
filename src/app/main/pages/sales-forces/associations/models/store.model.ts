import { ITimestamp } from 'app/shared/models/timestamp.model';

import { SupplierStore } from './supplier-store.model';
import { User } from './user.model';

export interface IStore extends ITimestamp {
    id: string;
    storeCode?: string;
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
    status: string;
    approvalStatus: string;
    reason?: string;
    parent?: boolean;
    topSellingBrand: string;
    mostWantedBrand: string;
    parentId?: string;
    numberOfEmployee: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    vehicleAccessibilityAmount: string;
    creatorId: string;
    // createdAt: string;
    // updatedAt: string;
    // deletedAt: string;
    supplierStores?: Array<SupplierStore>;
    owner?: User;
    supplierId?: string;
    storeId?: string;
    externalId?: string;
    warehouseId?: string;
    platformCreated?: string;
}

export class Store implements IStore {
    id: string;
    storeCode?: string;
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
    status: string;
    approvalStatus: string;
    reason?: string;
    parent?: boolean;
    topSellingBrand: string;
    mostWantedBrand: string;
    parentId?: string;
    numberOfEmployee: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    vehicleAccessibilityAmount: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    supplierStores?: Array<SupplierStore>;
    owner?: User;
    supplierId?: string;
    storeId?: string;
    externalId?: string;
    warehouseId?: string;
    platformCreated?: string;

    constructor(data: IStore) {
        const {
            id,
            storeCode,
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
            status,
            approvalStatus,
            reason,
            parent,
            topSellingBrand,
            mostWantedBrand,
            parentId,
            numberOfEmployee,
            urbanId,
            vehicleAccessibilityId,
            vehicleAccessibilityAmount,
            creatorId,
            createdAt,
            updatedAt,
            deletedAt,
            supplierStores,
            owner,
            supplierId,
            storeId,
            externalId,
            warehouseId,
            platformCreated,
        } = data;

        this.id = id;
        this.storeCode = storeCode;
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
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.reason = reason;
        this.parent = parent;
        this.topSellingBrand = topSellingBrand;
        this.mostWantedBrand = mostWantedBrand;
        this.parentId = parentId;
        this.numberOfEmployee = numberOfEmployee;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.vehicleAccessibilityAmount = vehicleAccessibilityAmount;
        this.creatorId = creatorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.supplierStores = supplierStores;
        this.owner = owner;
        this.supplierId = supplierId;
        this.storeId = storeId;
        this.externalId = externalId;
        this.warehouseId = warehouseId;
        this.platformCreated = platformCreated;
    }

    set setOwner(value: User) {
        this.owner = !value ? null : new User(value);
    }

    set setSupplierStores(value: Array<SupplierStore>) {
        this.supplierStores = Array.isArray(value) ? value.map(v => new SupplierStore(v)) : [];
    }
}
