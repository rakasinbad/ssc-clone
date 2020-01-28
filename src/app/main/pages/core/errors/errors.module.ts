import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';

import { ErrorsRoutingModule } from './errors-routing.module';
import { ErrorsComponent } from './errors.component';

@NgModule({
    declarations: [ErrorsComponent],
    imports: [ErrorsRoutingModule, FuseSharedModule]
})
export class ErrorsModule {}
