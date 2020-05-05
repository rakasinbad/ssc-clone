import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';

import { SinbadFilterComponent } from './sinbad-filter.component';

@NgModule({
    declarations: [SinbadFilterComponent],
    imports: [MaterialModule, FuseSharedModule],
    exports: [SinbadFilterComponent],
})
export class SinbadFilterModule {}
