import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export class StoreSegment<T> {
    constructor(public deepestLevel: number, public data: Array<T>) {}
}

export interface IStoreSegmentTree extends ITimestamp {
    readonly id: NonNullable<string>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    storeCount: string;
    supplierId: string;
}

export class StoreSegmentTree implements IStoreSegmentTree {
    readonly id: NonNullable<string>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    storeCount: string;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentTree) {
        const {
            id,
            description,
            externalId,
            hasChild,
            name,
            parentId,
            sequence,
            status,
            storeCount,
            supplierId,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.description = description ? String(description).trim() : null;
        this.externalId = externalId;
        this.hasChild = hasChild;
        this.name = name ? String(name).trim() : null;
        this.parentId = parentId;
        this.sequence = sequence;
        this.status = status;
        this.storeCount = storeCount;
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    clear(): StoreSegmentTree {
        return new StoreSegmentTree(undefined);
    }
}
