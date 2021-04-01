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
    TaxPipe,
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
        TaxPipe,
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
        TaxPipe,
        VisibilityTypePipe,
    ],
})
export class PipeSharedModule {}
