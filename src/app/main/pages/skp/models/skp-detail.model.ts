import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { EStatus, TNullable } from 'app/shared/models/global.model';

// export interface PromoList extends ITimestamp {
//     readonly id: NonNullable<string>;
//     name: string;
//     start_date: string;
//     end_date: string;
// }

// export interface StoreList extends ITimestamp {
//     readonly id: NonNullable<string>;
//     storeName: string;
//     storeOwnerName: string;
//     address: string;
//     province: string;
//     skpStatus: string;
//     skpUpdateDate: string;
//     start_date: string;
//     end_date: string;
// }

// export class skpDetails implements ITimestamp {
//     readonly id: NonNullable<string>;
//     name: string;
//     description: string;
//     noteDisplay: string;
//     header: string;
//     skpFile: string;
//     imgSuggestion: string;
//     fromDate: string;
//     toDate: string;
//     status: boolean;
//     // promoList?: PromoList[];
//     // storeList?: StoreList[];
//     createdAt: string;
//     updatedAt: string;
//     deletedAt: TNullable<string>;

//     constructor(data: skpDetails) {
//         const {
//             id,
//             name,
//             description,
//             noteDisplay,
//             header,
//             skpFile,
//             imgSuggestion,
//             fromDate,
//             toDate,
//             status,
//             // promoList,
//             // storeList,
//             createdAt,
//             updatedAt,
//             deletedAt,
//         } = data;

//         this.id = id;
//         this.name = name ? String(name).trim() : null;
//         this.description = description || null;
//         this.noteDisplay = noteDisplay || null;
//         this.header = header || null;
//         this.skpFile = skpFile || null;
//         this.imgSuggestion = imgSuggestion || null;
//         this.fromDate = fromDate || null;
//         this.toDate = toDate || null;
//         this.status = status || false;
//         // this.promoList = promoList;
//         // this.storeList = storeList;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;
//         this.deletedAt = deletedAt;

//         /* Handle promoList */
//         // if (typeof promoList !== 'undefined') {
//         // this.promoList =
//         //     promoList && promoList.length > 0 ? promoList : [];
//         // }

//         /* Handle storeList */
//         // if (typeof storeList !== 'undefined') {
//         // this.storeList =
//         //     storeList && storeList.length > 0 ? storeList : [];
//         // }
//     }
// }
