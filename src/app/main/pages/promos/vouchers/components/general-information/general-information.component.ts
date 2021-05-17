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
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
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
import { MatDialog, MatRadioChange } from '@angular/material';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus } from 'app/shared/models/global.model';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as numeral from 'numeral';
import { VoucherAllocation } from 'app/shared/models/promo-allocation.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DomSanitizer } from '@angular/platform-browser';
import { ShowImageComponent } from 'app/shared/modals/show-image/show-image.component';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

export interface VoucherTerms {
    name: string;
}
export interface VoucherIns {
    name: string;
}
export interface VoucherTag {
    name: string;
}

type TmpKey = 'imageUrl';

@Component({
    selector: 'voucher-general-information',
    templateUrl: './general-information.component.html',
    styleUrls: ['./general-information.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherGeneralInformationComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk keperluan memicu adanya perubahan form status.
    private triggerStatus$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk menyimpan daftar platform.
    platforms$: Observable<Array<Brand>>;
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    // Untuk menampung foto yang ingin diupload sementara sebelum dikirim.
    tmpimageUrl: FormControl = new FormControl({ value: '', disabled: true });
    tmpCouponImage: FormControl = new FormControl({ value: '', disabled: true });
    tmp: Partial<Record<TmpKey, FormControl>> = {};

    // Untuk membatasi pemberian tanggal.
    minActiveStartDate: Date;
    maxActiveStartDate: Date;
    minActiveEndDate: Date;
    maxActiveEndDate: Date;

    // tslint:disable-next-line: no-inferrable-types
    labelLength: number = 10;
    // tslint:disable-next-line: no-inferrable-types
    formFieldLength: number = 40;

    // Untuk menyimpan platform-nya Sinbad yang tersedia.
    sinbadPlatforms: Array<{ id: string; label: string }> = [];

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

    private strictISOString = false;

    voucherAllocation = this.helper$.voucherAllocation();
    eVoucherAllocation = VoucherAllocation;
    sinbadVoucherType: Array<{ id: string; label: string }> = [];
    sinbadVoucherCategory: Array<{ id: string; label: string }> = [];
    public selectPromo: string;
    public selectTypeVoucher: string;

    visibleVoucherTerms = true;
    selectableVoucherTerms = true;
    removableVoucherTerms = true;
    addOnBlurVoucherTerms = true;
    visibleVoucherIns = true;
    selectableVoucherIns = true;
    removableVoucherIns = true;
    addOnBlurVoucherIns = true;
    visibleVoucherTag = true;
    selectableVoucherTag = true;
    removableVoucherTag = true;
    addOnBlurVoucherTag = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    voucherTerms: VoucherTerms[] = [];
    voucherIns: VoucherIns[] = [];
    voucherTag: VoucherTag[] = [];
    isiVoucher = [];
    public expirationCheck = false;
    startCollectFromHrMn: string;
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
        private errorMessage$: ErrorMessageService,
        private helper$: HelperService,
        private domSanitizer: DomSanitizer
    ) {
        // Untuk menyimpan platform-nya Sinbad yang tersedia.
        this.sinbadPlatforms = this.helper$.platformSupplierVoucher();
        this.sinbadVoucherType = this.helper$.supplierVoucherType();
        this.sinbadVoucherCategory = this.helper$.supplierVoucherCategory();
    }

    /**
     *
     * Handle change event for General Information Promo Allocation
     * @param {MatRadioChange} ev
     * @param {number} idx
     * @returns {void}
     * @memberof FlexiComboFormComponent
     */

    selectPromoAlloc(ev: MatRadioChange): void {
        this.selectPromo = ev.value;
        this.form.get('voucherAllocationType').setValidators([
            RxwebValidators.required({
                message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.choice({
                minLength: 1,
                message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
            }),
        ]);
    }

    selectVoucherType(value) {
        this.selectTypeVoucher = value.value;
        if (this.selectTypeVoucher == 'collectible') {
            this.expirationCheck = true;
        } else {
            this.expirationCheck = false;
        }
    }

    addVoucherTerms(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our voucher terms
        if ((value || '').trim()) {
            this.voucherTerms.push({ name: value.trim() });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.getVoucherTerm(this.voucherTerms);
    }

    removeVoucherTerms(voucherTerms: VoucherTerms): void {
        const index = this.voucherTerms.indexOf(voucherTerms);

        if (index >= 0) {
            this.voucherTerms.splice(index, 1);
        }
        this.getVoucherTerm(this.voucherTerms);
    }

    addVoucherIns(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our voucher ins
        if ((value || '').trim()) {
            this.voucherIns.push({ name: value.trim() });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.getVoucherIns(this.voucherIns);
    }

    removeVoucherIns(voucherIns: VoucherIns): void {
        const index = this.voucherIns.indexOf(voucherIns);

        if (index >= 0) {
            this.voucherIns.splice(index, 1);
        }
        this.getVoucherIns(this.voucherIns);
    }

    getVoucherTerm(value) {
        let sumData = value;
        let vv = [];
        for (let terms of value) {
            vv.push(terms.name);
        }
        this.form.get('termsAndConditions').setValue(vv);
    }

    getVoucherIns(value) {
        let total = value;
        let vv = [];
        for (let instvoucher of value) {
            vv.push(instvoucher.name);
        }
        this.form.get('instructions').setValue(vv);
    }

    /**
     *
     * Handle File Browse (Image / File)
     * @param {Event} ev
     * @param {string} type
     * @memberof FlexiComboFormComponent
     */
    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'imageUrl':
                        {
                            const imageUrlField = this.form.get('imageUrl');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                imageUrlField.setValue(fileReader.result);
                                this.tmp['imageUrl'].setValue({
                                    name: file.name,
                                    url: this.domSanitizer.bypassSecurityTrustUrl(
                                        window.URL.createObjectURL(file)
                                    ),
                                });

                                if (imageUrlField.invalid) {
                                    imageUrlField.markAsTouched();
                                }
                            };

                            fileReader.readAsDataURL(file);
                        }
                        break;

                    default:
                        break;
                }
            }
        } else {
            switch (type) {
                case 'imageUrl':
                    {
                        this.form.get('imageUrl').reset();
                        this.tmp['imageUrl'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    addVoucherTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our voucher tag
        if ((value || '').trim()) {
            this.voucherTag.push({ name: value.trim() });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.getVoucherTag(this.voucherTag);
    }

    removeVoucherTag(voucherTag: VoucherTag): void {
        const index = this.voucherTag.indexOf(voucherTag);

        if (index >= 0) {
            this.voucherTag.splice(index, 1);
        }
        this.getVoucherTag(this.voucherTag);
    }

    getVoucherTag(value) {
        let sumData = value;
        let vTag = [];
        for (let tag of value) {
            vTag.push(tag.name);
        }
        this.form.get('voucherTag').setValue(vTag);
    }

    onChangeActiveStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const activeStartDate = moment(ev.value);
        // this.form.get('activeEndDate').value = '2020-10-31';
        if (this.form.get('endDate').value) {
            const activeEndDate = moment(this.form.get('endDate').value);

            if (activeStartDate.isAfter(activeEndDate)) {
                this.form.get('endDate').reset();
            }
        }

        this.minActiveEndDate = activeStartDate.add(1, 'minute').toDate();
        this.triggerStatus$.next('');
        let stDateHrMn = moment(ev.value).format('YYYY-MM-DD 00:00');
        let stDate = moment(stDateHrMn).format();
        this.form.get('startDate').setValue(stDate);
    }

    onChangeActiveEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        const activeEndDate = moment(ev.value);

        if (this.form.get('startDate').value) {
            const activeStartDate = moment(this.form.get('startDate').value);

            if (activeEndDate.isBefore(activeStartDate)) {
                this.form.get('startDate').reset();
            }
        }

        this.maxActiveStartDate = activeEndDate.toDate();
        this.triggerStatus$.next('');
        let edDateHrMn = moment(ev.value).format('YYYY-MM-DD 23:59');
        let edDate = moment(edDateHrMn).format();
        this.form.get('endDate').setValue(edDate);
    }

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
                    externalId: voucher.externalId,
                    name: voucher.name,
                    platform: String(voucher.platform).toLowerCase(),
                    voucherType: voucher.voucherType,
                    voucherHeader: voucher.voucherHeader,
                    category: voucher.category,
                    maxCollectionPerStore: voucher.maxCollectionPerStore,
                    maxVoucherRedemption: voucher.maxVoucherRedemption,
                    voucherSlot: voucher.voucherSlot,
                    voucherBudget: voucher.voucherBudget,
                    startDate: moment(voucher.startDate).toDate(),
                    endDate: moment(voucher.endDate).toDate(),
                    description: voucher.description,
                    shortDescription: voucher.shortDescription,
                    termsAndConditions: voucher.termsAndConditions,
                    instructions: voucher.instructions,
                    imageUrl: voucher.imageUrl,
                    expirationDays: voucher.expirationDays,
                    voucherTag: voucher.voucherTag,
                    code: voucher.code,
                });

                this.selectTypeVoucher = voucher.voucherType;
                if (this.selectTypeVoucher == 'collectible') {
                    this.expirationCheck = true;
                } else {
                    this.expirationCheck = false;
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

        this.tmp['imageUrl'] = new FormControl({ value: '', disabled: true });

        this.form = this.fb.group({
            id: [''],
            voucherAllocationType: [
                VoucherAllocation.NONE ||
                    // VoucherAllocation.PROMOBUDGET ||
                    VoucherAllocation.PROMOSLOT,
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            externalId: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            name: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value:20,
                        message: 'Max input is 20 character'
                    })
                ],
            ],
            voucherType: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            voucherHeader: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.maxLength({
                        value: 20,
                        message: 'Max input is 20 character',
                    }),
                ],
            ],
            category: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            shortDescription: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            description: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            termsAndConditions: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            instructions: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            platform: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            maxCollectionPerStore: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.pattern({
                        expression:{'onlyNumber': /^[1-9][0-9]*$/},
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: 'Allowed minimum value is 1',
                    }),
                ],
            ],
            voucherBudget: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.maxNumber({
                        value: 999999999999,
                        message: 'Max input is 12 digit',
                    }),
                ],
            ],
            voucherSlot: [
                null,
                [
                    RxwebValidators.digit({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.pattern({
                        expression:{'onlyNumber': /^[1-9][0-9]*$/},
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.maxLength({
                        value: 8,
                        message: 'Max input is 8 digit',
                    }),
                ],
            ],
            imageUrl: [
                null,
                [
                    RxwebValidators.fileSize({
                        maxSize: Math.floor(5 * 1000 * 1000),
                        message: this.errorMessage$.getErrorMessageNonState(
                            'default',
                            'file_size_lte',
                            { size: numeral(5 * 1000 * 1000).format('0[.]0 b', Math.floor) }
                        ),
                    }),
                ],
            ],

            startDate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            endDate: [
                { value: null, disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            expirationDays: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: false,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.pattern({
                        expression:{'onlyNumber': /^[1-9][0-9]*$/},
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: 'Allowed minimum value is 1',
                    }),
                ],
            ],
            voucherTag: [''],
            code: [
                '',
                [
                    RxwebValidators.pattern({
                        expression:{'onlyAlphaNumber': /^[A-Za-z0-9]+$/},
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                    RxwebValidators.minLength({
                        value: 5,
                        message: 'Min input is 5 character',
                    }),
                    RxwebValidators.maxLength({
                        value: 10,
                        message: 'Max input is 10 character',
                    }),
                ],
            ],
        });

        this.form.updateValueAndValidity();
    }

    private initFormCheck(): void {
        combineLatest([this.triggerStatus$, this.form.statusChanges as Observable<FormStatus>])
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                tap(([_, value]) =>
                    HelperService.debug(
                        '[BEFORE MAP] SUPPLIER VOUCHER GENERAL INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                map(([_, status]) => {
                    const rawValue = this.form.getRawValue();
                    if (!rawValue.startDate || !rawValue.endDate) {
                        return 'INVALID';
                    } else if (
                        rawValue.voucherType == 'collectible' &&
                        (rawValue.expirationDays == null || rawValue.expirationDays == '')
                    ) {
                        return 'INVALID';
                    } else if (
                        rawValue.voucherType == 'collectible' &&
                        (rawValue.maxCollectionPerStore == null ||
                            rawValue.maxCollectionPerStore == '')
                    ) {
                        return 'INVALID';
                    } else if (
                        rawValue.voucherAllocationType == 'voucher_slot' &&
                        (rawValue.voucherSlot == null || rawValue.voucherSlot == '')
                    ) {
                        return 'INVALID';
                    } else if (
                        rawValue.termsAndConditions == '' ||
                        rawValue.termsAndConditions.length === 0
                    ) {
                        return 'INVALID';
                    } else if (rawValue.instructions == '' || rawValue.instructions.length === 0) {
                        return 'INVALID';
                    } else if (rawValue.imageUrl == null) {
                        return 'INVALID';
                    } else if (rawValue.imageUrl) {
                        return 'VALID';
                    } else {
                        return status;
                    }
                }),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] SUPPLIER VOUCHER GENERAL INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                // tap(value => HelperService.debug('SUPPLIER VOUCHER GENERAL INFORMATION FORM STATUS CHANGED:', value)),
                takeUntil(this.subs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                // tap(value => HelperService.debug('SUPPLIER VOUCHER GENERAL INFORMATION FORM VALUE CHANGED', value)),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] SUPPLIER VOUCHER GENERAL INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                map(() => {
                    return this.form.getRawValue();
                }),
                tap((value) =>
                       HelperService.debug(
                        '[AFTER MAP] SUPPLIER VOUCHER GENERAL INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });
    }

    public findInvalidControls() {
        const invalid = [];
        const controls = this.form.controls;
        for (const name in controls) {
            if (controls[name].invalid) {
                invalid.push(name);
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

    onShowImage(imageUrl: string, title: string): void {
        if (!imageUrl || !title) {
            return;
        }

        this.dialog.open(ShowImageComponent, {
            data: {
                title: title || '',
                url: imageUrl || '',
            },
            disableClose: true,
        });
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
