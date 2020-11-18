import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SinbadAutocompleteModule } from '../sinbad-autocomplete';
import { SegmentClusterAutocompleteComponent } from './segment-cluster-autocomplete.component';
import { SegmentClusterApiService, SegmentClusterService } from './services';

@NgModule({
    declarations: [SegmentClusterAutocompleteComponent],
    imports: [CommonModule, SinbadAutocompleteModule],
    exports: [SegmentClusterAutocompleteComponent],
    providers: [SegmentClusterApiService, SegmentClusterService],
})
export class SegmentClusterAutocompleteModule {}
