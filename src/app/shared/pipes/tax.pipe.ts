import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tax' })
export class TaxPipe implements PipeTransform {
    transform(value: number): string {
        const newValue = Number(value);
        if (Number.isNaN(newValue)) {
            return '-';
        }

        return `${newValue} %`;
    }
}
