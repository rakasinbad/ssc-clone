import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { CardHeaderModule } from './card-header/card-header.module';
import { ExportsModule } from './exports/exports.module';
import { SearchBarModule } from './search-bar/search-bar.module';
import { ImportAdvancedModule } from './import-advanced/import-advanced.module';
import { MultipleSelectionModule } from './multiple-selection/multiple-selection.module';
import { GeolocationModule } from './geolocation/geolocation.module';



@NgModule({
    imports: [
        FuseSharedModule,
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ImportAdvancedModule,
        SearchBarModule,
        MultipleSelectionModule,
    ],
    exports: [
        CardHeaderModule,
        ExportsModule,
        GeolocationModule,
        ImportAdvancedModule,
        SearchBarModule,
        MultipleSelectionModule,
    ],
})
export class SharedComponentsModule { }
