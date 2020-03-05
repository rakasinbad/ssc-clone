// import { TNullable } from './global.model';
// import { Province } from './province.model';
// import { ITimestamp } from './timestamp.model';

// interface IUrban extends ITimestamp {
//     readonly id: NonNullable<string>;
//     zipCode: string;
//     city: string;
//     district: string;
//     urban: string;
//     provinceId: string;
//     province?: Province;
// }

// export class Urban implements IUrban {
//     readonly id: NonNullable<string>;
//     zipCode: string;
//     city: string;
//     district: string;
//     urban: string;
//     provinceId: string;
//     province?: Province;
//     createdAt: string;
//     updatedAt: string;
//     deletedAt: TNullable<string>;

//     constructor(data: Urban) {
//         const {
//             id,
//             zipCode,
//             city,
//             district,
//             urban,
//             provinceId,
//             province,
//             createdAt,
//             updatedAt,
//             deletedAt
//         } = data;

//         this.id = id;
//         this.zipCode = zipCode ? String(zipCode).trim() : null;
//         this.city = city ? String(city).trim() : null;
//         this.district = district ? String(district).trim() : null;
//         this.urban = urban ? String(urban).trim() : null;
//         this.provinceId = provinceId;
//         this.setProvince = province;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;
//     }

//     set setProvince(value: Province) {
//         this.province = value ? new Province(value) : null;
//     }
// }
