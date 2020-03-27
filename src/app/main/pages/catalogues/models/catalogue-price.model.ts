import { TNullable } from 'app/shared/models/global.model';
import { WarehouseCatalogue } from 'app/shared/models/warehouse-catalogue.model';
import {
    StoreSegmentationType,
    StoreSegmentationGroup,
    StoreSegmentationChannel,
    StoreSegmentationCluster,
} from './index';

interface ICataloguePrice {
    id: string;
    warehouseCatalogueId: string;
    typeId: TNullable<string>;
    groupId: TNullable<string>;
    channelId: TNullable<string>;
    clusterId: TNullable<string>;
    price: number;
    createdAt: string;
    updatedAt: string;
    warehouseCatalogue: WarehouseCatalogue;
    type: TNullable<StoreSegmentationType>;
    group: TNullable<StoreSegmentationGroup>;
    channel: TNullable<StoreSegmentationChannel>;
    cluster: TNullable<StoreSegmentationCluster>;
}

export class CataloguePrice implements CataloguePrice {
    id: string;
    warehouseCatalogueId: string;
    typeId: TNullable<string>;
    groupId: TNullable<string>;
    channelId: TNullable<string>;
    clusterId: TNullable<string>;
    price: number;
    createdAt: string;
    updatedAt: string;
    warehouseCatalogue: WarehouseCatalogue;
    type: TNullable<StoreSegmentationType>;
    group: TNullable<StoreSegmentationGroup>;
    channel: TNullable<StoreSegmentationChannel>;
    cluster: TNullable<StoreSegmentationCluster>;

    constructor(data: ICataloguePrice) {
        const {
            id,
            warehouseCatalogueId,
            typeId,
            groupId,
            channelId,
            clusterId,
            price,
            createdAt,
            updatedAt,
            warehouseCatalogue,
            type,
            group,
            channel,
            cluster,
        } = data;

        this.id = id;
        this.warehouseCatalogueId = warehouseCatalogueId;
        this.typeId = typeId;
        this.groupId = groupId;
        this.channelId = channelId;
        this.clusterId = clusterId;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.warehouseCatalogue = warehouseCatalogue ? new WarehouseCatalogue(warehouseCatalogue) : warehouseCatalogue;
        this.type = type ? new StoreSegmentationType(type) : type;
        this.group = group ? new StoreSegmentationGroup(group) : group;
        this.channel = channel ? new StoreSegmentationChannel(channel) : channel;
        this.cluster = cluster ? new StoreSegmentationCluster(cluster) : cluster;
    }
}
