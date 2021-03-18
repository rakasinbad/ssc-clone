import { WarehouseCatalogue } from 'app/shared/models/warehouse-catalogue.model';

interface ICataloguePrice {
    id: string;
    channelId: string;
    channels: any;
    clusterId: string;
    clusters: any;
    createdAt: string;
    groupId: string;
    groups: any;
    isMaximum: boolean;
    maxQty: number;
    name: string;
    price: number;
    segmentationId: string;
    typeId: string;
    types: any;
    updatedAt: string;
    warehouseCatalogue: WarehouseCatalogue;
    warehouseCatalogueId: string;
    warehouses: any;
}

export class CataloguePrice implements CataloguePrice {
    id: string;
    channelId: string;
    channels: any;
    clusterId: string;
    clusters: any;
    createdAt: string;
    groupId: string;
    groups: any;
    isMaximum: boolean;
    maxQty: number;
    name: string;
    price: number;
    segmentationId: string;
    typeId: string;
    types: any;
    updatedAt: string;
    warehouseCatalogue: WarehouseCatalogue;
    warehouseCatalogueId: string;
    warehouses: any;

    constructor(data: ICataloguePrice) {
        const {
            id,
            channelId,
            channels,
            clusterId,
            clusters,
            createdAt,
            groupId,
            groups,
            isMaximum,
            maxQty,
            name,
            price,
            segmentationId,
            typeId,
            types,
            updatedAt,
            warehouseCatalogue,
            warehouseCatalogueId,
            warehouses,
        } = data;

        this.id = id;
        this.channelId = channelId;
        this.channels = channels || [];
        this.clusterId = clusterId;
        this.clusters = clusters || [];
        this.createdAt = createdAt;
        this.groupId = groupId;
        this.groups = groups || [];
        this.isMaximum = isMaximum;
        this.maxQty = maxQty;
        this.name = (name && name.trim()) || null;
        this.price = price;
        this.segmentationId = segmentationId;
        this.typeId = typeId;
        this.types = types || [];
        this.updatedAt = updatedAt;
        this.warehouseCatalogue = warehouseCatalogue;
        this.warehouseCatalogueId = warehouseCatalogueId;
        this.warehouses = warehouses || [];
    }
}
