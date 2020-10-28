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
    TemplateRef,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject, throwError } from 'rxjs';
//
import { FeatureState as VoucherCoreFeatureState } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import {
    FormGroup,
    FormBuilder,
    AsyncValidatorFn,
    AbstractControl,
    ValidationErrors,
    FormControl,
    FormArray,
} from '@angular/forms';
import {
    RxwebValidators,
    RxFormBuilder,
    RxFormArray,
    NumericValueType,
} from '@rxweb/reactive-form-validators';
import {
    distinctUntilChanged,
    debounceTime,
    withLatestFrom,
    take,
    switchMap,
    map,
    takeUntil,
    tap,
    filter,
    mergeMap,
    retry,
    first,
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
import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { Selection } from 'app/shared/components/multiple-selection/models';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'voucher-condition-settings',
    templateUrl: './condition-settings.component.html',
    styleUrls: ['./condition-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherConditionSettingsComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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

    // tslint:disable-next-line: no-inferrable-types
    labelLength: number = 10;
    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;

    // Untuk keperluan handle dialog.
    dialog: ApplyDialogService<ElementRef<HTMLElement>>;

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
    @ViewChild('whatIsThisHint', { static: true, read: HTMLElement }) selectHint: TemplateRef<
        ElementRef<HTMLElement>
    >;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private applyDialogFactory$: ApplyDialogFactoryService<ElementRef<HTMLElement>>,
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
                    base: voucher.conditionBase === 'value' ? 'order-value' : voucher.conditionBase,
                    qty: voucher.conditionQty,
                    orderValue: voucher.conditionValue,
                });

                if (voucher.benefitType === 'qty') {
                    this.form.get('qty').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('orderValue').disable({ onlySelf: true, emitEvent: true });
                } else if (voucher.benefitType === 'value') {
                    this.form.get('qty').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('orderValue').enable({ onlySelf: true, emitEvent: true });
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
            base: ['qty'],
            qty: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            orderValue: [
                { value: '', disabled: true },
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
                if (value === 'qty') {
                    this.form.get('qty').enable({ onlySelf: true, emitEvent: true });
                    this.form.get('orderValue').disable({ onlySelf: true, emitEvent: true });
                } else if (value === 'order-value') {
                    this.form.get('qty').disable({ onlySelf: true, emitEvent: true });
                    this.form.get('orderValue').enable({ onlySelf: true, emitEvent: true });
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
                        'SUPPLIER VOUCHER CONDITION INFORMATION FORM STATUS CHANGED:',
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
                tap(value => HelperService.debug('SUPPLIER VOUCHER CONDITION INFORMATION FORM VALUE CHANGED', value)),
                // tap((value) =>
                //     HelperService.debug(
                //         '[BEFORE MAP] SUPPLIER VOUCHER CONDITION INFORMATION FORM VALUE CHANGED',
                //         value
                //     )
                // ),
                // map((value) => ({
                //     ...value,
                //     chosenSku: !value.chosenSku ? [] : value.chosenSku,
                //     chosenBrand: !value.chosenBrand ? [] : value.chosenBrand,
                //     chosenFaktur: !value.chosenFaktur ? [] : value.chosenFaktur,
                // })),
                // tap((value) =>
                //     HelperService.debug(
                //         '[AFTER MAP] SUPPLIER VOUCHER CONDITION INFORMATION FORM VALUE CHANGED',
                //         value
                //     )
                // ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
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

    openHint(): void {
        this.dialog = this.applyDialogFactory$.open(
            {
                title: 'Calculation Mechanism',
                template: this.selectHint,
                isApplyEnabled: false,
                showApplyButton: false,
            },
            {
                disableClose: false,
                width: '50vw',
                minWidth: '50vw',
                maxWidth: '50vw',
            }
        );

        this.dialog.closed$.subscribe({
            complete: () => HelperService.debug('DIALOG HINT CLOSED', {}),
        });
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

        this.chosenSku$.next(null);
        this.chosenSku$.complete();

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
