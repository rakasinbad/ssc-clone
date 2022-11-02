import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';

import { CardHeaderModule } from './card-header/card-header.module';
import { CardInstructionModule } from './card-instruction/card-instruction.module';
import { BrandsDropdownModule } from './dropdowns/brands/brands.module';
import { CatalogueDropdownModule } from './dropdowns/catalogues/catalogues.module';
import { FakturDropdownModule } from './dropdowns/faktur/faktur.module';
import { SelectAdvancedModule } from './dropdowns/select-advanced/select-advanced.module';
import { StoreSegmentationDropdownModule } from './dropdowns/store-segmentation-2/store-segmentation.module';
import { SegmentedStoreTypesDropdownModule } from './dropdowns/store-segmentation/segmented-store-types/segmented-store-types.module';
import { StoreChannelsDropdownModule } from './dropdowns/store-segmentation/store-channels/store-channels.module';
import { StoreClustersDropdownModule } from './dropdowns/store-segmentation/store-clusters/store-clusters.module';
import { StoreGroupsDropdownModule } from './dropdowns/store-segmentation/store-groups/store-groups.module';
import { StoreSegmentationChannelsDropdownModule } from './dropdowns/store-segmentation/store-segmentation-channels/store-segmentation-channels.module';
import { StoreSegmentationClustersDropdownModule } from './dropdowns/store-segmentation/store-segmentation-clusters/store-segmentation-clusters.module';
import { StoreSegmentationGroupsDropdownModule } from './dropdowns/store-segmentation/store-segmentation-groups/store-segmentation-groups.module';
import { StoreSegmentationTypesDropdownModule } from './dropdowns/store-segmentation/store-segmentation-types/store-segmentation-types.module';
import { StoresDropdownModule } from './dropdowns/stores/stores.module';
import { WarehouseCatalogueDropdownModule } from './dropdowns/warehouse-catalogues/warehouse-catalogues.module';
import { WarehouseDropdownModule } from './dropdowns/warehouses/warehouses.module';
import { ExportAdvancedModule } from './export-advanced/export-advanced.module';
import { ExportsModule } from './exports/exports.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { ImportAdvancedModule } from './import-advanced/import-advanced.module';
import { MultipleSelectionModule } from './multiple-selection/multiple-selection.module';
import { SearchBarModule } from './search-bar/search-bar.module';
import { SelectionTreeModule } from './selection-tree/selection-tree/selection-tree.module';
import { StoreSegmentationTreeModule } from './selection-tree/store-segmentation/store-segmentation.module';
import { SinbadFilterModule } from './sinbad-filter/sinbad-filter.module';
import { SingleWarehouseDropdownModule } from './dropdowns/single-warehouse/single-warehouse.module';
import { SingleSalesRepDropdownModule } from './dropdowns/single-sales-rep/single-sales-rep.module';
import { CatalogueSegmentationDropdownModule } from './dropdowns/catalogue-segmentation/catalogue-segmentation.module';
import { SelectPromoComponent } from './dropdowns/select-promo/select-promo.component';
import { SelectPromoModule } from './dropdowns/select-promo/select-promo.module';
import { SelectLinkedSkpModule } from './dropdowns/select-linked-skp/select-linked-skp.module';
import { ExtendPromoModule } from './dropdowns/extend-promo/extend-promo.module';

/** REACT SHARED COMPONENT */
import { StepperWrapperModule } from './react-components/Stepper/stepper.module';

@NgModule({
    imports: [
        FuseSharedModule,
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ExportAdvancedModule,
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
        CatalogueDropdownModule,
        StoresDropdownModule,
        StoreSegmentationDropdownModule,
        BrandsDropdownModule,
        FakturDropdownModule,
        SingleWarehouseDropdownModule,
        SingleSalesRepDropdownModule,
        CatalogueSegmentationDropdownModule,
        SelectPromoModule,
        SelectLinkedSkpModule,
        ExtendPromoModule,

        // Global filter sidebar
        SinbadFilterModule,

        /** React component */
        StepperWrapperModule
    ],
    exports: [
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ExportAdvancedModule,
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
        CatalogueDropdownModule,
        StoresDropdownModule,
        StoreSegmentationDropdownModule,
        BrandsDropdownModule,
        FakturDropdownModule,
        SingleWarehouseDropdownModule,
        SingleSalesRepDropdownModule,
        CatalogueSegmentationDropdownModule,
        SelectPromoModule,
        SelectLinkedSkpModule,
        ExtendPromoModule,

        // Global filter sidebar
        SinbadFilterModule,

        /** React component */
        StepperWrapperModule
    ],
    declarations: [],
})
export class SharedComponentsModule {}
