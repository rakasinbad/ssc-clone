import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest, BehaviorSubject } from 'rxjs';

import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil, tap } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogueWeightDimension } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { CataloguesSelectCategoryComponent } from '../../catalogues-select-category/catalogues-select-category.component';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { FormStatus } from 'app/shared/models/global.model';
// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';
// 
@Component({
    selector: 'catalogue-weight-and-dimension',
    templateUrl: './catalogue-weight-and-dimension.component.html',
    styleUrls: ['./catalogue-weight-and-dimension.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class CatalogueWeightAndDimensionComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output() formValueChange: EventEmitter<CatalogueWeightDimension> = new EventEmitter<CatalogueWeightDimension>();

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
        'custom-field-right': boolean;
        'view-field-right': boolean;
    };

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private errorMessage$: ErrorMessageService,
    ) { }

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
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
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter(url => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.trigger$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
        ]).pipe(
            withLatestFrom(
                this.store.select(AuthSelectors.getUserSupplier),
                ([_, catalogue], userSupplier) => ({ catalogue, userSupplier })
            ),
            takeUntil(this.subs$)
        ).subscribe(({ catalogue, userSupplier }) => {
            if (!catalogue) {
                // Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut.
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: catalogue.id
                        })
                    );

                    this.notice$.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'catalogues', 'list']), 1000);

                    return;
                }
            }

            /** Penetapan nilai pada form. */
            this.form.patchValue({
                productShipment: {
                    catalogueWeight: catalogue.catalogueWeight,
                    packagedWeight: catalogue.packagedWeight,
                    catalogueDimension: catalogue.catalogueDimension,
                    packagedDimension: catalogue.packagedDimension
                },
            }, { onlySelf: false });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.markAsDirty({ onlySelf: false });
            this.form.markAllAsTouched();
            this.form.markAsPristine();
        });
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('CATALOGUE WEIGHT & DIMENSION FORM STATUS CHANGED:', value)),
            takeUntil(this.subs$)
        ).subscribe(status => {
            this.formStatusChange.emit(status);
        });

        this.form.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(100),
            tap(value => HelperService.debug('[BEFORE MAP] CATALOGUE WEIGHT & DIMENSION FORM VALUE CHANGED', value)),
            map(value => {
                const formValue = {
                    ...value.productShipment,
                    catalogueDimension: isNaN(Number(value.productShipment.catalogueDimension))
                        ? null
                        : Number(value.productShipment.catalogueDimension),
                    catalogueWeight: isNaN(Number(value.productShipment.catalogueWeight))
                        ? null
                        : Number(value.productShipment.catalogueWeight),
                    packagedDimension: isNaN(Number(value.productShipment.packagedDimension))
                        ? null
                        : Number(value.productShipment.packagedDimension),
                    packagedWeight: isNaN(Number(value.productShipment.packagedWeight))
                        ? null
                        : Number(value.productShipment.packagedWeight),
                    dangerItem: false,
                };

                return formValue;
            }),
            tap(value => HelperService.debug('[AFTER MAP] CATALOGUE WEIGHT & DIMENSION FORM VALUE CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe(value => {
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
        this.form = this.fb.group({
            productShipment: this.fb.group({
                catalogueWeight: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            )
                        })
                    ]
                ],
                packagedWeight: [
                    '',
                    [
                        // RxwebValidators.required({
                        //     message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                        // }),
                        // RxwebValidators.minNumber({
                        //     value: 1,
                        //     message: this.errorMessage$.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                        // })
                    ]
                ],
                catalogueDimension: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            )
                        })
                    ]
                ],
                packagedDimension: [
                    '',
                    [
                        // RxwebValidators.required({
                        //     message: this.errorMessage$.getErrorMessageNonState('default', 'required')
                        // }),
                        // RxwebValidators.minNumber({
                        //     value: 1,
                        //     message: this.errorMessage$.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                        // })
                    ]
                ],
                dangerItem: [ false ],
                // couriers: this.fb.array([
                //     this.fb.control({
                //         name: 'SiCepat REG (maks 5000g)',
                //         disabled: this.fb.control(false)
                //     }),
                //     this.fb.control({
                //         name: 'JNE REG (maks 5000g)',
                //         disabled: this.fb.control(false)
                //     }),
                //     this.fb.control({
                //         name: 'SiCepat Cargo (maks 5000g)',
                //         disabled: this.fb.control(false)
                //     })
                // ])
            }),
        });

        this.checkRoute();
        this.initFormCheck();
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
    }

}
