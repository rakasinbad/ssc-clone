import { UrbanAssoc } from 'app/main/pages/urbans/models';
import {
    CustomerHierarchyAssoc,
    IResponsePaginate,
    ITimestamp,
    Timestamp,
    TNullable,
    TStatus
} from 'app/shared/models';

export interface IBrandStore extends ITimestamp {
    id: string;
    brandId: string;
    storeId: string;
    status: TStatus;
    store: Store;
}

export interface IBrandStoreResponse extends IResponsePaginate {
    data: IBrandStore[];
}

export class BrandStore extends Timestamp {
    id: string;
    brandId: string;
    storeId: string;
    status: TStatus;
    store: Store;

    constructor(
        id: string,
        brandId: string,
        storeId: string,
        status: TStatus,
        store: Store,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.brandId = brandId;
        this.storeId = storeId;
        this.status = status;
        this.store = store
            ? {
                  ...new Store(
                      store.id,
                      store.storeCode,
                      store.name,
                      store.address,
                      store.taxNo,
                      store.longitude,
                      store.latitude,
                      store.largeArea,
                      store.phoneNo,
                      store.imageUrl,
                      store.taxImageUrl,
                      store.status,
                      store.reason,
                      store.parent,
                      store.parentId,
                      store.externalId,
                      store.storeTypeId,
                      store.storeGroupId,
                      store.storeSegmentId,
                      store.urbanId,
                      store.warehouseId,
                      store.urban,
                      store.customerHierarchies,
                      store.storeType,
                      store.storeSegment,
                      store.createdAt,
                      store.updatedAt,
                      store.deletedAt
                  )
              }
            : null;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class Store extends Timestamp {
    id: string;
    storeCode: string;
    name: string;
    address: string;
    taxNo: TNullable<string>;
    longitude: TNullable<number>;
    latitude: TNullable<number>;
    largeArea: TNullable<number>;
    phoneNo: TNullable<string>;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    status: TStatus;
    reason: string;
    parent: boolean;
    parentId: string;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    warehouseId: string;
    urban: UrbanAssoc;
    customerHierarchies: CustomerHierarchyAssoc[];
    storeType: StoreType;
    storeSegment: StoreSegment;

    constructor(
        id: string,
        storeCode: string,
        name: string,
        address: string,
        taxNo: TNullable<string>,
        longitude: TNullable<number>,
        latitude: TNullable<number>,
        largeArea: TNullable<number>,
        phoneNo: TNullable<string>,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        status: TStatus,
        reason: string,
        parent: boolean,
        parentId: string,
        externalId: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        warehouseId: string,
        urban: UrbanAssoc,
        customerHierarchies: CustomerHierarchyAssoc[],
        storeType: StoreType,
        storeSegment: StoreSegment,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.storeCode = storeCode ? storeCode.trim() : storeCode;
        this.name = name ? name.trim() : name;
        this.address = address ? address.trim() : address;
        this.taxNo = taxNo ? taxNo.trim() : taxNo;
        this.longitude = longitude;
        this.latitude = latitude;
        this.largeArea = largeArea;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
        this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
        this.status = status;
        this.reason = reason;
        this.parent = parent;
        this.parentId = parentId;
        this.externalId = externalId;
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.urban = urban
            ? {
                  ...new UrbanAssoc(
                      urban.id,
                      urban.zipCode,
                      urban.city,
                      urban.district,
                      urban.urban,
                      urban.provinceId,
                      urban.createdAt,
                      urban.updatedAt,
                      urban.deletedAt
                  )
              }
            : null;

        this.storeType = storeType
            ? {
                  ...new StoreType(
                      storeType.id,
                      storeType.name,
                      storeType.createdAt,
                      storeType.updatedAt,
                      storeType.deletedAt
                  )
              }
            : null;

        this.storeSegment = storeSegment
            ? {
                  ...new StoreSegment(
                      storeSegment.id,
                      storeSegment.name,
                      storeSegment.createdAt,
                      storeSegment.updatedAt,
                      storeSegment.deletedAt
                  )
              }
            : null;

        if (customerHierarchies && customerHierarchies.length > 0) {
            customerHierarchies = [
                ...customerHierarchies.map(customerHierarchy => {
                    return {
                        ...new CustomerHierarchyAssoc(
                            customerHierarchy.id,
                            customerHierarchy.storeId,
                            customerHierarchy.hierarchyId,
                            customerHierarchy.status,
                            customerHierarchy.hierarchy,
                            customerHierarchy.createdAt,
                            customerHierarchy.updatedAt,
                            customerHierarchy.deletedAt
                        )
                    };
                })
            ];
            this.customerHierarchies = customerHierarchies;
        } else {
            this.customerHierarchies = [];
        }
    }
}

export class StoreSegment extends Timestamp {
    id: string;
    name: string;

    constructor(
        id: string,
        name: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class StoreType extends Timestamp {
    id: string;
    name: string;

    constructor(
        id: string,
        name: string,
        createdAt: TNullable<string>,
        updatedAt: TNullable<string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export interface IMerchantDemo {
    id: string;
    storeName: string;
    address: string;
    ownerPhoneNumber: string;
    storeSegment: string;
    storeType: string;
    customerHierarchy: string;
    status: string;
}

export interface IStoreEmployeeDemo {
    id: string;
    name: string;
    role: string;
    phoneNumber: string;
    lastCheckIn: string;
}
