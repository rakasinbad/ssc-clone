import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject, merge } from 'rxjs';

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
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as moment from 'moment';
// import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Selection } from 'app/shared/components/multiple-selection/models';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'period-target-promo-reward-information',
    templateUrl: './reward.component.html',
    styleUrls: ['./reward.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoRewardInformationComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan memicu adanya perubahan form status.
    private triggerStatus$: BehaviorSubject<string> = new BehaviorSubject<string>('');
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

    // Untuk menampung foto yang ingin diupload sementara sebelum dikirim.
    tmpCouponImage: FormControl = new FormControl({ value: '', disabled: true });

    // Untuk membatasi pemberian tanggal.
    minActiveStartDate: Date;
    maxActiveStartDate: Date;
    minActiveEndDate: Date;
    maxActiveEndDate: Date;

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

    // @ViewChild('imageSuggestionPicker', { static: false, read: ElementRef }) imageSuggestionPicker: ElementRef<HTMLInputElement>;

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

            if (periodTargetPromo.storeTargetCoupons.length === 1) {
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
                    rewardId: periodTargetPromo.storeTargetCoupons[0].id,
                    rewardValidDate: {
                        activeStartDate: moment(periodTargetPromo.storeTargetCoupons[0].startDate).toDate(),
                        activeEndDate: moment(periodTargetPromo.storeTargetCoupons[0].endDate).toDate(),
                    },
                    trigger: {
                        base: chosenBase,
                        chosenSku: chosenBase !== 'sku' || periodTargetPromo.promoCatalogues.length === 0 ? '' : periodTargetPromo.promoCatalogues,
                        chosenBrand: chosenBase !== 'brand' || periodTargetPromo.promoBrands.length === 0 ? '' : periodTargetPromo.promoBrands,
                        chosenFaktur: chosenBase !== 'faktur' || periodTargetPromo.promoInvoiceGroups.length === 0 ? '' : periodTargetPromo.promoInvoiceGroups,
                    },
                    condition: {
                        base: periodTargetPromo.storeTargetCoupons[0].conditionBase === 'value'
                            ? 'order-value'
                            : periodTargetPromo.storeTargetCoupons[0].conditionBase,
                        qty: periodTargetPromo.storeTargetCoupons[0].conditionQty,
                        value: isNaN(+periodTargetPromo.storeTargetCoupons[0].conditionValue) ? '0'
                                : String(periodTargetPromo.storeTargetCoupons[0].conditionValue).replace('.', ','),
                        valueView: periodTargetPromo.storeTargetCoupons[0].conditionValue,
                    },
                    miscellaneous: {
                        description: periodTargetPromo.storeTargetCoupons[0].termCondition,
                        couponImage: periodTargetPromo.storeTargetCoupons[0].imageUrl,
                    }
                });
            }

            if (this.formMode === 'view') {
                this.form.get('trigger.base').disable({ onlySelf: true, emitEvent: false });
                this.form.get('condition.base').disable({ onlySelf: true, emitEvent: false });
            } else {
                this.form.get('trigger.base').enable({ onlySelf: true, emitEvent: false });
                this.form.get('condition.base').enable({ onlySelf: true, emitEvent: false });
            }

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    private initForm(): void {
        this.minActiveStartDate = new Date();
        this.minActiveEndDate = new Date();
        this.maxActiveEndDate = null;
        this.maxActiveStartDate = null;

        this.tmpCouponImage = new FormControl({ value: '', disabled: true });

        this.form = this.fb.group({
            id: [''],
            rewardId: [''],
            rewardValidDate: this.fb.group({
                activeStartDate: [{ value: '', disabled: true }, [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    })
                ]],
                activeEndDate: [{ value: '', disabled: true }, [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    })
                ]],
            }),
            trigger: this.fb.group({
                base: ['sku', [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    })
                ]],
                chosenSku: [{ value: '', disabled: false }, [
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
            }),
            condition: this.fb.group({
                base: ['qty'],
                qty: ['', [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'required'
                        )
                    }),
                    RxwebValidators.greaterThanEqualTo({
                        value: 1,
                        message: 'This field must be greater than or equal to 1.'
                    })
                ]],
                value: ['', [
                    RxwebValidators.greaterThanEqualTo({
                        value: 1,
                        message: 'This field must be greater than or equal to 1.'
                    })
                ]],
                valueView: [''],
            }),
            miscellaneous: this.fb.group({
                description: [''],
                couponImage: ['']
            }),
        });
    }

    private initFormCheck(): void {
        combineLatest([
            this.triggerStatus$,
            this.form.statusChanges as Observable<FormStatus>,
        ]).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(([_, value]) => HelperService.debug('[BEFORE MAP] PERIOD TARGET PROMO REWARD INFORMATION FORM VALUE CHANGED', value)),
            map(([_, status]) => {
                const rawValue = this.form.getRawValue();

                if (!rawValue.rewardValidDate.activeStartDate || !rawValue.rewardValidDate.activeEndDate) {
                    return 'INVALID';
                } else {
                    return status;
                }
            }),
            tap(value => HelperService.debug('[AFTER MAP] PERIOD TARGET PROMO REWARD INFORMATION FORM VALUE CHANGED', value)),
            // tap(value => HelperService.debug('PERIOD TARGET PROMO REWARD INFORMATION FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(200),
            tap(value => HelperService.debug('[BEFORE MAP] PERIOD TARGET PROMO REWARD INFORMATON FORM VALUE CHANGED', value)),
            map(() => {
                const rawValue = this.form.getRawValue();

                const newValue = {
                    ...rawValue,
                };

                newValue.trigger = {
                    ...newValue.trigger,
                    base: newValue.trigger.base,
                    chosenSku: newValue.trigger.chosenSku.length === 0 ? [] : newValue.trigger.chosenSku,
                    chosenBrand: newValue.trigger.chosenBrand.length === 0 ? [] : newValue.trigger.chosenBrand,
                    chosenFaktur: newValue.trigger.chosenFaktur.length === 0 ? [] : newValue.trigger.chosenFaktur,
                };

                return newValue;
            }),
            tap(value => HelperService.debug('[AFTER MAP] PERIOD TARGET PROMO REWARD INFORMATON FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
        });

        this.form.get('trigger.base').valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('PERIOD TARGET PROMO REWARD INFORMATION TRIGGER BASE VALUE CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'sku') {
                this.form.get('trigger.chosenSku').enable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenBrand').disable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenFaktur').disable({ onlySelf: false, emitEvent: true });
            } else if (value === 'brand') {
                this.form.get('trigger.chosenSku').disable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenBrand').enable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenFaktur').disable({ onlySelf: false, emitEvent: true });
            } else if (value === 'faktur') {
                this.form.get('trigger.chosenSku').disable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenBrand').disable({ onlySelf: false, emitEvent: true });
                this.form.get('trigger.chosenFaktur').enable({ onlySelf: false, emitEvent: true });
            }

            this.form.updateValueAndValidity();
        });

        this.form.get('condition.base').valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('PERIOD TARGET PROMO REWARD INFORMATION CONDITION BASE VALUE CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value === 'qty') {
                this.form.get('condition.qty').enable({ onlySelf: true, emitEvent: true });
                this.form.get('condition.value').disable({ onlySelf: true, emitEvent: true });
            } else if (value === 'order-value') {
                this.form.get('condition.qty').disable({ onlySelf: true, emitEvent: true });
                this.form.get('condition.value').enable({ onlySelf: true, emitEvent: true });
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

    onCatalogueSelected(event: Array<any>): void {
        this.form.get('trigger.chosenSku').markAsDirty({ onlySelf: true });
        this.form.get('trigger.chosenSku').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('trigger.chosenSku').setValue('');
        } else {
            this.form.get('trigger.chosenSku').setValue(event);
        }
    }

    onBrandSelected(event: Array<Brand>): void {
        this.form.get('trigger.chosenBrand').markAsDirty({ onlySelf: true });
        this.form.get('trigger.chosenBrand').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('trigger.chosenBrand').setValue('');
        } else {
            this.form.get('trigger.chosenBrand').setValue(event);
        }
    }

    onFakturSelected(event: Array<InvoiceGroup>): void {
        this.form.get('trigger.chosenFaktur').markAsDirty({ onlySelf: true });
        this.form.get('trigger.chosenFaktur').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('trigger.chosenFaktur').setValue('');
        } else {
            this.form.get('trigger.chosenFaktur').setValue(event);
        }
    }

    onChangeActiveStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const activeStartDate = moment(ev.value);

        if (this.form.get('rewardValidDate.activeEndDate').value) {
            const activeEndDate = moment(this.form.get('rewardValidDate.activeEndDate').value);

            if (activeStartDate.isAfter(activeEndDate)) {
                this.form.get('rewardValidDate.activeEndDate').reset();
            }
        }

        this.minActiveEndDate = activeStartDate.add(1, 'minute').toDate();
        this.triggerStatus$.next('');
    }

    onChangeActiveEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        const activeEndDate = moment(ev.value);

        if (this.form.get('rewardValidDate.activeStartDate').value) {
            const activeStartDate = moment(this.form.get('rewardValidDate.activeStartDate').value);

            if (activeEndDate.isBefore(activeStartDate)) {
                this.form.get('rewardValidDate.activeStartDate').reset();
            }
        }

        this.maxActiveStartDate = activeEndDate.toDate();
        this.triggerStatus$.next('');
    }

    onFileBrowse(ev: Event): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                const photoField = this.form.get('miscellaneous.couponImage');

                const fileReader = new FileReader();

                fileReader.onload = () => {
                    photoField.setValue(fileReader.result);
                    this.tmpCouponImage.setValue(file.name);

                    if (photoField.invalid) {
                        photoField.markAsTouched();
                    }
                };

                fileReader.readAsDataURL(file);
            }
        }

        return;
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

        this.triggerStatus$.next('');
        this.triggerStatus$.complete();

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
