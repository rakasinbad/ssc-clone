import { Selection } from 'app/shared/components/multiple-selection/models';

export interface CatalogueSegmentationFormDto {
    chosenCatalogue: NonNullable<string[] | 'all'>;
    chosenStoreChannel: Selection[] | null;
    chosenStoreCluster: Selection[] | null;
    chosenStoreGroup: Selection[] | null;
    chosenStoreType: Selection[] | null;
    chosenWarehouse: NonNullable<Selection[]>;
    segmentationName: NonNullable<string>;
}
