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
