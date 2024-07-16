import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calculateTaxBulk' })
export class CalculateTaxBulkPipe implements PipeTransform {
    transform(value: any, tax: number): number {
        const newValue =
            typeof value === 'number'
                ? value
                : Number(value);
        const newTax = Number(tax);

        if (Number.isNaN(newTax) || Number.isNaN(tax) || Number.isNaN(newValue)) {
            return 0;
        }

        const getTax = newValue * (newTax / 100);

        return getTax + newValue;
    }
}
