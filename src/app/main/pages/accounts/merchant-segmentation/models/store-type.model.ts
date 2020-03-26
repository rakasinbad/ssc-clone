import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

export interface IStoreType extends ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: string;
    parentId: string;
    externalId: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    status: EStatus;
    children: Array<StoreType>;
}

export class StoreType implements IStoreType {
    readonly id: NonNullable<string>;
    supplierId: string;
    parentId: string;
    externalId: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    status: EStatus;
    children: Array<StoreType>;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreType) {
        const {
            id,
            supplierId,
            parentId,
            externalId,
            name,
            sequence,
            hasChild,
            description,
            status,
            children,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.parentId = parentId;
        this.externalId = externalId;
        this.name = name ? String(name).trim() : null;
        this.sequence = sequence;
        this.hasChild = hasChild;
        this.description = description ? String(description).trim() : null;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setChildren = children;
    }

    set setChildren(value: Array<StoreType>) {
        this.children = value && value.length > 0 ? value.map(v => new StoreType(v)) : [];
    }
}
