import { AfterViewInit, Directive, OnDestroy, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[appTabAutocomplete]'
})
export class TabAutocompleteDirective implements AfterViewInit, OnDestroy {
    private _unSubs$: Subject<void> = new Subject();

    constructor(
        @Optional() private autoTrigger: MatAutocompleteTrigger,
        @Optional() private control: NgControl
    ) {}

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.autoTrigger.panelClosingActions.pipe(takeUntil(this._unSubs$)).subscribe(x => {
            if (this.autoTrigger.activeOption) {
                const value = this.autoTrigger.activeOption.value;

                if (this.control) {
                    this.control.control.setValue(value, { emit: false });
                }

                this.autoTrigger.writeValue(this.autoTrigger.activeOption.value);
            }
        });
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._unSubs$.next();
        this._unSubs$.complete();
    }
}
