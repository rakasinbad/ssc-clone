import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';

import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogueWeightDimension, CatalogueAmount } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { CataloguesSelectCategoryComponent } from '../../catalogues-select-category/catalogues-select-category.component';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { FormStatus } from 'app/shared/models/global.model';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';
// 
@Component({
    selector: 'catalogue-amount-settings',
    templateUrl: './catalogue-amount-settings.component.html',
    styleUrls: ['./catalogue-amount-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CatalogueAmountSettingsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

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
    // Untuk styling form field di mode form yang berbeda.
    formClass: {
        'custom-field-right': boolean;
        'view-field-right': boolean;
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
        private errorMessage$: ErrorMessageService,
    ) {
        this.quantityChoices = this.helper$.getQuantityChoices();
    }

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
        };
        // Penetapan class pada konten katalog berdasarkan mode form-nya.
        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };

        this.cdRef.markForCheck();
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe(urls => {
            if (urls.filter(url => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.trigger$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
        ]).pipe(
            withLatestFrom(
                this.store.select(AuthSelectors.getUserSupplier),
                ([_, catalogue], userSupplier) => ({ catalogue, userSupplier })
            ),
            takeUntil(this.subs$)
        ).subscribe(({ catalogue, userSupplier }) => {
            if (!catalogue) {
                // Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut.
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: catalogue.id
                        })
                    );

                    this.notice$.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'catalogues', 'list']), 1000);

                    return;
                }
            }

            /** Penetapan nilai pada form. */
            this.form.patchValue({
                productCount: {
                    qtyPerMasterBox: catalogue.packagedQty,
                    minQtyOption: catalogue.minQtyType,
                    minQtyValue: catalogue.minQty,
                    additionalQtyOption: catalogue.multipleQtyType,
                    additionalQtyValue: catalogue.multipleQty
                }
            }, { onlySelf: false });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    private initFormCheck(): void {
        /** Melakukan subscribe ke perubahan nilai opsi Minimum Quantity Order. */
        this.form.get('productCount.minQtyOption')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.subs$))
            .subscribe(value => {
                /** Mengambil nilai pada input Minimum Order Quantity. */
                const minQtyValueController = this.form.get('productCount.minQtyValue');
                /** Mengambil nilai Quantity per Master Box. */
                const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

                /** Mengubah perilaku Form Control sesuai dengan opsi Minimum Order Quantity. */
                switch (value) {
                    case 'master_box':
                        minQtyValueController.disable();
                        minQtyValueController.patchValue(qtyPerMasterBox ? qtyPerMasterBox : 1);
                        break;
                    case 'custom':
                        minQtyValueController.enable();
                        // minQtyValueController.patchValue(1);
                        break;
                    case 'pcs':
                    default:
                        minQtyValueController.disable();
                        minQtyValueController.patchValue(1);
                        break;
                }

                this.formValue$.next();
            });

        /** Melakukan subscribe ke perubahan nilai opsi Additional Quantity. */
        this.form.get('productCount.additionalQtyOption')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.subs$))
            .subscribe(value => {
                /** Mengambil nilai pada input Additional Quantity. */
                const additionalQtyValueController = this.form.get(
                    'productCount.additionalQtyValue'
                );
                /** Mengambil nilai Quantity per Master Box. */
                const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

                /** Mengubah perilaku Form Control sesuai dengan opsi Minimum Order Quantity. */
                switch (value) {
                    case 'master_box':
                        additionalQtyValueController.disable();
                        additionalQtyValueController.patchValue(
                            qtyPerMasterBox ? qtyPerMasterBox : 1
                        );
                        break;
                    case 'custom':
                        additionalQtyValueController.enable();
                        // minQtyValueController.patchValue(1);
                        break;
                    case 'pcs':
                    default:
                        additionalQtyValueController.disable();
                        additionalQtyValueController.patchValue(1);
                        break;
                }

                this.formValue$.next();
            });

        /** Melakukan subscribe ke perubahan nilai input Quantity per Master Box. */
        this.form.get('productCount.qtyPerMasterBox')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.subs$))
            .subscribe(value => {
                /** Mengambil Form Control-nya option dan input Minimum Quantity Order. */
                const minQtyOption = this.form.get('productCount.minQtyOption');
                const minQtyValue = this.form.get('productCount.minQtyValue');
                /** Mengambil Form Control-nya option dan input Additional Quantity. */
                const additionalQtyOption = this.form.get('productCount.additionalQtyOption');
                const additionalQtyValue = this.form.get('productCount.additionalQtyValue');

                /** Menetapkan nilai input Minimum Quantity Order sesuai dengan nilai Quantity per Master Box jika opsinya adalah Master Box. */
                if (minQtyOption.value === 'master_box') {
                    minQtyValue.setValue(value);
                }

                /** Menetapkan nilai input Additional Quantity sesuai dengan nilai Quantity per Master Box jika opsinya adalah Master Box. */
                if (additionalQtyOption.value === 'master_box') {
                    additionalQtyValue.setValue(value);
                }

                this.formValue$.next();
            });

        this.form.statusChanges.pipe(
            debounceTime(250),
            // map(() => this.form.status),
            tap(value => HelperService.debug('CATALOGUE AMOUNT SETTINGS FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe((status: FormStatus) => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            debounceTime(250),
            // map(() => this.form.getRawValue()),
            tap(value => HelperService.debug('[BEFORE MAP] CATALOGUE AMOUNT SETTINGS FORM VALUE CHANGED', value)),
            map(value => {
                const formValue = {
                    packagedQty: value.productCount.qtyPerMasterBox,
                    minQty: this.form.get('productCount.minQtyValue').value,
                    minQtyType: value.productCount.minQtyOption,
                    multipleQty: this.form.get('productCount.additionalQtyValue').value,
                    multipleQtyType: value.productCount.additionalQtyOption,
                };

                return formValue;
            }),
            tap(value => HelperService.debug('[AFTER MAP] CATALOGUE AMOUNT SETTINGS FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
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

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.form = this.fb.group({
            productCount: this.fb.group({
                qtyPerMasterBox: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            )
                        })
                    ]
                ],
                minQtyOption: ['pcs'],
                minQtyValue: [
                    { value: '1', disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            )
                        })
                    ]
                ],
                additionalQtyOption: ['pcs'],
                additionalQtyValue: [
                    { value: '1', disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            )
                        })
                    ]
                ]
            })
        });

        this.checkRoute();
        this.initFormCheck();
    }

    ngAfterViewInit(): void { }

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
