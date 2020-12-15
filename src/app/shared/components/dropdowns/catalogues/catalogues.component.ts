import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, TemplateRef, ChangeDetectorRef, SimpleChanges, OnChanges, NgZone, HostListener } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService, ScrollService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatDialog } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap, map, exhaustMap } from 'rxjs/operators';
import { Catalogue as Entity } from './models';
import { CatalogueApiService as EntitiesApiService } from './services';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Selection } from '../select-advanced/models';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { MultipleSelectionComponent } from 'app/shared/components/multiple-selection/multiple-selection.component';
import { SelectionList } from 'app/shared/components/multiple-selection/models';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { MultipleSelectionService } from 'app/shared/components/multiple-selection/services/multiple-selection.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { HashTable } from 'app/shared/models/hashtable.model';

@Component({
    selector: 'select-catalogues',
    templateUrl: './catalogues.component.html',
    styleUrls: ['./catalogues.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CataloguesDropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    // Form
    entityForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan mat dialog ref.
    dialogRef$: Subject<string> = new Subject<string>();

    // Untuk menyimpan entities yang terpilih dan akan dikirim melalui event apply.
    selectedEntities: Array<Entity> = [];
    // Untuk menyimpan Entity yang belum ditransformasi untuk keperluan select advanced.
    rawAvailableEntities$: BehaviorSubject<Array<Entity>> = new BehaviorSubject<Array<Entity>>([]);
    // Untuk menyimpan Entity yang tersedia.
    availableEntities$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
    // Subject untuk mendeteksi adanya perubahan Entity yang terpilih.
    selectedEntity$: BehaviorSubject<Array<Entity>> = new BehaviorSubject<Array<Entity>>(null);
    // Menyimpan state loading-nya Entity.
    isEntityLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalEntities$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    // Untuk keperluan handle dialog.
    dialog: ApplyDialogService<MultipleSelectionComponent>;
    // UNtuk keperluan limit entity.
    // tslint:disable-next-line: no-inferrable-types
    limit: number = 15;
    // Untuk menyimpan search.
    // tslint:disable-next-line: no-inferrable-types
    search: string = '';
    // Untuk menampung nilai-nilai yang sudah muncul di available selection.
    cachedEntities: HashTable<Entity> = {};

    // Untuk keperluan form field.
    // tslint:disable-next-line: no-inferrable-types
    removing: boolean = false;
    tempEntity: Array<Selection> = [];
    @Input() initialSelection: Array<Selection> = [];
    entityFormView: FormControl = new FormControl();
    entityFormValue: FormControl = new FormControl();

    // Untuk menandai apakah pilihannya required atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() required: boolean = false;
    // Untuk menandai apakah form ini di-nonaktifkan atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() disabled: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    @Input() placeholder: string = 'Choose SKU';
    // tslint:disable-next-line: no-inferrable-types no-input-rename
    @Input('mode') mode: 'single' | 'multi' = 'multi';
    // Untuk memberitahu kepada component bahwa ada override untuk apply dan close dialog.
    // tslint:disable-next-line: no-inferrable-types
    @Input() handleEventManually: boolean = false;
    // Untuk mencari catalogue berdasarkan nama Invoice Group-nya.
    @Input() invoiceGroupName: string;
    // Untuk mengirim pesan error ke form.
    @Input() errorMessage: string;
    // Untuk menyimpan catalogues yang opsinya ingin di-disable. (tidak bisa dipilih)
    @Input() disabledCatalogues: Array<Selection> = [];


    @Input() typeCatalogue: string = '';
    @Input() fakturIdSelect: string = '';
    @Input() segmentationSelectId: string = '';

    // Untuk mengirim data berupa catalogue yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Array<Entity>>> = new EventEmitter<TNullable<Array<Entity>>>();
    // Untuk mengirim data berupa catalogue yang telah terpilih melalui tombol Apply. (hanya terkirim jika handleEventManually = true)
    @Output() applied: EventEmitter<Array<Entity>> = new EventEmitter<Array<Entity>>();
    // Untuk event ketika menekan close pada dialog. (Dialog tidak tertutup otomatis jika handleEventManually = true)
    @Output() closed: EventEmitter<void> = new EventEmitter<void>();

    // Untuk keperluan AutoComplete
    @ViewChild('entityAutocomplete', { static: false }) entityAutoComplete: MatAutocomplete;
    @ViewChild('triggerEntity', { static: false, read: MatAutocompleteTrigger }) triggerEntity: MatAutocompleteTrigger;
    // @ViewChild('dropdown', { static: false }) dropdown: MatSelect;
    @ViewChild('selectStoreType', { static: false }) selectStoreType: TemplateRef<MultipleSelectionComponent>;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private entityApi$: EntitiesApiService,
        private applyDialogFactory$: ApplyDialogFactoryService<MultipleSelectionComponent>,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private notice$: NoticeService,
        private multiple$: MultipleSelectionService,
        private ngZone: NgZone,
        private scroll$: ScrollService
    ) {
        this.availableEntities$.pipe(
            tap(x => HelperService.debug('AVAILABLE ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedEntity$.pipe(
            tap(x => HelperService.debug('SELECTED ENTITY', x)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (this.mode === 'multi') {
                this.selected.emit(value);
            } else {
                this.selected.emit(value ? (value[0] as unknown as Array<Entity>) : null);
            }
        });

        this.isEntityLoading$.pipe(
            tap(x => HelperService.debug('IS ENTITY LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalEntities$.pipe(
            tap(x => HelperService.debug('TOTAL ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        // Melakukan observe terhadap dialogRef$ untuk menangani dialog ref.
        this.dialogRef$.pipe(
            exhaustMap(subjectValue => {
                // tslint:disable-next-line: no-inferrable-types
                let dialogTitle: string = '';
                // tslint:disable-next-line: no-inferrable-types
                let dialogMessage: string = '';

                if (subjectValue === 'clear-all') {
                    dialogTitle = 'Clear Selected Options';
                    dialogMessage = 'It will clear all your selected options. Are you sure?';
                }

                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: dialogTitle,
                        message: dialogMessage,
                        id: subjectValue
                    }, disableClose: true
                });
        
                return dialogRef.afterClosed().pipe(
                    tap(value => {
                        if (value === 'clear-all') {
                            this.tempEntity = [];
                            this.entityFormValue.setValue([]);

                            this.multiple$.clearAllSelectedOptions();

                            this.notice$.open('Your selected options has been cleared.', 'success', {
                                horizontalPosition: 'right',
                                verticalPosition: 'bottom',
                                duration: 5000
                            });

                            this.cdRef.markForCheck();
                        }
                    })
                );
            }),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                this.isEntityLoading$.next(loading);
            });
        }

        this.cdRef.markForCheck();
    }

    private requestEntity(params: IQueryParams): void {
        this.toggleLoading(true);

        of(null).pipe(
            // tap(x => HelperService.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
                // Membentuk query baru.
                const newQuery: IQueryParams = { ... params };

                if (this.typeCatalogue == 'crossSelling' && this.fakturIdSelect != null) {
                    // Jika user tidak ada data supplier.
                    if (!userSupplier) {
                        throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                    }

                    // Mengambil ID supplier-nya.
                    const { supplierId } = userSupplier;

                    // Memasukkan ID supplier ke dalam params baru.
                    newQuery['supplierId'] = supplierId;
                    newQuery['fakturId'] = this.fakturIdSelect;
                    newQuery['catalogueSegmentationId'] = this.segmentationSelectId;
                    newQuery['segment']= 'catalogue';
                    // Melakukan request data segment catalogue.
                    return this.entityApi$
                    .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY', { params: newQuery, response })),
                    );
                } else {
                // Memeriksa keberadaan input value dari invoiceGroupName.
                if (this.invoiceGroupName) {
                    // Memberi flag bahwa ID supplier tidak diwajibkan.
                    // Jika tidak dikasih flag, maka service akan mengembalikan nilai error.
                    newQuery['noSupplierId'] = true;
                    // Memasukkan nama faktur ke dalam params baru.
                    newQuery['fakturName'] = this.invoiceGroupName;
                } else {
                    // Jika user tidak ada data supplier.
                    if (!userSupplier) {
                        throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                    }

                    // Mengambil ID supplier-nya.
                    const { supplierId } = userSupplier;
    
                    // Memasukkan ID supplier ke dalam params baru.
                    newQuery['supplierId'] = supplierId;
                }

                // Melakukan request data warehouse.
                return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY', { params: newQuery, response })),
                    );
                }

            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                let addedAvailableEntities: Array<Selection> = [];
                let addedRawAvailableEntities: Array<Entity> = [];

                // Menetampan nilai available entities yang akan ditambahkan.
                if (Array.isArray(response)) {
                    addedRawAvailableEntities = response;
                    addedAvailableEntities = (response as Array<Entity>).map(d => ({ id: d.id, label: d.name, group: 'catalogues' }));

                    for (const entity of (response as Array<Entity>)) {
                        this.upsertEntity(entity);
                    }
                } else {
                    addedRawAvailableEntities = response.data;
                    addedAvailableEntities = (response.data as Array<Entity>).map(d => ({ id: d.id, label: d.name, group: 'catalogues' }));
                    for (const entity of (response.data as Array<Entity>)) {
                        this.upsertEntity(entity);
                    }
                }

                // Mengambil nilai dari subject sebelumnya.
                const oldAvailableEntities = this.availableEntities$.value || [];
                const oldRawAvailableEntities = this.rawAvailableEntities$.value || [];

                // Menyimpan nilai subject yang baru, gabungan antara nilai yang lama dengan nilai yang baru.
                const newRawAvailableEntities = oldRawAvailableEntities.concat(addedRawAvailableEntities);
                const newAvailableEntities = oldAvailableEntities.concat(addedAvailableEntities);

                this.ngZone.run(() => {
                    // Menyimpan nilai yang baru tadi ke dalam subject.
                    this.rawAvailableEntities$.next(newRawAvailableEntities);
                    this.availableEntities$.next(newAvailableEntities);
    
                    // Menyimpan total entities yang baru.
                    if (Array.isArray(response)) {
                        this.totalEntities$.next((response as Array<Entity>).length);
                    } else {
                        this.totalEntities$.next(response.total);
                    }
                });

                this.cdRef.markForCheck();
            },
            error: (err) => {
                this.toggleLoading(false);
                HelperService.debug('ERROR FIND ENTITY', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                if (this.mode === 'single') {
                    if (this.initialSelection) {
                        this.entityForm.setValue((this.initialSelection as unknown as Selection));
                    }
                }
                
                this.toggleLoading(false);
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }
// 
    private initEntity(): void {
        // Menyiapkan query untuk pencarian store entity.
        const params: IQueryParams = {
            paginate: true,
            limit: this.limit,
            skip: 0
        };

        this.availableEntities$.next([]);
        this.rawAvailableEntities$.next([]);

        // Reset form-nya store entity.
        if (!this.disabled) {
            this.entityForm.enable();
        }
        this.entityForm.reset();

        // Memulai request data store entity.
        this.requestEntity(params);
    }

    private upsertEntity(entity: Entity): void {
        this.cachedEntities[String(entity.id)] = entity;
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
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

    showLabel(selected: TNullable<Selection>): string {
        if (selected) {
            return selected.label;
        } else {
            return '';
        }
    }

    onOpenedChangeEntity(isOpened: boolean): void {
        if (!isOpened) {
            const value = this.entityForm.value;

            if (value) {
                const rawEntities = this.rawAvailableEntities$.value;
                this.selectedEntity$.next(rawEntities.filter(raw => String(raw.id) === String(value)));
            } else {
                this.selectedEntity$.next(null);
            }
        }
    }

    onSelectedEntity(event: Array<Selection>): void {
        // Mengirim nilai tersebut melalui subject.
        if (event) {
            let value: string | Array<string> = null;
            const rawEntities = this.rawAvailableEntities$.value;

            if (event['option'] && event['source']) {
                if (event['option']['value']) {
                    value = event['option']['value']['id'];
                }

                this.selectedEntity$.next(rawEntities.filter(raw => String(raw.id) === String(value)));
            } else {
                const eventIds = event.map(e => e.id);
                this.selectedEntity$.next(eventIds.map(eventId => this.cachedEntities[String(eventId)]));
            }
        }
    }

    onEntitySearch(value: string): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                this.availableEntities$.next([]);
                this.rawAvailableEntities$.next([]);

                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: this.limit,
                    skip: 0
                };
        
                this.search = value;
                queryParams['keyword'] = value;
        
                this.requestEntity(queryParams);
            });
        }
    }

    onEntityReachedBottom(): void {
        const entities = this.availableEntities$.value || [];
        const entitiesLength = entities.length;

        const params: IQueryParams = {
            paginate: true,
            limit: this.limit,
            skip: entitiesLength
        };

        if (this.search) {
            params['keyword'] = this.search;
        }

        // Memulai request data store entity.
        this.requestEntity(params);
    }

    onSelectionChanged($event: SelectionList): void {
        const { added, removed, merged = this.entityFormValue.value } = $event;
        this.tempEntity = merged;
        this.removing = removed.length > 0;
        HelperService.debug('SELECTION CHANGED', $event);

        this.selectedEntities = added as unknown as Array<Entity>;
        this.cdRef.markForCheck();
    }

    openCatalogueSelection(): void {
        if (!this.disabled) {
            let selected = this.entityFormValue.value;
    
            if (!Array.isArray(selected)) {
                selected = [];
                this.entityFormValue.setValue(selected);
            }
    
            this.tempEntity = selected;
            this.initialSelection = selected;
            
            this.dialog = this.applyDialogFactory$.open({
                title: 'Select SKU',
                template: this.selectStoreType,
                isApplyEnabled: true,
                handleEventManually: this.handleEventManually
            }, {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            });

            if (this.handleEventManually) {
                this.dialog.onApply().pipe(
                    takeUntil(this.dialog.closed$)
                ).subscribe(() => {
                    const selectedValues = this.selectedEntities;

                    if (this.entityFormValue.value) {
                        selectedValues.push(...this.entityFormValue.value);
                    }

                    this.applied.emit(selectedValues);
                });

                this.dialog.onClose().pipe(
                    takeUntil(this.dialog.closed$)
                ).subscribe(() => {
                    this.closed.emit();
                });
            }

            this.dialog.opened$.subscribe({
                next: () => {
                    this.initEntity();
                }
            });

            this.dialog.closed$.subscribe({
                next: (value: TNullable<string>) => {
                    HelperService.debug('DIALOG SELECTION CLOSED', value);

                    let selection;
                    if (!!value) {
                        if (!this.removing) {
                            if (Array.isArray(this.tempEntity)) {
                                if (this.tempEntity.length > 0) {
                                    selection = this.tempEntity;
                                } else {
                                    selection = [];
                                }
                            } else {
                                selection = (this.entityFormValue.value as Array<Selection>);
                            }
                        } else {
                            selection = this.tempEntity;
                        }
                    } else {
                        selection = (this.entityFormValue.value as Array<Selection>);
                    }
    
                    if (selection.length === 0) {
                        this.entityFormView.setValue('');
                        this.entityFormValue.setValue([]);
                    } else {
                        // const firstselection = selection[0].label;
                        // const remainLength = selection.length - 1;
                        // const viewValue = (firstselection + String(remainLength > 0 ? ` (+${remainLength} ${remainLength === 1 ? 'other' : 'others'})` : ''));
    
                        this.entityFormValue.setValue(selection);
                        this.updateFormView();
                        // this.entityFormView.setValue(viewValue);
                    }
    
                    this.onSelectedEntity(this.entityFormValue.value);
                    this.cdRef.markForCheck();
                },
                complete: () => {
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                }
            });
        }
    }

    onClearAll(): void {
        this.dialogRef$.next('clear-all');
    }

    processEntityAutoComplete(): void {
        if (this.triggerEntity && this.entityAutoComplete && this.entityAutoComplete.panel) {
            // fromEvent<Event>(window, 'wheel').pipe(
            //     // Debugging.
            //     tap(event => HelperService.debug(`fromEvent<Event>(window, 'wheel')`, { event })),
            //     // Kasih jeda ketika scrolling.
            //     debounceTime(100),
            //     takeUntil(this.triggerEntity.panelClosingActions.pipe(
            //         tap((x) => HelperService.debug('SELECT ENTITY IS CLOSING ...', x))
            //     ))
            // ).subscribe(() => {
            //     this.triggerEntity.updatePosition();
            // });
            this.scroll$.getUpdatePosition().pipe(
                takeUntil(this.triggerEntity.panelClosingActions.pipe(
                    tap((x) => HelperService.debug('SELECT ENTITY IS CLOSING ...', x))
                ))
            ).subscribe(() => {
                this.triggerEntity.updatePosition();
            });

            fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(event => HelperService.debug(`fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')`, { event })),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store entity yang tersedia, jumlah store entity dan state loading-nya store entity dari subject.
                    withLatestFrom(this.availableEntities$, this.totalEntities$, this.isEntityLoading$,
                        ($event, entities, totalEntities, isLoading) => ({ $event, entities, totalEntities, isLoading }),
                    ),
                    // Debugging.
                    tap(({ $event, entities, isLoading, totalEntities }) => HelperService.debug('SELECT ENTITY IS SCROLLING...', { $event, entities, isLoading, totalEntities })),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, entities, totalEntities }) =>
                        !isLoading && (totalEntities > entities.length) && this.helper$.isElementScrolledToBottom(this.entityAutoComplete.panel)
                    ),
                    takeUntil(this.triggerEntity.panelClosingActions.pipe(
                        tap((x) => HelperService.debug('SELECT ENTITY IS CLOSING ...', x))
                    ))
                ).subscribe(({ entities }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: this.limit,
                        skip: entities.length
                    };

                    params['keyword'] = this.search || '';

                    // Memulai request data store entity.
                    this.requestEntity(params);
                });
        }
    }

    listenEntityAutoComplete(): void {
        // this.triggerEntity.autocomplete = this.entityAutoComplete;
        setTimeout(() => {
            this.processEntityAutoComplete();
        });
    }

    private initForm(): void {
        // this.entityFormView = new FormControl('');
        // this.entityFormValue = new FormControl('');
        this.entityFormValue.valueChanges.pipe(
            tap(value => HelperService.debug('entityFormValue value changed', value)),
            takeUntil(this.subs$)
        ).subscribe();

        if (this.required) {
            this.entityFormView.setValidators(RxwebValidators.required());
            this.entityForm.setValidators(RxwebValidators.required());
        }
    }

    private updateFormView(): void {
        setTimeout(() => {
            const formValue: Array<Selection> = this.entityFormValue.value;
            
            if (formValue.length === 0) {
                this.entityFormView.setValue('');
            } else {
                const firstselection = formValue[0].label;
                const remainLength = formValue.length - 1;
                const viewValue = (firstselection + String(remainLength > 0 ? ` (+${remainLength} ${remainLength === 1 ? 'other' : 'others'})` : ''));
        
                this.entityFormView.setValue(viewValue);
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
        
        // Menangani Form Control-nya warehouse.
        // (this.entityForm.valueChanges).pipe(
        //     startWith(''),
        //     debounceTime(200),
        //     distinctUntilChanged(),
        //     withLatestFrom(this.selectedEntity$),
        //     filter(([formValue, selectedEntity]) => {
        //         if (selectedEntity && formValue && !this.entityAutoComplete.isOpen) {
        //             return false;
        //         }
                
        //         if (selectedEntity || (!formValue && !this.entityAutoComplete.isOpen)) {
        //             this.selectedEntity$.next(null);
        //             return false;
        //         }

        //         if (!formValue && selectedEntity && !this.entityAutoComplete.isOpen) {
        //             this.entityForm.patchValue(selectedEntity);
        //             return false;
        //         }

        //         return true;
        //     }),
        //     tap<[string | Entity, TNullable<Entity>]>(([formValue, selectedEntity]) => {
        //         HelperService.debug('ENTITY FORM VALUE IS CHANGED', { formValue, selectedEntity });
        //     }),
        //     takeUntil(this.subs$)
        // ).subscribe(([formValue]) => {
        //     const queryParams: IQueryParams = {
        //         paginate: true,
        //         limit: this.limit,
        //         skip: 0
        //     };

        //     queryParams['keyword'] = formValue;

        //     this.requestEntity(queryParams);
        // });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['invoiceGroupName']) {
            this.availableEntities$.next([]);
            this.rawAvailableEntities$.next([]);

            const params: IQueryParams = {
                paginate: true,
                limit: this.limit,
                skip: 0,
            };

            this.requestEntity(params);
        }

        if (this.typeCatalogue == 'crossSelling' && this.fakturIdSelect != null) {
            this.availableEntities$.next([]);
            this.rawAvailableEntities$.next([]);
            this.entityFormValue.setValue([]);

            const params: IQueryParams = {
                paginate: true,
                limit: this.limit,
                skip: 0,
            };

            params['fakturId'] = this.fakturIdSelect;
            params['catalogueSegmentationId'] = this.segmentationSelectId;

            this.requestEntity(params);
        }

        if (changes['disabledCatalogues']) {
            const values = changes['disabledCatalogues'].currentValue;

            if (!Array.isArray(values)) {
                this.disabledCatalogues = [];
            }
        }

        if (changes['errorMessage']) {
            if (changes['errorMessage'].currentValue) {
                const error = changes['errorMessage'].currentValue;

                this.entityForm.setErrors({ custom: { message: error } });
                this.entityFormView.setErrors({ custom: { message: error } });
            } else {
                this.entityForm.setErrors(null);
                this.entityFormView.setErrors(null);
            }
        }

        if (changes['mode']) {
            if (changes['mode'].currentValue === 'single') {
                this.initEntity();
            }
        }

        if (changes['required']) {
            if (changes['required'].isFirstChange()) {
                this.entityFormView.clearValidators();
                this.entityFormValue.clearValidators();
                this.entityForm.clearValidators();
    
                if (changes['required'].currentValue === true) {
                    if (this.mode === 'multi') {
                        this.entityFormView.setValidators(RxwebValidators.required());
                    } else {
                        this.entityForm.setValidators(RxwebValidators.required());
                    }
                }
            }
        }

        if (changes['disabled']) {
            if (changes['disabled'].currentValue === true) {
                if (this.mode === 'multi') {
                    this.entityFormView.disable();
                } else if (this.mode === 'single') {
                    this.entityForm.disable();
                }
            } else {
                if (this.mode === 'multi') {
                    this.entityFormView.enable();
                } else if (this.mode === 'single') {
                    this.entityForm.enable();
                }
            }
        }

        if (changes['initialSelection']) {
            if (this.mode === 'multi') {
                this.entityFormValue.setValue(changes['initialSelection'].currentValue);
                this.updateFormView();
            } else if (this.mode === 'single') {
                // if (changes['initialSelection'].currentValue) {
                // if (this.entityAutoComplete.opened) {
                //     this.entityForm.setValue((changes['initialSelection'].currentValue as Selection).id);
                // }
                // }
                if (changes['initialSelection'].currentValue) {
                    this.entityForm.setValue((changes['initialSelection'].currentValue as Selection));
                    // this.entityFormView.setValue((changes['initialSelection'].currentValue as Selection).label);
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.cdRef.detach();

        this.subs$.next();
        this.subs$.complete();

        this.dialogRef$.next();
        this.dialogRef$.complete();

        this.totalEntities$.next(null);
        this.totalEntities$.complete();

        this.selectedEntity$.next(null);
        this.selectedEntity$.complete();

        this.isEntityLoading$.next(null);
        this.isEntityLoading$.complete();

        this.availableEntities$.next(null);
        this.availableEntities$.complete();
    }

    ngAfterViewInit(): void {
        this.entityForm.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(500),
            tap(x => HelperService.debug('ENTITY FORM CHANGED', x)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (typeof value === 'string') {
                if (this.entityAutoComplete) {
                    if (this.entityAutoComplete.panel) {
                        this.onEntitySearch(value);
                    }
                }
            }
            // if (value) {
            //     const rawEntities = this.rawAvailableEntities$.value;
            //     this.selectedEntity$.next(rawEntities.filter(raw => String(raw.id) === String(value)));
            // } else {
            //     this.selectedEntity$.next(null);
            // }
        });

        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        if (this.mode === 'single') {
            this.initEntity();
        }

        // if (this.dropdown) {
        //     if (this.dropdown.panel) {
        //         const panel = this.dropdown.panel.nativeElement;
        //         fromEvent<Event>(panel, 'scroll').pipe(
        //             // Debugging.
        //             tap(event => HelperService.debug(`fromEvent<Event>(panel, 'scroll')`, { event })),
        //             // Kasih jeda ketika scrolling.
        //             debounceTime(100),
        //             takeUntil(this.subs$)
        //         ).subscribe(() => {
        //             // this.triggerEntity.updatePosition();
        //         });
        //     }
        // }
    }
}

