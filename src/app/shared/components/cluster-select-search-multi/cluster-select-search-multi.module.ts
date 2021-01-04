import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadSelectSearchModule } from '../sinbad-select-search';
import { ClusterSelectSearchMultiComponent } from './cluster-select-search-multi.component';

@NgModule({
    declarations: [ClusterSelectSearchMultiComponent],
    imports: [CommonModule, SinbadSelectSearchModule],
    exports: [ClusterSelectSearchMultiComponent],
})
export class ClusterSelectSearchMultiModule {}
