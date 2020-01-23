import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'sinbad-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnInit, OnDestroy {

    // Untuk meletakkan placeholder.
    @Input('placeholder') placeholder: string;

    // Untuk mengubah debounceTime.
    @Input('threshold') threshold: number;

    // Untuk mengirim event ketika teks telah berubah.
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

        this.search.valueChanges.pipe(
            debounceTime(this.threshold),
            takeUntil(this.subs$)
        ).subscribe(value => this.changed.emit(value));
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

}
