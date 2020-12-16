
export interface IWarehouse {
    firstName: string;
    amount: number;
}

export class CatalogueSegmentation {
    readonly id: NonNullable<string>;
    supplierId: string;
    name: string;
    status: string;
    warehouse: IWarehouse[];

    constructor(data: CatalogueSegmentation) {
        const {
            id,
            supplierId,
            name,
            status,
            warehouse
        } = data

        this.id = id;
        this.supplierId = supplierId;
        this.name = name || null;
        this.status = status;
        this.warehouse = warehouse;
    }
}