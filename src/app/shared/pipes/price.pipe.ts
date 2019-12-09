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
        let newValue;

        switch (type) {
            case 'short': {
                // if (Number.isInteger(value)) {
                //     newValue = numeral(+value).format('($0 a)');
                // } else {
                //     newValue = numeral(+value).format('($0.00 a)', Math.floor);
                // }

                const res = +value - Math.floor(+value) !== 0;

                if (res) {
                    newValue = numeral(+value).format('($0.00 a)', Math.floor);
                } else {
                    newValue = numeral(+value).format('($0 a)', Math.floor);
                }

                break;
            }

            case 'full': {
                newValue = formatCurrency(
                    +value,
                    this.locale,
                    getCurrencySymbol(currencyCode, display),
                    currencyCode,
                    digitsInfo
                );
                break;
            }

            default: {
                newValue = value;
                break;
            }
        }

        return newValue;

        // return value.length ? value.replace(/([A-Z][a-z])/g, '$1 ').trim() : value;
    }
}
