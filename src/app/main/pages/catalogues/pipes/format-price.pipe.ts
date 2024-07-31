import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatPrice' })
export class FormatPricePipe implements PipeTransform {
    transform(value: any): string {
        const newValue = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

        if (isNaN(newValue)) {
            return '0';
        }

        const getResult = newValue;
        return getResult;
    }
}
