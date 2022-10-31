import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { MaterialModule } from 'app/shared/material.module';
import { NgxMaskModule } from 'ngx-mask';
import { StepperWrapper } from './StepperWrapper';

@NgModule({
    declarations: [StepperWrapper],
    imports: [
        FuseSharedModule,
        MaterialModule,
        NgxMaskModule,
    ],
    exports: [StepperWrapper],
})
export class StepperWrapperModule {}
