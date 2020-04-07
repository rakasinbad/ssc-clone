import { EStatus, TNullable } from 'app/shared/models/global.model';
import { ITimestamp } from 'app/shared/models/timestamp.model';

interface IStoreSegment extends ITimestamp {
    readonly id: NonNullable<string>;
    description: string;
    externalId: string;
    hasChild: boolean;
    name: string;
    parentId: string;
    sequence: number;
    status: EStatus;
    supplierId: string;
}

class StoreSegment implements IStoreSegment {
    readonly id: NonNullable<string>;
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

    constructor(data: IStoreSegment) {
        const {
            id,
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
    }
}

interface IStoreSegmentChannel extends ITimestamp {
    readonly id: NonNullable<string>;
    channel: StoreSegment;
    channelId: string;
    storeId: string;
}

class StoreSegmentChannel implements IStoreSegmentChannel {
    readonly id: NonNullable<string>;
    channel: StoreSegment;
    channelId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentChannel) {
        const { id, channel, channelId, storeId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.channelId = channelId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setChannel = channel;
    }

    set setChannel(value: StoreSegment) {
        this.channel = value ? new StoreSegment(value) : null;
    }
}

interface IStoreSegmentCluster extends ITimestamp {
    readonly id: NonNullable<string>;
    cluster: StoreSegment;
    clusterId: string;
    storeId: string;
}

class StoreSegmentCluster implements IStoreSegmentCluster {
    readonly id: NonNullable<string>;
    cluster: StoreSegment;
    clusterId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentCluster) {
        const { id, cluster, clusterId, storeId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.clusterId = clusterId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setCluster = cluster;
    }

    set setCluster(value: StoreSegment) {
        this.cluster = value ? new StoreSegment(value) : null;
    }
}

interface IStoreSegmentGroup extends ITimestamp {
    readonly id: NonNullable<string>;
    group: StoreSegment;
    groupId: string;
    storeId: string;
}

class StoreSegmentGroup implements IStoreSegmentGroup {
    readonly id: NonNullable<string>;
    group: StoreSegment;
    groupId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentGroup) {
        const { id, group, groupId, storeId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.groupId = groupId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setGroup = group;
    }

    set setGroup(value: StoreSegment) {
        this.group = value ? new StoreSegment(value) : null;
    }
}

interface IStoreSegmentType extends ITimestamp {
    readonly id: NonNullable<string>;
    type: StoreSegment;
    typeId: string;
    storeId: string;
}

class StoreSegmentType implements IStoreSegmentType {
    readonly id: NonNullable<string>;
    type: StoreSegment;
    typeId: string;
    storeId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentType) {
        const { id, type, typeId, storeId, createdAt, updatedAt, deletedAt } = data;

        this.id = id;
        this.typeId = typeId;
        this.storeId = storeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setType = type;
    }

    set setType(value: StoreSegment) {
        this.type = value ? new StoreSegment(value) : null;
    }
}

export interface IStoreSegmentAlert extends ITimestamp {
    readonly id: NonNullable<string>;
    address: string;
    externalId: string;
    imageUrl: string;
    largeArea: string;
    latitude: number;
    longitude: number;
    name: string;
    noteAddress: string;
    numberOfEmployee: string;
    parent: boolean;
    parentId: string;
    phoneNo: string;
    reason: string;
    status: EStatus;
    storeChannels: Array<StoreSegmentChannel>;
    storeClusters: Array<StoreSegmentCluster>;
    storeCode: string;
    storeGroups: Array<StoreSegmentGroup>;
    storeTypes: Array<StoreSegmentType>;
    taxImageUrl: string;
    taxNo: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    verified: boolean;
}

export class StoreSegmentAlert implements IStoreSegmentAlert {
    readonly id: NonNullable<string>;
    address: string;
    externalId: string;
    imageUrl: string;
    largeArea: string;
    latitude: number;
    longitude: number;
    name: string;
    noteAddress: string;
    numberOfEmployee: string;
    parent: boolean;
    parentId: string;
    phoneNo: string;
    reason: string;
    status: EStatus;
    storeChannels: Array<StoreSegmentChannel>;
    storeClusters: Array<StoreSegmentCluster>;
    storeCode: string;
    storeGroups: Array<StoreSegmentGroup>;
    storeTypes: Array<StoreSegmentType>;
    taxImageUrl: string;
    taxNo: string;
    urbanId: string;
    vehicleAccessibilityId: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: TNullable<string>;

    constructor(data: IStoreSegmentAlert) {
        const {
            id,
            address,
            externalId,
            imageUrl,
            largeArea,
            latitude,
            longitude,
            name,
            noteAddress,
            numberOfEmployee,
            parent,
            parentId,
            phoneNo,
            reason,
            status,
            storeChannels,
            storeClusters,
            storeCode,
            storeGroups,
            storeTypes,
            taxImageUrl,
            taxNo,
            urbanId,
            vehicleAccessibilityId,
            verified,
            createdAt,
            updatedAt,
            deletedAt
        } = data;

        this.id = id;
        this.address = address ? String(address).trim() : null;
        this.externalId = externalId;
        this.imageUrl = imageUrl ? String(imageUrl).trim() : null;
        this.largeArea = largeArea ? String(largeArea).trim() : null;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name ? String(name).trim() : null;
        this.noteAddress = noteAddress ? String(noteAddress).trim() : null;
        this.numberOfEmployee = numberOfEmployee ? String(numberOfEmployee).trim() : null;
        this.parent = parent;
        this.parentId = parentId;
        this.phoneNo = phoneNo ? String(phoneNo).trim() : null;
        this.reason = reason ? String(reason).trim() : null;
        this.status = status;
        this.storeCode = storeCode ? String(storeCode).trim() : null;
        this.taxImageUrl = taxImageUrl ? String(taxImageUrl).trim() : null;
        this.taxNo = taxNo ? String(taxNo).trim() : null;
        this.urbanId = urbanId;
        this.vehicleAccessibilityId = vehicleAccessibilityId;
        this.verified = verified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;

        this.setStoreChannels = storeChannels;
        this.setStoreClusters = storeClusters;
        this.setStoreGroups = storeGroups;
        this.setStoreTypes = storeTypes;
    }

    set setStoreChannels(value: Array<StoreSegmentChannel>) {
        this.storeChannels =
            value && value.length > 0 ? value.map(v => new StoreSegmentChannel(v)) : [];
    }

    set setStoreClusters(value: Array<StoreSegmentCluster>) {
        this.storeClusters =
            value && value.length > 0 ? value.map(v => new StoreSegmentCluster(v)) : [];
    }

    set setStoreGroups(value: Array<StoreSegmentGroup>) {
        this.storeGroups =
            value && value.length > 0 ? value.map(v => new StoreSegmentGroup(v)) : [];
    }

    set setStoreTypes(value: Array<StoreSegmentType>) {
        this.storeTypes = value && value.length > 0 ? value.map(v => new StoreSegmentType(v)) : [];
    }
}
