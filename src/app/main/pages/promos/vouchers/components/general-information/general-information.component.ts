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
import { PromoAllocation } from 'app/shared/models/promo-allocation.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DomSanitizer } from '@angular/platform-browser';

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

type TmpKey = 'imgSuggestion';

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
    tmpImageSuggestion: FormControl = new FormControl({ value: '', disabled: true });
    tmpCouponImage: FormControl = new FormControl({ value: '', disabled: true });
    tmp: Partial<Record<TmpKey, FormControl>> = {};

    // Untuk membatasi pemberian tanggal.
    minActiveStartDate: Date;
    maxActiveStartDate: Date;
    minActiveEndDate: Date;
    maxActiveEndDate: Date;

    minCollectibleFrom: Date;
    maxCollectibleFrom: Date;
    minCollectibleTo: Date;
    maxCollectibleTo: Date;

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

    promoAllocation = this.helper$.promoAllocation();
    ePromoAllocation = PromoAllocation;
    // supplierVoucherType = this.helper$.supplierVoucherType();
    // eSupplierVoucherType = SupplierVoucherType;
    sinbadVoucherType: Array<{ id: string; label: string }> = [];
    sinbadVoucherCategory: Array<{ id: string; label: string }> = [];
    // supplierVoucherCategory = this.helper$.supplierVoucherCategory();
    // eSupplierVoucherCategory = SupplierVoucherCategory;
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
        this.form.get('promoAllocationType').setValidators([
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
    }

    getVoucherIns(value) {
        let total = value;
        let vv = [];
        for(let instvoucher of value) {
            vv.push(instvoucher.name);
        }
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
                    case 'imgSuggestion':
                        {
                            const imgSuggestionField = this.form.get('imgSuggestion');

                            const fileReader = new FileReader();

                            fileReader.onload = () => {
                                imgSuggestionField.setValue(fileReader.result);
                                this.tmp['imgSuggestion'].setValue({
                                    name: file.name,
                                    url: this.domSanitizer.bypassSecurityTrustUrl(
                                        window.URL.createObjectURL(file)
                                    ),
                                });

                                if (imgSuggestionField.invalid) {
                                    imgSuggestionField.markAsTouched();
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
                case 'imgSuggestion':
                    {
                        this.form.get('imgSuggestion').reset();
                        this.tmp['imgSuggestion'].reset();
                    }
                    break;

                default:
                    break;
            }
        }
    }

    selectExpiration(event) {
        if (event.checked === true) {
            this.expirationCheck = true;
            this.form.get('expirationStatus').setValue(true);
        } else {
            this.expirationCheck = false;
            this.form.get('expirationStatus').setValue(false);
        }
    }

    inputExpirationDays(event): void {
        console.log('isi value input->', event)
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
        console.log('isi tag->', value)
    }

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
                    maxRedemptionPerBuyer: voucher.maxRedemptionPerStore,
                    maxVoucherRedemption: voucher.maxVoucherRedemption,
                    activeStartDate: moment(voucher.startDate).toDate(),
                    activeEndDate: moment(voucher.endDate).toDate(),
                    description: voucher.description,
                    shortDescription: voucher.shortDescription,
                });

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

        this.minCollectibleFrom = new Date();
        this.minCollectibleTo = null;
        this.maxCollectibleFrom = null;
        this.maxCollectibleTo = null;

        this.tmp['imgSuggestion'] = new FormControl({ value: '', disabled: true });

        this.form = this.fb.group({
            id: [''],
            promoAllocationType: [
                PromoAllocation.NONE || PromoAllocation.PROMOBUDGET || PromoAllocation.PROMOSLOT,
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
            shortDescription: [''],
            description: [''],
            voucherTermsConds: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            voucherInstruction: [
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
            maxRedemptionPerBuyer: [
                '1',
                [
                    RxwebValidators.numeric({
                        allowDecimal: false,
                        message: 'This field must be numeric.',
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: 'Allowed minimum value is 1',
                    }),
                ],
            ],
            promoBudget: [
                null,
                [
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.PositiveNumber,
                        allowDecimal: true,
                        message: this.errorMessage$.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.maxNumber({
                        value:999999999999,
                        message: 'Max input is 12 digit'
                    })
                ],
            ],
            promoSlot: [
                null,
                [
                    RxwebValidators.digit({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.maxLength({
                        value:8,
                        message: 'Max input is 8 digit'
                    })
                ],
            ],
            imgSuggestion: [
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

            // maxVoucherRedemption: [
            //     '',
            //     [
            //         RxwebValidators.numeric({
            //             allowDecimal: false,
            //             message: 'This field must be numeric.',
            //         }),
            //     ],
            // ],

            activeStartDate: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            activeEndDate: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            collactibleDateFrom: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            collactibleDateTo: [
                { value: '', disabled: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            expirationStatus: false,
            expirationDays: [
                null,
                [
                    RxwebValidators.digit({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'numeric'),
                    }),
                    RxwebValidators.maxLength({
                        value:8,
                        message: 'Max input is 8 digit'
                    })
                ],
            ],
            voucherTag: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            voucherCode: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ]
        });
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

                    if (!rawValue.activeStartDate || !rawValue.activeEndDate) {
                        return 'INVALID';
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

    onChangeActiveStartDate(ev: MatDatetimepickerInputEvent<any>): void {
        const activeStartDate = moment(ev.value);
        // this.form.get('activeEndDate').value = '2020-10-31';
        if (this.form.get('activeEndDate').value) {
            const activeEndDate = moment(this.form.get('activeEndDate').value);

            if (activeStartDate.isAfter(activeEndDate)) {
                this.form.get('activeEndDate').reset();
            }
        }

        this.minActiveEndDate = activeStartDate.add(1, 'minute').toDate();
        this.triggerStatus$.next('');
    }

    onChangeActiveEndDate(ev: MatDatetimepickerInputEvent<any>): void {
        console.log('end date ->', ev.value);
        const activeEndDate = moment(ev.value);

        if (this.form.get('activeStartDate').value) {
            const activeStartDate = moment(this.form.get('activeStartDate').value);

            if (activeEndDate.isBefore(activeStartDate)) {
                this.form.get('activeStartDate').reset();
            }
        }

        this.maxActiveStartDate = activeEndDate.toDate();
        this.triggerStatus$.next('');
    }

    onChangeCollectibleFrom(ev: MatDatetimepickerInputEvent<any>): void {
        const activeStartDate = moment(ev.value);
        if (this.form.get('collactibleDateFrom').value) {
            const activeEndDate = moment(this.form.get('collactibleDateTo').value);

            if (activeStartDate.isAfter(activeEndDate)) {
                this.form.get('collactibleDateFrom').reset();
            }
        }

        this.minActiveEndDate = activeStartDate.add(1, 'minute').toDate();
        this.triggerStatus$.next('');
    }

    onChangeCollectibleTo(ev: MatDatetimepickerInputEvent<any>): void {
        console.log('end date ->', ev.value);
        const activeEndDate = moment(ev.value);

        if (this.form.get('collactibleDateTo').value) {
            const activeStartDate = moment(this.form.get('collactibleDateFrom').value);

            if (activeEndDate.isBefore(activeStartDate)) {
                this.form.get('collactibleDateTo').reset();
            }
        }

        this.maxActiveStartDate = activeEndDate.toDate();
        this.triggerStatus$.next('');
    }


    ngOnInit(): void {
        console.log('time format->', moment('2020-09-09T06:05:00.000Z').format('YYYY-MM-DD HH:mm'));
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
