import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
    SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'sinbad-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit, OnDestroy {
    // Untuk menandakan penggunaan border atau tidak
    // tslint:disable-next-line:no-input-rename
    @Input('useBorder') useBorder = false;

    // Untuk meletakkan placeholder.
    // tslint:disable-next-line:no-input-rename
    @Input('placeholder') placeholder: string;
    
    // Untuk meletakkan placeholder.
    // tslint:disable-next-line:no-input-rename
    @Input('value') value: string;

    // Untuk mengubah debounceTime.
    // tslint:disable-next-line:no-input-rename
    @Input('threshold') threshold: number;

    // Untuk mengirim event ketika teks telah berubah.
    // tslint:disable-next-line:no-output-rename
    @Output('changed') changed: EventEmitter<string> = new EventEmitter<string>();

    // Untuk mengambil nilai search pada search bar.
    search: FormControl = new FormControl('');

    // Untuk keperluan unsubscribe.
    subs$: Subject<void> = new Subject<void>();

    constructor() {}

    ngOnInit(): void {
        if (!this.threshold) {
            this.threshold = 500;
        }

        this.search.setValue(this.value);

        this.search.valueChanges
            .pipe(debounceTime(this.threshold), takeUntil(this.subs$))
            .subscribe((value) => this.changed.emit(value));
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.value) {
            this.search.setValue(this.value);
        }
    }

    reset(): void {
        this.search.reset();
    }
}
