import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, Input, EventEmitter, Output, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSelectionListChange } from '@angular/material';
import { tap, takeUntil, filter, map } from 'rxjs/operators';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { HelperService } from 'app/shared/helpers';
import { Selection } from './models';

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
    @Input() availableOptions: Array<Selection> = [];
    // Untuk menyimpan jumlah option yang tersedia.
    // tslint:disable-next-line: no-inferrable-types
    @Input() totalAvailableOptions: number = 0;
    // Untuk menyimpan status loading pada available options.
    // tslint:disable-next-line: no-inferrable-types
    @Input() isAvailableOptionsLoading: boolean = false;
    // Event untuk ketika scroll pada available list telah mencapai paling bawah.
    // tslint:disable-next-line: no-inferrable-types
    @Output() availableReachedBottom: EventEmitter<void> = new EventEmitter<void>();

    // Untuk menyimpan daftar list yang dianggap sebagai nilai awal.
    @Input() initialSelectedOptions: Array<Selection> = [];
    // Untuk menyimpan daftar list yang terpilih.
    @Input() selectedOptions: Array<Selection> = [];
    // Untuk menyimpan jumlah option yang terpilih.
    // tslint:disable-next-line: no-inferrable-types
    @Input() totalSelectedOptions: number = 0;
    // Untuk menyimpan status loading pada selected options.
    // tslint:disable-next-line: no-inferrable-types
    @Input() isSelectedOptionsLoading: boolean = false;
    // Event untuk ketika scroll pada selected list telah mencapai paling bawah.
    // tslint:disable-next-line: no-inferrable-types
    @Output() selectedReachedBottom: EventEmitter<void> = new EventEmitter<void>();

    // Event untuk ketika melakukan search.
    @Output() search: EventEmitter<string> = new EventEmitter<string>();
    // Event untuk ketika salah satu list ada perubahan pemilihan (check-uncheck).
    @Output() selectionChanged: EventEmitter<Selection> = new EventEmitter<Selection>();
    // Event untuk ketika ada perubahan dan mengirim nilai list yang terpilih dan tidak terpilih.
    @Output() selectionListChanged: EventEmitter<
        { selected: Array<Selection>; unselected: Array<Selection> }
    > = new EventEmitter<
        { selected: Array<Selection>; unselected: Array<Selection> }
    >();
    // Event untuk ketika menekan "Clear All".
    @Output() clearAll: EventEmitter<void> = new EventEmitter<void>();

    // Untuk menangkap event yang terjadi saat meng-update list yang diklik.
    selectedOptionSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availableSelectionList', { static: false, read: ElementRef }) availableSelectionList: ElementRef;
    @ViewChild('selectedSelectionList', { static: false, read: ElementRef }) selectedSelectionList: ElementRef;

    constructor(
        private helper$: HelperService,
        private scroll: ScrollDispatcher,
    ) {
        this.selectedOptionSub$.pipe(
            tap(($event) => {
                const value = ($event.option.value as Selection);
                const isSelected = $event.option.selected;

                if (isSelected) {
                    this.selectedOptions.push(value);
                } else if (!isSelected) {
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
        // 'Mendengarkan' event scrolling dari CDK Scrollable.
        this.scroll.scrolled(500)
            .pipe(
                // Hanya mengambil dari element-nya available list dan selected list.
                filter(cdkScrollable => {
                    return this.availableSelectionList.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id
                        || this.selectedSelectionList.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id;
                }),
                // Mengubah nilai observable menjadi element-nya saja tanpa membawa status loading.
                map((cdkScrollable) => (cdkScrollable as CdkScrollable).getElementRef()),
                // Hanya diteruskan jika element sudah ter-scroll sampai bawah.
                filter((elementRef) => this.helper$.isElementScrolledToBottom(elementRef)),
                takeUntil(this.subs$)
            ).subscribe((elementRef: ElementRef<HTMLElement>) => {
                // Pemisahan tugas berdasarkan element yang ingin diperiksa.
                if (elementRef.nativeElement.id === this.availableSelectionList.nativeElement.id) {
                    // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                    elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop;

                    // Meluncurkan 'emit' untuk memberitahu bahwa available list telah mencapai dasarnya.
                    this.availableReachedBottom.emit();
                } else if (elementRef === this.selectedSelectionList.nativeElement.id) {
                    // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                    elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop;

                    // Meluncurkan 'emit' untuk memberitahu bahwa selection list telah mencapai dasarnya.
                    this.selectedReachedBottom.emit();
                }
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedOptionSub$.next();
        this.selectedOptionSub$.complete();
    }

}
