import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { NgxMaskModule } from 'ngx-mask';

import { SinbadFilterComponent } from './sinbad-filter.component';

@NgModule({
    declarations: [SinbadFilterComponent],
    imports: [MaterialModule, FuseSharedModule, NgxMaskModule],
    exports: [SinbadFilterComponent],
})
export class SinbadFilterModule {}
