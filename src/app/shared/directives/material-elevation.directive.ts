import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    Renderer2,
    SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[appMaterialElevation]'
})
export class MaterialElevationDirective implements OnChanges {
    @Input()
    defaultElevation = 2;

    @Input()
    raisedElevation = 8;

    constructor(private elRef: ElementRef, private renderer: Renderer2) {}

    ngOnChanges(changes: SimpleChanges): void {
        // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        // Add '${implements OnChanges}' to the class.

        this.setElevation(this.defaultElevation);
    }

    @HostListener('mouseenter')
    onMouseEnter(): void {
        this.setElevation(this.raisedElevation);
    }

    @HostListener('mouseleave')
    onMouseLeave(): void {
        this.setElevation(this.defaultElevation);
    }

    setElevation(amount: number): void {
        // Remove all elevation classes
        const classesToRemove = Array.from(
            (this.elRef.nativeElement as HTMLElement).classList
        ).filter(c => c.startsWith('mat-elevation-z'));
        classesToRemove.forEach(c => {
            this.renderer.removeClass(this.elRef.nativeElement, c);
        });

        // Add the given elevation class
        const newClass = `mat-elevation-z${amount}`;

        this.renderer.addClass(this.elRef.nativeElement, newClass);
    }
}
