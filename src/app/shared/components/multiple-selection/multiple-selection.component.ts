import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSelectionListChange } from '@angular/material';
import { tap, takeUntil } from 'rxjs/operators';

interface Selection {
    id: string;
    label: string;
}

@Component({
    selector: 'sinbad-multiple-selection',
    templateUrl: './multiple-selection.component.html',
    styleUrls: ['./multiple-selection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Untuk kepel
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan daftar option yang tersedia.
    availableOptions: Array<Selection> = [];
    // Untuk menyimpan jumlah option yang tersedia.
    // tslint:disable-next-line: no-inferrable-types
    totalAvailableOptions: number = 0;
    // Untuk menyimpan status loading pada available options.
    // tslint:disable-next-line: no-inferrable-types
    isAvailableOptionsLoading: boolean = false;

    // Untuk menyimpan daftar list yang terpilih.
    selectedOptions: Array<Selection> = [];
    // Untuk menyimpan jumlah option yang terpilih.
    // tslint:disable-next-line: no-inferrable-types
    totalSelectedOptions: number = 0;
    // Untuk menyimpan status loading pada selected options.
    // tslint:disable-next-line: no-inferrable-types
    isSelectedOptionsLoading: boolean = false;

    // Untuk menangkap event yang terjadi saat meng-update list yang diklik.
    selectedOptionSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    constructor() {
        this.selectedOptionSub$.pipe(
            tap(($event) => {
                const value = ($event.option.value as Selection);
                const isSelected = $event.option.selected;

                if (isSelected) {
                    this.selectedOptions.push(value);
                } else if (isSelected) {
                    this.selectedOptions = this.selectedOptions.filter(option => option !== value);
                }

                this.selectedOptions = [...new Set(this.selectedOptions)];
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    isAvailableAtSelection(value: Selection): boolean {
        return this.selectedOptions.findIndex(selected => selected.id === value.id) >= 0;
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedOptionSub$.next();
        this.selectedOptionSub$.complete();
    }

}
