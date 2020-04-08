import { Timestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

// interface IFlexiComboCreationPayload {
//     warehouseId: number;
//     catalogueId: Array<number>;
//     deletedCatalogue: Array<number>;
// }


// export class FlexiComboCreationPayload {
//     warehouseId: number;
//     catalogueId: Array<number>;
//     deletedCatalogue: Array<number>;

//     constructor(data: IFlexiComboCreationPayload) {
//         const { warehouseId, catalogueId, deletedCatalogue } = data;

//         this.warehouseId = warehouseId;
//         this.catalogueId = catalogueId;
//         this.deletedCatalogue = deletedCatalogue;
//     }
// }
type PromoStatus = 'active' | 'inactive';

interface IPeriodTargetPromo extends Timestamp {
    id: string;
    promoSellerId: string;
    promoName: string;
    base: string;
    startDate: string;
    endDate: string;
    status: PromoStatus;
}

export class PeriodTargetPromo implements IPeriodTargetPromo {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    promoSellerId: string;
    promoName: string;
    base: string;
    startDate: string;
    endDate: string;
    status: PromoStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IPeriodTargetPromo) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            promoSellerId,
            promoName,
            base,
            startDate,
            endDate,
            status,
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.promoSellerId = promoSellerId;
        this.promoName = promoName;
        this.base = base;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
