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
import { Subject, Observable, of, combineLatest, BehaviorSubject, merge } from 'rxjs';

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
import { Voucher } from '../../models';
import { VoucherActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as moment from 'moment';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Selection } from 'app/shared/components/multiple-selection/models';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'voucher-benefit-information',
    templateUrl: './benefit.component.html',
    styleUrls: ['./benefit.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherBenefitInformationComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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
    @Output() formValueChange: EventEmitter<Voucher> = new EventEmitter<Voucher>();

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

    private prepareEdit(): void {}

    private initForm(): void {
        this.form = this.fb.group({
            id: [''],
            base: ['rupiah'],
            rupiah: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            percent: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
        });

        this.form
            .get('base')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.subs$))
            .subscribe((value) => {
                if (value === 'rupiah') {
                    this.form.get('rupiah').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').disable({ onlySelf: true, emitEvent: true });
                } else if (value === 'percent') {
                    this.form.get('rupiah').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').enable({ onlySelf: true, emitEvent: true });
                }

                this.form.updateValueAndValidity();
            });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                tap((value) =>
                    HelperService.debug(
                        'PERIOD TARGET PROMO REWARD INFORMATION FORM STATUS CHANGED:',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] PERIOD TARGET PROMO REWARD INFORMATON FORM VALUE CHANGED',
                        value
                    )
                ),
                map(() => {
                    const rawValue = this.form.getRawValue();

                    const newValue = {
                        ...rawValue,
                    };

                    newValue.trigger = {
                        ...newValue.trigger,
                        base: newValue.trigger.base,
                        chosenSku:
                            newValue.trigger.chosenSku.length === 0
                                ? []
                                : newValue.trigger.chosenSku,
                        chosenBrand:
                            newValue.trigger.chosenBrand.length === 0
                                ? []
                                : newValue.trigger.chosenBrand,
                        chosenFaktur:
                            newValue.trigger.chosenFaktur.length === 0
                                ? []
                                : newValue.trigger.chosenFaktur,
                    };

                    return newValue;
                }),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] PERIOD TARGET PROMO REWARD INFORMATON FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });

        this.form
            .get('trigger.base')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        'PERIOD TARGET PROMO REWARD INFORMATION TRIGGER BASE VALUE CHANGED:',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                if (value === 'sku') {
                    this.form.get('trigger.chosenSku').enable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenBrand')
                        .disable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenFaktur')
                        .disable({ onlySelf: false, emitEvent: true });
                } else if (value === 'brand') {
                    this.form
                        .get('trigger.chosenSku')
                        .disable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenBrand')
                        .enable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenFaktur')
                        .disable({ onlySelf: false, emitEvent: true });
                } else if (value === 'faktur') {
                    this.form
                        .get('trigger.chosenSku')
                        .disable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenBrand')
                        .disable({ onlySelf: false, emitEvent: true });
                    this.form
                        .get('trigger.chosenFaktur')
                        .enable({ onlySelf: false, emitEvent: true });
                }

                this.form.updateValueAndValidity();
            });

        this.form
            .get('condition.base')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        'PERIOD TARGET PROMO REWARD INFORMATION CONDITION BASE VALUE CHANGED:',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
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

    onCatalogueSelected(event: Array<Catalogue>): void {
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
