import { NgModule } from '@angular/core';
import {ViewInvoicesRoutingModule} from './view-invoices-routing.module';
import { ViewInvoicesComponent } from './view-invoices.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    imports: [ViewInvoicesRoutingModule,  PdfViewerModule],
    declarations: [ViewInvoicesComponent]
})
export class ViewInvoicesModule {}

