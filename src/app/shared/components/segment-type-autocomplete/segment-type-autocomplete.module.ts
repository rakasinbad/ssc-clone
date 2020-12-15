import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { SegmentTypeAutocompleteComponent } from './segment-type-autocomplete.component';
import { SegmentTypeApiService, SegmentTypeService } from './services';

@NgModule({
    declarations: [SegmentTypeAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [SegmentTypeAutocompleteComponent],
    providers: [SegmentTypeApiService, SegmentTypeService],
})
export class SegmentTypeAutocompleteModule {}
