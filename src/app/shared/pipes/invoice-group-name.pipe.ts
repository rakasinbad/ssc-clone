import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceGroupPromo } from '../models/invoice-group.model';

@Pipe({ name: 'invoiceGroupName' })
export class InvoiceGroupNamePipe implements PipeTransform {
    transform(value: string, sources: InvoiceGroupPromo[]): string {
        if (!value || !sources || (sources && !sources.length)) {
            return null;
        }

        return sources.find((source) => source.fakturId === value).fakturName || null;
    }
}
