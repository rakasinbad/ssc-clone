import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadSelectSearchModule } from '../sinbad-select-search';
import { GroupSelectSearchMultiComponent } from './group-select-search-multi.component';

@NgModule({
    declarations: [GroupSelectSearchMultiComponent],
    imports: [CommonModule, SinbadSelectSearchModule],
    exports: [GroupSelectSearchMultiComponent],
})
export class GroupSelectSearchMultiModule {}
