import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject, throwError } from 'rxjs';
// 
import { FeatureState as PeriodTargetPromoCoreFeatureState } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { RxwebValidators, RxFormBuilder, RxFormArray, NumericValueType } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap, filter, mergeMap, retry, first } from 'rxjs/operators';
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
import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { PeriodTargetPromoTriggerInformationService } from '../trigger-information/services';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'period-target-promo-trigger-condition-benefit-settings',
    templateUrl: './condition-benefit-settings.component.html',
    styleUrls: ['./condition-benefit-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoTriggerConditionBenefitSettingsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    private formSubs$: Array<Subject<void>> = [];
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan mengirim nilai yang terpilih ke component multiple selection.
    chosenSku$: BehaviorSubject<Selection> = new BehaviorSubject<Selection>(null);
    // Untuk menyimpan daftar platform.
    platforms$: Observable<Array<Brand>>;
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';
    // Untuk menandakan apakah trigger SKU memiliki SKU lebih dari 1.
    // tslint:disable-next-line: no-inferrable-types
    hasMultipleSKUs: boolean = false;
    // tslint:disable-next-line: no-inferrable-types
    isTriggeredBySKU: boolean = true;
    // tslint:disable-next-line: no-inferrable-types
    isSelectCatalogueDisabled: boolean = false;
    // Untuk menyimpan SKU yang terpilih di trigger information.
    triggerSKUs: Array<Catalogue> = [];
    // Untuk menyimpan tier terakhir apakah valid atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    isLastTierValid: boolean = false;

    // tslint:disable-next-line: no-inferrable-types
    labelLength: number = 10;
    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;

    // Untuk keperluan handle dialog.
    dialog: ApplyDialogService<ElementRef<HTMLElement>>;

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
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    // Untuk styling form field di mode form yang berbeda.
    formClass: {
        'custom-field': boolean;
        'view-field label-no-padding': boolean;
    };

    // @ViewChild('imageSuggestionPicker', { static: false, read: ElementRef }) imageSuggestionPicker: ElementRef<HTMLInputElement>;
    @ViewChild('whatIsThisHint', { static: true, read: HTMLElement }) selectHint: TemplateRef<ElementRef<HTMLElement>>;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private applyDialogFactory$: ApplyDialogFactoryService<ElementRef<HTMLElement>>,
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
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
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

    private patchConditionBenefitForm(source: PeriodTargetPromo, index: number): void {
        if (!this.form.get(['conditionBenefit', index])) {
            this.addConditionBenefitForm();
        }

        let benefitType: string = source.promoConditions[index].benefitType;
        let patchValue: any = {
            id: source.promoConditions[index].id,
            condition: {
                base: source.promoConditions[index].conditionBase === 'value' ? 'order-value' : source.promoConditions[index].conditionBase,
                qty: source.promoConditions[index].conditionQty,
                value: String(source.promoConditions[index].conditionValue).replace('.', ','),
                valueView: source.promoConditions[index].conditionValue,
            },
        };

        switch (benefitType) {
            case 'qty':
                const catalogue = source.promoConditions[index].catalogue;

                this.chosenSku$.next({
                    id: catalogue.id,
                    label: catalogue.name,
                    group: 'catalogues'
                });

                benefitType = 'qty';
                patchValue = {
                    ...patchValue,
                    benefit: {
                        ...patchValue.benefit,
                        base: benefitType,
                        qty: {
                            bonusSku: {
                                id: catalogue.id,
                                label: catalogue.name,
                                group: 'catalogues'
                            },
                            // applySameSku: 
                            bonusQty: source.promoConditions[index].benefitBonusQty,
                            multiplicationOnly: !!source.promoConditions[index].multiplication,
                        }
                    }
                };
                break;
            case 'amount':
                benefitType = 'cash';
                patchValue = {
                    ...patchValue,
                    benefit: {
                        ...patchValue.benefit,
                        base: benefitType,
                        cash: {
                            rebate: source.promoConditions[index].benefitRebate,
                        }
                    }
                };
                break;
            case 'percent':
                benefitType = 'percent';
                patchValue = {
                    ...patchValue,
                    benefit: {
                        ...patchValue.benefit,
                        base: benefitType,
                        percent: {
                            percentDiscount: source.promoConditions[index].benefitDiscount,
                            maxRebate: source.promoConditions[index].benefitMaxRebate,
                        }
                    }
                };
                break;
        }

        this.form.get(['conditionBenefit', index]).patchValue(patchValue);

        if (this.isViewMode()) {
            this.form.get(['conditionBenefit', index, 'condition', 'base']).disable({ onlySelf: true, emitEvent: false });
            this.form.get(['conditionBenefit', index, 'benefit', 'base']).disable({ onlySelf: true, emitEvent: false });
            this.form.get(['conditionBenefit', index, 'benefit', 'qty', 'applySameSku']).disable({ onlySelf: true, emitEvent: false });
            this.form.get(['conditionBenefit', index, 'benefit', 'qty', 'multiplicationOnly']).disable({ onlySelf: true, emitEvent: false });
        } else {
            this.form.get(['conditionBenefit', index, 'condition', 'base']).enable({ onlySelf: true, emitEvent: true });
            this.form.get(['conditionBenefit', index, 'benefit', 'base']).enable({ onlySelf: true, emitEvent: true });
            this.form.get(['conditionBenefit', index, 'benefit', 'qty', 'applySameSku']).enable({ onlySelf: true, emitEvent: true });
            this.form.get(['conditionBenefit', index, 'benefit', 'qty', 'multiplicationOnly']).enable({ onlySelf: true, emitEvent: true });
        }

        this.form.updateValueAndValidity();
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

            this.form.patchValue({
                id: periodTargetPromo.id,
                calculationMechanism: periodTargetPromo.isComulative ? 'cummulative' : 'non-cummulative',
            });

            if (this.isViewMode()) {
                this.form.get('calculationMechanism').disable({ onlySelf: true, emitEvent: false });
            } else {
                this.form.get('calculationMechanism').enable({ onlySelf: true, emitEvent: false });
            }

            for (const [idx, _] of periodTargetPromo.promoConditions.entries()) {
                this.patchConditionBenefitForm(periodTargetPromo, idx);
            }

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    checkRebate(index: number): AsyncValidatorFn {
        const check = () => {
            if (this.form.get(['conditionBenefit', index, 'condition', 'value']).disabled) {
                return null;
            }

            const conditionValue = +this.form.get(['conditionBenefit', index, 'condition', 'value']).value;
            const cashRebate = +this.form.get(['conditionBenefit', index, 'benefit', 'cash', 'rebate']).value;

            if (cashRebate < conditionValue) {
                return null;
            }

            return {
                lessThan: {
                    message: `This field must less than ${conditionValue}`
                }
            };
        };

        return (): Observable<ValidationErrors | null> => {
            return of(check()).pipe(first());
        };
    }

    addConditionBenefitForm(): void {
        const subject: Subject<void> = new Subject<void>();

        (this.form.get('conditionBenefit') as FormArray).push(
            this.fb.group({
                subject: [subject],
                id: [''],
                condition: this.fb.group({
                    base: ['qty'],
                    qty: ['', [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                        }),
                        RxwebValidators.digit({
                            message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ]],
                    value: ['', [
                        RxwebValidators.numeric({
                            allowDecimal: true,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                        }),
                    ]],
                    valueView: [],
                }),
                benefit: this.fb.group({
                    base: ['qty'],
                    // QUANITY (QTY) BASED
                    qty: this.fb.group({
                        bonusSku: ['', [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]],
                        applySameSku: [false],
                        bonusQty: ['1', [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                            }),
                            RxwebValidators.digit({
                                message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                            }),
                            RxwebValidators.minNumber({
                                value: 1,
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'min_number',
                                    { minValue: 1 }
                                ),
                            }),
                        ]],
                        multiplicationOnly: [false],
                    }),
                    // PERCENT (%) BASED
                    percent: this.fb.group({
                        percentDiscount: ['', [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            }),
                            RxwebValidators.numeric({
                                allowDecimal: true,
                                acceptValue: NumericValueType.PositiveNumber,
                                message: 'This field must be numeric.'
                            }),
                            RxwebValidators.range({
                                minimumNumber: 0,
                                maximumNumber: 100,
                                message: 'Only accept with range 0 and 100.'
                            }),
                        ]],
                        maxRebate: ['', [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                )
                            })
                        ]],
                    }),
                    // CASH BASED
                    cash: this.fb.group({
                        rebate: ['', [
                            RxwebValidators.numeric({
                                acceptValue: NumericValueType.PositiveNumber,
                                allowDecimal: true,
                                message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                            }),
                        ]],
                    }),
                })
            })
        );

        const lastIdx = (this.form.get('conditionBenefit') as FormArray).controls.length - 1;
        const lastControl = (this.form.get(['conditionBenefit', lastIdx]) as FormGroup);

        if ((this.form.get('conditionBenefit') as FormArray).length > 1 && !this.isViewMode()) {
            const multiplication = this.form.get(['conditionBenefit', 0, 'benefit', 'qty', 'multiplicationOnly']);

            multiplication.disable({ onlySelf: true, emitEvent: true });
            multiplication.reset();
        }

        (lastControl.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(status => HelperService.debug('CONDITION BENEFITS STATUS CHANGED', { index: lastIdx, status, control: lastControl })),
            takeUntil(subject),
        ).subscribe({
            next: status => {
                this.isLastTierValid = status === 'VALID';
            },
            complete: () => HelperService.debug('CONDITION BENEFITS VALUE STATUS COMPLETED', { index: lastIdx, control: lastControl })
        });

        lastControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('CONDITION BENEFITS VALUE CHANGED', { index: lastIdx, value, control: lastControl })),
            takeUntil(subject),
        ).subscribe({
            next: value => {
                if (lastControl.enabled && value.condition) {
                    if (value.condition.base === 'qty') {
                        lastControl.get('condition.qty').enable({ onlySelf: true, emitEvent: true });
                        lastControl.get('condition.value').disable({ onlySelf: true, emitEvent: true });
                    } else if (value.condition.base === 'order-value') {
                        lastControl.get('condition.qty').disable({ onlySelf: true, emitEvent: true });
                        lastControl.get('condition.value').enable({ onlySelf: true, emitEvent: true });
                    }

                    switch (value.benefit.base) {
                        case 'qty':
                            lastControl.get('benefit.qty').enable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.percent').disable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.cash').disable({ onlySelf: true, emitEvent: true });
                            break;
                        case 'percent':
                            lastControl.get('benefit.qty').disable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.percent').enable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.cash').disable({ onlySelf: true, emitEvent: true });
                            break;
                        case 'cash':
                            lastControl.get('benefit.qty').disable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.percent').disable({ onlySelf: true, emitEvent: true });
                            lastControl.get('benefit.cash').enable({ onlySelf: true, emitEvent: true });
                            break;
                    }
                }

            },
            complete: () => HelperService.debug('CONDITION BENEFITS VALUE CHANGES COMPLETED', { index: lastIdx, control: lastControl })
        });

        const controls = (this.form.get('conditionBenefit') as FormArray).controls;
        for (const [idx, control] of controls.entries()) {
            if (idx !== (controls.length - 1)) {
                setTimeout(() => control.disable({ onlySelf: false, emitEvent: false }), 150);
            }
        }

        setTimeout(() => {
            if (lastIdx > 0) {
                const previousControl = (this.form.get(['conditionBenefit', lastIdx - 1]) as FormGroup);
                const previousConditionBase = previousControl.get('condition.base').value;
                const previousConditionQty = +previousControl.get('condition.qty').value;
                const previousConditionValue = +previousControl.get('condition.value').value;

                lastControl.get('condition.base').setValue(previousConditionBase);

                if (previousConditionBase === 'qty') {
                    lastControl.get('condition.value').disable({ onlySelf: true, emitEvent: false });

                    // Condition Qty.
                    lastControl.get('condition.qty').setValue(previousConditionQty + 1);
                    lastControl.get('condition.qty').setValidators([
                        RxwebValidators.numeric({
                            allowDecimal: false,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                        RxwebValidators.greaterThan({
                            value: previousConditionQty,
                            message: `This field must greater than ${previousConditionQty}`
                        })
                    ]);
                } else if (previousConditionBase === 'order-value') {
                    lastControl.get('condition.qty').disable({ onlySelf: true, emitEvent: false });

                    // Condition Order Value
                    lastControl.get('condition.value').setValue(previousConditionValue + 1);
                    lastControl.get('condition.value').setValidators([
                        RxwebValidators.numeric({
                            allowDecimal: true,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                        RxwebValidators.greaterThan({
                            value: previousConditionValue,
                            message: `This field must greater than ${previousConditionValue}`
                        })
                    ]);
                }

                const previousBenefitBase = previousControl.get('benefit.base').value;
                lastControl.get('benefit.base').setValue(previousBenefitBase);

                if (previousBenefitBase === 'qty') {
                    lastControl.get('benefit.percent').disable({ onlySelf: true, emitEvent: false });
                    lastControl.get('benefit.cash').disable({ onlySelf: true, emitEvent: false });
                    const previousBonusQty = +previousControl.get('benefit.qty.bonusQty').value;

                    // BONUS QTY
                    lastControl.get('benefit.qty.bonusQty').setValue(previousBonusQty + 1);
                    lastControl.get('benefit.qty.bonusQty').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.numeric({
                            allowDecimal: false,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                        RxwebValidators.greaterThan({
                            value: previousBonusQty,
                            message: `This field must greater than ${previousBonusQty}`
                        })
                    ]);
                } else if (previousBenefitBase === 'percent') {
                    lastControl.get('benefit.qty').disable({ onlySelf: true, emitEvent: false });
                    lastControl.get('benefit.cash').disable({ onlySelf: true, emitEvent: false });
                    const previousBonusPercentDiscount = +previousControl.get('benefit.percent.percentDiscount').value;
                    const previousBonusMaxRebate = +previousControl.get('benefit.percent.maxRebate').value;

                    // BONUS % DISCOUNT
                    lastControl.get('benefit.percent.percentDiscount').setValue(previousBonusPercentDiscount - 1);
                    lastControl.get('benefit.percent.percentDiscount').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.numeric({
                            allowDecimal: true,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                        RxwebValidators.range({
                            minimumNumber: 0,
                            maximumNumber: 100,
                            message: 'Only accept with range 0 and 100.'
                        }),
                        RxwebValidators.lessThan({
                            value: previousBonusPercentDiscount,
                            message: `This field must less than ${previousBonusPercentDiscount}`
                        })
                    ]);

                    // BONUS MAX REBATE
                    lastControl.get('benefit.percent.maxRebate').setValue(previousBonusMaxRebate - 1);
                    lastControl.get('benefit.percent.maxRebate').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.numeric({
                            allowDecimal: true,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                        RxwebValidators.lessThan({
                            value: previousBonusMaxRebate,
                            message: `This field must less than ${previousBonusMaxRebate}`
                        })
                    ]);
                } else if (previousBenefitBase === 'cash') {
                    lastControl.get('benefit.qty').disable({ onlySelf: true, emitEvent: false });
                    lastControl.get('benefit.percent').disable({ onlySelf: true, emitEvent: false });
                    const previousBonusRebate = +previousControl.get('benefit.cash.rebate').value;

                    // BONUS CASH REBATE
                    lastControl.get('benefit.cash.rebate').setValue(previousBonusRebate - 1);
                    lastControl.get('benefit.cash.rebate').setAsyncValidators([
                        this.checkRebate(lastIdx)
                    ]);
                    lastControl.get('benefit.cash.rebate').setValidators([
                        RxwebValidators.numeric({
                            allowDecimal: true,
                            acceptValue: NumericValueType.PositiveNumber,
                            message: 'This field must be numeric.'
                        }),
                    ]);
                }
            } else {
                lastControl.get('benefit.cash.rebate').setAsyncValidators([
                    this.checkRebate(lastIdx)
                ]);

                lastControl.get('benefit.cash.rebate').setValidators([
                    RxwebValidators.numeric({
                        allowDecimal: true,
                        acceptValue: NumericValueType.PositiveNumber,
                        message: 'This field must be a positive number.'
                    }),
                ]);

                lastControl.updateValueAndValidity();
            }
        }, 100);
    }

    removeConditionBenefitForm(index: number, control: AbstractControl): void {
        if (control) {
            const subject: Subject<void> = control.get('subject').value as Subject<void>;
            subject.next();
            subject.complete();
        }

        (this.form.get('conditionBenefit') as FormArray).removeAt(index);

        if ((this.form.get('conditionBenefit') as FormArray).length === 1 && !this.isViewMode()) {
            const multiplication = this.form.get(['conditionBenefit', 0, 'benefit', 'qty', 'multiplicationOnly']);

            multiplication.enable({ onlySelf: true, emitEvent: false });
            multiplication.reset(false);
        }

        const controls = (this.form.get('conditionBenefit') as FormArray).controls;
        for (const [idx, kontrol] of controls.entries()) {
            if (idx === (controls.length - 1)) {
                kontrol.enable({ onlySelf: true, emitEvent: true });
                kontrol.markAsDirty();
                kontrol.markAllAsTouched();
            }
        }

        this.form.get('conditionBenefit').updateValueAndValidity();
    }

    private initForm(): void {
        this.form = this.fb.group({
            id: [''],
            calculationMechanism: ['non-cummulative'],
            conditionBenefit: this.fb.array([]),
        });

        this.addConditionBenefitForm();
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('PERIOD TARGET PROMO CONDITON & BENEFIT SETTINGS FORM STATUS CHANGED:', value)),
            // filter(value => {
            //     if (value === 'PENDING') {
            //         this.form.updateValueAndValidity();
            //         return false;
            //     }

            //     return true;
            // }),
            // retry(1),
            takeUntil(this.subs$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(200),
            tap(value => HelperService.debug('[BEFORE MAP] PERIOD TARGET PROMO CONDITON & BENEFIT SETTINGS FORM VALUE CHANGED', value)),
            map(() => {
                const rawValue = this.form.getRawValue();

                return {
                    ...rawValue,
                    conditionBenefit: rawValue.conditionBenefit.map(data => ({ id: data.id, condition: data.condition, benefit: data.benefit }))
                };
            }),
            tap(value => HelperService.debug('[AFTER MAP] PERIOD TARGET PROMO CONDITON & BENEFIT SETTINGS FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.formValueChange.emit(value);
        });

        this.triggerInformation$.getValue().pipe(
            tap(value => HelperService.debug('triggerInformation$ CHANGED:', value)),
            filter(value => !!value),
            takeUntil(this.subs$)
        ).subscribe(value => {
            this.triggerSKUs = value.chosenSku;
            this.isTriggeredBySKU = value.base === 'sku';

            if (value.chosenSku.length > 1) {
                this.hasMultipleSKUs = true;
            } else {
                this.hasMultipleSKUs = false;
            }

            this.form.get(['conditionBenefit', 0, 'benefit', 'qty', 'applySameSku']).reset();
        });

        (this.form.get(['conditionBenefit', 0, 'benefit', 'qty', 'applySameSku']).valueChanges as Observable<boolean>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('PERIOD TARGET PROMO CONDITON & BENEFIT SETTINGS APPLY SAME SKU CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
            if (value) {
                if (this.triggerSKUs[0]) {
                    this.chosenSku$.next({
                        id: this.triggerSKUs[0].id,
                        label: this.triggerSKUs[0].name,
                        group: 'catalogues',
                    });
                }

                this.isSelectCatalogueDisabled = true;
            } else {
                this.isSelectCatalogueDisabled = false;
            }
        });
    }

    private destroyTierSubs(): void {
        const controls = (this.form.get('conditionBenefit') as FormArray).controls;

        for (const control of controls) {
            const subject: Subject<void> = control.get('subject').value as Subject<void>;
            if (!subject.closed) {
                subject.next();
                subject.complete();
            }
        }
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

    openHint(): void {
        this.dialog = this.applyDialogFactory$.open({
            title: 'Calculation Mechanism',
            template: this.selectHint,
            isApplyEnabled: false,
            showApplyButton: false,
        }, {
            disableClose: false,
            width: '50vw',
            minWidth: '50vw',
            maxWidth: '50vw',
        });

        this.dialog.closed$.subscribe({
            complete: () => HelperService.debug('DIALOG HINT CLOSED', {}),
        });
    }

    onCatalogueSelected(event: Catalogue, control: FormControl): void {
        control.markAsDirty({ onlySelf: true });
        control.markAsTouched({ onlySelf: true });
        
        if (!event) {
            control.setValue('');
        } else {
            control.setValue(event);
        }

        control.updateValueAndValidity();
    }

    onBrandSelected(event: Array<Brand>): void {
        this.form.get('chosenBrand').markAsDirty({ onlySelf: true });
        this.form.get('chosenBrand').markAsTouched({ onlySelf: true });
        
        if (event.length === 0) {
            this.form.get('chosenBrand').setValue('');
        } else {
            this.form.get('chosenBrand').setValue(event);
        }
    }

    onFakturSelected(event: Array<InvoiceGroup>): void {
        this.form.get('chosenFaktur').markAsDirty({ onlySelf: true });
        this.form.get('chosenFaktur').markAsTouched({ onlySelf: true });
        
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

        this.chosenSku$.next(null);
        this.chosenSku$.complete();

        this.destroyTierSubs();
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
