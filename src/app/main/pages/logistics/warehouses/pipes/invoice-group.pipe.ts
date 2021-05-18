import { Pipe, PipeTransform } from '@angular/core';
import { WarehouseInvoiceGroup } from 'app/shared/models/warehouse-invoice-group.model';

@Pipe({ name: 'invoiceGroup' })
export class InvoiceGroupPipe implements PipeTransform {
    transform(value: WarehouseInvoiceGroup[]): string {
        if (value && value.length > 0) {
            const invoiceGroup = value.map((v) => v.invoiceGroup.name);

            return invoiceGroup.length > 0 ? invoiceGroup.join(', ') : '-';
        }

        return '-';
    }
}
