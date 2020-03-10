interface ISkuAssignmentsCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;
}

export class SkuAssignmentsCreationPayload {
    warehouseId: number;
    catalogueId: Array<number>;
    deletedCatalogue: Array<number>;

    constructor(data: ISkuAssignmentsCreationPayload) {
        const {
            warehouseId,
            catalogueId,
            deletedCatalogue,
        } = data;

        this.warehouseId = warehouseId;
        this.catalogueId = catalogueId;
        this.deletedCatalogue = deletedCatalogue;
    }
}

interface ISkuAssignments {
    id: string;
}

export class SkuAssignments implements ISkuAssignments {
    // Meletakkan atribut ke dalam class sesuai dengan implement interface-nya.
    id: string;

    constructor(data: ISkuAssignments) {
        // Menggunakan destructing assignment object untuk menghemat jumlah parameter yang bisa diterima.
        const {
            id
        } = data;

        // Memasukkan nilai ke dalam object dari parameter-nya constructor.
        this.id = id;
    }
}
