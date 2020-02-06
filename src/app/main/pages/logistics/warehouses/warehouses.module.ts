import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';

import { WarehouseFormComponent } from './warehouse-form/warehouse-form.component';
import { WarehousesRoutingModule } from './warehouses-routing.module';
import { WarehousesComponent } from './warehouses.component';

@NgModule({
    declarations: [WarehousesComponent, WarehouseFormComponent],
    imports: [WarehousesRoutingModule, FuseSharedModule]
})
export class WarehousesModule {}
