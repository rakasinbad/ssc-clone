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
import { RxwebValidators, NumericValueType } from '@rxweb/reactive-form-validators';
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
import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { Selection } from 'app/shared/components/multiple-selection/models';

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
                    base: voucher.benefitType,
                    rupiah: voucher.benefitRebate,
                    percent: voucher.benefitDiscount,
                    benefitMaxRebate: voucher.benefitMaxRebate,
                });

                if (voucher.benefitType === 'amount') {
                    this.form.get('rupiah').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('benefitMaxRebate').disable({ onlySelf: true, emitEvent: true });
                } else if (voucher.benefitType === 'percent') {
                    this.form.get('rupiah').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('benefitMaxRebate').enable({ onlySelf: true, emitEvent: true });
                }

                if (this.formMode === 'view') {
                    this.form.get('base').disable({ onlySelf: true, emitEvent: true });
                } else {
                    this.form.get('base').enable({ onlySelf: true, emitEvent: true });
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
            base: ['amount'],
            rupiah: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            percent: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.pattern({
                        expression:{'onlyNumber': /^(0|[1-9]\d*)(\.\d+)?$/},
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.maxNumber({
                        value: 100,
                        message: 'Max input is 100',
                    }),
                ],
            ],
            benefitMaxRebate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    // max length 12 character
                    RxwebValidators.maxLength({
                        value: 12,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
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
                tap((value) =>
                    HelperService.debug(
                        'PERIOD TARGET PROMO REWARD INFORMATION FORM STATUS CHANGED:',
                        value
                    )
                ),
                map((status) => {
                    const rawValue = this.form.getRawValue();
                    if (rawValue.base == 'amount' && (rawValue.rupiah == '' || rawValue.rupiah == null)) {
                        return 'INVALID';
                    } else if (rawValue.base == 'percent' && 
                    (rawValue.benefitMaxRebate == '' || rawValue.benefitMaxRebate == null) &&
                    (rawValue.percent == '' || rawValue.percent == null)) {
                        return 'INVALID';
                    } else {
                        return status;
                    }
                }),
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
                        'SUPPLIER VOUCHER BENEFIT INFORMATON FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });

        this.form.get('base')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        'SUPPLIER VOUCHER BENEFIT INFORMATION CONDITION BASE VALUE CHANGED:',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                if (value === 'amount') {
                    this.form.get('rupiah').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('benefitMaxRebate').disable({ onlySelf: true, emitEvent: true });
                } else if (value === 'percent') {
                    this.form.get('rupiah').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('percent').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('benefitMaxRebate').enable({ onlySelf: true, emitEvent: true });
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

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.initForm();

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
