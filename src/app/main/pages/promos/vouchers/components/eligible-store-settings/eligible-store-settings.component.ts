import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    AfterViewInit,
    Input,
    OnChanges,
    SimpleChanges,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';

import { FeatureState as VoucherCoreFeatureState } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import {
    FormGroup,
    FormBuilder,
    AsyncValidatorFn,
    AbstractControl,
    ValidationErrors,
    FormControl,
} from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import {
    distinctUntilChanged,
    debounceTime,
    withLatestFrom,
    take,
    switchMap,
    map,
    takeUntil,
    tap,
} from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { VoucherSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { VoucherApiService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierVoucher } from '../../models';
import { VoucherActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as moment from 'moment';
import {
    Catalogue,
    StoreSegmentationGroup,
    StoreSegmentationChannel,
    StoreSegmentationCluster,
} from 'app/main/pages/catalogues/models';
import { Warehouse } from 'app/main/pages/logistics/warehouse-coverages/models/warehouse-coverage.model';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { SupplierStore } from 'app/shared/components/dropdowns/stores/models/supplier-store.model';

import { Selection } from 'app/shared/components/multiple-selection/models';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'voucher-eligible-store-settings',
    templateUrl: './eligible-store-settings.component.html',
    styleUrls: ['./eligible-store-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherEligibleStoreSettingsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan nilai awal pada multiple selection.
    chosen$: Array<BehaviorSubject<Array<Selection>>> = [
        new BehaviorSubject<Array<Selection>>([]), // untuk store
        new BehaviorSubject<Array<Selection>>([]), // untuk warehouse
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation type
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation group
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation channel
        new BehaviorSubject<Array<Selection>>([]), // untuk store segmentation cluster
    ];
    // Untuk menyimpan daftar platform.
    platforms$: Observable<Array<Brand>>;
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    // tslint:disable-next-line: no-inferrable-types
    labelLength: number = 10;
    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;
    @Input() selectedTrigger = [];
    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<SupplierVoucher> = new EventEmitter<SupplierVoucher>();

    // Untuk mendapatkan event ketika form mode berubah.
    @Output() formModeChange: EventEmitter<IFormMode> = new EventEmitter<IFormMode>();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    // Untuk class yang digunakan di berbeda mode form.
    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    // Untuk styling form field di mode form yang berbeda.
    formClass: {
        'custom-field': boolean;
        'view-field label-no-padding': boolean;
    };

    // @ViewChild('imageSuggestionPicker', { static: false, read: ElementRef }) imageSuggestionPicker: ElementRef<HTMLInputElement>;

    public typePromo = 'voucher';
    public catalogueIdSelected: string = null;
    public brandIdSelected: string = null;
    public fakturIdSelected: string = null;
    public segmentBases: string = 'store';
    public triggerSelected: string = 'sku';

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<VoucherCoreFeatureState>,
        private promo$: VoucherApiService,
        private errorMessage$: ErrorMessageService
    ) {}

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field': !this.isViewMode(),
            'view-field label-no-padding': this.isViewMode(),
        };
        // Penetapan class pada konten katalog berdasarkan mode form-nya.
        this.catalogueContent = {
            'mt-16': false,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode(),
        };

        this.cdRef.markForCheck();
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe((urls) => {
            if (urls.filter((url) => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEdit();
            } else if (urls.filter((url) => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEdit();
            } else if (urls.filter((url) => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEdit(): void {
        combineLatest([this.trigger$, this.store.select(VoucherSelectors.getSelectedVoucher)])
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    ([_, voucher], userSupplier) => ({ voucher, userSupplier })
                ),
                takeUntil(this.subs$)
            )
            .subscribe(({ voucher, userSupplier }) => {
                // Butuh mengambil data period target promo jika belum ada di state.
                if (!voucher) {
                    // Mengambil ID dari parameter URL.
                    const { id } = this.route.snapshot.params;

                    this.store.dispatch(
                        VoucherActions.fetchSupplierVoucherRequest({
                            payload: id as string,
                        })
                    );

                    this.store.dispatch(
                        VoucherActions.selectSupplierVoucher({
                            payload: id as string,
                        })
                    );

                    return;
                } else {
                    // Harus keluar dari halaman form jika promo yang diproses bukan milik supplier tersebut.
                    if (voucher.supplierId !== userSupplier.supplierId) {
                        this.store.dispatch(VoucherActions.resetSupplierVoucher());

                        this.notice$.open('Voucher tidak ditemukan.', 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });

                        setTimeout(
                            () => this.router.navigate(['pages', 'promos', 'voucher']),
                            1000
                        );

                        return;
                    }
                }

                this.form.patchValue({
                    id: voucher.id,
                    segmentationBase: voucher.target === 'store' ? 'direct-store' : voucher.target,
                    chosenStore: voucher.voucherStores.length === 0 ? '' : voucher.voucherStores,
                });

                if (voucher.target === 'store') {
                    // STORE
                    this.chosen$[0].next(
                        voucher.voucherStores.map((data) => ({
                            id: data.store.id,
                            label: data.store.name,
                            group: 'stores',
                        }))
                    );
                } else if (voucher.target === 'segmentation') {
                   
                }

                if (this.formMode === 'view') {
                    this.form.get('segmentationBase').disable({ onlySelf: true, emitEvent: false });
                } else {
                    this.form.get('segmentationBase').enable({ onlySelf: true, emitEvent: false });
                }

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    private initForm(): void {
        this.form = this.fb.group({
            id: [''],
            segmentationBase: [
                'direct-store',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStore: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            // UNUSED
            //
            //
            //
            chosenWarehouse: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStoreType: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStoreGroup: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStoreChannel: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            chosenStoreCluster: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
        });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                // tap((value) =>
                //     HelperService.debug(
                //         'SUPPLIER VOUCHER CUSTOMER SEGMENTATION SETTINGS FORM STATUS CHANGED:',
                //         value
                //     )
                // ),
                takeUntil(this.subs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                // tap(value => HelperService.debug('SUPPLIER VOUCHER CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED', value)),
                // tap((value) =>
                    // HelperService.debug(
                    //     '[BEFORE MAP] SUPPLIER VOUCHER CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED',
                    //     value
                    // )
                // ),
                map(() => {
                    const rawValue = this.form.getRawValue();
                    if (rawValue.segmentationBase === 'direct-store') {
                        return {
                            id: rawValue.id,
                            segmentationBase: rawValue.segmentationBase,
                            chosenStore:
                                rawValue.chosenStore == null || rawValue.chosenStore.length === 0 
                                    ? [] 
                                    : rawValue.chosenStore,
                        };
                    } else if (rawValue.segmentationBase === 'segmentation') {
                        return {
                            // UNUSED
                            //
                            //
                            // id: rawValue.id,
                            // segmentationBase: rawValue.segmentationBase,
                            // chosenWarehouse:
                            //     rawValue.chosenWarehouse.length === 0
                            //         ? []
                            //         : rawValue.chosenWarehouse,
                            // chosenStoreType:
                            //     rawValue.chosenStoreType.length === 0
                            //         ? []
                            //         : rawValue.chosenStoreType,
                            // chosenStoreGroup:
                            //     rawValue.chosenStoreGroup.length === 0
                            //         ? []
                            //         : rawValue.chosenStoreGroup,
                            // chosenStoreChannel:
                            //     rawValue.chosenStoreChannel.length === 0
                            //         ? []
                            //         : rawValue.chosenStoreChannel,
                            // chosenStoreCluster:
                            //     rawValue.chosenStoreCluster.length === 0
                            //         ? []
                            //         : rawValue.chosenStoreCluster,
                        };
                    }

                    return rawValue;
                }),
                // tap((value) =>
                //     HelperService.debug(
                //         '[AFTER MAP] SUPPLIER VOUCHER CUSTOMER SEGMENTATION SETTINGS FORM VALUE CHANGED',
                //         value
                //     )
                // ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });

        this.form
            .get('segmentationBase')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                // tap((value) =>
                //     HelperService.debug(
                //         'SUPPLIER VOUCHER SEGMENTATION SETTINGS SEGMENTATION BASE VALUE CHANGED:',
                //         value
                //     )
                // ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                if (value === 'direct-store') {
                    this.form.get('chosenStore').enable({ onlySelf: true, emitEvent: true });
                    // UNUSED
                    //
                    //
                    //
                    // this.form.get('chosenWarehouse').disable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreType').disable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreGroup').disable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreChannel').disable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreCluster').disable({ onlySelf: true, emitEvent: true });
                } else if (value === 'segmentation') {
                    this.form.get('chosenStore').disable({ onlySelf: true, emitEvent: true });
                    // UNUSED
                    //
                    //
                    //
                    // this.form.get('chosenWarehouse').enable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreType').enable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreGroup').enable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreChannel').enable({ onlySelf: true, emitEvent: true });
                    // this.form.get('chosenStoreCluster').enable({ onlySelf: true, emitEvent: true });
                }

                this.form.updateValueAndValidity();
            });
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
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }

        return form.errors && (form.dirty || form.touched);
    }

    isAddMode(): boolean {
        return this.formMode === 'add';
    }

    isEditMode(): boolean {
        return this.formMode === 'edit';
    }

    isViewMode(): boolean {
        return this.formMode === 'view';
    }

    onStoreSelected(ev: SupplierStore[]): void {
        this.form.get('chosenStore').markAsDirty({ onlySelf: true });
        this.form.get('chosenStore').markAsTouched({ onlySelf: true });

        if (ev.length === 0) {
            this.form.get('chosenStore').setValue('');
            this.form.get('chosenStore').reset();
            this.form.get('chosenStore').updateValueAndValidity();

        } else {
            this.form.get('chosenStore').clearValidators();
            this.form.get('chosenStore').updateValueAndValidity();
            const newStores: Selection[] = ev.map((item) => ({
                id: item.storeId,
                label: item.storeName,
                group: 'supplier-stores',
            }));
            this.form.get('chosenStore').setValue(newStores);
        }
    }

    onWarehouseSelected(event: Array<Warehouse>): void {
        // this.form.get('chosenWarehouse').markAsDirty({ onlySelf: true });
        // this.form.get('chosenWarehouse').markAsTouched({ onlySelf: true });

        // if (event.length === 0) {
        //     this.form.get('chosenWarehouse').setValue('');
        // } else {
        //     this.form.get('chosenWarehouse').setValue(event);
        // }
    }

    onStoreTypeSelected(event: Array<StoreSegmentationType>): void {
        // this.form.get('chosenStoreType').markAsDirty({ onlySelf: true });
        // this.form.get('chosenStoreType').markAsTouched({ onlySelf: true });

        // if (event.length === 0) {
        //     this.form.get('chosenStoreType').setValue('');
        // } else {
        //     this.form.get('chosenStoreType').setValue(event);
        // }
    }

    onStoreGroupSelected(event: Array<StoreSegmentationGroup>): void {
        // this.form.get('chosenStoreGroup').markAsDirty({ onlySelf: true });
        // this.form.get('chosenStoreGroup').markAsTouched({ onlySelf: true });

        // if (event.length === 0) {
        //     this.form.get('chosenStoreGroup').setValue('');
        // } else {
        //     this.form.get('chosenStoreGroup').setValue(event);
        // }
    }

    onStoreChannelSelected(event: Array<StoreSegmentationChannel>): void {
        // this.form.get('chosenStoreChannel').markAsDirty({ onlySelf: true });
        // this.form.get('chosenStoreChannel').markAsTouched({ onlySelf: true });

        // if (event.length === 0) {
        //     this.form.get('chosenStoreChannel').setValue('');
        // } else {
        //     this.form.get('chosenStoreChannel').setValue(event);
        // }
    }

    onStoreClusterSelected(event: Array<StoreSegmentationCluster>): void {
        // this.form.get('chosenStoreCluster').markAsDirty({ onlySelf: true });
        // this.form.get('chosenStoreCluster').markAsTouched({ onlySelf: true });

        // if (event.length === 0) {
        //     this.form.get('chosenStoreCluster').setValue('');
        // } else {
        //     this.form.get('chosenStoreCluster').setValue(event);
        // }
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.initForm();

        this.checkRoute();
        this.initFormCheck();
    }

    ngAfterViewInit(): void {
     
    }

    ngOnChanges(changes: SimpleChanges): void {
        // if (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') {
        //     this.trigger$.next('');
        //     setTimeout(() => {
        //         this.updateFormView();
        //     });
        // } else if (changes['formMode'].currentValue) {
        //     this.trigger$.next('');
        //     setTimeout(() => this.updateFormView());
        // }
        this.trigger$.next('');
        this.updateFormView();
        if (changes['selectedTrigger'].currentValue == null) {
        } else {
            if (this.selectedTrigger['base'] == 'sku') {
                this.form.get('chosenStore').setValue('');
                this.form.get('chosenStore').reset();
                if (changes['selectedTrigger'].currentValue.chosenSku != null 
                    && changes['selectedTrigger'].currentValue.chosenSku.length > 0) {
                    let idSku = [];
                    idSku = this.selectedTrigger['chosenSku'].map((item) => (item.id));
                    this.catalogueIdSelected = idSku.toString();
                    this.brandIdSelected = undefined;     
                    this.fakturIdSelected = undefined;
                    this.triggerSelected = 'sku';
                }
            } else if (this.selectedTrigger['base'] == 'brand') {
                this.form.get('chosenStore').setValue('');
                this.form.get('chosenStore').reset();
                if (changes['selectedTrigger'].currentValue.chosenBrand != null 
                        && changes['selectedTrigger'].currentValue.chosenBrand.length > 0) {
                    let idBrand = [];
                    idBrand = this.selectedTrigger['chosenBrand'].map((item) => (item.id));
                    this.brandIdSelected = idBrand.toString();
                    this.catalogueIdSelected = undefined;     
                    this.fakturIdSelected = undefined;
                    this.triggerSelected = 'brand';
                }
                
            } else if (this.selectedTrigger['base'] == 'faktur') {
                this.form.get('chosenStore').setValue('');
                this.form.get('chosenStore').reset();
                if (changes['selectedTrigger'].currentValue.chosenFaktur != null 
                        && changes['selectedTrigger'].currentValue.chosenFaktur.length > 0) {
                    let idFaktur = [];
                    idFaktur = this.selectedTrigger['chosenFaktur'].map((item) => (item.id));
                    this.fakturIdSelected = idFaktur.toString();
                    this.catalogueIdSelected = undefined;        
                    this.brandIdSelected = undefined;
                    this.triggerSelected = 'faktur';
                }
            }
        }
    }

    getStores(data) {
        if (data && data.length > 0) {
            const store = data.map((v) => v.store.name + ' - ' + v.store.externalId);

            return store.length > 0 ? store.join(', ') : '-';
        }

        return '-';
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.trigger$.next('');
        this.trigger$.complete();

        this.chosen$.forEach((chosen) => {
            chosen.next([]);
            chosen.complete();
        });
    }
}
