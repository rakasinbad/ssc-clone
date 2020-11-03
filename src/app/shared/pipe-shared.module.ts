import { NgModule } from '@angular/core';
import {
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
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        HasFormModePipe,
        InvoiceGroupNamePipe,
        SegmentationViewPipe,
        VisibilityTypePipe,
    ],
    exports: [
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
