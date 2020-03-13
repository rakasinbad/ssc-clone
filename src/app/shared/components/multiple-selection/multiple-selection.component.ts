import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, Input, EventEmitter, Output, ViewChildren, ElementRef, ViewChild, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSelectionListChange } from '@angular/material';
import { tap, takeUntil, filter, map } from 'rxjs/operators';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { HelperService } from 'app/shared/helpers';
import { Selection, SelectionList } from './models';
import { MultipleSelectionService } from './services/multiple-selection.service';

@Component({
    selector: 'sinbad-multiple-selection',
    templateUrl: './multiple-selection.component.html',
    styleUrls: ['./multiple-selection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleSelectionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    // Untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk meletakkan judul di kolom available options.
    // tslint:disable-next-line: no-inferrable-types
    @Input() availableTitle: string;
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

    // Untuk meletakkan judul di kolom selected options.
    // tslint:disable-next-line: no-inferrable-types
    @Input() selectedTitle: string;
    // tslint:disable-next-line: no-inferrable-types
    @Input() totalInitialSelectedOptions: number = 0;
    // Untuk menyimpan daftar list yang dianggap sebagai nilai awal.
    @Input() initialSelectedOptions: Array<Selection> = [];
    // Untuk menyimpan daftar list yang terpilih.
    selectedOptions: Array<Selection> = [];
    // Untuk menyimpan daftar list yang terhapus.
    removedOptions: Array<Selection> = [];
    // Untuk menyimpan daftar list gabungan antara initial selected option dengan selected option.
    mergedSelectedOptions: Array<Selection> = [];
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
    @Output() selectionListChanged: EventEmitter<SelectionList> = new EventEmitter<SelectionList>();
    // Event untuk ketika menekan "Clear All".
    @Output() clearAll: EventEmitter<void> = new EventEmitter<void>();

    // Untuk menangkap event yang terjadi saat meng-update list yang diklik.
    selectedOptionSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();
    // Untuk menyimpan jumlah option yang terpilih.
    // tslint:disable-next-line: no-inferrable-types
    totalSelectedOptions: number = 0;

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availableSelectionList', { static: false, read: ElementRef }) availableSelectionList: ElementRef;
    @ViewChild('selectedSelectionList', { static: false, read: ElementRef }) selectedSelectionList: ElementRef;

    constructor(
        private helper$: HelperService,
        private scroll: ScrollDispatcher,
        private cdRef: ChangeDetectorRef,
        private multiple$: MultipleSelectionService,
    ) {}

    isAvailableAtSelection(value: Selection): boolean {
        return !!(this.mergedSelectedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group)));
    }

    onClearAll(): void {
        this.clearAll.emit();
    }

    onSearch($event: string): void {
        this.search.emit($event);
    }

    onToggleSelectAll($event: MatSelectionListChange): void {
        // const isSelected = $event.option.selected;
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialSelectedOptions']) {
            this.mergedSelectedOptions = this.initialSelectedOptions.concat(
                this.selectedOptions
            ).filter(merged =>
                this.removedOptions.length === 0
                ? true
                : !this.removedOptions.map(remove => String(remove.id + remove.group)).includes(String(merged.id + merged.group))
            );

            this.totalSelectedOptions = (this.totalInitialSelectedOptions - this.removedOptions.length) + this.selectedOptions.length;

            // Mendeteksi adanya perubahan.
            this.cdRef.markForCheck();
        }
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
                    // Memastikan tidak meng-emit event load more kembali ketika sudah tidak ada yang bisa dimuat lagi.
                    if (this.totalAvailableOptions > this.availableOptions.length) {
                        // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                        elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop;
    
                        // Meluncurkan 'emit' untuk memberitahu bahwa available list telah mencapai dasarnya.
                        this.availableReachedBottom.emit();
                    }
                } else if (elementRef.nativeElement.id === this.selectedSelectionList.nativeElement.id) {
                    // Memastikan tidak meng-emit event load more kembali ketika sudah tidak ada yang bisa dimuat lagi.
                    if (this.totalInitialSelectedOptions > (this.mergedSelectedOptions.length + this.removedOptions.length)) {
                        // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                        elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop;
    
                        // Meluncurkan 'emit' untuk memberitahu bahwa selection list telah mencapai dasarnya.
                        this.selectedReachedBottom.emit();
                    }
                }
            });

        this.multiple$.getMessage().pipe(
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'clear-all') {
                this.mergedSelectedOptions = [];
                this.selectedOptions = [];
                this.initialSelectedOptions = [];
                this.totalSelectedOptions = 0;

                this.cdRef.detectChanges();
            }
        });

        this.selectedOptionSub$.pipe(
            tap(($event) => {
                // Mengambil nilai dari option yang dipilih.
                const value = ($event.option.value as Selection);
                // Mengambil status pemilihannya (unchecked atau checked).
                const isSelected = $event.option.selected;

                const isAtInitialSelection = this.initialSelectedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group));

                if (isAtInitialSelection) {
                    if (isSelected) {
                        this.removedOptions = this.removedOptions.filter(selected => String(selected.id + selected.group) !== String(value.id + value.group));
                    } else {
                        this.removedOptions.push(value);
                    }
                } else {
                    if (isSelected) {
                        this.selectedOptions.push(value);
                    } else {
                        this.selectedOptions = this.selectedOptions.filter(selected => String(selected.id + selected.group) !== String(value.id + value.group));
                    }

                    
                }

                // Memeriksa apakah option berada di initial selection.
                // for (const option of this.mergedSelectedOptions) {
                //     const isAtInitialSelection = this.initialSelectedOptions
                //                                     .find(selected => String(selected.id + selected.group) === String(option.id + option.group));

                //     if (isAtInitialSelection) {
                //         if (!isSelected) {
                //             this.removedOptions.push(option);
                //         } else {
                //             this.removedOptions = this.removedOptions.filter(r => String(r.id + r.group) !== String(option.id + option.group));
                //         }
                //     } else {
                //         if (!isSelected) {
                //             if (String(option.id + option.group) === String(value.id + value.group)) {
                //                 this.selectedOptions = this.selectedOptions.filter(selected => String(option.id + option.group) !== String(selected.id + selected.group));
                //             }
                //         }
                //     }
                // }

                // Untuk menyimpan nilai selection yang terbaru (tidak tersedia di initial selection, namun ada di selected option).
                const added: Array<Selection> = this.selectedOptions;

                // Untuk menyimpan nilai selection yang terhapus dari initial selection.
                // const removed: Array<Selection> = this.initialSelectedOptions.filter(selected =>
                                                    // this.removedOptions.find(remove => String(selected.id + selected.group) !== String(remove.id + remove.group)));
                const removed: Array<Selection> = this.removedOptions;

                // Mengirim event selectionChanged dengan membawa nilai option yang baru saya diklik.
                this.selectionChanged.emit(value);

                // Mengirim event selectionListChanged dengan membawa nilai option-option yang tambahan baru dan terhapus.
                this.selectionListChanged.emit({ added, removed });

                // Untuk menyimpan initial selected options dengan selected options.
                this.mergedSelectedOptions = this.initialSelectedOptions.concat(
                                                this.selectedOptions
                                            ).filter(merged =>
                                                removed.length === 0
                                                ? true
                                                : !removed.map(remove => String(remove.id + remove.group)).includes(String(merged.id + merged.group))
                                            );

                // Menetapkan jumlah selected options.
                const addedLength = (this.selectedOptions.length);
                const removedLength =  (removed.length);
                this.totalSelectedOptions = (this.totalInitialSelectedOptions - removedLength) + addedLength;

                // Mendeteksi adanya perubahan.
                this.cdRef.markForCheck();
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedOptionSub$.next();
        this.selectedOptionSub$.complete();
    }

}
