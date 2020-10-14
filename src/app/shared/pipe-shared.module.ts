import { NgModule } from '@angular/core';
import {
    ErrorMessagePipe,
    FilterLogicRelationPipe,
    HasErrorFieldPipe,
    InvoiceGroupNamePipe,
} from './pipes';

@NgModule({
    declarations: [
        ErrorMessagePipe,
        FilterLogicRelationPipe,
        HasErrorFieldPipe,
        InvoiceGroupNamePipe,
    ],
    exports: [ErrorMessagePipe, FilterLogicRelationPipe, HasErrorFieldPipe, InvoiceGroupNamePipe],
})
export class PipeSharedModule {}
