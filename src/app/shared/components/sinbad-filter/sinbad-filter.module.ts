import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { NgxMaskModule } from 'ngx-mask';

import { SinbadFilterActionComponent } from './components';
import { SinbadFilterComponent } from './sinbad-filter.component';

@NgModule({
    declarations: [SinbadFilterComponent, SinbadFilterActionComponent],
    imports: [MaterialModule, FuseSharedModule, NgxMaskModule],
    exports: [SinbadFilterComponent],
})
export class SinbadFilterModule {}
