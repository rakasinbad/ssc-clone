import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadSelectSearchModule } from './../sinbad-select-search';
import { ChannelSelectSearchMultiComponent } from './channel-select-search-multi.component';

@NgModule({
    declarations: [ChannelSelectSearchMultiComponent],
    imports: [CommonModule, SinbadSelectSearchModule],
    exports: [ChannelSelectSearchMultiComponent],
})
export class ChannelSelectSearchMultiModule {}
