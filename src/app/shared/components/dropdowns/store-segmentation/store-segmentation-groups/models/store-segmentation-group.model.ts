import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

export interface IStoreSegmentationGroup extends ITimestamp {
    id: string;
    supplierId: string;
    parentId: TNullable<string>;
    externalId: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    status: string;
}

export class StoreSegmentationGroup implements IStoreSegmentationGroup {
    id: string;
    supplierId: string;
    parentId: TNullable<string>;
    externalId: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentationGroup) {
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
            createdAt,
            updatedAt,
            deletedAt,
        } = data;

        this.id = id;
        this.supplierId = supplierId;
        this.parentId = parentId;
        this.externalId = externalId;
        this.name = name;
        this.sequence = sequence;
        this.hasChild = hasChild;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}
