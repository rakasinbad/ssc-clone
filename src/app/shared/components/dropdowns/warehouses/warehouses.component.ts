import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, TemplateRef, ChangeDetectorRef, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap, map, exhaustMap } from 'rxjs/operators';
import { Warehouse as Entity } from './models';
import { WarehousesApiService as EntitiesApiService } from './services';
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
import { WarehouseCatalogue } from 'app/main/pages/logistics/sku-assignments/models/warehouse-catalogue.model';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { HashTable } from 'app/shared/models/hashtable.model';

@Component({
    selector: 'select-warehouses',
    templateUrl: './warehouses.component.html',
    styleUrls: ['./warehouses.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class WarehouseDropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    // Form
    entityForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan mat dialog ref.
    dialogRef$: Subject<string> = new Subject<string>();

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
    // tslint:disable-next-line: no-inferrable-types no-input-rename
    @Input('placeholder') placeholder: string = 'Search Warehouse';

    @Input() typePromo: string = '';
    @Input() catalogueIdSelect: string;
    @Input() brandIdSelect: string = '';
    @Input() fakturIdSelect: string = '';
    @Input() segmentBases: string = '';
    @Input() typeTrigger: string = '';

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Array<Entity>>> = new EventEmitter<TNullable<Array<Entity>>>();

    @Output() valueSelectAll = new EventEmitter<any>();
    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('entityAutoComplete', { static: true }) entityAutoComplete: MatAutocomplete;
    @ViewChild('triggerEntity', { static: true, read: MatAutocompleteTrigger }) triggerEntity: MatAutocompleteTrigger;
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
    ) {
        this.availableEntities$.pipe(
            tap(x => HelperService.debug('AVAILABLE ENTITIES warehouse promo ->', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedEntity$.pipe(
            tap(x => HelperService.debug('SELECTED ENTITY warehouse promo->', x)),
            takeUntil(this.subs$)
        ).subscribe(value => this.selected.emit(value));

        this.isEntityLoading$.pipe(
            tap(x => HelperService.debug('IS ENTITY LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalEntities$.pipe(
            tap(x => HelperService.debug('TOTAL ENTITIES warehouse promo ->', x)),
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
            tap(x => HelperService.debug('GET USER SUPPLIER FROM STATE warehouse promo ->', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
                // Jika user tidak ada data supplier.
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                // Mengambil ID supplier-nya.
                const { supplierId } = userSupplier;

                // Membentuk query baru.
                const newQuery: IQueryParams = { ... params };
                
                // Memasukkan ID supplier ke dalam params baru.
                newQuery['supplierId'] = supplierId;
                newQuery['segment'] = 'warehouse'
                // console.log('isi segmentBases req ent->', this.segmentBases)
                // console.log('this.catalogueIdSelect->', this.catalogueIdSelect)
                // console.log('this.fakturIdSelect->', this.fakturIdSelect)
                // console.log('this.brandIdSelect->', this.brandIdSelect)
                if (this.segmentBases == 'all') {
                    if (this.typePromo == 'flexiCombo') {   
                        if (this.typeTrigger == 'sku') {
                            if (this.typeTrigger == 'sku') {
                                newQuery['catalogueId'] = this.catalogueIdSelect;
                                // Melakukan request data warehouse.
                                return this.entityApi$
                                .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                                .pipe(
                                    tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                                );
                            } else {}
                            
                        } else if (this.typeTrigger == 'brand') {
                            if (this.brandIdSelect !== undefined) {
                                newQuery['brandId'] = this.brandIdSelect;
                                // Melakukan request data warehouse.
                                return this.entityApi$
                                .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                                .pipe(
                                    tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                                );
                            } else {}
                            
                        } else if (this.typeTrigger == 'faktur' && this.fakturIdSelect !== undefined) {
                            newQuery['fakturId'] = this.fakturIdSelect;
                             // Melakukan request data warehouse.
                             return this.entityApi$
                             .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                             .pipe(
                                 tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                             );
                        } else {

                        }
                            
                    }
                } else {
                    if(this.typePromo != 'flexiCombo') {
                    // Melakukan request data warehouse.
                    return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(response => HelperService.debug('FIND ENTITY other', { params: newQuery, response })),
                    );
                    }
                }
                
            }),
            // take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.valueSelectAll.emit(response);
                let addedAvailableEntities: Array<Selection> = [];
                let addedRawAvailableEntities: Array<Entity> = [];

                // Menetampan nilai available entities yang akan ditambahkan.
                if (Array.isArray(response)) {
                    addedRawAvailableEntities = response;
                    if (this.typePromo == 'flexiCombo') {
                    addedAvailableEntities = (response as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
                    } else {
                    addedAvailableEntities = (response as Array<Entity>).map(d => ({ id: d.id, label: d.name, group: 'warehouses' }));
                    }

                    for (const entity of (response as Array<Entity>)) {
                        this.upsertEntity(entity);
                    }
                } else {
                    addedRawAvailableEntities = response.data;
                    if (this.typePromo == 'flexiCombo') {
                        addedAvailableEntities = (response.data as Array<Entity>).map(d => ({ id: d.warehouseId, label: d.warehouseName, group: 'warehouses' }));
                    } else {
                        addedAvailableEntities = (response.data as Array<Entity>).map(d => ({ id: d.id, label: d.name, group: 'warehouses' }));
                    }

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
            // error: (err) => {
            //     this.toggleLoading(false);
            //     HelperService.debug('ERROR FIND ENTITY', { params, error: err }),
            //     this.helper$.showErrorNotification(new ErrorHandler(err));
            // },
            complete: () => {
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

    onSelectedEntity(event: Array<Selection>): void {
        // Mengirim nilai tersebut melalui subject.
        if (event) {
            const eventIds = event.map(e => e.id);
            // const rawEntities = this.rawAvailableEntities$.value;
            this.selectedEntity$.next(eventIds.map(eventId => this.cachedEntities[String(eventId)]));
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
                queryParams['search'] = [
                    {
                        fieldName: 'name',
                        keyword: value
                    }
                ];
        
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
        const { removed, merged = this.entityFormValue.value } = $event;
        this.tempEntity = merged;
        this.removing = removed.length > 0;
        HelperService.debug('SELECTION CHANGED', $event);

        this.cdRef.markForCheck();
    }

    openEntitySelection(): void {
        if (!this.disabled) {
            let selected = this.entityFormValue.value;

            if (!Array.isArray(selected)) {
                selected = [];
                this.entityFormValue.setValue(selected);
            }

            this.tempEntity = selected;
            this.initialSelection = selected;
            
            this.dialog = this.applyDialogFactory$.open({
                title: 'Select Warehouse',
                template: this.selectStoreType,
                isApplyEnabled: true,
            }, {
                disableClose: true,
                width: '80vw',
                minWidth: '80vw',
                maxWidth: '80vw',
            });

            this.dialog.closed$.subscribe({
                next: (value: TNullable<string>) => {
                    HelperService.debug('DIALOG SELECTION CLOSED', value);

                    let selection;
                    if (value === 'apply') {
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
                }
            });
        }
    }

    onClearAll(): void {
        this.dialogRef$.next('clear-all');
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
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log('isi segmentBases onchanges1->', this.segmentBases)
        // console.log('isi changes segment->', changes['segmentBases'])
        if (this.segmentBases == 'all') {
            this.availableEntities$.next([]);
            this.rawAvailableEntities$.next([]);
            if (this.typePromo == 'flexiCombo') {
                // console.log('masuk type promo ini flexi')
                const params = {
                    // paginate: true,
                    // limit: this.limit,
                    // skip: 0,
                };
                if (this.typeTrigger == 'sku' && this.catalogueIdSelect !== undefined) {
                    // console.log('masuk catalogue sini')
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    params['catalogueId'] = this.catalogueIdSelect;
                    this.requestEntity(params);
                } else if (this.typeTrigger == 'brand' && this.brandIdSelect !== undefined) {
                    // console.log('masuk brand sini');
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    params['brandId'] = this.brandIdSelect;
                    this.requestEntity(params);
                } else if (this.typeTrigger == 'faktur' && this.fakturIdSelect !== undefined) {
                    // console.log('masuk faktur sini');
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    params['fakturId'] = this.fakturIdSelect;
                    this.requestEntity(params);
                }
            } else {

            }
        }

        if (this.typePromo == 'crossSelling') {
            this.availableEntities$.next([]);
            this.rawAvailableEntities$.next([]);
            const params: IQueryParams = {
                paginate: true,
                limit: this.limit,
                skip: 0,
            };
            this.requestEntity(params);
        }

        if (changes['required']) {
            if (!changes['required'].isFirstChange()) {
                this.entityFormView.clearValidators();

                if (changes['required'].currentValue === true) {
                    this.entityFormView.setValidators(RxwebValidators.required());
                }
            }
        }

        if (changes['disabled']) {
            if (changes['disabled'].currentValue === true) {
                this.entityFormView.disable();
            } else {
                this.entityFormView.enable();
            }
        }

        if (changes['initialSelection']) {
            this.entityFormValue.setValue(changes['initialSelection'].currentValue);
            this.updateFormView();
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
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        // this.initEntity();
    }

}