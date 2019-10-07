import { Component, ElementRef, Input, Renderer2, ViewEncapsulation } from '@angular/core';

/**
 *
 *
 * @export
 * @class NavbarComponent
 */
@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
    // Private
    _variant: string;

    /**
     * Creates an instance of NavbarComponent.
     * @param {ElementRef} _elementRef
     * @param {Renderer2} _renderer
     * @memberof NavbarComponent
     */
    constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
        // Set the private defaults
        this._variant = 'vertical-style-1';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Variant
     * @readonly
     * @type {string}
     * @memberof NavbarComponent
     */
    get variant(): string {
        return this._variant;
    }

    /**
     *
     *
     * @memberof NavbarComponent
     */
    @Input()
    set variant(value: string) {
        // Remove the old class name
        this._renderer.removeClass(this._elementRef.nativeElement, this.variant);

        // Store the variant value
        this._variant = value;

        // Add the new class name
        this._renderer.addClass(this._elementRef.nativeElement, value);
    }
}
