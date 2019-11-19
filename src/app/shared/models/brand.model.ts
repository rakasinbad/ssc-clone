import { TNullable, TStatus } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { Urban } from './urban.model';

interface IBrand extends ITimestamp {
    id: string;
    name: string;
    address: string;
    longitude: number;
    latitude: number;
    phoneNo: string;
    imageUrl: TNullable<string>;
    official: boolean;
    status: TStatus;
    urbanId: string;
    urban?: Urban;
}

export class Brand extends Timestamp implements IBrand {
    private _urban?: Urban;

    constructor(
        private _id: string,
        private _name: string,
        private _address: string,
        private _longitude: number,
        private _latitude: number,
        private _phoneNo: string,
        private _imageUrl: TNullable<string>,
        private _official: boolean,
        private _status: TStatus,
        private _urbanId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value ? value.trim() : value;
    }

    get address(): string {
        return this._address;
    }

    set address(value: string) {
        this._address = value ? value.trim() : value;
    }

    get longitude(): number {
        return this._longitude;
    }

    set longitude(value: number) {
        this._longitude = value;
    }

    get latitude(): number {
        return this._latitude;
    }

    set latitude(value: number) {
        this._latitude = value;
    }

    get phoneNo(): string {
        return this._phoneNo;
    }

    set phoneNo(value: string) {
        this._phoneNo = value ? value.trim() : value;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    set imageUrl(value: string) {
        this._imageUrl = value ? value.trim() : value;
    }

    get official(): boolean {
        return this._official;
    }

    set official(value: boolean) {
        this._official = value;
    }

    get status(): TStatus {
        return this._status;
    }

    set status(value: TStatus) {
        this._status = value;
    }

    get urbanId(): string {
        return this._urbanId;
    }

    set urbanId(value: string) {
        this._urbanId = value;
    }

    get urban(): Urban {
        return this._urban;
    }

    set urban(value: Urban) {
        this._urban = value;
    }
}

// export class Brand extends Timestamp {
//     id: string;
//     name: string;
//     address: TNullable<string>;
//     longitude: TNullable<number>;
//     latitude: TNullable<number>;
//     phoneNo: TNullable<string>;
//     imageUrl: TNullable<string>;
//     official: boolean;
//     status: TStatus;
//     urbanId: string;

//     constructor(
//         id: string,
//         name: string,
//         address: TNullable<string>,
//         longitude: TNullable<number>,
//         latitude: TNullable<number>,
//         phoneNo: TNullable<string>,
//         imageUrl: TNullable<string>,
//         official: boolean,
//         status: TStatus,
//         urbanId: string,
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.address = address ? address.trim() : address;
//         this.longitude = longitude;
//         this.latitude = latitude;
//         this.phoneNo = phoneNo ? phoneNo.trim() : phoneNo;
//         this.imageUrl = imageUrl ? imageUrl.trim() : imageUrl;
//         this.official = official;
//         this.status = status;
//         this.urbanId = urbanId;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }

// export class BrandAssocUser extends Timestamp {
//     id: string;
//     brandId: string;
//     status: TStatus;
//     brand: Brand;

//     constructor(
//         id: string,
//         brandId: string,
//         status: TStatus,
//         brand: Brand,
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.brandId = brandId;
//         this.status = status;
//         this.brand = brand
//             ? {
//                   ...new Brand(
//                       brand.id,
//                       brand.name,
//                       brand.address,
//                       brand.longitude,
//                       brand.latitude,
//                       brand.phoneNo,
//                       brand.imageUrl,
//                       brand.official,
//                       brand.status,
//                       brand.urbanId,
//                       brand.createdAt,
//                       brand.updatedAt,
//                       brand.deletedAt
//                   )
//               }
//             : null;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }
