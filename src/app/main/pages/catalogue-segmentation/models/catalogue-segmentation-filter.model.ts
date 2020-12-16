export interface CatalogueSegmentationFilterDto {
    channelId?: number;
    clusterId?: number;
    groupId?: number;
    status?: 'all' | 'active' | 'inactive';
    typeId?: number;
    warehouseId?: number;
}
