import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { CardHeaderModule } from './card-header/card-header.module';
import { ExportsModule } from './exports/exports.module';
import { SearchBarModule } from './search-bar/search-bar.module';



@NgModule({
    imports: [
        FuseSharedModule,
        CardHeaderModule,
        ExportsModule,
        SearchBarModule,
    ],
    exports: [
        CardHeaderModule,
        ExportsModule,
        SearchBarModule,
    ],
})
export class SharedComponentsModule { }
