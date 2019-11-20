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
    public urban?: Urban;

    constructor(
        public id: string,
        public name: string,
        public address: string,
        public longitude: number,
        public latitude: number,
        public phoneNo: string,
        public imageUrl: TNullable<string>,
        public official: boolean,
        public status: TStatus,
        public urbanId: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
        this.address = address ? address.trim() : null;
        this.phoneNo = phoneNo ? phoneNo.trim() : null;
        this.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    set setUrban(value: Urban) {
        if (value) {
            const newUrban = new Urban(
                value.id,
                value.zipCode,
                value.city,
                value.district,
                value.urban,
                value.provinceId,
                value.createdAt,
                value.updatedAt,
                value.deletedAt
            );

            if (value.province) {
                newUrban.setProvince = value.province;
            }

            this.urban = newUrban;
        } else {
            this.urban = null;
        }
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
