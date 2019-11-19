import {
    CustomerHierarchy,
    ITimestamp,
    StoreCluster,
    StoreConfig,
    StoreGroup,
    StoreSegment,
    StoreType,
    Timestamp,
    TNullable,
    TStatus,
    Urban,
    User,
    VehicleAccessibility
} from 'app/shared/models';
import { SupplierStore } from 'app/shared/models/supplier.model';

interface IStore extends ITimestamp {
    id: string;
    storeCode: string;
    name: string;
    address: string;
    taxNo: string;
    longitude: number;
    latitude: number;
    largeArea: string;
    phoneNo: string;
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
    userStores: UserStore[];
    supplierStores?: SupplierStore[];
    vehicleAccessibility?: VehicleAccessibility;
    storeType: StoreType;
    storeGroup: StoreGroup;
    storeSegment: StoreSegment;
    urban: Urban;
    customerHierarchies?: CustomerHierarchy[];
    storeConfig: StoreConfig;
    storeClusters?: StoreCluster[];
    legalInfo?: User;
}

export class Store extends Timestamp implements IStore {
    private _supplierStores?: SupplierStore[];
    private _vehicleAccessibility?: VehicleAccessibility;
    private _customerHierarchies?: CustomerHierarchy[];
    private _storeClusters?: StoreCluster[];
    private _legalInfo?: User;

    constructor(
        private _id: string,
        private _storeCode: string,
        private _name: string,
        private _address: string,
        private _taxNo: string,
        private _longitude: number,
        private _latitude: number,
        private _largeArea: string,
        private _phoneNo: string,
        private _imageUrl: TNullable<string>,
        private _taxImageUrl: TNullable<string>,
        private _status: TStatus,
        private _reason: string,
        private _parent: boolean,
        private _parentId: string,
        private _numberOfEmployee: TNullable<string>,
        private _externalId: string,
        private _storeTypeId: string,
        private _storeGroupId: string,
        private _storeSegmentId: string,
        private _urbanId: string,
        private _vehicleAccessibilityId: string,
        private _warehouseId: string,
        private _userStores: UserStore[],
        private _storeType: StoreType,
        private _storeGroup: StoreGroup,
        private _storeSegment: StoreSegment,
        private _urban: Urban,
        private _storeConfig: StoreConfig,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this._userStores =
            _userStores && _userStores.length > 0
                ? _userStores.map(row => {
                      const newUserStore = new UserStore(
                          row.id,
                          row.userId,
                          row.storeId,
                          row.status,
                          row.createdAt,
                          row.updatedAt,
                          row.deletedAt
                      );

                      if (row.user) {
                          newUserStore.user = row.user;
                      }

                      return newUserStore;
                  })
                : [];

        this._storeType = _storeType
            ? new StoreType(
                  _storeType.id,
                  _storeType.name,
                  _storeType.createdAt,
                  _storeType.updatedAt,
                  _storeType.deletedAt
              )
            : null;

        this._storeSegment = _storeSegment
            ? new StoreSegment(
                  _storeSegment.id,
                  _storeSegment.name,
                  _storeSegment.createdAt,
                  _storeSegment.updatedAt,
                  _storeSegment.deletedAt
              )
            : null;

        if (_urban) {
            const newUrban = new Urban(
                _urban.id,
                _urban.zipCode,
                _urban.city,
                _urban.district,
                _urban.urban,
                _urban.provinceId,
                _urban.createdAt,
                _urban.updatedAt,
                _urban.deletedAt
            );

            if (_urban.province) {
                newUrban.province = _urban.province;
            }

            this._urban = newUrban;
        } else {
            this._urban = null;
        }

        this._storeConfig = _storeConfig
            ? new StoreConfig(
                  _storeConfig.id,
                  _storeConfig.startingWorkHour,
                  _storeConfig.finishedWorkHour,
                  _storeConfig.status,
                  _storeConfig.storeId,
                  _storeConfig.createdAt,
                  _storeConfig.updatedAt,
                  _storeConfig.deletedAt
              )
            : null;
    }

    get id(): string {
        return this._id;
    }

    get storeCode(): string {
        return this._storeCode;
    }

    get name(): string {
        return this._name;
    }

    get address(): string {
        return this._address;
    }

    get taxNo(): string {
        return this._taxNo;
    }

    get longitude(): number {
        return this._longitude;
    }

    get latitude(): number {
        return this._latitude;
    }

    get largeArea(): string {
        return this._largeArea;
    }

    get phoneNo(): string {
        return this._phoneNo;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get taxImageUrl(): string {
        return this._taxImageUrl;
    }

    get status(): TStatus {
        return this._status;
    }

    get reason(): string {
        return this._reason;
    }

    get parent(): boolean {
        return this._parent;
    }

    get parentId(): string {
        return this._parentId;
    }

    get numberOfEmployee(): string {
        return this._numberOfEmployee;
    }

    get externalId(): string {
        return this._externalId;
    }

    get storeTypeId(): string {
        return this._storeTypeId;
    }

    get storeGroupId(): string {
        return this._storeGroupId;
    }

    get storeSegmentId(): string {
        return this._storeSegmentId;
    }

    get urbanId(): string {
        return this._urbanId;
    }

    get vehicleAccessibilityId(): string {
        return this._vehicleAccessibilityId;
    }

    get warehouseId(): string {
        return this._warehouseId;
    }

    get userStores(): UserStore[] {
        return this._userStores;
    }

    get storeType(): StoreType {
        return this._storeType;
    }

    get storeGroup(): StoreGroup {
        return this._storeGroup;
    }

    get storeSegment(): StoreSegment {
        return this._storeSegment;
    }

    get urban(): Urban {
        return this._urban;
    }

    get storeConfig(): StoreConfig {
        return this._storeConfig;
    }

    get supplierStores(): SupplierStore[] {
        return this._supplierStores;
    }

    set supplierStores(value: SupplierStore[]) {
        this._supplierStores = value;
    }

    get vehicleAccessibility(): VehicleAccessibility {
        return this._vehicleAccessibility;
    }

    set vehicleAccessibility(value: VehicleAccessibility) {
        this._vehicleAccessibility = value;
    }

    get customerHierarchies(): CustomerHierarchy[] {
        return this._customerHierarchies;
    }

    set customerHierarchies(value: CustomerHierarchy[]) {
        this._customerHierarchies = value;
    }

    get storeClusters(): StoreCluster[] {
        return this._storeClusters;
    }

    set storeClusters(value: StoreCluster[]) {
        this._storeClusters = value;
    }

    get legalInfo(): User {
        return this._legalInfo;
    }

    set legalInfo(value: User) {
        this._legalInfo = value;
    }
}

export type StoreOptions = Partial<Store>;

interface IUserStore {
    id: string;
    userId: string;
    storeId: string;
    status: TStatus;
    user?: User;
    store?: Store;
}

export class UserStore extends Timestamp implements IUserStore {
    private _user?: User;
    private _store?: Store;

    constructor(
        private _id: string,
        private _userId: string,
        private _storeId: string,
        private _status: TStatus,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    get userId(): string {
        return this._userId;
    }

    get storeId(): string {
        return this._storeId;
    }

    get status(): TStatus {
        return this._status;
    }

    get user(): User {
        return this._user;
    }

    set user(value: User) {
        if (value) {
            const newUser = new User(
                value.id,
                value.fullName,
                value.email,
                value.phoneNo,
                value.mobilePhoneNo,
                value.idNo,
                value.taxNo,
                value.status,
                value.imageUrl,
                value.taxImageUrl,
                value.idImageUrl,
                value.selfieImageUrl,
                value.urbanId,
                value.roles,
                value.createdAt,
                value.urbanId,
                value.deletedAt
            );

            if (value.userStores) {
                newUser.userStores = value.userStores;
            }

            if (value.userSuppliers) {
                newUser.userSuppliers = value.userSuppliers;
            }

            if (value.urban) {
                newUser.urban = value.urban;
            }

            if (value.attendances) {
                newUser.attendances = value.attendances;
            }

            this._user = newUser;
        } else {
            this._user = null;
        }
    }

    get store(): Store {
        return this._store;
    }

    set store(value: Store) {
        if (value) {
            const newStore = new Store(
                value.id,
                value.storeCode,
                value.name,
                value.address,
                value.taxNo,
                value.longitude,
                value.latitude,
                value.largeArea,
                value.phoneNo,
                value.imageUrl,
                value.taxImageUrl,
                value.status,
                value.reason,
                value.parent,
                value.parentId,
                value.numberOfEmployee,
                value.externalId,
                value.storeTypeId,
                value.storeGroupId,
                value.storeSegmentId,
                value.urbanId,
                value.vehicleAccessibilityId,
                value.warehouseId,
                value.userStores,
                value.storeType,
                value.storeGroup,
                value.storeSegment,
                value.urban,
                value.storeConfig,
                value.createdAt,
                value.updatedAt,
                value.deletedAt
            );

            if (value.supplierStores) {
                newStore.supplierStores = value.supplierStores;
            }

            if (value.vehicleAccessibility) {
                newStore.vehicleAccessibility = value.vehicleAccessibility;
            }

            if (value.customerHierarchies) {
                newStore.customerHierarchies = value.customerHierarchies;
            }

            if (value.storeClusters) {
                newStore.storeClusters = value.storeClusters;
            }

            if (value.legalInfo) {
                newStore.legalInfo = value.legalInfo;
            }

            this._store = newStore;
        } else {
            this._store = null;
        }
    }

    static patch(body: UserStoreOptions): UserStoreOptions {
        return body;
    }
}

export type UserStoreOptions = Partial<UserStore>;

// import { Role } from 'app/main/pages/roles/role.model';
// import { Urban } from 'app/main/pages/urbans/models';
// import {
//     CustomerHierarchyAssoc,
//     IResponsePaginate,
//     ITimestamp,
//     Legal,
//     StoreCluster,
//     StoreGroup,
//     StoreSegment,
//     StoreType,
//     Timestamp,
//     TNullable,
//     TStatus,
//     VehicleAccessibility
// } from 'app/shared/models';
// import * as _ from 'lodash';

// import { AccountAssocStore, TAccountStatus } from '../../models';

// export interface IBrandStore extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
//     store: Store;
// }

// export interface IStore extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     vehicleAccessibility: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     urban: Urban;
//     customerHierarchies: CustomerHierarchyAssoc[];
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     legalInfo: Legal;
// }

// export interface IStoreEdit extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
//     urban: Urban;
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     storeClusters: IStoreClusters[];
// }

// interface IStoreClusters extends ITimestamp {
//     id: string;
//     storeId: string;
//     clusterId: string;
//     cluster: StoreCluster;
// }

// export interface IStoreEmployee extends ITimestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TStatus;
//     user: AccountAssocStore;
// }

// export interface IStoreEmployeeDetail extends ITimestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     roles: Role[];
// }

// export interface IBrandStoreResponse extends IResponsePaginate {
//     data: IBrandStore[];
// }

// export interface IStoreEmployeeResponse extends IResponsePaginate {
//     data: IStoreEmployee[];
// }

// export interface IBrandStoreDeleteResponse extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
// }

// export interface IStoreCreateResponse extends ITimestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
// }

// export interface IStoreEditResponse extends ITimestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
// }

// export class BrandStore extends Timestamp {
//     id: string;
//     brandId: string;
//     storeId: string;
//     status: TStatus;
//     store: Store;

//     constructor(
//         id: string,
//         brandId: string,
//         storeId: string,
//         status: TStatus,
//         store: Store,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.brandId = brandId;
//         this.storeId = storeId;
//         this.status = status;
//         this.store = store
//             ? {
//                   ...new Store(
//                       store.id,
//                       store.storeCode,
//                       store.name,
//                       store.address,
//                       store.taxNo,
//                       store.longitude,
//                       store.latitude,
//                       store.largeArea,
//                       store.phoneNo,
//                       store.imageUrl,
//                       store.taxImageUrl,
//                       store.status,
//                       store.reason,
//                       store.parent,
//                       store.parentId,
//                       store.numberOfEmployee,
//                       store.externalId,
//                       store.storeTypeId,
//                       store.storeGroupId,
//                       store.storeSegmentId,
//                       store.urbanId,
//                       store.warehouseId,
//                       store.vehicleAccessibility,
//                       store.urban,
//                       store.customerHierarchies,
//                       store.storeType,
//                       store.storeSegment,
//                       store.storeGroup,
//                       store.legalInfo,
//                       store.createdAt,
//                       store.updatedAt,
//                       store.deletedAt
//                   )
//               }
//             : null;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class Store extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     vehicleAccessibility: VehicleAccessibility;
//     urban: Urban;
//     customerHierarchies: CustomerHierarchyAssoc[];
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     legalInfo: Legal;

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<number>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         warehouseId: string,
//         vehicleAccessibility: VehicleAccessibility,
//         urban: Urban,
//         customerHierarchies: CustomerHierarchyAssoc[],
//         storeType: StoreType,
//         storeSegment: StoreSegment,
//         storeGroup: StoreGroup,
//         legalInfo: Legal,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.vehicleAccessibility = vehicleAccessibility
//             ? {
//                   ...new VehicleAccessibility(
//                       vehicleAccessibility.name,
//                       vehicleAccessibility.createdAt,
//                       vehicleAccessibility.updatedAt,
//                       vehicleAccessibility.deletedAt,
//                       vehicleAccessibility.id
//                   )
//               }
//             : null;

//         this.urban = urban
//             ? {
//                   ...new Urban(
//                       urban.id,
//                       urban.zipCode,
//                       urban.city,
//                       urban.district,
//                       urban.urban,
//                       urban.provinceId,
//                       urban.province,
//                       urban.createdAt,
//                       urban.updatedAt,
//                       urban.deletedAt
//                   )
//               }
//             : null;

//         this.storeType = storeType
//             ? {
//                   ...new StoreType(
//                       storeType.name,
//                       storeType.createdAt,
//                       storeType.updatedAt,
//                       storeType.deletedAt,
//                       storeType.id
//                   )
//               }
//             : null;

//         this.storeSegment = storeSegment
//             ? {
//                   ...new StoreSegment(
//                       storeSegment.name,
//                       storeSegment.createdAt,
//                       storeSegment.updatedAt,
//                       storeSegment.deletedAt,
//                       storeSegment.id
//                   )
//               }
//             : null;

//         this.storeGroup = storeGroup
//             ? {
//                   ...new StoreGroup(
//                       storeGroup.name,
//                       storeGroup.createdAt,
//                       storeGroup.updatedAt,
//                       storeGroup.deletedAt,
//                       storeGroup.id
//                   )
//               }
//             : null;

//         this.legalInfo = legalInfo
//             ? {
//                   ...new Legal(
//                       legalInfo.id,
//                       legalInfo.fullName,
//                       legalInfo.email,
//                       legalInfo.phoneNo,
//                       legalInfo.mobilePhoneNo,
//                       legalInfo.idNo,
//                       legalInfo.taxNo,
//                       legalInfo.status,
//                       legalInfo.imageUrl,
//                       legalInfo.taxImageUrl,
//                       legalInfo.idImageUrl,
//                       legalInfo.selfieImageUrl,
//                       legalInfo.urbanId,
//                       legalInfo.createdAt,
//                       legalInfo.updatedAt,
//                       legalInfo.deletedAt
//                   )
//               }
//             : null;

//         if (customerHierarchies && customerHierarchies.length > 0) {
//             customerHierarchies = [
//                 ...customerHierarchies.map(customerHierarchy => {
//                     return {
//                         ...new CustomerHierarchyAssoc(
//                             customerHierarchy.id,
//                             customerHierarchy.storeId,
//                             customerHierarchy.hierarchyId,
//                             customerHierarchy.status,
//                             customerHierarchy.hierarchy,
//                             customerHierarchy.createdAt,
//                             customerHierarchy.updatedAt,
//                             customerHierarchy.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.customerHierarchies = customerHierarchies;
//         } else {
//             this.customerHierarchies = [];
//         }
//     }
// }

// export class StoreEdit extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     vehicleAccessibilityId: string;
//     warehouseId: string;
//     urban: Urban;
//     storeType: StoreType;
//     storeSegment: StoreSegment;
//     storeGroup: StoreGroup;
//     storeClusters: StoreCluster[];

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<string>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         vehicleAccessibilityId: string,
//         warehouseId: string,
//         urban: Urban,
//         storeType: StoreType,
//         storeSegment: StoreSegment,
//         storeGroup: StoreGroup,
//         storeClusters: StoreCluster[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.vehicleAccessibilityId = vehicleAccessibilityId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.urban = urban
//             ? {
//                   ...new Urban(
//                       urban.id,
//                       urban.zipCode,
//                       urban.city,
//                       urban.district,
//                       urban.urban,
//                       urban.provinceId,
//                       urban.province,
//                       urban.createdAt,
//                       urban.updatedAt,
//                       urban.deletedAt
//                   )
//               }
//             : null;

//         this.storeType = storeType
//             ? {
//                   ...new StoreType(
//                       storeType.name,
//                       storeType.createdAt,
//                       storeType.updatedAt,
//                       storeType.deletedAt,
//                       storeType.id
//                   )
//               }
//             : null;

//         this.storeSegment = storeSegment
//             ? {
//                   ...new StoreSegment(
//                       storeSegment.name,
//                       storeSegment.createdAt,
//                       storeSegment.updatedAt,
//                       storeSegment.deletedAt,
//                       storeSegment.id
//                   )
//               }
//             : null;

//         this.storeGroup = storeGroup
//             ? {
//                   ...new StoreGroup(
//                       storeGroup.name,
//                       storeGroup.createdAt,
//                       storeGroup.updatedAt,
//                       storeGroup.deletedAt,
//                       storeGroup.id
//                   )
//               }
//             : null;

//         this.storeClusters =
//             storeClusters && storeClusters.length > 0
//                 ? [
//                       ...storeClusters.map(row => {
//                           return {
//                               ...new StoreCluster(
//                                   row.name,
//                                   row.createdAt,
//                                   row.updatedAt,
//                                   row.deletedAt,
//                                   row.id
//                               )
//                           };
//                       })
//                   ]
//                 : storeClusters;
//     }
// }

// export class StoreEmployee extends Timestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TStatus;
//     user: AccountAssocStore;

//     constructor(
//         id: string,
//         userId: string,
//         storeId: string,
//         status: TStatus,
//         user: AccountAssocStore,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.userId = userId;
//         this.storeId = storeId;
//         this.status = status;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         this.user = user
//             ? {
//                   ...new AccountAssocStore(
//                       user.id,
//                       user.fullName,
//                       user.email,
//                       user.phoneNo,
//                       user.mobilePhoneNo,
//                       user.idNo,
//                       user.taxNo,
//                       user.status,
//                       user.imageUrl,
//                       user.taxImageUrl,
//                       user.idImageUrl,
//                       user.selfieImageUrl,
//                       user.urbanId,
//                       user.roles,
//                       user.attendances,
//                       user.createdAt,
//                       user.updatedAt,
//                       user.deletedAt
//                   )
//               }
//             : null;
//     }
// }

// export class StoreEmployeeDetail extends Timestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     roles: Role[];

//     constructor(
//         id: string,
//         fullName: string,
//         email: string,
//         phoneNo: TNullable<string>,
//         mobilePhoneNo: string,
//         idNo: string,
//         taxNo: string,
//         status: TAccountStatus,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         idImageUrl: TNullable<string>,
//         selfieImageUrl: TNullable<string>,
//         roles: Role[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.email = email ? email.trim() : email;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
//         this.idNo = idNo;
//         this.taxNo = taxNo;
//         this.status = status;
//         this.imageUrl = imageUrl;
//         this.taxImageUrl = taxImageUrl;
//         this.idImageUrl = idImageUrl;
//         this.selfieImageUrl = selfieImageUrl;

//         if (roles && roles.length > 0) {
//             roles = [
//                 ...roles.map(role => {
//                     return {
//                         ...new Role(
//                             role.id,
//                             role.role,
//                             role.description,
//                             role.status,
//                             role.roleTypeId,
//                             role.privileges,
//                             role.createdAt,
//                             role.updatedAt,
//                             role.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.roles = _.sortBy(roles, ['role'], ['asc']);
//         } else {
//             this.roles = [];
//         }
//     }
// }

// export class FormStore {
//     storeCode: string;
//     name: string;
//     image: string;
//     taxNo: string;
//     address: string;
//     longitude?: TNullable<number>;
//     latitude?: TNullable<number>;
//     phoneNo: string;
//     status: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     largeArea?: string;
//     numberOfEmployee?: string;
//     vehicleAccessibilityId?: string;
//     urbanId: string;
//     user: FormUser;
//     cluster: FormCluster;
//     brand: FormBrand;

//     constructor(
//         storeCode: string,
//         name: string,
//         image: string,
//         taxNo: string,
//         address: string,
//         phoneNo: string,
//         status: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         user: FormUser,
//         cluster: FormCluster,
//         brand: FormBrand,
//         largeAre?: string,
//         numberOfEmployee?: string,
//         vehicleAccessibilityId?: string
//     ) {
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.image = image;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.address = address ? address.trim() : address;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.status = status ? status.trim() : 'active';
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.user = user
//             ? {
//                   ...new FormUser(
//                       user.fullName,
//                       user.taxNo,
//                       user.idImage,
//                       user.selfieImage,
//                       user.phone,
//                       user.status,
//                       user.roles,
//                       user.email,
//                       user.password
//                   )
//               }
//             : null;

//         this.cluster = cluster ? { ...new FormCluster(cluster.clusterId) } : null;
//         this.brand = brand ? { ...new FormBrand(brand.brandId) } : null;

//         if (largeAre) {
//             this.largeArea = largeAre;
//         }

//         if (numberOfEmployee) {
//             this.numberOfEmployee = numberOfEmployee;
//         }

//         if (vehicleAccessibilityId) {
//             this.vehicleAccessibilityId = vehicleAccessibilityId;
//         }
//     }
// }

// export class FormStoreEdit {
//     storeCode?: string;
//     name?: string;
//     image?: string;
//     taxNo?: string;
//     address?: string;
//     longitude?: TNullable<number>;
//     latitude?: TNullable<number>;
//     phoneNo?: string;
//     storeTypeId?: string;
//     storeGroupId?: string;
//     storeSegmentId?: string;
//     largeArea?: string;
//     numberOfEmployee?: string;
//     vehicleAccessibilityId?: string;
//     urbanId?: string;
//     cluster?: FormCluster;

//     constructor(
//         storeCode?: string,
//         name?: string,
//         image?: string,
//         taxNo?: string,
//         address?: string,
//         phoneNo?: string,
//         storeTypeId?: string,
//         storeGroupId?: string,
//         storeSegmentId?: string,
//         urbanId?: string,
//         cluster?: FormCluster,
//         largeAre?: string,
//         numberOfEmployee?: string,
//         vehicleAccessibilityId?: string
//     ) {
//         if (storeCode) {
//             this.storeCode = storeCode.trim();
//         }

//         if (name) {
//             this.name = name.trim();
//         }

//         if (image) {
//             this.image = image;
//         }

//         if (taxNo) {
//             this.taxNo = taxNo.trim();
//         }

//         if (address) {
//             this.address = address.trim();
//         }

//         if (address) {
//             this.address = address.trim();
//         }

//         if (phoneNo) {
//             this.phoneNo = phoneNo.trim();
//         }

//         if (storeTypeId) {
//             this.storeTypeId = storeTypeId;
//         }

//         if (storeGroupId) {
//             this.storeGroupId = storeGroupId;
//         }

//         if (storeSegmentId) {
//             this.storeSegmentId = storeSegmentId;
//         }

//         if (urbanId) {
//             this.urbanId = urbanId;
//         }

//         if (cluster) {
//             this.cluster = { ...new FormCluster(cluster.clusterId) };
//         }

//         if (largeAre) {
//             this.largeArea = largeAre;
//         }

//         if (numberOfEmployee) {
//             this.numberOfEmployee = numberOfEmployee;
//         }

//         if (vehicleAccessibilityId) {
//             this.vehicleAccessibilityId = vehicleAccessibilityId;
//         }
//     }
// }

// export class FormUser {
//     fullName: string;
//     taxNo: string;
//     idImage: string;
//     selfieImage: string;
//     phone: string;
//     email?: string;
//     password?: string;
//     status: string;
//     roles: string[];

//     constructor(
//         fullName: string,
//         taxNo: string,
//         idImage: string,
//         selfieImage: string,
//         phone: string,
//         status: string,
//         roles: string[],
//         email?: string,
//         password?: string
//     ) {
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.idImage = idImage;
//         this.selfieImage = selfieImage;
//         this.phone = phone ? phone.trim() : phone;
//         this.status = status ? status.trim() : 'active';
//         this.roles = roles ? roles : ['1'];

//         if (email) {
//             this.email = email.trim();
//         }

//         if (password) {
//             this.password = password.trim();
//         }
//     }
// }

// export class FormCluster {
//     clusterId: string;

//     constructor(clusterId: string) {
//         this.clusterId = clusterId;
//     }
// }

// export class FormBrand {
//     brandId: string;

//     constructor(brandId: string) {
//         this.brandId = brandId;
//     }
// }

// export class UserStore extends Timestamp {
//     constructor(
//         private _id: string,
//         private _userId: string,
//         private _storeId: string,
//         private _status: TStatus,
//         private _store: Store,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);
//     }

//     get id(): string {
//         return this._id;
//     }

//     set id(value: string) {
//         this._id = value;
//     }

//     get userId(): string {
//         return this._userId;
//     }

//     set userId(value: string) {
//         this._userId = value;
//     }

//     get storeId(): string {
//         return this._storeId;
//     }

//     set storeId(value: string) {
//         this._storeId = value;
//     }

//     get status(): TStatus {
//         return this._status;
//     }

//     set status(value: TStatus) {
//         this._status = value;
//     }

//     get store(): Store {
//         return this._store;
//     }

//     set store(value: Store) {
//         this._store = value;
//     }
// }

// class UserStores extends Timestamp {
//     id: string;
//     userId: string;
//     storeId: string;
//     status: TAccountStatus;
//     store: StoreAssocUserStores;

//     constructor(
//         id: string,
//         userId: string,
//         storeId: string,
//         status: TAccountStatus,
//         store: StoreAssocUserStores,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.userId = userId;
//         this.storeId = storeId;
//         this.status = status;
//         this.store = store
//             ? {
//                   ...new StoreAssocUserStores(
//                       store.id,
//                       store.storeCode,
//                       store.name,
//                       store.address,
//                       store.taxNo,
//                       store.longitude,
//                       store.latitude,
//                       store.largeArea,
//                       store.phoneNo,
//                       store.imageUrl,
//                       store.taxImageUrl,
//                       store.status,
//                       store.reason,
//                       store.parent,
//                       store.parentId,
//                       store.numberOfEmployee,
//                       store.vehicleAccessibility,
//                       store.externalId,
//                       store.storeTypeId,
//                       store.storeGroupId,
//                       store.storeSegmentId,
//                       store.urbanId,
//                       store.warehouseId,
//                       store.owner,
//                       store.createdAt,
//                       store.updatedAt,
//                       store.deletedAt
//                   )
//               }
//             : null;
//     }
// }

// class StoreAssocUserStores extends Timestamp {
//     id: string;
//     storeCode: string;
//     name: string;
//     address: string;
//     taxNo: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     largeArea: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     status: TStatus;
//     reason: string;
//     parent: boolean;
//     parentId: string;
//     numberOfEmployee: TNullable<number>;
//     vehicleAccessibility: TNullable<string>;
//     externalId: string;
//     storeTypeId: string;
//     storeGroupId: string;
//     storeSegmentId: string;
//     urbanId: string;
//     warehouseId: string;
//     owner: Owner[];

//     constructor(
//         id: string,
//         storeCode: string,
//         name: string,
//         address: string,
//         taxNo: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         largeArea: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         status: TStatus,
//         reason: string,
//         parent: boolean,
//         parentId: string,
//         numberOfEmployee: TNullable<number>,
//         vehicleAccessibility: TNullable<string>,
//         externalId: string,
//         storeTypeId: string,
//         storeGroupId: string,
//         storeSegmentId: string,
//         urbanId: string,
//         warehouseId: string,
//         owner: Owner[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.storeCode = storeCode ? storeCode.trim() : storeCode;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.taxNo = taxNo ? taxNo.trim() : taxNo;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.largeArea = largeArea;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.taxImageUrl = taxImageUrl ? taxImageUrl.trim() : taxImageUrl;
//         this.status = status;
//         this.reason = reason ? reason.trim() : reason;
//         this.parent = parent;
//         this.parentId = parentId;
//         this.numberOfEmployee = numberOfEmployee;
//         this.vehicleAccessibility = vehicleAccessibility;
//         this.externalId = externalId;
//         this.storeTypeId = storeTypeId;
//         this.storeGroupId = storeGroupId;
//         this.storeSegmentId = storeSegmentId;
//         this.urbanId = urbanId;
//         this.warehouseId = warehouseId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         if (owner && owner.length > 0) {
//             owner = [
//                 ...owner.map(row => {
//                     return {
//                         ...new Owner(
//                             row.id,
//                             row.fullName,
//                             row.email,
//                             row.phoneNo,
//                             row.mobilePhoneNo,
//                             row.idNo,
//                             row.taxNo,
//                             row.status,
//                             row.imageUrl,
//                             row.taxImageUrl,
//                             row.idImageUrl,
//                             row.selfieImageUrl,
//                             row.urbanId,
//                             row.roles,
//                             row.createdAt,
//                             row.updatedAt,
//                             row.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.owner = owner;
//         } else {
//             this.owner = [];
//         }
//     }
// }

// class Owner extends Timestamp {
//     id: string;
//     fullName: string;
//     email: string;
//     phoneNo: TNullable<string>;
//     mobilePhoneNo: string;
//     idNo: string;
//     taxNo: string;
//     status: TAccountStatus;
//     imageUrl: TNullable<string>;
//     taxImageUrl: TNullable<string>;
//     idImageUrl: TNullable<string>;
//     selfieImageUrl: TNullable<string>;
//     urbanId: string;
//     roles: OwnerRole[];

//     constructor(
//         id: string,
//         fullName: string,
//         email: string,
//         phoneNo: TNullable<string>,
//         mobilePhoneNo: string,
//         idNo: string,
//         taxNo: string,
//         status: TAccountStatus,
//         imageUrl: TNullable<string>,
//         taxImageUrl: TNullable<string>,
//         idImageUrl: TNullable<string>,
//         selfieImageUrl: TNullable<string>,
//         urbanId: string,
//         roles: OwnerRole[],
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.fullName = fullName ? fullName.trim() : fullName;
//         this.email = email ? email.trim() : email;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.mobilePhoneNo = mobilePhoneNo ? mobilePhoneNo.trim() : mobilePhoneNo;
//         this.idNo = idNo;
//         this.taxNo = taxNo;
//         this.status = status;
//         this.imageUrl = imageUrl;
//         this.taxImageUrl = taxImageUrl;
//         this.idImageUrl = idImageUrl;
//         this.selfieImageUrl = selfieImageUrl;
//         this.urbanId = urbanId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         if (roles && roles.length > 0) {
//             roles = [
//                 ...roles.map(role => {
//                     return {
//                         ...new OwnerRole(
//                             role.id,
//                             role.role,
//                             role.description,
//                             role.status,
//                             role.roleTypeId,
//                             role.createdAt,
//                             role.updatedAt,
//                             role.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.roles = roles;
//         } else {
//             this.roles = [];
//         }
//     }
// }

// class OwnerRole extends Timestamp {
//     id: string;
//     role: string;
//     description: string;
//     status: TStatus;
//     roleTypeId: string;

//     constructor(
//         id: string,
//         role: string,
//         description: string,
//         status: TStatus,
//         roleTypeId: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.role = role ? role.trim() : role;
//         this.description = description ? description.trim() : description;
//         this.status = status;
//         this.roleTypeId = roleTypeId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// /* export class StoreGroup extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class StoreSegment extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string,
//         updatedAt: string,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class StoreType extends Timestamp {
//     id: string;
//     name: string;

//     constructor(
//         id: string,
//         name: string,
//         createdAt: string>,
//         updatedAt: string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// } */

// // -----------------------------------------------------------------------------------------------------
// // For Demo
// // -----------------------------------------------------------------------------------------------------

// export interface IMerchantDemo {
//     id: string;
//     storeName: string;
//     address: string;
//     ownerPhoneNumber: string;
//     storeSegment: string;
//     storeType: string;
//     customerHierarchy: string;
//     status: string;
// }

// export interface IStoreEmployeeDemo {
//     id: string;
//     name: string;
//     role: string;
//     phoneNumber: string;
//     lastCheckIn: string;
// }
