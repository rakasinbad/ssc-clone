export interface IPayloadStoreType {
    supplierId: string;
    parentId: string;
    name: string;
    sequence: number;
}

export class PayloadStoreType implements IPayloadStoreType {
    supplierId: string;
    parentId: string;
    name: string;
    sequence: number;

    constructor(data: IPayloadStoreType) {
        const { supplierId, parentId, name, sequence } = data;

        this.supplierId = supplierId;
        this.parentId = parentId;
        this.name = name ? String(name).trim() : null;
        this.sequence = sequence;
    }

    clear(): PayloadStoreType {
        return new PayloadStoreType(undefined);
    }
}
