import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calculateAfterTax' })
export class CalculateAfterTaxPipe implements PipeTransform {
    transform(value: string, tax: number): number {
        const newValue =
            typeof value === 'number'
                ? value
                : Number(String(value).replace(/\./g, '').replace(/,/g, '.'));
        const newTax = Number(tax);

        if (Number.isNaN(newTax) || Number.isNaN(tax) || Number.isNaN(newValue)) {
            return 0;
        }

        const getTax = newValue * (newTax / 100);

        return getTax + newValue;
    }
}
