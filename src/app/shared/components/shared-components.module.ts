import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { CardHeaderModule } from './card-header/card-header.module';
import { ExportsModule } from './exports/exports.module';
import { SearchBarModule } from './search-bar/search-bar.module';
import { ImportAdvancedModule } from './import-advanced/import-advanced.module';
import { MultipleSelectionModule } from './multiple-selection/multiple-selection.module';
import { GeolocationModule } from './geolocation/geolocation.module';
// Dropdowns
import { SelectAdvancedModule } from './dropdowns/select-advanced/select-advanced.module';
import { WarehouseDropdownModule } from './dropdowns/warehouses/warehouses.module';
import { WarehouseCatalogueDropdownModule } from './dropdowns/warehouse-catalogues/warehouse-catalogues.module';
import { StoreSegmentationTypesDropdownModule } from './dropdowns/store-segmentation/store-segmentation-types/store-segmentation-types.module';
import { StoreSegmentationGroupsDropdownModule } from './dropdowns/store-segmentation/store-segmentation-groups/store-segmentation-groups.module';
import { StoreSegmentationChannelsDropdownModule } from './dropdowns/store-segmentation/store-segmentation-channels/store-segmentation-channels.module';
import { StoreSegmentationClustersDropdownModule } from './dropdowns/store-segmentation/store-segmentation-clusters/store-segmentation-clusters.module';
import { SegmentedStoreTypesDropdownModule } from './dropdowns/store-segmentation/segmented-store-types/segmented-store-types.module';
import { StoreGroupsDropdownModule } from './dropdowns/store-segmentation/store-groups/store-groups.module';
import { StoreChannelsDropdownModule } from './dropdowns/store-segmentation/store-channels/store-channels.module';
import { StoreClustersDropdownModule } from './dropdowns/store-segmentation/store-clusters/store-clusters.module';
// Selection Tree
import { SelectionTreeModule } from './selection-tree/selection-tree/selection-tree.module';
import { StoreSegmentationTreeModule } from './selection-tree/store-segmentation/store-segmentation.module';
import { CardInstructionModule } from './card-instruction/card-instruction.module';


@NgModule({
    imports: [
        FuseSharedModule,
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ImportAdvancedModule,
        SearchBarModule,
        MultipleSelectionModule,
        WarehouseDropdownModule,
        WarehouseCatalogueDropdownModule,
        StoreSegmentationTypesDropdownModule,
        SegmentedStoreTypesDropdownModule,
        StoreSegmentationGroupsDropdownModule,
        StoreSegmentationChannelsDropdownModule,
        StoreSegmentationClustersDropdownModule,
        StoreGroupsDropdownModule,
        StoreChannelsDropdownModule,
        StoreClustersDropdownModule,
        SelectAdvancedModule,
        SelectionTreeModule,
        StoreSegmentationTreeModule,
        CardInstructionModule,
    ],
    exports: [
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ImportAdvancedModule,
        SearchBarModule,
        MultipleSelectionModule,
        WarehouseDropdownModule,
        WarehouseCatalogueDropdownModule,
        StoreSegmentationTypesDropdownModule,
        SegmentedStoreTypesDropdownModule,
        StoreSegmentationGroupsDropdownModule,
        StoreSegmentationChannelsDropdownModule,
        StoreSegmentationClustersDropdownModule,
        StoreGroupsDropdownModule,
        StoreChannelsDropdownModule,
        StoreClustersDropdownModule,
        SelectAdvancedModule,
        SelectionTreeModule,
        StoreSegmentationTreeModule,
        CardInstructionModule,
    ],
})
export class SharedComponentsModule { }
