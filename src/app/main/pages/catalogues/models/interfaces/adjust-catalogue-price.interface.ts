export interface AdjustCataloguePriceDto {
    catalogueId: string;
    channelIds: string[];
    clusterIds: string[];
    groupIds: string[];
    price: number;
    segmentationId: string;
    segmentedCatalogueId: string;
    typeIds: string[];
    warehouseIds: string[];
}
