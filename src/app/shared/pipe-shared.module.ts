import { NgModule } from '@angular/core';
import {
    ConvertArrayToStringPipe,
    ErrorMessagePipe,
    FilterLogicRelationPipe,
    HasErrorFieldPipe,
    HasFormModePipe,
    HighlightPipe,
    InvoiceGroupNamePipe,
    SegmentationViewPipe,
    VisibilityTypePipe,
} from './pipes';

@NgModule({
    declarations: [
        ConvertArrayToStringPipe,
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        HasFormModePipe,
        HighlightPipe,
        InvoiceGroupNamePipe,
        SegmentationViewPipe,
        VisibilityTypePipe,
    ],
    exports: [
        ConvertArrayToStringPipe,
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        HasFormModePipe,
        HighlightPipe,
        InvoiceGroupNamePipe,
        SegmentationViewPipe,
        VisibilityTypePipe,
    ],
})
export class PipeSharedModule {}
