export interface PatchCatalogueSegmentationDto {
    segmentationIds: NonNullable<string[]>;
}

export interface PatchCatalogueSegmentationInfoDto {
    channelIds: string[] | null;
    clusterIds: string[] | null;
    groupIds: string[] | null;
    name: NonNullable<string>;
    typeIds: string[] | null;
    warehouseIds: NonNullable<string[]>;
}
