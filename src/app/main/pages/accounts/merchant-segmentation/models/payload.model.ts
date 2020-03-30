// STORE TYPE

export interface IPayloadStoreType {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;
}

export class PayloadStoreType implements IPayloadStoreType {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;

    constructor(data: IPayloadStoreType) {
        const { name, parentId, sequence, supplierId } = data;

        this.name = name ? String(name).trim() : null;
        this.parentId = parentId;
        this.sequence = sequence;
        this.supplierId = supplierId;
    }

    clear(): PayloadStoreType {
        return new PayloadStoreType(undefined);
    }
}

// STORE GROUP

export interface IPayloadStoreGroup {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;
}

export class PayloadStoreGroup implements IPayloadStoreGroup {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;

    constructor(data: IPayloadStoreGroup) {
        const { name, parentId, sequence, supplierId } = data;

        this.name = name ? String(name).trim() : null;
        this.parentId = parentId;
        this.sequence = sequence;
        this.supplierId = supplierId;
    }

    clear(): PayloadStoreGroup {
        return new PayloadStoreGroup(undefined);
    }
}

// STORE CHANNEL

export interface IPayloadStoreChannel {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;
}

export class PayloadStoreChannel implements IPayloadStoreChannel {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;

    constructor(data: IPayloadStoreChannel) {
        const { name, parentId, sequence, supplierId } = data;

        this.name = name ? String(name).trim() : null;
        this.parentId = parentId;
        this.sequence = sequence;
        this.supplierId = supplierId;
    }

    clear(): PayloadStoreChannel {
        return new PayloadStoreChannel(undefined);
    }
}

// STORE CLUSTER

export interface IPayloadStoreCluster {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;
}

export class PayloadStoreCluster implements IPayloadStoreCluster {
    name: string;
    parentId: string;
    sequence: number;
    supplierId: string;

    constructor(data: IPayloadStoreCluster) {
        const { name, parentId, sequence, supplierId } = data;

        this.name = name ? String(name).trim() : null;
        this.parentId = parentId;
        this.sequence = sequence;
        this.supplierId = supplierId;
    }

    clear(): PayloadStoreCluster {
        return new PayloadStoreCluster(undefined);
    }
}
