import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
    transform(value: string, search): string {
        const pattern = search
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
            .split(' ')
            .filter(t => t.length > 0)
            .join('|');

        const regex = new RegExp(pattern, 'gi');

        return search ? value.replace(regex, match => `<b>${match}</b>`) : value;
    }
}
