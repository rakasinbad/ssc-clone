import { Directive, HostListener, Output, EventEmitter } from '@angular/core';
import { HelperService } from '../helpers';

@Directive({
    selector: '[trackScroll]'
})
export class TrackScrollDirective {

    @Output() scrolled: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    @HostListener('scroll', ['$event'])
    detect(event): void {
        HelperService.debug(`@HostListener('scroll', ['$event'])`, { event });
        this.scrolled.emit(event);
    }
}
