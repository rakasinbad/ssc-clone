import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calculateAfterTax' })
export class CalculateAfterTaxPipe implements PipeTransform {
    transform(value: number, tax: number): number {
        const newValue = Number(value);
        const newTax = Number(tax);

        if (Number.isNaN(newTax) || !tax || Number.isNaN(newValue)) {
            return value;
        }

        const getTax = newValue * (newTax / 100);

        return getTax + newValue;
    }
}
