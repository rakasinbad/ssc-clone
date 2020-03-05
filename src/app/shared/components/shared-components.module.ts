import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';

import { CardHeaderModule } from './card-header/card-header.module';
import { ExportsModule } from './exports/exports.module';
import { ImportAdvancedModule } from './import-advanced/import-advanced.module';
import { SearchBarModule } from './search-bar/search-bar.module';

@NgModule({
    imports: [
        FuseSharedModule,
        CardHeaderModule,
        ExportsModule,
        ImportAdvancedModule,
        SearchBarModule
    ],
    exports: [CardHeaderModule, ExportsModule, ImportAdvancedModule, SearchBarModule]
})
export class SharedComponentsModule {}
