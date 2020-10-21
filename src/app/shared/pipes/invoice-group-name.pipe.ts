import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceGroup } from '../models/invoice-group.model';

@Pipe({ name: 'invoiceGroupName' })
export class InvoiceGroupNamePipe implements PipeTransform {
    transform(value: string, sources: InvoiceGroup[]): string {
        if (!value || !sources || (sources && !sources.length)) {
            return null;
        }

        return sources.find((source) => source.id === value).name || null;
    }
}
