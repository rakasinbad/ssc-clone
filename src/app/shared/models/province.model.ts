import { sortBy } from 'lodash';

import { IResponsePaginate, TNullable } from './global.model';
import { ITimestamp, Timestamp } from './timestamp.model';
import { Urban } from './urban.model';

export interface IProvince extends ITimestamp {
    id: string;
    name: string;
    urbans?: Urban[];
}

export interface IProvinceResponse extends IResponsePaginate {
    data: Province[];
}

export class Province extends Timestamp implements IProvince {
    public urbans?: Urban[];

    constructor(
        public id: string,
        public name: string,
        createdAt: string,
        updatedAt: string,
        deletedAt: TNullable<string>
    ) {
        super(createdAt, updatedAt, deletedAt);

        this.name = name ? name.trim() : null;
    }

    set setUrbans(value: Urban[]) {
        if (value && value.length > 0) {
            const newUrbans = value.map(row => {
                const newUrban = new Urban(
                    row.id,
                    row.zipCode,
                    row.city,
                    row.district,
                    row.urban,
                    row.provinceId,
                    row.createdAt,
                    row.updatedAt,
                    row.deletedAt
                );

                if (row.province) {
                    newUrban.setProvince = row.province;
                }

                return newUrban;
            });

            this.urbans = sortBy(newUrbans, ['urban'], ['asc']);
        } else {
            this.urbans = [];
        }
    }
}

// export interface IProvince extends ITimestamp {
//     id: string;
//     name: string;
//     urbans?: IUrban[];
// }

// export interface IUrban extends ITimestamp {
//     id: string;
//     zipCode: string;
//     city: string;
//     district: string;
//     urban: string;
// }

// export interface IProvinceResponse extends IResponsePaginate {
//     data: IProvince[];
// }

// export class Province extends Timestamp {
//     id: string;
//     name: string;
//     urbans?: Urban[];

//     constructor(
//         id: string,
//         name: string,
//         urbans: Urban[],
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.name = name ? name.trim() : name;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         if (urbans && urbans.length > 0) {
//             urbans = [
//                 ...urbans.map(row => {
//                     return {
//                         ...new Urban(
//                             row.id,
//                             row.zipCode,
//                             row.city,
//                             row.district,
//                             row.urban,
//                             row.createdAt,
//                             row.updatedAt,
//                             row.deletedAt
//                         )
//                     };
//                 })
//             ];
//             this.urbans = _.sortBy(urbans, ['urban'], ['asc']);
//         } else {
//             this.urbans = urbans;
//         }
//     }
// }

// export class Urban extends Timestamp {
//     id: string;
//     zipCode: string;
//     city: string;
//     district: string;
//     urban: string;

//     constructor(
//         id: string,
//         zipCode: string,
//         city: string,
//         district: string,
//         urban: string,
//         createdAt: TNullable<string>,
//         updatedAt: TNullable<string>,
//         deletedAt: TNullable<string>
//     ) {
//         super(createdAt, updatedAt, deletedAt);

//         this.id = id || undefined;
//         this.zipCode = zipCode ? zipCode.trim() : zipCode;
//         this.city = city ? city.trim() : city;
//         this.district = district ? district.trim() : district;
//         this.urban = urban ? urban.trim() : urban;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }
// }
