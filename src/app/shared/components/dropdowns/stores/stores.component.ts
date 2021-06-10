import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, TemplateRef, ChangeDetectorRef, SimpleChanges, OnChanges, NgZone } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatDialog } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, Subscription } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap, map, exhaustMap } from 'rxjs/operators';
import { SupplierStore as Entity } from './models';
import { SupplierStoresApiService as EntitiesApiService } from './services';
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
import { DomSanitizer } from '@angular/platform-browser';
import { IMassUploadData } from './models/supplier-store.model';
import { ImportMassUpload } from './store/actions';
import { ImportMassUploadSelectors } from './store/selectors';
import { AlertMassUploadComponent } from './modals/alert-mass-upload/alert-mass-upload.component';

@Component({
    selector: 'select-supplier-stores',
    templateUrl: './stores.component.html',
    styleUrls: ['./stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class StoresDropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

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
    // Menyimpan state loading-nya Selected Entity.
    isEntitySelectedLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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

    // Untuk mengambil warehouse berdasarkan ID catalogue-nya.
    @Input() catalogueId: string | number;

    // Untuk menandai apakah pilihannya required atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() required: boolean = false;
    // Untuk menandai apakah form ini di-nonaktifkan atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() disabled: boolean = false;
    // tslint:disable-next-line: no-inferrable-types no-input-rename
    @Input('placeholder') placeholder: string = 'Search Store';

    @Input() typePromo: string = null;
    @Input() catalogueIdSelect: string = null;
    @Input() brandIdSelect: string = null;
    @Input() fakturIdSelect: string = null;
    @Input() typeTrigger: string = null;
    @Input() segmentBases: string = null;
    @Input() idSelectedSegment: string = null;

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Array<Entity>>> = new EventEmitter<TNullable<Array<Entity>>>();
    // Untuk mengirim data apakah checkbox "Select All" dicentang atau tidak.
    // @Output() selectAllChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('entityAutoComplete', { static: true }) entityAutoComplete: MatAutocomplete;
    // @ViewChild('triggerEntity', { static: true, read: MatAutocompleteTrigger }) triggerEntity: MatAutocompleteTrigger;
    @ViewChild('selectStoreType', { static: false }) selectStoreType: TemplateRef<MultipleSelectionComponent>;

    statusMassUpload: boolean = false;
    linkTemplate: string;
    dataSource$: Observable<IMassUploadData>;
    importSub$: Subject<{ $event: Event; type: string }> = new Subject();
    public subStore: Subscription;

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
        private domSanitizer: DomSanitizer
    ) {
        this.linkTemplate = "https://sinbad-website-sg.s3.ap-southeast-1.amazonaws.com/dev/import-csv/mass-upload-stores/Template-Mass-Upload-Stores.csv_2021012885044.csv";
        this.availableEntities$.pipe(
            tap(x => HelperService.debug('AVAILABLE ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedEntity$.pipe(
            tap(x => HelperService.debug('SELECTED ENTITY', x)),
            takeUntil(this.subs$)
        ).subscribe(value => this.selected.emit(value));

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

    private toggleSelectedLoading(loading: boolean): void {
        if (this.ngZone) {
            this.ngZone.run(() => {
                this.isEntitySelectedLoading$.next(loading);
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
                if (this.typePromo == 'flexiCombo' || this.typePromo == 'voucher') {  
                    newQuery['segment'] = 'store';
                    if (this.typeTrigger == 'sku' && (this.catalogueIdSelect !== undefined && this.catalogueIdSelect !== null)) {
                            newQuery['catalogueId'] = this.catalogueIdSelect;
                            // Melakukan request data  Store Segment.
                            return this.entityApi$
                            .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                            .pipe(
                                tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                            );
                        
                    } else if (this.typeTrigger == 'brand' && (this.brandIdSelect !== undefined && this.brandIdSelect !== null)) {
                            newQuery['brandId'] = this.brandIdSelect;
                            // Melakukan request data  Store Segment.
                            return this.entityApi$
                            .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                            .pipe(
                                tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                            );
                        
                    } else if (this.typeTrigger == 'faktur' && (this.fakturIdSelect !== undefined && this.fakturIdSelect !== null)) {
                        newQuery['fakturId'] = this.fakturIdSelect;
                         // Melakukan request data  Store Segment.
                         return this.entityApi$
                         .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                         .pipe(
                             tap(response => HelperService.debug('FIND ENTITY flexi', { params: newQuery, response })),
                         );
                    } else {

                    }
                        
                } else if (this.typePromo == 'crossSelling') {
                    if (this.idSelectedSegment !== null && this.idSelectedSegment !== undefined) {
                        newQuery['segment'] = 'store';
                        newQuery['catalogueSegmentationId'] = this.idSelectedSegment;
                        // Melakukan request data warehouse.
                        return this.entityApi$
                        .findSegmentPromo<IPaginatedResponse<Entity>>(newQuery)
                        .pipe(
                            tap(response => HelperService.debug('FIND ENTITY Cross Selling', { params: newQuery, response })),
                        );
                    }
                        
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
                    if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling' ) {
                        addedAvailableEntities = (response as Array<Entity>).filter(d => !!d).map(d => ({ id: d.storeId, label: d.storeName + ' - ' + d.storeId, group: 'supplier-stores' }));
                    } else if (this.typePromo == 'voucher') {
                        addedAvailableEntities = (response as Array<Entity>).filter(d => !!d).map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores' }));
                    } else {
                        addedAvailableEntities = (response as Array<Entity>).filter(d => !!d.store).map(d => ({ id: d.store.id, label: d.store.name, group: 'supplier-stores' }));
                    }

                    if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling' ) {
                        for (let i = 0; i < response.data.length; i++){
                            response.data[i].storeName = response.data[i].storeName + ' - ' + response.data[i].storeId;
                        }
                    }
                    
                    for (const entity of (response as Array<Entity>)) {
                        this.upsertEntity(entity);
                    }

                } else {
                    addedRawAvailableEntities = response.data;
                    if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling') {
                        addedAvailableEntities = (response.data as Array<Entity>).filter(d => !!d).map(d => ({ id: d.storeId, label: d.storeName + ' - ' + d.storeId, group: 'supplier-stores' }));
                    } else if (this.typePromo == 'voucher') {
                        addedAvailableEntities = (response.data as Array<Entity>).filter(d => !!d).map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores' }));
                    } else {
                        addedAvailableEntities = (response.data as Array<Entity>).filter(d => !!d.store).map(d => ({ id: d.store.id, label: d.store.name, group: 'supplier-stores' }));
                    }

                    if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling') {
                        for (let i = 0; i < response.data.length; i++){
                            response.data[i].storeName = response.data[i].storeName + ' - ' + response.data[i].storeId;
                        }

                        for (const entity of (response.data as Array<Entity>)) {
                            this.upsertEntity(entity);
                        }
                    } else {
                        for (const entity of (response.data as Array<Entity>)) {
                            this.upsertEntity(entity);
                        }
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
                this.toggleLoading(false);
                HelperService.debug('FIND ENTITY COMPLETED');
            }
        });
    }
   
    private initEntity(): void {
        // Menyiapkan query untuk pencarian store entity.
        const params: IQueryParams = {
            paginate: true,
            limit: this.limit,
            skip: 0
        };

        // Reset form-nya store entity.
        if (!this.disabled) {
            this.entityForm.enable();
        }
        this.entityForm.reset();

        // Memulai request data store entity.
        this.requestEntity(params);
    }

    private upsertEntity(entity: Entity): void {
        this.cachedEntities[String(entity.storeId)] = entity;
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
        const { removed, merged = this.entityFormValue.value } = $event;
        this.tempEntity = merged;
        this.removing = removed.length > 0;
        HelperService.debug('SELECTION CHANGED', $event);
        this.cdRef.markForCheck();
    }

    openStoreTypeSelection(): void {
        if (!this.disabled) {
            let selected = this.entityFormValue.value;

            if (!Array.isArray(selected)) {
                selected = [];
                this.entityFormValue.setValue(selected);
            }

            this.tempEntity = selected;
            this.initialSelection = selected;
            
            this.dialog = this.applyDialogFactory$.open({
                title: 'Select Store',
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

    massUploadFile(ev: Event) {
        this.toggleLoading(true);
        this.toggleSelectedLoading(true);
            const inputEl = ev.target as HTMLInputElement;
            if (inputEl.files && inputEl.files.length > 0) {
                const file = inputEl.files[0];
                
                if (file) {
                    this._handlePage(file);

                this.dataSource$ = this.store.select(ImportMassUploadSelectors.getSelectedItem);

                this.subStore = this.dataSource$.subscribe((val) => {
                    if (val != undefined) {
                        //checking if data exclude length > 0
                        if (val.totalExclude > 0) {
                            this.toggleLoading(false);
                            this.toggleSelectedLoading(false);
                            //display pop up when found error
                                const dialogRef = this.matDialog.open(AlertMassUploadComponent, {
                                    data: {
                                        totalExclude: val.totalExclude,
                                        linkExclude: val.linkExclude,
                                    }, disableClose: true
                                });
                        
                                dialogRef.afterClosed().subscribe(result => {
                                    if (result == 'yes') { //if click button yes
                                        let fileEntities = [];
                                        if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling' ) {
                                            fileEntities = val.massData.filter(d => !!d)
                                            .map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores', storeId: d.storeId, storeName: d.storeName + ' - ' + d.storeId }));    
                                        } else {
                                            fileEntities = val.massData.filter(d => !!d)
                                            .map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores', storeId: d.storeId, storeName: d.storeName }));
                                        }
                                        
                                        for (const entity of (fileEntities as Array<Entity>)) {
                                            this.upsertEntity(entity);
                                        }

                                        for (let i= 0; i < fileEntities.length; i++) {
                                            this.tempEntity.push(fileEntities[i]);
                                            this.initialSelection.push(fileEntities[i]);
                                        }
                                        
                                        this.entityFormValue.setValue(this.tempEntity);
                                        if (this.entityFormValue.value.length != 0) {
                                            this.onSelectedEntity(this.entityFormValue.value);
                                        }
                                        this.updateFormView();
                                    } else { //if click button no
                                        this.toggleLoading(false);
                                        this.toggleSelectedLoading(false);
                                    }
                                  });
                        } else { //checking if data exclude length == 0
                            this.toggleLoading(false);
                            this.toggleSelectedLoading(false);
                            let fileEntities = [];
                            if (this.typePromo == 'flexiCombo' || this.typePromo == 'crossSelling' ) {
                                fileEntities = val.massData.filter(d => !!d)
                                .map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores', storeId: d.storeId, storeName: d.storeName + ' - ' + d.storeId }));
                            } else {
                                fileEntities = val.massData.filter(d => !!d)
                                .map(d => ({ id: d.storeId, label: d.storeName, group: 'supplier-stores', storeId: d.storeId, storeName: d.storeName }));
                            }
                            
                                for (const entity of (fileEntities as Array<Entity>)) {
                                this.upsertEntity(entity);
                            }

                            for (let i= 0; i < fileEntities.length; i++) {
                                this.tempEntity.push(fileEntities[i]);
                                this.initialSelection.push(fileEntities[i]);
                            }
                                        
                            this.entityFormValue.setValue(this.tempEntity);
                            if (this.entityFormValue.value.length != 0) {
                                this.onSelectedEntity(this.entityFormValue.value);
                            }
                            this.updateFormView();
                        }
                    }
                });
                }
    
            }
            this.cdRef.markForCheck();
    }

    private _handlePage(file: File): void {
        if (this.typePromo == 'flexiCombo') {  
            if (this.typeTrigger == 'sku' && (this.catalogueIdSelect !== undefined && this.catalogueIdSelect !== null)) {
                    this.store.dispatch(
                        ImportMassUpload.importMassConfirmRequest({
                            payload: {
                                file,
                                type: 'massUpload',
                                catalogueId: this.catalogueIdSelect,
                                brandId: null,
                                fakturId: null,
                                catalogueSegmentationId: null
                            }
                        })
                    );
                
            } else if (this.typeTrigger == 'brand' && (this.brandIdSelect !== undefined && this.brandIdSelect !== null)) {
                    this.store.dispatch(
                        ImportMassUpload.importMassConfirmRequest({
                            payload: {
                                file,
                                type: 'massUpload',
                                catalogueId: null,
                                brandId: this.brandIdSelect,
                                fakturId: null,
                                catalogueSegmentationId: null
                            }
                        })
                    );
                
            } else if (this.typeTrigger == 'faktur' && (this.fakturIdSelect !== undefined && this.fakturIdSelect !== null)) {
                this.store.dispatch(
                    ImportMassUpload.importMassConfirmRequest({
                        payload: {
                            file,
                            type: 'massUpload',
                            catalogueId: null,
                            brandId: null,
                            fakturId: this.fakturIdSelect,
                            catalogueSegmentationId: null
                        }
                    })
                );
            } else {

            }
                
        } else if (this.typePromo == 'crossSelling') {
            if (this.idSelectedSegment !== null && this.idSelectedSegment !== undefined) {
                this.store.dispatch(
                    ImportMassUpload.importMassConfirmRequest({
                        payload: {
                            file,
                            type: 'massUpload',
                            catalogueId: null,
                            brandId: null,
                            fakturId: null,
                            catalogueSegmentationId: this.idSelectedSegment
                        }
                    })
                );
            }
                
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
        if (this.segmentBases == null || this.segmentBases == 'store') {
            if (this.typePromo == 'flexiCombo' || this.typePromo == 'voucher') {
                const params: IQueryParams = {
                    paginate: true,
                    limit: this.limit,
                    skip: 0,
                };
                if (this.typeTrigger == 'sku') {
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    this.entityForm.reset();
                    this.entityFormValue.setValue([]);
                    this.tempEntity = [];
                    // this.initialSelection = [];
                    // this.multiple$.clearAllSelectedOptions();
                    if (changes['catalogueIdSelect']) {
                        if (((this.catalogueIdSelect !== null && this.catalogueIdSelect !== undefined ))) {
                            params['catalogueId'] = this.catalogueIdSelect;
                            this.requestEntity(params);
                            this.statusMassUpload = true;
                        } else {
                            this.statusMassUpload = false;
                        }
                    } else {
                        //if changes['catalogueIdSelect'] undefined
                        if (((this.catalogueIdSelect !== null && this.catalogueIdSelect !== undefined ))) {
                            params['catalogueId'] = this.catalogueIdSelect;
                            this.requestEntity(params);
                            this.statusMassUpload = true;
                        } else {
                            this.statusMassUpload = false;
                        }
                    }
                   
                } else if (this.typeTrigger == 'brand') {
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    this.entityForm.reset();
                    this.entityFormValue.setValue([]);
                    this.tempEntity = [];

                    if (changes['brandIdSelect']) {
                        if((this.brandIdSelect !== null && this.brandIdSelect !== undefined)) {
                            params['brandId'] = this.brandIdSelect;
                            this.requestEntity(params);
                            this.statusMassUpload = true;
                        } else {
                            this.statusMassUpload = false;
                        }
                    } else {
                        //if changes['brandIdSelect'] undefined
                        if((this.brandIdSelect !== null && this.brandIdSelect !== undefined)) {
                            params['brandId'] = this.brandIdSelect;
                            this.requestEntity(params);
                        }
                    }
                   
                } else if (this.typeTrigger == 'faktur') {
                    this.availableEntities$.next([]);
                    this.rawAvailableEntities$.next([]);
                    this.entityForm.reset();
                    this.entityFormValue.setValue([]);
                    this.tempEntity = [];
                    // this.initialSelection = [];
                    if (changes['fakturIdSelect']) {
                        if ((this.fakturIdSelect !== null && this.fakturIdSelect !== undefined)) {
                            params['fakturId'] = this.fakturIdSelect;
                            this.requestEntity(params);
                            this.statusMassUpload = true;
                        } else {
                            this.statusMassUpload = false;
                        }
                    } else {
                        // if (changes['fakturIdSelect']) undefined
                        if ((this.fakturIdSelect !== null && this.fakturIdSelect !== undefined)) {
                            params['fakturId'] = this.fakturIdSelect;
                            this.requestEntity(params);
                        } 
                    }
                } else {
                }

            } else if (this.typePromo == 'crossSelling') {
                const params: IQueryParams = {
                    paginate: true,
                    limit: this.limit,
                    skip: 0,
                };
                this.availableEntities$.next([]);
                this.rawAvailableEntities$.next([]);
                this.entityForm.reset();
                this.entityFormValue.setValue([]);
                this.tempEntity = [];
                if (this.typeTrigger == 'selectSegment' && (this.idSelectedSegment !== null && this.idSelectedSegment !== undefined)) {
                    params['catalogueSegmentationId'] = this.idSelectedSegment;
                    this.requestEntity(params);
                    this.statusMassUpload = true;
                } else {
                    this.statusMassUpload = false;
                }
            }
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

        if (this.statusMassUpload = true){
            this.isEntitySelectedLoading$.next(null);
            this.isEntitySelectedLoading$.complete();
        }
    }

    ngAfterViewInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        if (this.typePromo !== 'flexiCombo' && this.typePromo !== 'crossSelling' && this.typePromo !== 'voucher') {
            this.initEntity();
        }
    }

}