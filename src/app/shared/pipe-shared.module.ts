import { NgModule } from '@angular/core';
import {
    ErrorMessagePipe,
    FilterLogicRelationPipe,
    HasErrorFieldPipe,
    HasFormModePipe,
    InvoiceGroupNamePipe,
    VisibilityTypePipe,
} from './pipes';

@NgModule({
    declarations: [
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        HasFormModePipe,
        InvoiceGroupNamePipe,
        VisibilityTypePipe,
    ],
    exports: [
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        HasFormModePipe,
        InvoiceGroupNamePipe,
        VisibilityTypePipe,
    ],
})
export class PipeSharedModule {}
