import { Role } from 'app/main/pages/roles/role.model';
import { Urban } from 'app/main/pages/urbans/models';
import {
    CustomerHierarchyAssoc,
    IResponsePaginate,
    ITimestamp,
    Legal,
    StoreCluster,
    StoreGroup,
    StoreSegment,
    StoreType,
    Timestamp,
    TNullable,
    TStatus,
    VehicleAccessibility,
} from 'app/shared/models';
import * as _ from 'lodash';

import { AccountAssocStore, TAccountStatus } from '../../models';

export interface IBrandStore extends ITimestamp {
    id: string;
    brandId: string;
    storeId: string;
    status: TStatus;
    store: Store;
}

export interface IStore extends ITimestamp {
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
    numberOfEmployee: TNullable<number>;
    vehicleAccessibility: TNullable<string>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    warehouseId: string;
    urban: Urban;
    customerHierarchies: CustomerHierarchyAssoc[];
    storeType: StoreType;
    storeSegment: StoreSegment;
    storeGroup: StoreGroup;
    legalInfo: Legal;
}

export interface IStoreEdit extends ITimestamp {
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
    numberOfEmployee: TNullable<string>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    warehouseId: string;
    urban: Urban;
    storeType: StoreType;
    storeSegment: StoreSegment;
    storeGroup: StoreGroup;
    storeClusters: IStoreClusters[];
}

interface IStoreClusters extends ITimestamp {
    id: string;
    storeId: string;
    clusterId: string;
    cluster: StoreCluster;
}

export interface IStoreEmployee extends ITimestamp {
    id: string;
    userId: string;
    storeId: string;
    status: TStatus;
    user: AccountAssocStore;
}

export interface IStoreEmployeeDetail extends ITimestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TAccountStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];
}

export interface IBrandStoreResponse extends IResponsePaginate {
    data: IBrandStore[];
}

export interface IStoreEmployeeResponse extends IResponsePaginate {
    data: IStoreEmployee[];
}

export interface IBrandStoreDeleteResponse extends ITimestamp {
    id: string;
    brandId: string;
    storeId: string;
    status: TStatus;
}

export interface IStoreCreateResponse extends ITimestamp {
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
    numberOfEmployee: TNullable<string>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    warehouseId: string;
}

export interface IStoreEditResponse extends ITimestamp {
    id: string;
    brandId: string;
    storeId: string;
    status: TStatus;
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
        createdAt: string,
        updatedAt: string,
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
                      store.numberOfEmployee,
                      store.externalId,
                      store.storeTypeId,
                      store.storeGroupId,
                      store.storeSegmentId,
                      store.urbanId,
                      store.warehouseId,
                      store.vehicleAccessibility,
                      store.urban,
                      store.customerHierarchies,
                      store.storeType,
                      store.storeSegment,
                      store.storeGroup,
                      store.legalInfo,
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
    numberOfEmployee: TNullable<number>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    warehouseId: string;
    vehicleAccessibility: VehicleAccessibility;
    urban: Urban;
    customerHierarchies: CustomerHierarchyAssoc[];
    storeType: StoreType;
    storeSegment: StoreSegment;
    storeGroup: StoreGroup;
    legalInfo: Legal;

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
        numberOfEmployee: TNullable<number>,
        externalId: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        warehouseId: string,
        vehicleAccessibility: VehicleAccessibility,
        urban: Urban,
        customerHierarchies: CustomerHierarchyAssoc[],
        storeType: StoreType,
        storeSegment: StoreSegment,
        storeGroup: StoreGroup,
        legalInfo: Legal,
        createdAt: string,
        updatedAt: string,
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
        this.numberOfEmployee = numberOfEmployee;
        this.externalId = externalId;
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.vehicleAccessibility = vehicleAccessibility
            ? {
                  ...new VehicleAccessibility(
                      vehicleAccessibility.name,
                      vehicleAccessibility.createdAt,
                      vehicleAccessibility.updatedAt,
                      vehicleAccessibility.deletedAt,
                      vehicleAccessibility.id
                  )
              }
            : null;

        this.urban = urban
            ? {
                  ...new Urban(
                      urban.id,
                      urban.zipCode,
                      urban.city,
                      urban.district,
                      urban.urban,
                      urban.provinceId,
                      urban.province,
                      urban.createdAt,
                      urban.updatedAt,
                      urban.deletedAt
                  )
              }
            : null;

        this.storeType = storeType
            ? {
                  ...new StoreType(
                      storeType.name,
                      storeType.createdAt,
                      storeType.updatedAt,
                      storeType.deletedAt,
                      storeType.id
                  )
              }
            : null;

        this.storeSegment = storeSegment
            ? {
                  ...new StoreSegment(
                      storeSegment.name,
                      storeSegment.createdAt,
                      storeSegment.updatedAt,
                      storeSegment.deletedAt,
                      storeSegment.id
                  )
              }
            : null;

        this.storeGroup = storeGroup
            ? {
                  ...new StoreGroup(
                      storeGroup.name,
                      storeGroup.createdAt,
                      storeGroup.updatedAt,
                      storeGroup.deletedAt,
                      storeGroup.id
                  )
              }
            : null;

        this.legalInfo = legalInfo
            ? {
                  ...new Legal(
                      legalInfo.id,
                      legalInfo.fullName,
                      legalInfo.email,
                      legalInfo.phoneNo,
                      legalInfo.mobilePhoneNo,
                      legalInfo.idNo,
                      legalInfo.taxNo,
                      legalInfo.status,
                      legalInfo.imageUrl,
                      legalInfo.taxImageUrl,
                      legalInfo.idImageUrl,
                      legalInfo.selfieImageUrl,
                      legalInfo.urbanId,
                      legalInfo.createdAt,
                      legalInfo.updatedAt,
                      legalInfo.deletedAt
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

export class StoreEdit extends Timestamp {
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
    numberOfEmployee: TNullable<string>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    warehouseId: string;
    urban: Urban;
    storeType: StoreType;
    storeSegment: StoreSegment;
    storeGroup: StoreGroup;
    storeClusters: StoreCluster[];

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
        numberOfEmployee: TNullable<string>,
        externalId: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        vehicleAccessibilityId: string,
        warehouseId: string,
        urban: Urban,
        storeType: StoreType,
        storeSegment: StoreSegment,
        storeGroup: StoreGroup,
        storeClusters: StoreCluster[],
        createdAt: string,
        updatedAt: string,
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
        this.numberOfEmployee = numberOfEmployee;
        this.externalId = externalId;
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.urban = urban
            ? {
                  ...new Urban(
                      urban.id,
                      urban.zipCode,
                      urban.city,
                      urban.district,
                      urban.urban,
                      urban.provinceId,
                      urban.province,
                      urban.createdAt,
                      urban.updatedAt,
                      urban.deletedAt
                  )
              }
            : null;

        this.storeType = storeType
            ? {
                  ...new StoreType(
                      storeType.name,
                      storeType.createdAt,
                      storeType.updatedAt,
                      storeType.deletedAt,
                      storeType.id
                  )
              }
            : null;

        this.storeSegment = storeSegment
            ? {
                  ...new StoreSegment(
                      storeSegment.name,
                      storeSegment.createdAt,
                      storeSegment.updatedAt,
                      storeSegment.deletedAt,
                      storeSegment.id
                  )
              }
            : null;

        this.storeGroup = storeGroup
            ? {
                  ...new StoreGroup(
                      storeGroup.name,
                      storeGroup.createdAt,
                      storeGroup.updatedAt,
                      storeGroup.deletedAt,
                      storeGroup.id
                  )
              }
            : null;

        this.storeClusters =
            storeClusters && storeClusters.length > 0
                ? [
                      ...storeClusters.map(row => {
                          return {
                              ...new StoreCluster(
                                  row.name,
                                  row.createdAt,
                                  row.updatedAt,
                                  row.deletedAt,
                                  row.id
                              )
                          };
                      })
                  ]
                : storeClusters;
    }
}

export class StoreEmployee extends Timestamp {
    id: string;
    userId: string;
    storeId: string;
    status: TStatus;
    user: AccountAssocStore;

    constructor(
        id: string,
        userId: string,
        storeId: string,
        status: TStatus,
        user: AccountAssocStore,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.userId = userId;
        this.storeId = storeId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.user = user
            ? {
                  ...new AccountAssocStore(
                      user.id,
                      user.fullName,
                      user.email,
                      user.phoneNo,
                      user.mobilePhoneNo,
                      user.idNo,
                      user.taxNo,
                      user.status,
                      user.imageUrl,
                      user.taxImageUrl,
                      user.idImageUrl,
                      user.selfieImageUrl,
                      user.urbanId,
                      user.roles,
                      user.attendances,
                      user.createdAt,
                      user.updatedAt,
                      user.deletedAt
                  )
              }
            : null;
    }
}

export class StoreEmployeeDetail extends Timestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TAccountStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    roles: Role[];

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        idNo: string,
        taxNo: string,
        status: TAccountStatus,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        idImageUrl: TNullable<string>,
        selfieImageUrl: TNullable<string>,
        roles: Role[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullName = fullName ? fullName.trim() : fullName;
        this.email = email ? email.trim() : email;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
        this.idNo = idNo;
        this.taxNo = taxNo;
        this.status = status;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.idImageUrl = idImageUrl;
        this.selfieImageUrl = selfieImageUrl;

        if (roles && roles.length > 0) {
            roles = [
                ...roles.map(role => {
                    return {
                        ...new Role(
                            role.id,
                            role.role,
                            role.description,
                            role.status,
                            role.roleTypeId,
                            role.privileges,
                            role.createdAt,
                            role.updatedAt,
                            role.deletedAt
                        )
                    };
                })
            ];
            this.roles = _.sortBy(roles, ['role'], ['asc']);
        } else {
            this.roles = [];
        }
    }
}

export class FormStore {
    storeCode: string;
    name: string;
    image: string;
    taxNo: string;
    address: string;
    longitude?: TNullable<number>;
    latitude?: TNullable<number>;
    phoneNo: string;
    status: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    largeArea?: string;
    numberOfEmployee?: string;
    vehicleAccessibilityId?: string;
    urbanId: string;
    user: FormUser;
    cluster: FormCluster;
    brand: FormBrand;

    constructor(
        storeCode: string,
        name: string,
        image: string,
        taxNo: string,
        address: string,
        phoneNo: string,
        status: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        user: FormUser,
        cluster: FormCluster,
        brand: FormBrand,
        largeAre?: string,
        numberOfEmployee?: string,
        vehicleAccessibilityId?: string
    ) {
        this.storeCode = storeCode ? storeCode.trim() : storeCode;
        this.name = name ? name.trim() : name;
        this.image = image;
        this.taxNo = taxNo ? taxNo.trim() : taxNo;
        this.address = address ? address.trim() : address;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.status = status ? status.trim() : 'active';
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.user = user
            ? {
                  ...new FormUser(
                      user.fullName,
                      user.taxNo,
                      user.idImage,
                      user.selfieImage,
                      user.phone,
                      user.status,
                      user.roles,
                      user.email,
                      user.password
                  )
              }
            : null;

        this.cluster = cluster ? { ...new FormCluster(cluster.clusterId) } : null;
        this.brand = brand ? { ...new FormBrand(brand.brandId) } : null;

        if (largeAre) {
            this.largeArea = largeAre;
        }

        if (numberOfEmployee) {
            this.numberOfEmployee = numberOfEmployee;
        }

        if (vehicleAccessibilityId) {
            this.vehicleAccessibilityId = vehicleAccessibilityId;
        }
    }
}

export class FormStoreEdit {
    storeCode?: string;
    name?: string;
    image?: string;
    taxNo?: string;
    address?: string;
    longitude?: TNullable<number>;
    latitude?: TNullable<number>;
    phoneNo?: string;
    storeTypeId?: string;
    storeGroupId?: string;
    storeSegmentId?: string;
    largeArea?: string;
    numberOfEmployee?: string;
    vehicleAccessibilityId?: string;
    urbanId?: string;
    cluster?: FormCluster;

    constructor(
        storeCode?: string,
        name?: string,
        image?: string,
        taxNo?: string,
        address?: string,
        phoneNo?: string,
        storeTypeId?: string,
        storeGroupId?: string,
        storeSegmentId?: string,
        urbanId?: string,
        cluster?: FormCluster,
        largeAre?: string,
        numberOfEmployee?: string,
        vehicleAccessibilityId?: string
    ) {
        if (storeCode) {
            this.storeCode = storeCode.trim();
        }

        if (name) {
            this.name = name.trim();
        }

        if (image) {
            this.image = image;
        }

        if (taxNo) {
            this.taxNo = taxNo.trim();
        }

        if (address) {
            this.address = address.trim();
        }

        if (address) {
            this.address = address.trim();
        }

        if (phoneNo) {
            this.phoneNo = phoneNo.trim();
        }

        if (storeTypeId) {
            this.storeTypeId = storeTypeId;
        }

        if (storeGroupId) {
            this.storeGroupId = storeGroupId;
        }

        if (storeSegmentId) {
            this.storeSegmentId = storeSegmentId;
        }

        if (urbanId) {
            this.urbanId = urbanId;
        }

        if (cluster) {
            this.cluster = { ...new FormCluster(cluster.clusterId) };
        }

        if (largeAre) {
            this.largeArea = largeAre;
        }

        if (numberOfEmployee) {
            this.numberOfEmployee = numberOfEmployee;
        }

        if (vehicleAccessibilityId) {
            this.vehicleAccessibilityId = vehicleAccessibilityId;
        }
    }
}

export class FormUser {
    fullName: string;
    taxNo: string;
    idImage: string;
    selfieImage: string;
    phone: string;
    email?: string;
    password?: string;
    status: string;
    roles: string[];

    constructor(
        fullName: string,
        taxNo: string,
        idImage: string,
        selfieImage: string,
        phone: string,
        status: string,
        roles: string[],
        email?: string,
        password?: string
    ) {
        this.fullName = fullName ? fullName.trim() : fullName;
        this.taxNo = taxNo ? taxNo.trim() : taxNo;
        this.idImage = idImage;
        this.selfieImage = selfieImage;
        this.phone = phone ? phone.trim() : phone;
        this.status = status ? status.trim() : 'active';
        this.roles = roles ? roles : ['1'];

        if (email) {
            this.email = email.trim();
        }

        if (password) {
            this.password = password.trim();
        }
    }
}

export class FormCluster {
    clusterId: string;

    constructor(clusterId: string) {
        this.clusterId = clusterId;
    }
}

export class FormBrand {
    brandId: string;

    constructor(brandId: string) {
        this.brandId = brandId;
    }
}

class UserStores extends Timestamp {
    id: string;
    userId: string;
    storeId: string;
    status: TAccountStatus;
    store: StoreAssocUserStores;

    constructor(
        id: string,
        userId: string,
        storeId: string,
        status: TAccountStatus,
        store: StoreAssocUserStores,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.userId = userId;
        this.storeId = storeId;
        this.status = status;
        this.store = store
            ? {
                  ...new StoreAssocUserStores(
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
                      store.numberOfEmployee,
                      store.vehicleAccessibility,
                      store.externalId,
                      store.storeTypeId,
                      store.storeGroupId,
                      store.storeSegmentId,
                      store.urbanId,
                      store.warehouseId,
                      store.owner,
                      store.createdAt,
                      store.updatedAt,
                      store.deletedAt
                  )
              }
            : null;
    }
}

class StoreAssocUserStores extends Timestamp {
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
    numberOfEmployee: TNullable<number>;
    vehicleAccessibility: TNullable<string>;
    externalId: string;
    storeTypeId: string;
    storeGroupId: string;
    storeSegmentId: string;
    urbanId: string;
    warehouseId: string;
    owner: Owner[];

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
        numberOfEmployee: TNullable<number>,
        vehicleAccessibility: TNullable<string>,
        externalId: string,
        storeTypeId: string,
        storeGroupId: string,
        storeSegmentId: string,
        urbanId: string,
        warehouseId: string,
        owner: Owner[],
        createdAt: string,
        updatedAt: string,
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
        this.reason = reason ? reason.trim() : reason;
        this.parent = parent;
        this.parentId = parentId;
        this.numberOfEmployee = numberOfEmployee;
        this.vehicleAccessibility = vehicleAccessibility;
        this.externalId = externalId;
        this.storeTypeId = storeTypeId;
        this.storeGroupId = storeGroupId;
        this.storeSegmentId = storeSegmentId;
        this.urbanId = urbanId;
        this.warehouseId = warehouseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (owner && owner.length > 0) {
            owner = [
                ...owner.map(row => {
                    return {
                        ...new Owner(
                            row.id,
                            row.fullName,
                            row.email,
                            row.phoneNo,
                            row.mobilePhoneNo,
                            row.idNo,
                            row.taxNo,
                            row.status,
                            row.imageUrl,
                            row.taxImageUrl,
                            row.idImageUrl,
                            row.selfieImageUrl,
                            row.urbanId,
                            row.roles,
                            row.createdAt,
                            row.updatedAt,
                            row.deletedAt
                        )
                    };
                })
            ];
            this.owner = owner;
        } else {
            this.owner = [];
        }
    }
}

class Owner extends Timestamp {
    id: string;
    fullName: string;
    email: string;
    phoneNo: TNullable<string>;
    mobilePhoneNo: string;
    idNo: string;
    taxNo: string;
    status: TAccountStatus;
    imageUrl: TNullable<string>;
    taxImageUrl: TNullable<string>;
    idImageUrl: TNullable<string>;
    selfieImageUrl: TNullable<string>;
    urbanId: string;
    roles: OwnerRole[];

    constructor(
        id: string,
        fullName: string,
        email: string,
        phoneNo: TNullable<string>,
        mobilePhoneNo: string,
        idNo: string,
        taxNo: string,
        status: TAccountStatus,
        imageUrl: TNullable<string>,
        taxImageUrl: TNullable<string>,
        idImageUrl: TNullable<string>,
        selfieImageUrl: TNullable<string>,
        urbanId: string,
        roles: OwnerRole[],
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.fullName = fullName ? fullName.trim() : fullName;
        this.email = email ? email.trim() : email;
        this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
        this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
        this.idNo = idNo;
        this.taxNo = taxNo;
        this.status = status;
        this.imageUrl = imageUrl;
        this.taxImageUrl = taxImageUrl;
        this.idImageUrl = idImageUrl;
        this.selfieImageUrl = selfieImageUrl;
        this.urbanId = urbanId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        if (roles && roles.length > 0) {
            roles = [
                ...roles.map(role => {
                    return {
                        ...new OwnerRole(
                            role.id,
                            role.role,
                            role.description,
                            role.status,
                            role.roleTypeId,
                            role.createdAt,
                            role.updatedAt,
                            role.deletedAt
                        )
                    };
                })
            ];
            this.roles = roles;
        } else {
            this.roles = [];
        }
    }
}

class OwnerRole extends Timestamp {
    id: string;
    role: string;
    description: string;
    status: TStatus;
    roleTypeId: string;

    constructor(
        id: string,
        role: string,
        description: string,
        status: TStatus,
        roleTypeId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.role = role ? role.trim() : role;
        this.description = description ? description.trim() : description;
        this.status = status;
        this.roleTypeId = roleTypeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

/* export class StoreGroup extends Timestamp {
    id: string;
    name: string;

    constructor(
        id: string,
        name: string,
        createdAt: string,
        updatedAt: string,
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

export class StoreSegment extends Timestamp {
    id: string;
    name: string;

    constructor(
        id: string,
        name: string,
        createdAt: string,
        updatedAt: string,
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
        createdAt: string>,
        updatedAt: string>,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.id = id || undefined;
        this.name = name ? name.trim() : name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
} */

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
