import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange, MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormStatus } from 'app/shared/models/global.model';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { Catalogue, CatalogueAmount, CatalogueUnit } from '../../models';
import { CataloguesService } from '../../services';
import { CatalogueActions } from '../../store/actions';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors } from '../../store/selectors';

// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';
interface IUomType {
    smallName: string;
    smallId: string;
    largeName: string;
    largeId: string;
}
@Component({
    selector: 'catalogue-amount-settings',
    templateUrl: './catalogue-amount-settings.component.html',
    styleUrls: ['./catalogue-amount-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CatalogueAmountSettingsComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan memicu adanya perubahan nilai pada form.
    private formValue$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan status pada form.
    private formStatus$: Subject<void> = new Subject<void>();
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';
    // Untuk menyimpan pilihan kuantitas produk
    quantityChoices: Array<{ id: string; label: string }>;
    //untuk jenis uom
    uomNames$: BehaviorSubject<IUomType> = new BehaviorSubject({
        largeName: '',
        largeId: '',
        smallName: '',
        smallId: '',
    });
    catalogueUnits: CatalogueUnit[];
    catalogueSmallUnits: CatalogueUnit[];
    catalogueLargeUnits: CatalogueUnit[];

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<CatalogueAmount> = new EventEmitter<CatalogueAmount>();

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

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private helper$: HelperService,
        private errorMessage$: ErrorMessageService
    ) {
        this.quantityChoices = this.helper$.getQuantityChoices();
    }

    getClassLargeUnit(viewMode) {
        switch (viewMode) {
            case true:
                return 'box-largest-unit view-mode';
                break;
            case false:
                return 'box-largest-unit edit-mode';
                break;
            default:
                return 'box-largest-unit view-mode';
                break;
        }
    }

    private updateFormView(): void {
        // Penetapan class pada konten katalog berdasarkan mode form-nya.
        this.catalogueContent = {
            'mt-16': true,
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
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.trigger$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
        ])
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    this.store.select(CatalogueSelectors.getCatalogueUnits),
                    ([_, catalogue], userSupplier, units) => ({ catalogue, userSupplier, units })
                ),
                takeUntil(this.subs$)
            )
            .subscribe(({ catalogue, userSupplier, units }) => {
                if (!catalogue) {
                    // Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut.
                    if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                        this.store.dispatch(
                            CatalogueActions.spliceCatalogue({
                                payload: catalogue.id,
                            })
                        );

                        this.notice$.open('Produk tidak ditemukan.', 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });

                        setTimeout(
                            () => this.router.navigate(['pages', 'catalogues', 'list']),
                            1000
                        );

                        return;
                    }
                }

                HelperService.debug('[PREPARE EDIT] FORM PATCHVALUE', {
                    catalogue,
                });

                if (units.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id',
                            },
                        })
                    );
                }

                /** mencari largest uom  */
                if (catalogue.largeUomId) {
                    const selectedLargeUnit = units.filter(
                        (unit) => unit.id === catalogue.largeUomId
                    );

                    this.uomNames$.next({
                        smallName: catalogue.catalogueUnit.unit,
                        smallId: catalogue.catalogueUnit.id,
                        largeName: selectedLargeUnit[0].unit,
                        largeId: selectedLargeUnit[0].id,
                    });

                    this.form.patchValue({
                        productCount: {
                            uomLargeUnit: selectedLargeUnit[0].id,
                            uomSmallUnit: catalogue.catalogueUnit.id,
                        },
                    });

                    this.cdRef.markForCheck();
                } else {
                    this.uomNames$.next({
                        smallName: catalogue.catalogueUnit.unit,
                        smallId: catalogue.catalogueUnit.id,
                        largeName: '',
                        largeId: null,
                    });
                    this.form.patchValue({
                        productCount: {
                            uomLargeUnit: null,
                            uomSmallUnit: catalogue.catalogueUnit.id,
                        },
                    });

                    this.cdRef.markForCheck();
                }

                /** Penetapan nilai pada form saat pertama render view sebelum edit. */

                this.form.patchValue(
                    {
                        productCount: {
                            minQtyValue: catalogue.minQty,
                            isMaximum: !catalogue.isMaximum,
                            amountIncrease: catalogue.multipleQty,
                            isEnableLargeUnit: catalogue.enableLargeUom,
                            consistOfQtyLargeUnit: catalogue.packagedQty,
                            maxQtyValue: catalogue.maxQty,
                            // minQtyType: ,
                            // multipleQty: this.uomNames$.value.smallId,
                            // multipleQtyType: this.uomNames$.value.smallName,
                        },
                    },
                    { onlySelf: false }
                );
                if (catalogue.enableLargeUom) {
                    this.form.get('productCount.consistOfQtyLargeUnit').enable({ onlySelf: true });
                    this.form.get('productCount.uomLargeUnit').enable({ onlySelf: true });
                    this.form.get('productCount.consistOfQtyLargeUnit').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                {
                                    minValue: 1,
                                }
                            ),
                        }),
                    ]);
                }

                if (catalogue.isMaximum) {
                    this.form.get('productCount.maxQtyValue').clearValidators();
                    this.form.get('productCount.maxQtyValue').disable({ onlySelf: true });
                }
                //init kebalikan isMaximum
                if (!catalogue.isMaximum) {
                    this.form.get('productCount.maxQtyValue').disable({ onlySelf: true });
                }
                //init kebalikan isMaximum
                if (catalogue.isMaximum) {
                    const minQty = this.form.get('productCount.minQtyValue').value;

                    this.form.get('productCount.maxQtyValue').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.greaterThanEqualTo({
                            fieldName: 'productCount.minQtyValue',
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'gte_number',
                                {
                                    limitValue: minQty,
                                }
                            ),
                        }),
                    ]);
                    this.form.get('productCount.maxQtyValue').enable({ onlySelf: true });
                }

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    private initFormCheck(): void {
        //Revalidate consist of based on max qty changes
        this.form
            .get('productCount.maxQtyValue')
            .valueChanges.pipe(debounceTime(100), distinctUntilChanged(), takeUntil(this.subs$))
            .subscribe((maxQtyValChanges) => {
                let isEnableLargeUnit = this.form.get('productCount.isEnableLargeUnit').value;

                //consist Of Qty Large Unit
                if (isEnableLargeUnit) {
                    this.form.get('productCount.consistOfQtyLargeUnit').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                {
                                    minValue: 1,
                                }
                            ),
                        }),
                        RxwebValidators.lessThanEqualTo({
                            fieldName: 'productCount.maxQtyValue',
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'lte_number',
                                {
                                    limitValue: maxQtyValChanges,
                                }
                            ),
                        }),
                    ]);
                    this.form
                        .get('productCount.consistOfQtyLargeUnit')
                        .updateValueAndValidity({ onlySelf: true });
                    /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                    this.form
                        .get('productCount.consistOfQtyLargeUnit')
                        .markAsDirty({ onlySelf: false });
                    this.form.get('productCount.consistOfQtyLargeUnit').markAllAsTouched();
                    this.form.get('productCount.consistOfQtyLargeUnit').markAsPristine();
                }
            });

        // Re-validate maximum order quantity field based on changes in minimum order quantity
        this.form
            .get('productCount.minQtyValue')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.subs$))
            .subscribe((value) => {
                const isMaximum = this.form.get('productCount.isMaximum').value;

                /* HelperService.debug(
                    '[CataloguesFormComponent] productCount.minQtyValue valueChanges',
                    {
                        value,
                        minQtyOption: this.form.get('productCount.minQtyOption').value,
                        isMaximum,
                        maxQtyValueForm: this.form.get('productCount.maxQtyValue'),
                    }
                ); */

                if (isMaximum) {
                    this.form.get('productCount.maxQtyValue').reset();
                    this.form.get('productCount.maxQtyValue').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.greaterThanEqualTo({
                            fieldName: 'productCount.minQtyValue',
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'gte_number',
                                {
                                    limitValue: value,
                                }
                            ),
                        }),
                    ]);

                    this.form
                        .get('productCount.maxQtyValue')
                        .updateValueAndValidity({ onlySelf: true });
                }
            });

        this.form.statusChanges
            .pipe(
                debounceTime(250),
                // map(() => this.form.status),
                tap((value) =>
                    HelperService.debug('CATALOGUE AMOUNT SETTINGS FORM STATUS CHANGED:', value)
                ),
                takeUntil(this.subs$)
            )
            .subscribe((status: FormStatus) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                debounceTime(250),
                map(() => this.form.getRawValue()),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] CATALOGUE AMOUNT SETTINGS FORM VALUE CHANGED',
                        { value, form: this.form }
                    )
                ),
                map((value) => {
                    const formValue = {
                        largeUomId: value.productCount.uomLargeUnit, // integer
                        unitOfMeasureId: this.uomNames$.value.smallId
                            ? parseInt(this.uomNames$.value.smallId)
                            : null, //integer
                        enableLargeUom: value.productCount.isEnableLargeUnit, //boolean
                        packagedQty: value.productCount.consistOfQtyLargeUnit, //integer
                        minQty: value.productCount.minQtyValue, //integer,
                        minQtyType: `pcs`, //string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
                        multipleQty: value.productCount.amountIncrease, //integer,
                        multipleQtyType: `pcs`, //string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
                        isMaximum: value.productCount.isMaximum, //boolean
                        maxQty: value.productCount.isMaximum
                            ? null
                            : parseInt(value.productCount.maxQtyValue), // integer
                    };

                    return formValue;
                }),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] CATALOGUE AMOUNT SETTINGS FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });
    }
    //checkbox max order is unlimited
    onChangeMaxOrderQty(ev: MatCheckboxChange): void {
        // HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty', { ev });

        if (ev.checked) {
            this.form.get('productCount.maxQtyValue').reset();
            this.form.get('productCount.maxQtyValue').clearValidators();
            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.maxQtyValue').disable({ onlySelf: true });

            /* HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty checked TRUE', {
                minQty,
                maxQtyValue: this.form.get('productCount.maxQtyValue'),
                qtyMasterBox: this.form.get('productCount.qtyPerMasterBox'),
            }); */
        } else {
            const minQty = this.form.get('productCount.minQtyValue').value;

            this.form.get('productCount.maxQtyValue').setValidators([
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.minQtyValue',
                    message: this.errorMessage$.getErrorMessageNonState('default', 'gte_number', {
                        limitValue: minQty,
                    }),
                }),
            ]);

            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.maxQtyValue').enable({ onlySelf: true });

            /* HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty checked FALSE', {
                maxQtyValue: this.form.get('productCount.maxQtyValue'),
                qtyMasterBox: this.form.get('productCount.qtyPerMasterBox'),
            }); */
        }
    }

    //input max order val
    onChangeMaxQtyVal(val: string) {
        if (this.form.get('productCount.consistOfQtyLargeUnit').value > parseInt(val)) {
            this.form.get('productCount.consistOfQtyLargeUnit').reset();
        }
    }

    onChangeMinOrderQty(val: string) {
        const minQty = val ? parseInt(val) : 0;
        const maxQty = this.form.get('productCount.maxQtyValue').value;

        if (minQty > maxQty && !this.form.get('productCount.isMaximum').value) {
            this.form.get('productCount.maxQtyValue').reset();
            this.form.get('productCount.maxQtyValue').setValidators([
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.minQtyValue',
                    message: this.errorMessage$.getErrorMessageNonState('default', 'gte_number', {
                        limitValue: minQty,
                    }),
                }),
            ]);

            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.get('productCount.maxQtyValue').markAsDirty({ onlySelf: false });
            this.form.get('productCount.maxQtyValue').markAllAsTouched();
            this.form.get('productCount.maxQtyValue').markAsPristine();
        } else {
            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.get('productCount.maxQtyValue').markAsDirty({ onlySelf: false });
            this.form.get('productCount.maxQtyValue').markAllAsTouched();
            this.form.get('productCount.maxQtyValue').markAsPristine();
        }
    }

    onChangeIsEnableLargeUnit(ev: MatCheckboxChange): void {
        if (ev.checked) {
            this.form.patchValue({
                productCount: {
                    isEnableLargeUnit: true,
                },
            });
            //UOM Large Unit
            this.form.get('productCount.uomLargeUnit').enable({ onlySelf: true });
            this.form.get('productCount.consistOfQtyLargeUnit').enable({ onlySelf: true });
        } else {
            //UOM Large Unit
            this.form.get('productCount.uomLargeUnit').clearValidators();
            this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.uomLargeUnit').disable({ onlySelf: true });
            //consist Of Qty Large Unit
            this.form.get('productCount.consistOfQtyLargeUnit').clearValidators();
            this.form
                .get('productCount.consistOfQtyLargeUnit')
                .updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.consistOfQtyLargeUnit').disable({ onlySelf: true });
            this.form.patchValue({
                productCount: {
                    isEnableLargeUnit: false,
                    consistOfQtyLargeUnit: 0,
                    uomLargeUnit: null,
                },
            });
        }
    }

    onChangeConsistOf(val: string) {
        const maxQty = this.form.get('productCount.maxQtyValue').value;
        this.form.get('productCount.consistOfQtyLargeUnit').setValidators([
            RxwebValidators.required({
                message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.minNumber({
                value: 0,
                message: this.errorMessage$.getErrorMessageNonState('default', 'min_number', {
                    minValue: 0,
                }),
            }),
            RxwebValidators.lessThanEqualTo({
                fieldName: 'productCount.maxQtyValue',
                message: this.errorMessage$.getErrorMessageNonState('default', 'lte_number', {
                    limitValue: maxQty,
                }),
            }),
        ]);
        this.form
            .get('productCount.consistOfQtyLargeUnit')
            .updateValueAndValidity({ onlySelf: true });
        /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
        this.form.get('productCount.consistOfQtyLargeUnit').markAsDirty({ onlySelf: false });
        this.form.get('productCount.consistOfQtyLargeUnit').markAllAsTouched();
        this.form.get('productCount.consistOfQtyLargeUnit').markAsPristine();
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
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

    ngOnInit(): void {
        /** Menyiapkan form edit. */
        this.form = this.fb.group({
            productCount: this.fb.group({
                minQtyValue: [
                    { value: 1, disabled: false },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                isMaximum: true,
                uomSmallUnit: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                amountIncrease: [
                    { value: '', disabled: false },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                isEnableLargeUnit: false,
                uomLargeUnit: [{ value: '', disabled: true }],
                consistOfQtyLargeUnit: [{ value: 0, disabled: true }],
                maxQtyValue: [
                    { value: 0, disabled: false },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
            }),
        });

        this.store
            .select(CatalogueSelectors.getCatalogueUnits)
            .pipe(takeUntil(this.subs$))
            .subscribe((units) => {
                if (units.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id',
                            },
                        })
                    );
                }

                this.form
                    .get('productCount.uomSmallUnit')!
                    .valueChanges.pipe(
                        distinctUntilChanged(),
                        debounceTime(100),
                        takeUntil(this.subs$)
                    )
                    .subscribe((change) => {
                        const selectedUnit: any = units.filter((unit) => unit.id === change);
                        if (selectedUnit && selectedUnit.length > 0) {
                            this.uomNames$.next({
                                smallName: selectedUnit[0].unit,
                                smallId: selectedUnit[0].id,
                                largeName: this.uomNames$.value.largeName,
                                largeId: this.uomNames$.value.largeId,
                            });
                        }
                        this.form.get('productCount.uomSmallUnit').setValidators([
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                            RxwebValidators.different({
                                fieldName: 'productCount.uomLargeUnit',
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'small_unit',
                                    'different',
                                    {
                                        fieldComparedName: 'large_unit',
                                    }
                                ),
                            }),
                        ]);
                        this.form
                            .get('productCount.uomSmallUnit')
                            .updateValueAndValidity({ onlySelf: true });
                        this.form
                            .get('productCount.uomLargeUnit')
                            .updateValueAndValidity({ onlySelf: true });
                    });

                this.form
                    .get('productCount.uomLargeUnit')
                    .valueChanges.pipe(
                        distinctUntilChanged(),
                        debounceTime(100),
                        takeUntil(this.subs$)
                    )
                    .subscribe((change) => {
                        const selectedUnit: any = units.filter((unit) => unit.id === change);
                        if (selectedUnit && selectedUnit.length > 0) {
                            this.uomNames$.next({
                                largeName: selectedUnit[0].unit,
                                largeId: selectedUnit[0].id,
                                smallName: this.uomNames$.value.smallName,
                                smallId: this.uomNames$.value.smallId,
                            });
                        }
                        this.form.get('productCount.uomLargeUnit').setValidators([
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                            RxwebValidators.different({
                                fieldName: 'productCount.uomSmallUnit',
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'large_unit',
                                    'different',
                                    {
                                        fieldComparedName: 'small_unit',
                                    }
                                ),
                            }),
                        ]);
                        this.form
                            .get('productCount.uomLargeUnit')
                            .updateValueAndValidity({ onlySelf: true });
                        this.form
                            .get('productCount.uomSmallUnit')
                            .updateValueAndValidity({ onlySelf: true });
                    });

                this.catalogueUnits = units;
                this.catalogueSmallUnits = units;
                this.catalogueLargeUnits = units;

                this.cdRef.markForCheck();
            });

        this.checkRoute();
        this.initFormCheck();
    }

    ngAfterViewInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') {
            this.trigger$.next('');

            setTimeout(() => {
                this.updateFormView();
            });
        } else if (changes['formMode'].currentValue) {
            this.trigger$.next('');
            setTimeout(() => this.updateFormView());
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.trigger$.next('');
        this.trigger$.complete();
    }
}
