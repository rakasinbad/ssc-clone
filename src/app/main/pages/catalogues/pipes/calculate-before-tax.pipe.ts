import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calculateBeforeTax' })
export class CalculateBeforeTaxPipe implements PipeTransform {
    transform(value: string, tax: number): number {
        const newValue = typeof value === 'number' ? value : Number(String(value));
        const newTax = Number(tax);

        if (Number.isNaN(newTax) || Number.isNaN(tax) || Number.isNaN(newValue)) {
            return 0;
        }

        const getTax = 1 + newTax / 100;

        // Price include PPN / (1 + PPN Amount) = Total
        // const result = Number((newValue / getTax).toFixed(2));
        const result = Number(Math.ceil((newValue / getTax) * 100) / 100);
        return result;
    }
}
