interface IFlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;
}

export class FlexiComboCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;

    constructor(data: IFlexiComboCreationPayload) {
        const { warehouseId, catalogueId, deletedCatalogue } = data;

        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.deletedCatalogue = deletedCatalogue;
    }
}

interface IFlexiCombo {
    id: string;
}

export class FlexiCombo implements IFlexiCombo {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;

    constructor(data: IFlexiCombo) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const { id } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
    }
}
