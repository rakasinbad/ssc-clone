import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, AfterViewInit, Input, EventEmitter, Output, ViewChildren, ElementRef, ViewChild, OnChanges, SimpleChanges, ChangeDetectorRef, QueryList } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { MatSelectionListChange, MatSelectionList, MatListOption } from '@angular/material';
import { tap, takeUntil, filter, map, debounceTime } from 'rxjs/operators';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import { HelperService } from 'app/shared/helpers';
import { Selection, SelectionList, SelectionState } from './models';
import { MultipleSelectionService } from './services/multiple-selection.service';
import { UniqueCollection } from 'app/shared/models/unique_collection.model';

@Component({
    selector: 'sinbad-multiple-selection',
    templateUrl: './multiple-selection.component.html',
    styleUrls: ['./multiple-selection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class MultipleSelectionComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    // Untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();
    // tslint:disable-next-line: no-inferrable-types
    allSelected: boolean = false;

    // tslint:disable-next-line: no-inferrable-types
    @Input() disableClearAll: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    @Input() enableSelectAll: boolean = false;
    // Untuk menyimpan daftar list options yang ingin di-disable.
    @Input() disabledOptions: Array<Selection> = [];
    // Untuk menyimpan daftar list options yang ingin diberi warning.
    @Input() warnedOptions: Array<Selection> = [];

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
    // Untuk menyimpan daftar option yang tersedia.
    // uniqueAvailableOptions: UniqueCollection<Selection> = new UniqueCollection<Selection>();
    // Untuk menyimpan daftar list yang terpilih.
    selectedOptions: UniqueCollection<Selection> = new UniqueCollection<Selection>();
    // Untuk menyimpan daftar list yang terhapus.
    removedOptions: UniqueCollection<Selection> = new UniqueCollection<Selection>();
    // Untuk menyimpan daftar list gabungan antara initial selected option dengan selected option.
    mergedSelectedOptions: UniqueCollection<Selection> = new UniqueCollection<Selection>();
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
    // Event untuk ketika salah satu list ada perubahan pemilihan (check-uncheck).
    @Output() selectionStateChanged: EventEmitter<SelectionState> = new EventEmitter<SelectionState>();
    // Event untuk ketika ada perubahan dan mengirim nilai list yang terpilih dan tidak terpilih.
    @Output() selectionListChanged: EventEmitter<SelectionList> = new EventEmitter<SelectionList>();
    // Event untuk ketika menekan "Clear All".
    @Output() clearAll: EventEmitter<void> = new EventEmitter<void>();
    // Event untuk ketika menekan informasi tambahan pada selection.
    @Output() clickInfo: EventEmitter<Selection> = new EventEmitter<Selection>();

    // Untuk menangkap event yang terjadi saat meng-update list yang diklik.
    selectedOptionSub$: Subject<MatSelectionListChange> = new Subject<MatSelectionListChange>();
    // Untuk menyimpan jumlah option yang terpilih.
    // tslint:disable-next-line: no-inferrable-types
    totalSelectedOptions: number = 0;

    @ViewChildren(CdkScrollable, { read: ElementRef }) scrollable: CdkScrollable;
    @ViewChild('availableSelectionList', { static: false, read: MatSelectionList }) availableSelection: MatSelectionList;
    @ViewChild('availableSelectionList', { static: false, read: ElementRef }) availableSelectionList: ElementRef;
    @ViewChild('selectedSelectionList', { static: false, read: MatSelectionList }) selectedSelection: MatSelectionList;
    @ViewChild('selectedSelectionList', { static: false, read: ElementRef }) selectedSelectionList: ElementRef;

    @ViewChildren('availableOption', { read: MatListOption }) availableOption: QueryList<MatListOption>;
    @ViewChildren('selectedOption', { read: MatListOption }) selectedOption: QueryList<MatListOption>;

    constructor(
        private helper$: HelperService,
        private scroll: ScrollDispatcher,
        private cdRef: ChangeDetectorRef,
        private multiple$: MultipleSelectionService,
    ) {}

    getWarn(value: Selection): string {
        if (this.warnedOptions.length > 0) {
            const warnedOption = (this.warnedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group)));
            
            if (warnedOption) {
                if (!warnedOption.tooltip) {
                    return '';
                }

                return warnedOption.tooltip;
            }

            return '';
        }

        return '';
    }
    
    hasWarn(value: Selection): boolean {
        return !!(this.warnedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group)));
    }

    isDisabled(value: Selection): boolean {
        return !!(this.disabledOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group)));
    }

    isAvailableAtSelection(value: Selection): boolean {
        return !!(this.mergedSelectedOptions.toArray().find(selected => String(selected.id + selected.group) === String(value.id + value.group)));
    }

    onClearAll(): void {
        this.clearAll.emit();
    }

    onSearch($event: string): void {
        this.search.emit($event);
    }

    onToggleSelectAll($event: MatSelectionListChange): void {
        const isSelected = $event.option.selected;
        const disabledIds = this.disabledOptions.map(disabledOption => disabledOption.id);

        if (isSelected) {
            this.allSelected = true;

            if (disabledIds.length === 0) {
                this.availableSelection.selectAll();

                for (const option of this.availableOption.toArray()) {
                    if (!option.selected && !option.disabled) {
                        option.toggle();
                    }
    
                    this.availableSelection.selectionChange.emit(
                        new MatSelectionListChange(this.availableSelection, option)
                    );
                }
            } else {
                for (const option of this.availableOption.toArray()) {
                    const optionId = (option.value as Selection).id;
    
                    if (disabledIds.includes(optionId)) {
                        continue;
                    }
    
                    if (!option.selected && !option.disabled) {
                        option.toggle();
                    }
    
                    this.availableSelection.selectionChange.emit(
                        new MatSelectionListChange(this.availableSelection, option)
                    );
                }
            }

            HelperService.debug('SELECTED => this.availableOption from ViewChildren', this.availableOption);
            // this.selectionChanged.emit({ id: 'all', group: 'all', label: 'all' });
        } else {
            this.allSelected = false;
            this.availableSelection.deselectAll();

            for (const option of this.selectedOption.toArray()) {
                if (option.selected) {
                    option.toggle();
                }

                this.selectedSelection.selectionChange.emit(
                    new MatSelectionListChange(this.selectedSelection, option)
                );
            }

            HelperService.debug('DESELECTED => this.selectedOption from ViewChildren', this.availableOption);
            // this.selectionChanged.emit({ id: null, group: null, label: null });
        }
    }

    onInformationClicked(value: Selection): void {
        this.clickInfo.emit(value);
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialSelectedOptions']) {
            // Menggabungkan opsi yang tergabung antara initial selected options dengan selected options.
            const initialOptions = changes['initialSelectedOptions'].currentValue.map(
                selected => String(selected.id + selected.group)
            );

            // const availableOptions =
            //    changes['availableOptions'] &&
            //    Array.isArray(changes['availableOptions'].currentValue) ? 
            //        changes['availableOptions'].currentValue :
            //        this.availableOptions || [];
            
            const removedOptions = this.removedOptions.toArray();
            
            // Membuang opsi yang terpilih agar tidak terduplikasi dengan initial selected options.
            this.selectedOptions.clearAllAndAddItems(
                this.selectedOptions.toArray().filter(
                    selected => !initialOptions.includes(String(selected.id + selected.group))
                )
            );

            this.mergedSelectedOptions.clearAllAndAddItems(
                changes['initialSelectedOptions'].currentValue.concat(
                    this.selectedOptions
                ).filter(merged =>
                    removedOptions.length === 0
                    ? true
                    : !removedOptions.map(remove => String(remove.id + remove.group)).includes(String(merged.id + merged.group))
                ).filter(merged =>
                    removedOptions.length === 0
                    ? true
                    : !removedOptions.map(remove => String(remove.id + remove.group)).includes(String(merged.id + merged.group))
                )
            );

            // Menghitung kembali jumlah opsi yang terpilih.
            // this.totalSelectedOptions = (this.totalInitialSelectedOptions - this.removedOptions.length) + this.selectedOptions.length;
            this.totalSelectedOptions = this.mergedSelectedOptions.size();

            this.totalInitialSelectedOptions = initialOptions.length;

            // this.uniqueAvailableOptions.clearAllAndAddItems(availableOptions);
            // this.totalAvailableOptions = this.uniqueAvailableOptions.length;
            
            // Mengirim emit event kembali untuk di-update hasil pilihannya.
            this.selectionListChanged.emit({
                added: Array.from(this.selectedOptions.toArray()),
                removed: Array.from(this.removedOptions.toArray()),
                merged: Array.from(this.mergedSelectedOptions.toArray()),
                isAllSelected: this.allSelected || this.mergedSelectedOptions.oldSize() === this.totalAvailableOptions,
            });

            // Mendeteksi adanya perubahan.
            this.cdRef.markForCheck();
        }

        if (changes['availableOptions']) {
            if (this.allSelected) {
                setTimeout(() => {
                    this.onToggleSelectAll({ option: { selected: true } } as MatSelectionListChange);
                }, 100);
            }
        }

        if (changes['isAvailableOptionsLoading'] || changes['isSelectedOptionsLoading']) {
            // Mendeteksi adanya perubahan.
            this.cdRef.markForCheck();
        }
    }

    ngAfterViewInit(): void {
        // 'Mendengarkan' event scrolling dari CDK Scrollable.
        this.scroll.scrolled(200)
            .pipe(
                // Hanya mengambil dari element-nya available list dan selected list.
                tap(cdkScrollable => HelperService.debug('MULTIPLE SELECTION SCROLLED', { cdkScrollable })),
                filter(cdkScrollable => {
                    return this.availableSelectionList.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id
                        || this.selectedSelectionList.nativeElement.id === (cdkScrollable as CdkScrollable).getElementRef().nativeElement.id;
                }),
                // Mengubah nilai observable menjadi element-nya saja tanpa membawa status loading.
                map((cdkScrollable) => (cdkScrollable as CdkScrollable).getElementRef()),
                tap(elementRef => HelperService.debug('GET MULTIPLE SELECTION ELEMENTREF', { elementRef })),
                // Hanya diteruskan jika element sudah ter-scroll sampai bawah.
                tap(elementRef => HelperService.debug('IS MULTIPLE SELECTION ELEMENTREF SCROLLED TO BOTTOM?', this.helper$.isElementScrolledToBottom(elementRef))),
                filter((elementRef) => this.helper$.isElementScrolledToBottom(elementRef)),
                tap(elementRef => HelperService.debug('IS MULTIPLE SELECTION IN LOADING STATE?', {
                    elementRef,
                    isAvailableOptionsLoading: this.isAvailableOptionsLoading,
                    isSelectedOptionsLoading: this.isSelectedOptionsLoading
                })),
                filter(elementRef => {
                    if (this.availableSelectionList.nativeElement.id === elementRef.nativeElement.id) {
                        return !this.isAvailableOptionsLoading;
                    } else {
                        return !this.isSelectedOptionsLoading;
                    }
                }),
                takeUntil(this.subs$)
            ).subscribe((elementRef: ElementRef<HTMLElement>) => {
                // Pemisahan tugas berdasarkan element yang ingin diperiksa.
                if (elementRef.nativeElement.id === this.availableSelectionList.nativeElement.id) {
                    // Memastikan tidak meng-emit event load more kembali ketika sudah tidak ada yang bisa dimuat lagi.
                    if (this.totalAvailableOptions > this.availableOptions.length) {
                        // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                        elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop - 40;
    
                        // Meluncurkan 'emit' untuk memberitahu bahwa available list telah mencapai dasarnya.
                        this.availableReachedBottom.emit();
                    }
                } else if (elementRef.nativeElement.id === this.selectedSelectionList.nativeElement.id) {
                    // Memastikan tidak meng-emit event load more kembali ketika sudah tidak ada yang bisa dimuat lagi.
                    if (this.totalInitialSelectedOptions > (this.mergedSelectedOptions.size() + this.removedOptions.size())) {
                        // Menetapkan posisi scroll agar tidak ikut ke bawah ketika ada penambahan di bawahnya.
                        elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop - 40;
    
                        // Meluncurkan 'emit' untuk memberitahu bahwa selection list telah mencapai dasarnya.
                        this.selectedReachedBottom.emit();
                    }
                }
            });

        this.multiple$.getMessage().pipe(
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'clear-all') {
                // this.mergedSelectedOptions = [];
                // this.selectedOptions = [];
                // this.initialSelectedOptions = [];
                // this.totalSelectedOptions = 0;
                // this.totalInitialSelectedOptions = 0;

                // this.selectedOptionSub$.next(null);
                this.onToggleSelectAll({ option: { selected: false } } as MatSelectionListChange);
                this.cdRef.markForCheck();
            }

            // untuk menjalan fungsi toggle select all dari luar component
            if (value === 'select-all') {
                this.onToggleSelectAll({ option: { selected: true } } as MatSelectionListChange);
                this.cdRef.markForCheck();
            }

            // untuk mengubah allSelected menjadi false dari luar component
            if (value === 'select-all-false') {
                this.allSelected = false;
                this.cdRef.markForCheck();
            }
        });

        this.selectedOptionSub$.pipe(
            // debounceTime(200),
            tap(($event) => {
                const mergedSelectedOptions = this.mergedSelectedOptions.toArray();
                const removedOptions = this.removedOptions.toArray();
                const selectedOptions = this.selectedOptions.toArray();

                if ($event) {
                    // Mengambil nilai dari option yang dipilih.
                    const value = ($event.option.value as Selection);

                    // Mengambil status pemilihannya (unchecked atau checked).
                    const isSelected = $event.option.selected;
    
                    const isAtInitialSelection = this.initialSelectedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group));

                    const isAtSelectedOptions = mergedSelectedOptions.find(selected => String(selected.id + selected.group) === String(value.id + value.group));

                    if (isAtSelectedOptions && isSelected) {
                        return;
                    }
                    if (isAtInitialSelection) {
                        if (isSelected) {
                            this.removedOptions.clearAllAndAddItems(
                                removedOptions.filter(selected => String(selected.id + selected.group) !== String(value.id + value.group))
                            );
                        } else {
                            this.removedOptions.add(value);
                        }
                    } else {
                        if (isSelected) {
                            this.selectedOptions.add(value);
                        } else {
                            this.selectedOptions.filter(value);
                            // this.selectedOptions.clearAllAndAddItems(
                            //     selectedOptions.filter(selected => String(selected.id + selected.group) !== String(value.id + value.group))
                            // );
                        }
                    }

                    // Mengirim event selectionChanged dengan membawa nilai option yang baru saya diklik.
                    this.selectionChanged.emit({ ...value, isSelected });

                    // Mengirim event selectionStateChanged dengan membawa nilai option yang baru saya diklik.
                    this.selectionStateChanged.emit({ checked: isSelected, data: value });
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
                // const added: Array<Selection> = this.selectedOptions;

                // Untuk menyimpan nilai selection yang terhapus dari initial selection.
                // const removed: Array<Selection> = this.initialSelectedOptions.filter(selected =>
                                                    // this.removedOptions.find(remove => String(selected.id + selected.group) !== String(remove.id + remove.group)));
                // const removed: Array<Selection> = this.removedOptions;

                // Untuk menyimpan initial selected options dengan selected options.
                this.mergedSelectedOptions.clearAllAndAddItems(
                    this.initialSelectedOptions.concat(
                        this.selectedOptions.toArray()
                    ).filter(merged =>
                        removedOptions.length === 0
                        ? true
                        : !removedOptions.map(remove => String(remove.id + remove.group)).includes(String(merged.id + merged.group))
                    )
                );

                // Mengirim event selectionListChanged dengan membawa nilai option-option yang tambahan baru dan terhapus.
                this.selectionListChanged.emit({ 
                    added: Array.from(this.selectedOptions.toArray()),
                    removed: Array.from(this.removedOptions.toArray()),
                    merged: Array.from(this.mergedSelectedOptions.toArray()),
                    isAllSelected: this.allSelected 
                });

                // Menetapkan jumlah selected options.
                // const addedLength = (this.selectedOptions.length);
                // const removedLength =  (removed.length);
                // this.totalSelectedOptions = (this.totalInitialSelectedOptions - removedLength) + addedLength;
                this.totalSelectedOptions = this.mergedSelectedOptions.size();
                // Mendeteksi adanya perubahan.
                this.cdRef.detectChanges();
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.cdRef.detach();

        this.subs$.next();
        this.subs$.complete();

        this.selectedOptionSub$.next();
        this.selectedOptionSub$.complete();
    }

}
