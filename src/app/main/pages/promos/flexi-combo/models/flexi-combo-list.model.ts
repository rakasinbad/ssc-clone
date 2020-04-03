import { TNullable } from 'app/shared/models/global.model';

interface IFlexiComboList {
    id: string;
    name: string;
    externalId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouseCount: string;
    brand: {
        name: string;
    };
}

export class FlexiComboList implements IFlexiComboList {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;
    name: string;
    externalId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;
    warehouseCount: string;
    brand: {
        name: string;
    };

    constructor(data: IFlexiComboList) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id,
            name,
            externalId,
            createdAt,
            updatedAt,
            deletedAt,
            warehouseCount,
            brand
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
        this.name = name;
        this.externalId = externalId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.warehouseCount = warehouseCount;
        this.brand = brand;
    }
}
