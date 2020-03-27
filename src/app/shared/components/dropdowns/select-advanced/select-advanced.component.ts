import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Subject, BehaviorSubject } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take } from 'rxjs/operators';
import { Selection } from './models';

import { SelectionModel } from '@angular/cdk/collections';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

let that: SelectAdvancedComponent;

@Component({
    selector: 'select-advanced',
    templateUrl: './select-advanced.component.html',
    styleUrls: ['./select-advanced.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class SelectAdvancedComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    // Form
    optionForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();
    // Subject untuk keperluan toggle selection.
    toggle$: Subject<Selection | string> = new Subject<Selection | string>();

    // Untuk menyimpan option yang terpilih.
    selection: SelectionModel<Selection> = new SelectionModel<Selection>(true, []);
    // Subject untuk mendeteksi adanya perubahan option yang terpilih.
    selectedOption$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
    // Untuk penanda apakah semuanya terpilih atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    allSelected: boolean = false;

    // Untuk menyimpan status required untuk input bersifat wajib atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() isRequired: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    // Untuk teks placeholder pada input.
    // tslint:disable-next-line: no-inferrable-types
    @Input() placeholder: string = 'Search';
    // Untuk memberitahu apakah select ini bisa multiple atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() isMultipleSelections: boolean = true;
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
    @Output() availableReachedBottom: EventEmitter<number> = new EventEmitter<number>();
    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<Selection | Array<Selection>> = new EventEmitter<Selection | Array<Selection>>();
    // Event untuk ketika melakukan search.
    @Output() search: EventEmitter<string> = new EventEmitter<string>();

    // Untuk keperluan AutoComplete-nya option
    @ViewChild('optionAutoComplete', { static: true }) optionAutoComplete: MatAutocomplete;
    @ViewChild('triggerOption', { static: true, read: MatAutocompleteTrigger }) triggerOption: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private cdRef: ChangeDetectorRef,
        private errorMessage$: ErrorMessageService,
    ) {
        that = this;

        this.selectedOption$.pipe(
            tap(x => HelperService.debug('SELECTED OPTION', x)),
            takeUntil(this.subs$)
        ).subscribe(options => {
            if (this.isMultipleSelections) {
                this.selected.emit(options);
            } else {
                if (options) {
                    this.selected.emit(options[0]);
                } else {
                    this.selected.emit(null);
                }
            }
        });

        this.toggle$.pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            if (this.allSelected) {
                this.selection.clear();
            } else {
                this.availableOptions.forEach(option => this.addSelection(option));
            }

            this.allSelected = !this.allSelected;
        });
    }

    private setValidator(): void {
        this.optionForm.setValidators(
            RxwebValidators.required({
                message: this.errorMessage$.getErrorMessageNonState(
                    'default',
                    'required'
                )
            })
        );
    }

    private initOption(): void {
        // Reset form-nya option.
        this.optionForm.enable();
        this.optionForm.reset();

        if (this.isRequired) {
            this.setValidator();
        }
    }

    getValue(option: Selection): string {
        return JSON.stringify(option);
    }

    isSelected(option: Selection): boolean {
        return this.selection.selected.findIndex(
            selected => this.getValue(selected) === this.getValue(option)
        ) >= 0;
    }

    addSelection(option: Selection): void {
        this.selection.select(option);
    }

    removeSelection(option: Selection): void {
        if (this.isSelected(option)) {
            const previousSelected = this.selection.selected;

            this.selection.clear();
            previousSelected.forEach(selected => this.getValue(selected) !== this.getValue(option) ? this.addSelection(selected) : null);
        }
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        return this.totalAvailableOptions === numSelected;
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

    toggleSelectedOption(option: Selection): void {
        if (this.isSelected(option)) {
            if (this.allSelected) {
                this.allSelected = !this.allSelected;
            }

            this.removeSelection(option);
        } else {
            this.addSelection(option);

            if (this.isAllSelected()) {
                this.allSelected = true;
            }
        }
    }

    displayOption(value: Selection): string {
        if (!that.isMultipleSelections) {
            if (value) {
                return value.label;
            } else {
                const selected = that.selectedOption$.value;

                if (selected) {
                    if (selected.length > 0) {
                        return selected[0].label;
                    } else {
                        // if (!that.optionAutoComplete.isOpen) {
                        //     that.optionForm.setValue('');
                        // }
                        return '';
                    }
                } else {
                    // if (!that.optionAutoComplete.isOpen) {
                    //     that.optionForm.setValue('');
                    // }
                    return '';
                }
            }
        }
        // if (!that.isMultipleSelections) {
            // const selected = that.selectedOption$.value;

            // if (selected.length > 0) {
            //     if (that.selected) {
            //         that.selectedOption$.next(selected);
            //     }

            //     setTimeout(() => {
            //         if (!(this as unknown as MatAutocomplete).isOpen) {
            //             return selected[0].label;
            //         } else {
            //             return '';
            //         }
            //     }, 100);
            // }   

            // if (!value) {
            //     return '';
            // }

            // return value.label;
        // } else {
            // if (!this.selection) {
            //     if (this.selected) {
            //         this.selected.emit({ id: null, label: null, group: null });
            //     }
    
            //     return '';
            // }
    
            // if (!this.selection.hasValue()) {
            //     if (this.selected) {
            //         this.selected.emit({ id: null, label: null, group: null });
            //     }
    
            //     return '';
            // }
    
            // this.selected.emit(value);
            // return this.selection.selected[0].label + String(this.selection.selected.length > 1 ? `(+${this.selection.selected.length - 1} others)` : '');
        // }
    }

    listenToAutocompletePanelClosing(): void {
        if (this.triggerOption) {
            this.triggerOption.panelClosingActions.pipe(
                tap(() => HelperService.debug('SELECT OPTION IS CLOSING ...')),
                take(1),
            ).subscribe({
                next: () => {},
                complete: () => {
                    HelperService.debug('this.triggerOption.panelClosingActions COMPLETED', {});

                    if (this.isMultipleSelections) {
                        if (!this.selection) {
                            this.optionForm.setValue('');
                            return;
                        }
                        
                        if (!this.selection.hasValue()) {
                            this.optionForm.setValue('');
                        } else {
                            const selectedFirst = this.selection.selected[0].label;
                            const selectedLength = this.selection.selected.length;
                            this.optionForm.setValue(selectedFirst + String(selectedLength > 1 ? ` (+${selectedLength - 1} ${selectedLength <= 1 ? 'other' : 'others'})` : ''));
                            // this.optionForm.setValue(this.optionForm.value + ' ');
                            // setTimeout(() =>
                        //     this.optionForm.setValue(selectedFirst + String(selectedLength > 1 ? ` (+${selectedLength - 1} ${selectedLength <= 1 ? 'other' : 'others'})` : ''))
                            // );
                        }
            
                        this.selectedOption$.next(this.selection.selected);
                    } else {
                        // const selected = this.selectedOption$.value;

                        // if (selected.length > 0) {
                        //     const selectedFirst = selected[0].label;
                        //     this.optionForm.setValue(selectedFirst);
                        //     this.selectedOption$.next(selected);
                        //     this.cdRef.detectChanges();
                        //     // setTimeout(() => {
                        //     //     this.optionForm.setValue(selectedFirst);
                        //     //     this.selectedOption$.next(selected);
                        //     //     this.cdRef.detectChanges();
                        //     // });
                        // }
                    }
                }
            });
        }
    }

    processOptionAutoComplete(): void {
        if (this.triggerOption && this.optionAutoComplete && this.optionAutoComplete.panel) {
            fromEvent<Event>(this.optionAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => HelperService.debug(`fromEvent<Event>(this.optionAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Debugging.
                    tap(() => HelperService.debug('SELECT OPTION IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(() =>
                        !this.isAvailableOptionsLoading
                        && (this.totalAvailableOptions > this.availableOptions.length)
                        && this.helper$.isElementScrolledToBottom(this.optionAutoComplete.panel)
                    ),
                    takeUntil(this.triggerOption.panelClosingActions)
                ).subscribe(() => {
                    this.availableReachedBottom.emit(this.availableOptions.length);
                });
        }
    }

    listenOptionAutoComplete(): void {
        this.optionForm.setValue('');
        setTimeout(() => {
            this.processOptionAutoComplete();
            this.listenToAutocompletePanelClosing();
        });
    }

    optionSelected(event: Event, value: string | Selection): void {
        event.stopPropagation();
        this.toggle$.next(value);
    }

    onOptionAutocompleteSelected(event: MatAutocompleteSelectedEvent): void {
        if (!this.isMultipleSelections) {
            const { value }: { value: Selection } = event.option;
            // this.triggerOption.closePanel();
            // this.optionAutoComplete.closed.emit();
            if (value) {
                this.selectedOption$.next([value]);
            } else {
                this.selectedOption$.next(null);
            }
        }
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initOption();

        // Menangani Form Control-nya option.
        (this.optionForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedOption$),
            filter(([formValue, selectedOption]) => {
                if (this.optionAutoComplete.isOpen) {
                    return true;
                }

                // if (selectedOption && formValue && !this.optionAutoComplete.isOpen) {
                //     return false;
                // }

                // if (selectedOption || (!formValue && !this.optionAutoComplete.isOpen)) {
                //     // this.selectedOption$.next(null);
                //     return false;
                // }

                // if (!formValue && selectedOption && !this.optionAutoComplete.isOpen) {
                //     this.optionForm.patchValue(selectedOption);
                //     return false;
                // }

                return false;
            }),
            tap<[string | Selection, Array<Selection>]>(([formValue, selectedOption]) => {
                HelperService.debug('OPTION FORM VALUE IS CHANGED', { formValue, selectedOption });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            if (typeof formValue === 'string') {
                this.search.emit(formValue);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['availableOptions']) {
            if (Array.isArray(changes['availableOptions'].previousValue)) {
                const previousSelected = this.selection.selected;

                this.selection.clear();

                for (const value of previousSelected) {
                    this.selection.select(value);
                }
            }

            HelperService.debug('CHANGES ON availableOptions:', changes['availableOptions']);
            this.cdRef.detectChanges();
        }

        if (changes['isRequired']) {
            this.optionForm.clearValidators();

            if (changes['isRequired'].currentValue === true) {
                this.setValidator();
            }

            this.optionForm.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.selectedOption$.next(null);
        this.selectedOption$.complete();
    }

    ngAfterViewInit(): void {
        // this.triggerOption.panelClosingActions.pipe(
        //     startWith([]),
        //     tap(() => HelperService.debug('SELECT OPTION IS CLOSING ...')),
        //     takeUntil(this.subs$)
        // ).subscribe(() => {
        //     if (that.isMultipleSelections) {
        //         if (!this.selection) {
        //             this.optionForm.setValue('');
        //             return;
        //         }
                
        //         if (!this.selection.hasValue()) {
        //             this.optionForm.setValue('');
        //         } else {
        //             const selectedFirst = this.selection.selected[0].label;
        //             const selectedLength = this.selection.selected.length;
        //             this.optionForm.setValue(this.optionForm.value + ' ');
        //             setTimeout(() =>
        //                 this.optionForm.setValue(selectedFirst + String(selectedLength > 1 ? ` (+${selectedLength - 1} ${selectedLength <= 1 ? 'other' : 'others'})` : ''))
        //             );
        //         }
    
        //         this.selectedOption$.next(this.selection.selected);
        //     } else {
        //         const selected = that.selectedOption$.value;

        //         if (selected.length > 0) {
        //             if (that.selected) {
        //                 const selectedFirst = that.selection.selected[0].label;
        //                 const selectedLength = that.selection.selected.length;
        //                 that.optionForm.setValue(that.optionForm.value + ' ');
        //                 setTimeout(() => {
        //                     that.optionForm.setValue(selectedFirst + String(selectedLength > 1 ? ` (+${selectedLength - 1} ${selectedLength <= 1 ? 'other' : 'others'})` : ''));
        //                     that.selectedOption$.next(selected);
        //                 });
        //             }
        //         }
        //     }
        // });
    }
}

