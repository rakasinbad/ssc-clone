import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { CardHeaderModule } from './card-header/card-header.module';
import { ExportsModule } from './exports/exports.module';
import { SearchBarModule } from './search-bar/search-bar.module';
import { ImportAdvancedModule } from './import-advanced/import-advanced.module';
import { MultipleSelectionModule } from './multiple-selection/multiple-selection.module';
import { GeolocationModule } from './geolocation/geolocation.module';
// Dropdowns
import { WarehouseDropdownModule } from './dropdowns/warehouses/warehouses.module';
import { StoreTypesDropdownModule } from './dropdowns/store-types/store-types.module';
import { StoreGroupsDropdownModule } from './dropdowns/store-groups/store-groups.module';
import { StoreChannelsDropdownModule } from './dropdowns/store-channels/store-channels.module';
import { StoreClustersDropdownModule } from './dropdowns/store-clusters/store-clusters.module';


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
        StoreTypesDropdownModule,
        StoreGroupsDropdownModule,
        StoreChannelsDropdownModule,
        StoreClustersDropdownModule,
    ],
    exports: [
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ImportAdvancedModule,
        SearchBarModule,
        MultipleSelectionModule,
        WarehouseDropdownModule,
        StoreTypesDropdownModule,
        StoreGroupsDropdownModule,
        StoreChannelsDropdownModule,
        StoreClustersDropdownModule,
    ],
})
export class SharedComponentsModule { }
