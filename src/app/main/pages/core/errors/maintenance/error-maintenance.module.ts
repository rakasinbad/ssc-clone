import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FuseSharedModule } from '@fuse/shared.module';

import { ErrorMaintenanceRoutingModule } from './error-maintenance-routing.module';
import { ErrorMaintenanceComponent } from './error-maintenance.component';

@NgModule({
    declarations: [ErrorMaintenanceComponent],
    imports: [ErrorMaintenanceRoutingModule, MatIconModule, FuseSharedModule]
})
export class ErrorMaintenanceModule {}
