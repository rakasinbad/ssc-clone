import { ITimestamp } from 'app/shared/models/timestamp.model';
import { TNullable } from 'app/shared/models/global.model';

export interface IStoreSegmentationType extends ITimestamp {
    readonly id: NonNullable<string>;
    supplierId: string;
    parentId: TNullable<string>;
    externalId: string;
    name: string;
    sequence: number;
    hasChild: boolean;
    description: string;
    status: string;
    typeId: string;
    typeName: string;
    groupId: string;
    groupName: string;
    clusterId: string;
    clusterName: string;
    channelId: string;
    channelName: string;
}

export class StoreSegmentationType implements IStoreSegmentationType {
    readonly id: NonNullable<string>;
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
    typeId: string;
    typeName: string;
    groupId: string;
    groupName: string;
    clusterId: string;
    clusterName: string;
    channelId: string;
    channelName: string;

    constructor(data: IStoreSegmentationType) {
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
            typeId,
            typeName,
            groupId,
            groupName,
            clusterId,
            clusterName,
            channelId,
            channelName
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
        this.typeId = typeId || null;
        this.typeName = typeName || null;
        this.groupId = groupId || null;
        this.groupName = groupName || null;
        this.clusterId = clusterId || null;
        this.clusterName = clusterName || null;
        this.channelId = channelId || null;
        this.channelName = channelName || null;
    }
}