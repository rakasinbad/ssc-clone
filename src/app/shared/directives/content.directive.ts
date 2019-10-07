import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appContent]'
})
export class ContentDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
