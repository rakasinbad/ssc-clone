import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'price'
 })
export class PricePipe implements PipeTransform {

    transform(val: string) {
        return (val.length) ? val.replace(/([A-Z][a-z])/g, '$1 ').trim() : val;
    }
}
