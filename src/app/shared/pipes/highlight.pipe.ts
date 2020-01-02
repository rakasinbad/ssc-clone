import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {}

    transform(value: string, search): SafeHtml {
        if (typeof search !== 'string') {
            return value;
        }

        const pattern = search
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
            .split(' ')
            .filter(t => t.length > 0)
            .join('|');

        const regex = new RegExp(pattern, 'gi');
        const newValue = search ? value.replace(regex, match => `<b>${match}</b>`) : value;

        return this.domSanitizer.bypassSecurityTrustHtml(newValue);
    }
}
