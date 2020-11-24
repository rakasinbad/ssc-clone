import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { SegmentChannelAutocompleteComponent } from './segment-channel-autocomplete.component';
import { SegmentChannelApiService, SegmentChannelService } from './services';

@NgModule({
    declarations: [SegmentChannelAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [SegmentChannelAutocompleteComponent],
    providers: [SegmentChannelApiService, SegmentChannelService],
})
export class SegmentChannelAutocompleteModule {}
