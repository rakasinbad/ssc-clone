import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';

import { FeatureState as PeriodTargetPromoCoreFeatureState } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { PeriodTargetPromoSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { PeriodTargetPromoApiService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { PeriodTargetPromo } from '../../models';
import { PeriodTargetPromoActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
// import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { PeriodTargetPromoTriggerInformationService } from './services';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'period-target-promo-trigger-information',
    templateUrl: './trigger-information.component.html',
    styleUrls: ['./trigger-information.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoTriggerInformationComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan mengirim nilai yang terpilih ke component multiple selection.
    chosenSku$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
    chosenBrand$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
    chosenFaktur$: BehaviorSubject<Array<Selection>> = new BehaviorSubject<Array<Selection>>([]);
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

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<PeriodTargetPromo> = new EventEmitter<PeriodTargetPromo>();

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
        // 'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    // Untuk styling form field di mode form yang berbeda.
    formClass: {
        'custom-field': boolean;
        'view-field label-no-padding': boolean;
    };

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<PeriodTargetPromoCoreFeatureState>,
        private promo$: PeriodTargetPromoApiService,
        private errorMessage$: ErrorMessageService,
        private triggerInformation$: PeriodTargetPromoTriggerInformationService,
    ) { }

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field': !this.isViewMode(),
            'view-field label-no-padding': this.isViewMode()
        };
        // Penetapan class pada konten katalog berdasarkan mode form-nya.
        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            // 'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };

        this.cdRef.markForCheck();
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe(urls => {
            if (urls.filter(url => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEdit();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEdit();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEdit(): void {
        combineLatest([
            this.trigger$,
            this.store.select(PeriodTargetPromoSelectors.getSelectedPeriodTargetPromo)
        ]).pipe(
            withLatestFrom(
                this.store.select(AuthSelectors.getUserSupplier),
                ([_, periodTargetPromo], userSupplier) => ({ periodTargetPromo, userSupplier })
            ),
            takeUntil(this.subs$)
        ).subscribe(({ periodTargetPromo, userSupplier }) => {
            // Butuh mengambil data period target promo jika belum ada di state.
            if (!periodTargetPromo) {
                // Mengambil ID dari parameter URL.
                const { id } = this.route.snapshot.params;

                this.store.dispatch(
                    PeriodTargetPromoActions.fetchPeriodTargetPromoRequest({
                        payload: (id as string)
                    })
                );

                this.store.dispatch(
                    PeriodTargetPromoActions.selectPeriodTargetPromo({
                        payload: (id as string)
                    })
                );

                return;
            } else {
                // Harus keluar dari halaman form jika promo yang diproses bukan milik supplier tersebut.
                if (periodTargetPromo.supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        PeriodTargetPromoActions.resetPeriodTargetPromo()
                    );

                    this.notice$.open('Promo tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'promos', 'period-target-promo']), 1000);

                    return;
                }
            }

            let chosenBase: string;

            switch (periodTargetPromo.base) {
                case 'sku':
                    this.chosenSku$.next(
                        periodTargetPromo.promoCatalogues.map(data => ({
                            id: data.catalogue.id,
                            label: data.catalogue.name,
                            group: 'catalogues'
                        }))
                    );

                    chosenBase = periodTargetPromo.base;
                    break;
                case 'brand':
                    this.chosenBrand$.next(
                        periodTargetPromo.promoBrands.map(data => ({
                            id: data.brand.id,
                            label: data.brand.name,
                            group: 'brand'
                        }))
                    );

                    chosenBase = periodTargetPromo.base;
                    break;
                case 'invoiceGroup':
                    this.chosenFaktur$.next(
                        periodTargetPromo.promoInvoiceGroups.map(data => ({
                            id: data.invoiceGroup.id,
                            label: data.invoiceGroup.name,
                            group: 'faktur'
                        }))
                    );

                    chosenBase = 'faktur';
                    break;
            }

            this.form.patchValue({
                id: periodTargetPromo.id,
                base: chosenBase,
                chosenSku: periodTargetPromo.promoCatalogues.length === 0 ? '' : periodTargetPromo.promoCatalogues,
                chosenBrand: periodTargetPromo.promoBrands.length === 0 ? '' : periodTargetPromo.promoBrands,
                chosenFaktur: periodTargetPromo.promoInvoiceGroups.length === 0 ? '' : periodTargetPromo.promoInvoiceGroups,
            });

            if (this.formMode === 'view') {
                this.form.get('base').disable({ onlySelf: true, emitEvent: false });
            } else {
                this.form.get('base').enable({ onlySelf: true, emitEvent: false });
            }

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    // private onSubmit(): void {
    //     // Menyembunyikan form toolbar agar tidak di-submit lagi.
    //     this.store.dispatch(UiActions.hideFooterAction());
    //     // Mendapatkan seluruh nilai dari form.
    //     const formValues = this.form.getRawValue();
        
    //     // Membuat sebuah Object dengan tipe Partial<Catalogue> untuk keperluan strict-typing.
    //     const catalogueData: Partial<CatalogueInformation> = {
    //         /**
    //          * INFORMASI PRODUK
    //          */
    //         externalId: formValues.productInfo.externalId,
    //         name:
    //             String(formValues.productInfo.name)
    //                 .charAt(0)
    //                 .toUpperCase() + String(formValues.productInfo.name).slice(1),
    //         description: formValues.productInfo.description,
    //         information: formValues.productInfo.information,
    //         detail: formValues.productInfo.information,
    //         brandId: formValues.productInfo.brandId,
    //         firstCatalogueCategoryId: formValues.productInfo.category[0].id,
    //         lastCatalogueCategoryId:
    //             formValues.productInfo.category.length === 1
    //                 ? formValues.productInfo.category[0].id
    //                 : formValues.productInfo.category[formValues.productInfo.category.length - 1].id,
    //         unitOfMeasureId: formValues.productInfo.uom,
    //     };

    //     if (this.formMode === 'edit') {
    //         this.store.dispatch(
    //             CatalogueActions.patchCatalogueRequest({
    //                 payload: { id: formValues.productInfo.id, data: catalogueData, source: 'form' }
    //             })
    //         );
    //     }
    // }

    // private initCatalogueCategoryState(): void {
    //     this.store.select(
    //         CatalogueSelectors.getCatalogueCategories
    //     ).pipe(
    //         takeUntil(this.subs$)
    //     ).subscribe(categories => {
    //         // Melakukan request ke back-end jika belum ada unit katalog di state.
    //         if (categories.length === 0) {
    //             this.store.dispatch(
    //                 CatalogueActions.fetchCatalogueCategoriesRequest({
    //                     payload: {
    //                         paginate: false,
    //                         sort: 'asc',
    //                         sortBy: 'id'
    //                     }
    //                 })
    //             );
    //         }

    //         this.catalogueCategories$.next(categories);
    //     });
    // }

    // private initCatalogueUnitState(): void {
    //     // Mendapatkan unit katalog dari state.
    //     this.store.select(
    //         CatalogueSelectors.getCatalogueUnits
    //     ).pipe(
    //         takeUntil(this.subs$)
    //     ).subscribe(units => {
    //         // Melakukan request ke back-end jika belum ada unit katalog di state.
    //         if (units.length === 0) {
    //             this.store.dispatch(
    //                 CatalogueActions.fetchCatalogueUnitRequest({
    //                     payload: {
    //                         paginate: false,
    //                         sort: 'asc',
    //                         sortBy: 'id'
    //                     }
    //                 })
    //             );
    //         } else {
    //             // Mengambil nilai ID UOM dari form.
    //             const uom = this.form.get('productInfo.uom').value;
    //             // Mengambil data UOM berdasarkan ID UOM yang terpilih.
    //             const selectedUnit = units.filter(unit => unit.id === uom);
    //             if (selectedUnit.length > 0) {
    //                 this.form.patchValue({
    //                     productInfo: {
    //                         uomName: selectedUnit[0].unit
    //                     }
    //                 });
    //             }

    //             this.cdRef.markForCheck();
    //         }

    //         this.catalogueUnits$.next(units);
    //     });
    // }

    // private initCatalogueBrand(): void {
    //     this.brands$ = this.store.select(
    //         BrandSelectors.getAllBrands
    //     ).pipe(
    //         withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
    //         map(([brands, userSupplier]) => {
    //             if (userSupplier && brands.length === 0) {
    //                 const query: IQueryParams = { paginate: false };
    //                 query['supplierId'] = userSupplier.supplierId;

    //                 this.store.dispatch(
    //                     BrandActions.fetchBrandsRequest({
    //                         payload: query
    //                     })
    //                 );
    //             }

    //             return brands;
    //         }),
    //         takeUntil(this.subs$)
    //     );
    // }

    private initForm(): void {
        this.form = this.fb.group({
            id: [''],
            base: ['sku'],
            chosenSku: ['', [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenBrand: [{ value: '', disabled: true }, [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]],
            chosenFaktur: [{ value: '', disabled: true }, [
                RxwebValidators.required({
                    message: this.errorMessage$.getErrorMessageNonState(
                        'default',
                        'required'
                    )
                })
            ]]
        });

        this.form.get('base').valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'sku') {
                this.form.get('chosenSku').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenBrand').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenFaktur').disable({ onlySelf: true, emitEvent: true });
            } else if (value === 'brand') {
                this.form.get('chosenSku').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenBrand').enable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenFaktur').disable({ onlySelf: true, emitEvent: true });
            } else if (value === 'faktur') {
                this.form.get('chosenSku').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenBrand').disable({ onlySelf: true, emitEvent: true });
                this.form.get('chosenFaktur').enable({ onlySelf: true, emitEvent: true });
            }

            this.form.updateValueAndValidity();
        });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('PERIOD TARGET PROMO TRIGGER INFORMATON FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$),
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(200),
            // tap(value => HelperService.debug('PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED', value)),
            tap(value => HelperService.debug('[BEFORE MAP] PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED', value)),
            // map(value => {
            //     let formValue = {
            //         ...value.productInfo,
            //         detail: value.productInfo.information,
            //         unitOfMeasureId: value.productInfo.uom,
            //     };
    
            //     if (formValue.category.length > 0) {
            //         formValue = {
            //             ...formValue,
            //             firstCatalogueCategoryId: value.productInfo.category[0].id,
            //             lastCatalogueCategoryId: value.productInfo.category.length === 1
            //                                     ? value.productInfo.category[0].id
            //                                     : value.productInfo.category[value.productInfo.category.length - 1].id,
            //         };
            //     }

            //     return formValue;
            // }),
            map(value => ({
                ...value,
                chosenSku: !value.chosenSku ? [] : value.chosenSku,
                chosenBrand: !value.chosenBrand ? [] : value.chosenBrand,
                chosenFaktur: !value.chosenFaktur ? [] : value.chosenFaktur,
            })),
            tap(value => HelperService.debug('[AFTER MAP] PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
            this.triggerInformation$.setValue(value);
        });
    }

    // onEditCategory(): void {
    //     this.dialog.open(CataloguesSelectCategoryComponent, { width: '1366px' });
    // }

    // checkExternalId(): AsyncValidatorFn {
    //     return (control: AbstractControl): Observable<ValidationErrors | null> => {
    //         return control.valueChanges.pipe(
    //             distinctUntilChanged(),
    //             debounceTime(500),
    //             withLatestFrom(
    //                 this.store.select(AuthSelectors.getUserSupplier),
    //                 this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
    //             ),
    //             take(1),
    //             switchMap(([value, userSupplier, catalogue]) => {
    //                 if (!value) {
    //                     return of({
    //                         required: true
    //                     });
    //                 }

    //                 const params: IQueryParams = {
    //                     limit: 1,
    //                     paginate: true
    //                 };

    //                 params['externalId'] = value;
    //                 params['supplierId'] = userSupplier.supplierId;

    //                 return this.catalogue$.findAll(params).pipe(
    //                     map(response => {
    //                         if (response.total > 0) {
    //                             if (!this.isAddMode()) {
    //                                 if (response.data[0].id === catalogue.id) {
    //                                     return null;
    //                                 }
    //                             }

    //                             return {
    //                                 skuSupplierExist: true
    //                             };
    //                         }

    //                         return null;
    //                     })
    //                 );
    //             })
    //         );
    //     };
    // }

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

    onCatalogueSelected(event: Array<any>): void {
        this.form.get('chosenSku').markAsDirty();
        this.form.get('chosenSku').markAsTouched();
        
        if (event.length === 0) {
            this.form.get('chosenSku').setValue('');
        } else {
            this.form.get('chosenSku').setValue(event);
        }
    }

    onBrandSelected(event: Array<Brand>): void {
        this.form.get('chosenBrand').markAsDirty();
        this.form.get('chosenBrand').markAsTouched();
        
        if (event.length === 0) {
            this.form.get('chosenBrand').setValue('');
        } else {
            this.form.get('chosenBrand').setValue(event);
        }
    }

    onFakturSelected(event: Array<InvoiceGroup>): void {
        this.form.get('chosenFaktur').markAsDirty();
        this.form.get('chosenFaktur').markAsTouched();
        
        if (event.length === 0) {
            this.form.get('chosenFaktur').setValue('');
        } else {
            this.form.get('chosenFaktur').setValue(event);
        }
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.initForm();

        this.checkRoute();
        this.initFormCheck();
        // this.initCatalogueBrand();
        // this.initCatalogueUnitState();
        // this.initCatalogueCategoryState();
        // this.checkSelectedCatalogueCategory();
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

        // this.catalogueCategories$.next([]);
        // this.catalogueCategories$.complete();

        // this.catalogueUnits$.next([]);
        // this.catalogueUnits$.complete();

        // this.store.dispatch(CatalogueActions.resetCatalogueUnits());
        // this.store.dispatch(UiActions.hideFooterAction());
        // this.store.dispatch(FormActions.resetCancelButtonAction());
        // this.store.dispatch(CatalogueActions.resetCatalogueUnits());
    }

}