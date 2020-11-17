import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChange,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
    MatAutocomplete,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { HelperService } from 'app/shared/helpers';
import { fromEvent, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SinbadAutocompleteSource, SinbadAutocompleteType } from './models';

@Component({
    selector: 'sinbad-autocomplete',
    templateUrl: './sinbad-autocomplete.component.html',
    styleUrls: ['./sinbad-autocomplete.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadAutocompleteComponent implements OnChanges, OnInit, AfterViewInit {
    private unSubs$: Subject<any> = new Subject();

    @Input()
    control: AbstractControl;

    @Input()
    hintAlign: 'start' | 'end' = 'start';

    @Input()
    hintValue: string;

    @Input()
    placeholder: string;

    @Input()
    sources: SinbadAutocompleteSource[];

    @Input()
    type: SinbadAutocompleteType = 'single';

    @ViewChild('autoComplete', { static: false })
    autocomplete: MatAutocomplete;

    @ViewChild('autocompleteTrigger', { read: MatAutocompleteTrigger, static: false })
    autocompleteTrigger: MatAutocompleteTrigger;

    constructor(private cdRef: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        HelperService.debug('[SinbadAutocomplete] ngOnChanges', {
            changes,
        });

        // if (changes['placeholder']) {
        //     this._handlePlaceholderChanges(changes['placeholder']);
        // }

        if (changes['type']) {
            this._handleTypeChanges(changes['type']);
        }

        // this.cdRef.markForCheck();
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        if (this.autocomplete.isOpen) {
            this.autocompleteTrigger.panelClosingActions.pipe(takeUntil(this.unSubs$)).subscribe({
                next: (ev) => {
                    HelperService.debug('[SinbadAutocomplete next] ngAfterViewInit panelClosing', {
                        ev,
                    });

                    // this.panelAutocompleteClosing.emit();
                },
                complete: () =>
                    HelperService.debug(
                        '[SinbadAutocomplete complete] ngAfterViewInit panelClosing'
                    ),
            });
        }
    }

    onDisplayAutocompleteFn(item: SinbadAutocompleteSource): string {
        HelperService.debug('[SinbadAutocomplete] onDisplayAutocompleteFn', {
            item,
        });

        return item && item.label;
    }

    onOpenAutocomplete(): void {
        HelperService.debug('[SinbadAutocomplete next] onOpenAutocomplete', {
            autocomplete: this.autocomplete,
            panel: this.autocomplete.panel,
            autocompleteTrigger: this.autocompleteTrigger,
        });

        // this.cdRef.detectChanges();

        if (this.autocomplete && this.autocomplete.panel && this.autocompleteTrigger) {
            fromEvent(this.autocomplete.panel.nativeElement, 'scroll')
                .pipe(
                    map(() => ({
                        scrollTop: this.autocomplete.panel.nativeElement.scrollTop,
                        scrollHeight: this.autocomplete.panel.nativeElement.scrollHeight,
                        elHeight: this.autocomplete.panel.nativeElement.clientHeight,
                    })),
                    filter(
                        ({ scrollTop, scrollHeight, elHeight }) =>
                            scrollHeight === scrollTop + elHeight
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions)
                )
                .subscribe({
                    next: ({ scrollTop, scrollHeight, elHeight }) => {
                        const atBottom = scrollHeight === scrollTop + elHeight;

                        HelperService.debug(
                            '[SinbadAutocomplete next] onOpenAutocomplete fromEvent',
                            { scrollTop, scrollX, scrollHeight, elHeight, atBottom }
                        );
                    },
                    complete: () =>
                        HelperService.debug(
                            '[SinbadAutocomplete next] onOpenAutocomplete fromEvent'
                        ),
                });
        }
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent): void {
        HelperService.debug('[SinbadAutocomplete] onSelectAutocomplete', { ev });

        // this.selectedAutocomplete.emit(ev.option.value);
    }

    private _handlePlaceholderChanges(value: SimpleChange): void {
        if (value.isFirstChange()) {
            if (value.currentValue) {
                this.cdRef.detectChanges();
            }
        }
    }

    private _handleTypeChanges(value: SimpleChange): void {
        if (value.isFirstChange()) {
            if (!value.currentValue) {
                this.type = 'single';
            }
        }
    }
}
