import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadSelectSearchModule } from './../sinbad-select-search';
import { TypeSelectSearchMultiComponent } from './type-select-search-multi.component';

@NgModule({
    declarations: [TypeSelectSearchMultiComponent],
    imports: [CommonModule, SinbadSelectSearchModule],
    exports: [TypeSelectSearchMultiComponent],
})
export class TypeSelectSearchMultiModule {}
