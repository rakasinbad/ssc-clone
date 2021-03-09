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
import { MatRadioChange } from '@angular/material';
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

@Component({
  selector: 'app-layer-settings',
  templateUrl: './layer-settings.component.html',
  styleUrls: ['./layer-settings.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LayerSettingsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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

    // Untuk menyimpan platform-nya Sinbad yang tersedia.
    sinbadPlatforms: Array<{ id: string; label: string }> = [];
    sinbadPromoLayer: Array<{ id: string; label: string }> = [];
    sinbadPromoOwner: Array<{ id: string; label: string }> = [];

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
    
    formFieldLength: number = 40;

    public selectPromo: string;
    public selectTypeVoucher: string;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private store: NgRxStore<VoucherCoreFeatureState>,
        private errorMessage$: ErrorMessageService,
        private helper$: HelperService,
        private domSanitizer: DomSanitizer
    ) {
        // Untuk menyimpan platform-nya Sinbad yang tersedia.
        this.sinbadPromoLayer = this.helper$.promoHierarchyLayer();
        this.sinbadPromoOwner = this.helper$.promoHierarchyGroup();
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
                    layer: voucher.layer,
                    promoOwner: voucher.promoOwner
                });

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    private initForm(): void {
        this.form = this.fb.group({
            id: [null],
            layer: null,
            promoOwner: null
            
        });
    }

    private initFormCheck(): void {
        // combineLatest([this.triggerStatus$, this.form.statusChanges as Observable<FormStatus>])
        //     .pipe(
        //         distinctUntilChanged(),
        //         debounceTime(300),
        //         tap(([_, value]) =>
        //             HelperService.debug(
        //                 '[BEFORE MAP] SUPPLIER VOUCHER LAYER SETTING FORM VALUE CHANGED',
        //                 value
        //             )
        //         ),
        //         map(([_, status]) => {
        //            return status;
        //         }),
        //         tap((value) =>
        //             HelperService.debug(
        //                 '[AFTER MAP] SUPPLIER VOUCHER LAYER SETTING FORM VALUE CHANGED',
        //                 value
        //             )
        //         ),
        //         takeUntil(this.subs$)
        //     )
        //     .subscribe((status) => {
        //         const rawValue = this.form.getRawValue();
        //         if (rawValue.layer == null || rawValue.layer !== null) {
        //             status = 'VALID';
        //         } else if (rawValue.promoOwner == null || rawValue.promoOwner !== null) {
        //             status = 'VALID';
        //         } else {
        //             status = 'VALID';
        //         }
        //         this.formStatusChange.emit(status);
        //     });

        this.formStatusChange.emit('VALID');
        this.form.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(200),
                tap((value) =>
                    HelperService.debug(
                        '[BEFORE MAP] SUPPLIER VOUCHER LAYER SETTING FORM VALUE CHANGED',
                        value
                    )
                ),
                map(() => {
                    return this.form.getRawValue();
                }),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] SUPPLIER VOUCHER LAYER SETTING FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                if (value.layer == 'nol') {
                    value.layer = 0;
                } else if (value.layer == 'one') {
                    value.layer = 1;
                } else if (value.layer == 'two') {
                    value.layer = 2;
                } else if (value.layer == 'three') {
                    value.layer = 3;
                }  else if (value.layer == 'four') {
                    value.layer = 4;
                } else {
                    value.layer = 0;
                }
                
                if (value.promoOwner == null) {
                    value.promoOwner = 'none';            
                } else {
                    value.promoOwner = value.promoOwner;
                }
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

        this.triggerStatus$.next('');
        this.triggerStatus$.complete();
    }
}
