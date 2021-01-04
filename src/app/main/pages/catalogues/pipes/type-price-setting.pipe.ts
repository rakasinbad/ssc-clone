import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'typePriceSetting' })
export class TypePriceSettingPipe implements PipeTransform {
    transform(value: any): string {
        if (!value) {
            return null;
        }

        if (Array.isArray(value)) {
            return (
                (value && value.length > 1
                    ? `${value[0].name} (+${value.length - 1}${
                          value.length === 2 ? ' other' : ' others'
                      })`
                    : value[0].name) || null
            );
        }

        return (value && value.name && value.name.trim()) || null;
    }
}
