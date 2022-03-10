export class CreateManualOrder {
    supplierId: string;
    name: string;

    constructor(data: CreateManualOrder) {
        const {
            supplierId,
            name,
        } = data;

        this.supplierId = supplierId;
        this.name = name ? String(name).trim() : null;
     

    }
}