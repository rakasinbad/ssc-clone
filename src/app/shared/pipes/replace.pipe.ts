import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replace'
})
export class ReplacePipe implements PipeTransform {
    transform(value: string, from: string, to: string): string {
        if (!value || !from || !to) {
            return value;
        }

        return value.replace(new RegExp(from, 'g'), to);
    }
}
