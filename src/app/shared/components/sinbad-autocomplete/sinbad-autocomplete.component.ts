import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
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
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { SinbadAutocompleteSource, SinbadAutocompleteType } from './models';

@Component({
    selector: 'sinbad-autocomplete',
    templateUrl: './sinbad-autocomplete.component.html',
    styleUrls: ['./sinbad-autocomplete.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadAutocompleteComponent implements OnChanges, OnInit {
    private unSubs$: Subject<any> = new Subject();

    @Input()
    control: AbstractControl;

    @Input()
    hintAlign: 'start' | 'end' = 'start';

    @Input()
    hintValue: string;

    @Input()
    loading: boolean;

    @Input()
    placeholder: string;

    @Input()
    sources: SinbadAutocompleteSource[];

    @Input()
    type: SinbadAutocompleteType = 'single';

    @Output()
    closed: EventEmitter<void> = new EventEmitter();

    @Output()
    opened: EventEmitter<void> = new EventEmitter();

    @Output()
    scrollToBottom: EventEmitter<void> = new EventEmitter();

    @Output()
    selectedAutocomplete: EventEmitter<SinbadAutocompleteSource> = new EventEmitter();

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
    }

    ngOnInit(): void {}

    onDisplayAutocompleteFn(item: SinbadAutocompleteSource): string {
        HelperService.debug('[SinbadAutocomplete] onDisplayAutocompleteFn', {
            item,
        });

        return item && item.label;
    }

    onClosedAutocomplete(): void {
        HelperService.debug('[SinbadAutocomplete] onClosedAutocomplete', {
            autocomplete: this.autocomplete,
            panel: this.autocomplete.panel,
            autocompleteTrigger: this.autocompleteTrigger,
        });

        this.closed.emit();
    }

    onOpenedAutocomplete(): void {
        HelperService.debug('[SinbadAutocomplete] onOpenedAutocomplete', {
            autocomplete: this.autocomplete,
            panel: this.autocomplete.panel,
            autocompleteTrigger: this.autocompleteTrigger,
        });

        this.cdRef.detectChanges();

        this.opened.emit();

        fromEvent(this.autocomplete.panel.nativeElement, 'scroll')
            .pipe(
                map(() => ({
                    scrollTop: this.autocomplete.panel.nativeElement.scrollTop,
                    scrollHeight: this.autocomplete.panel.nativeElement.scrollHeight,
                    elHeight: this.autocomplete.panel.nativeElement.clientHeight,
                })),
                filter(
                    ({ scrollTop, scrollHeight, elHeight }) => scrollHeight === scrollTop + elHeight
                ),
                tap(({ scrollTop, scrollHeight, elHeight }) =>
                    HelperService.debug('[SinbadAutocomplete tap] onOpenAutocomplete fromEvent', {
                        scrollTop,
                        scrollX,
                        scrollHeight,
                        elHeight,
                    })
                ),
                takeUntil(this.autocompleteTrigger.panelClosingActions)
            )
            .subscribe({
                next: ({ scrollTop, scrollHeight, elHeight }) => {
                    const atBottom = scrollHeight === scrollTop + elHeight;

                    HelperService.debug('[SinbadAutocomplete next] onOpenAutocomplete fromEvent', {
                        scrollTop,
                        scrollX,
                        scrollHeight,
                        elHeight,
                        atBottom,
                    });

                    this.scrollToBottom.emit();
                },
                complete: () =>
                    HelperService.debug(
                        '[SinbadAutocomplete complete] onOpenAutocomplete fromEvent'
                    ),
            });
    }

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent): void {
        HelperService.debug('[SinbadAutocomplete] onSelectAutocomplete', { ev });

        this.selectedAutocomplete.emit(ev.option.value);
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
