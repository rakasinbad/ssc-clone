import { EStatus } from 'app/shared/models/global.model';

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

export interface IPayloadStoreTypePatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;
}

export class PayloadStoreTypePatch implements IPayloadStoreTypePatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;

    constructor(data: IPayloadStoreTypePatch) {
        const { description, externalId, name, status } = data;

        if (typeof description !== 'undefined') {
            this.description = description ? String(description).trim() : null;
        }

        if (typeof externalId !== 'undefined') {
            this.externalId = externalId ? String(externalId).trim() : null;
        }

        if (typeof name !== 'undefined') {
            this.name = name ? String(name).trim() : null;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }
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

export interface IPayloadStoreGroupPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;
}

export class PayloadStoreGroupPatch implements IPayloadStoreGroupPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;

    constructor(data: IPayloadStoreGroupPatch) {
        const { description, externalId, name, status } = data;

        if (typeof description !== 'undefined') {
            this.description = description ? String(description).trim() : null;
        }

        if (typeof externalId !== 'undefined') {
            this.externalId = externalId ? String(externalId).trim() : null;
        }

        if (typeof name !== 'undefined') {
            this.name = name ? String(name).trim() : null;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }
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

export interface IPayloadStoreChannelPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;
}

export class PayloadStoreChannelPatch implements IPayloadStoreChannelPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;

    constructor(data: IPayloadStoreChannelPatch) {
        const { description, externalId, name, status } = data;

        if (typeof description !== 'undefined') {
            this.description = description ? String(description).trim() : null;
        }

        if (typeof externalId !== 'undefined') {
            this.externalId = externalId ? String(externalId).trim() : null;
        }

        if (typeof name !== 'undefined') {
            this.name = name ? String(name).trim() : null;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }
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

export interface IPayloadStoreClusterPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;
}

export class PayloadStoreClusterPatch implements IPayloadStoreClusterPatch {
    description?: string;
    externalId?: string;
    name?: string;
    status?: EStatus;

    constructor(data: IPayloadStoreClusterPatch) {
        const { description, externalId, name, status } = data;

        if (typeof description !== 'undefined') {
            this.description = description ? String(description).trim() : null;
        }

        if (typeof externalId !== 'undefined') {
            this.externalId = externalId ? String(externalId).trim() : null;
        }

        if (typeof name !== 'undefined') {
            this.name = name ? String(name).trim() : null;
        }

        if (typeof status !== 'undefined') {
            this.status = status;
        }
    }
}
