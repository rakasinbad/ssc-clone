import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subject } from 'rxjs';
import { SinbadAutocompleteSource, SinbadAutocompleteType } from '../sinbad-autocomplete/models';

@Component({
    selector: 'warehouse-autocomplete-multi',
    templateUrl: './warehouse-autocomplete-multi.component.html',
    styleUrls: ['./warehouse-autocomplete-multi.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseAutocompleteMultiComponent implements OnInit {
    @Input()
    limitItem: number = 10;

    @Input()
    limitLength: number;

    @Input()
    loading: boolean;

    @Output()
    loadingChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    selectedValue: EventEmitter<
        SinbadAutocompleteSource | SinbadAutocompleteSource[]
    > = new EventEmitter();

    @Input()
    type: SinbadAutocompleteType = 'multi';

    @Input()
    reset: boolean;

    @Output()
    resetChange: EventEmitter<boolean> = new EventEmitter();

    private selectedItem: string;
    private triggerSelected: boolean = false;
    private unSubs$: Subject<any> = new Subject();

    readonly form: FormControl = new FormControl('');
    readonly placeholder: string = 'Channel';

    collections$: Observable<any[]>;
    loading$: Observable<boolean>;
    sources = [
        {
            id: 1,
            label: 'DC PGB',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
        {
            id: 1,
            label: 'DC PALEMBANG',
        },
        {
            id: 2,
            label: 'DC SUKABUMI',
        },
    ];

    constructor() {}

    ngOnInit(): void {
        this.form.valueChanges.subscribe((x) => console.log('FORM', { x }));
    }

    onDisplayAutocompleteFn(item: any): string {
        console.log('DISPLAY', { item });
        return item && item.label;
    }

    onClosedAutocomplete(): void {}

    onOpenedAutocomplete(): void {}

    onSelectAutocomplete(ev: MatAutocompleteSelectedEvent): void {}

    onSearch(value: any): void {
        console.log('On Search', { value });
    }
}
