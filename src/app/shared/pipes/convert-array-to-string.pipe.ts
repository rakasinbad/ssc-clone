import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'convertArrayToString' })
export class ConvertArrayToStringPipe implements PipeTransform {
    transform(value: any[], key: string, delimiter: string = ', '): string {
        if (!value || (value && !value.length) || typeof key !== 'string') {
            return null;
        }

        return value.map((item) => this._remappingStructure(item, key)).join(delimiter);
    }

    private _remappingStructure(item: any, key: string): string {
        if (item[key]) {
            if (Array.isArray(item[key])) {
                return null;
            }

            return item[key];
        }

        return null;
    }
}
