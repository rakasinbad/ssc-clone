import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calculateAfterTax' })
export class CalculateAfterTaxPipe implements PipeTransform {
    transform(value: any, tax: number): number {
        const newValue = typeof value === 'number' ? value : Number(String(value));
        const newTax = Number(tax);

        if (Number.isNaN(newTax) || Number.isNaN(tax) || Number.isNaN(newValue)) {
            return 0;
        }

        const getTax = Number(newValue * (newTax / 100));

        return Number((getTax + newValue).toFixed(2));
    }
}
