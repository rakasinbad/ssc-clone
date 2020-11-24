import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { SegmentGroupAutocompleteComponent } from './segment-group-autocomplete.component';
import { SegmentGroupApiService, SegmentGroupService } from './services';

@NgModule({
    declarations: [SegmentGroupAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [SegmentGroupAutocompleteComponent],
    providers: [SegmentGroupApiService, SegmentGroupService],
})
export class SegmentGroupAutocompleteModule {}
