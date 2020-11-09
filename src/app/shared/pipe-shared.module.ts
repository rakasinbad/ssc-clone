import { NgModule } from '@angular/core';
import {
    ConvertArrayToStringPipe,
    ErrorMessagePipe,
    FilterLogicRelationPipe,
    HasErrorFieldPipe,
    HasFormModePipe,
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
        InvoiceGroupNamePipe,
        SegmentationViewPipe,
        VisibilityTypePipe,
    ],
})
export class PipeSharedModule {}
