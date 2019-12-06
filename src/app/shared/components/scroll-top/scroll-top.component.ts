import { Component, OnInit, ChangeDetectionStrategy, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-scroll-top',
    templateUrl: './scroll-top.component.html',
    styleUrls: ['./scroll-top.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollTopComponent implements OnInit {
    windowScrolled: boolean;

    constructor(@Inject(DOCUMENT) private document: Document) {}

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e: Event): void {
        alert('ABC');
        console.log('WINDOW SCROLL 1');
        console.log('WINDOW SCROLL 2', e.target['scrollingElement'].scrollTop);
        if (
            window.pageYOffset ||
            this.document.documentElement.scrollTop ||
            this.document.body.scrollTop > 100
        ) {
            this.windowScrolled = true;
        } else if (
            (this.windowScrolled && window.pageYOffset) ||
            this.document.documentElement.scrollTop ||
            this.document.body.scrollTop < 10
        ) {
            this.windowScrolled = false;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    onScrollToTop(): void {
        (function smoothscroll(): void {
            const currentScroll =
                this.document.documentElement.scrollTop || this.document.body.scrollTop;

            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - currentScroll / 8);
            }
        })();
    }
}
