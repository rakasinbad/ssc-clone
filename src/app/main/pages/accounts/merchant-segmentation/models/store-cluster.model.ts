import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IStoreCluster extends ITimestamp {
    readonly id: NonNullable<string>;
    children: Array<StoreCluster>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    supplierId: string;
}

export class StoreCluster implements IStoreCluster {
    readonly id: NonNullable<string>;
    children: Array<StoreCluster>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    supplierId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreCluster) {
        const {
            id,
            children,
            description,
            externalId,
            hasChild,
            name,
            parentId,
            sequence,
            status,
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
        this.supplierId = supplierId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setChildren = children;
    }

    set setChildren(value: Array<StoreCluster>) {
        this.children = value && value.length > 0 ? value.map(v => new StoreCluster(v)) : [];
    }
}