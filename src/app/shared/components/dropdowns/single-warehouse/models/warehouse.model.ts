export interface IWarehouse {
    id: NonNullable<string>;
    code: string;
    supplierId: string;
    externalId: string;
    name: string;
}

export class Warehouse implements IWarehouse {
    id: NonNullable<string>;
    code: string;
    supplierId: string;
    externalId: string;
    name: string;

    constructor(data: IWarehouse) {
        const {
            id,
            code,
            supplierId,
            externalId,
            name,
        } = data;

        this.id = id;
        this.code = code;
        this.supplierId = supplierId;
        this.externalId = externalId;
        this.name = name;
    }
}
