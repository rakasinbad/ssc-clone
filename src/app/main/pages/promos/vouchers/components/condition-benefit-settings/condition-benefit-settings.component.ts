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
import { Voucher } from '../../models';
import { VoucherActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
import { Catalogue } from 'app/main/pages/catalogues/models';
import { InvoiceGroup } from 'app/shared/models/invoice-group.model';
import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { VoucherTriggerInformationService } from '../trigger-information/services';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'voucher-trigger-condition-benefit-settings',
    templateUrl: './condition-benefit-settings.component.html',
    styleUrls: ['./condition-benefit-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherTriggerConditionBenefitSettingsComponent
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
        private errorMessage$: ErrorMessageService,
        private triggerInformation$: VoucherTriggerInformationService
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
                        'PERIOD TARGET PROMO TRIGGER INFORMATON FORM STATUS CHANGED:',
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
                // tap(value => HelperService.debug('PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED', value)),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED',
                        value
                    )
                ),
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
                map((value) => ({
                    ...value,
                    chosenSku: !value.chosenSku ? [] : value.chosenSku,
                    chosenBrand: !value.chosenBrand ? [] : value.chosenBrand,
                    chosenFaktur: !value.chosenFaktur ? [] : value.chosenFaktur,
                })),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] PERIOD TARGET PROMO TRIGGER INFORMATON FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
                this.triggerInformation$.setValue(value);
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
