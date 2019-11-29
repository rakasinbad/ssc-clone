import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import * as numeral from 'numeral';

@Pipe({
    name: 'price'
})
export class PricePipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) public locale: string) {}

    transform(
        value: number,
        type: 'full' | 'short' = 'full',
        currencyCode: string = 'IDR',
        display: 'wide' | 'narrow' = 'narrow',
        digitsInfo?: string
    ): string | number | null {
        switch (type) {
            case 'short':
                if (Number.isInteger(value)) {
                    return numeral(+value).format('($0 a)');
                } else {
                    return numeral(+value).format('($0.00 a)', Math.floor);
                }
                break;

            case 'full':
                return formatCurrency(
                    +value,
                    this.locale,
                    getCurrencySymbol(currencyCode, display),
                    currencyCode,
                    digitsInfo
                );

            default:
                return value;
        }

        // return value.length ? value.replace(/([A-Z][a-z])/g, '$1 ').trim() : value;
    }
}
