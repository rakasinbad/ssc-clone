import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadSelectSearchModule } from './../sinbad-select-search';
import { WarehouseSelectSearchMultiComponent } from './warehouse-select-search-multi.component';

@NgModule({
    declarations: [WarehouseSelectSearchMultiComponent],
    imports: [CommonModule, SinbadSelectSearchModule],
    exports: [WarehouseSelectSearchMultiComponent],
})
export class WarehouseSelectSearchMultiModule {}
