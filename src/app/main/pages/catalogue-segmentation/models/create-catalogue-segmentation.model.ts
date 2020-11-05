export interface CreateCatalogueSegmentationDto {
    catalogueIds: NonNullable<string[] | 'all'>;
    channelIds: string[] | null;
    clusterIds: string[] | null;
    groupIds: string[] | null;
    name: NonNullable<string>;
    supplierId: NonNullable<string>;
    typeIds: string[] | null;
    warehouseIds: NonNullable<string[]>;
}
