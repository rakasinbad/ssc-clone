import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subject } from 'rxjs';
import { SinbadSelectSearchSource, SinbadSelectSearchType } from './models';

@Component({
    selector: 'sinbad-select-search',
    templateUrl: './sinbad-select-search.component.html',
    styleUrls: ['./sinbad-select-search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinbadSelectSearchComponent implements OnChanges, OnInit {
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
    sources: SinbadSelectSearchSource[];

    @Input()
    type: SinbadSelectSearchType = 'single';

    @Output()
    closed: EventEmitter<void> = new EventEmitter();

    @Output()
    opened: EventEmitter<void> = new EventEmitter();

    @Output()
    scrollToBottom: EventEmitter<void> = new EventEmitter();

    @Output()
    selectedValue: EventEmitter<SinbadSelectSearchSource[]> = new EventEmitter();

    @Output()
    searchValue: EventEmitter<string> = new EventEmitter();

    // @ViewChild('autoComplete', { static: false })
    // autocomplete: MatAutocomplete;

    // @ViewChild('autocompleteTrigger', { read: MatAutocompleteTrigger, static: false })
    // autocompleteTrigger: MatAutocompleteTrigger;

    private unSubs$: Subject<any> = new Subject();

    readonly searchControl: FormControl = new FormControl('');

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (changes['sources']) {
                if (changes['sources'].currentValue) {
                    this.control.setValue(changes['sources'].currentValue);
                }
            }
        }
    }

    ngOnInit(): void {}

    onDisplayAutocompleteFn(item: any): string {
        console.log('DISPLAY', { item });
        return item && item.label;
    }

    onClosedAutocomplete(): void {}

    onOpenedAutocomplete(): void {}

    // onSelectAutocomplete(ev: MatAutocompleteSelectedEvent): void {}

    onSearch(value: string): void {
        console.log('On Search', { value });
        this.searchValue.emit(value);
    }

    onSelect(ev: MatSelectChange): void {
        console.log('SELECTION CHANGE', { ev });

        this.selectedValue.emit(ev.value);
    }
}
