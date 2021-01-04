import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'selectSearchFilter' })
export class SelectSearchFilterPipe implements PipeTransform {
    transform(value: any[], search: string): any {
        if (!value || !search) {
            return value;
        }

        return value.filter((item) => item.label.search(new RegExp(search, 'gi')) !== -1);
    }
}
