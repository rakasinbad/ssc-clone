import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormArray,
    FormBuilder,
    FormGroup,
    ValidationErrors,
} from '@angular/forms';
import { MatChipInputEvent, MatDialog, MatSelectChange } from '@angular/material';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Brand } from 'app/shared/models/brand.model';
import { FormStatus, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    switchMap,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { CataloguesSelectCategoryComponent } from '../../catalogues-select-category/catalogues-select-category.component';
import {
    CatalogueCategory,
    CatalogueInformation,
    CatalogueUnit,
    SimpleCatalogueCategory,
    SubBrand,
    SubBrandProps,
} from '../../models';
import { CataloguesService, SubBrandApiService } from '../../services';
import { BrandActions, CatalogueActions } from '../../store/actions';
import { fromCatalogue } from '../../store/reducers';
import { BrandSelectors, CatalogueSelectors } from '../../store/selectors';

// import { UserSupplier } from 'app/shared/models/supplier.model';
// import { TNullable } from 'app/shared/models/global.model';
// import { UiActions, FormActions } from 'app/shared/store/actions';
// import { FormSelectors } from 'app/shared/store/selectors';

// Untuk keperluan penanda mode form apakah sedang add, view, atau edit.
type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'catalogue-sku-information',
    templateUrl: './catalogue-sku-information.component.html',
    styleUrls: ['./catalogue-sku-information.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CatalogueSkuInformationComponent
    implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    // Untuk keperluan subscription.
    private subs$: Subject<void> = new Subject<void>();
    // Untuk keperluan memicu adanya perubahan view.
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('');
    // Untuk menyimpan daftar brand dari suatu supplier.
    brands$: Observable<Array<Brand>>;
    // Untuk menyimpan daftar katalog yang tersedia.
    catalogueCategories$: BehaviorSubject<Array<CatalogueCategory>> = new BehaviorSubject<
        Array<CatalogueCategory>
    >([]);
    // Untuk menyimpan satuan unit katalog.
    catalogueUnits$: BehaviorSubject<Array<CatalogueUnit>> = new BehaviorSubject<
        Array<CatalogueUnit>
    >([]);
    // Untuk menyimpan string kategori produk untuk ditampilkan di web.
    productCategory$: SafeHtml;
    // Untuk form.
    form: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';

    // Untuk keperluan product tags.
    productTagsControls: FormArray;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();
    @Output()
    formValueChange: EventEmitter<CatalogueInformation> = new EventEmitter<CatalogueInformation>();

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

    private readonly subBrandCollections$: BehaviorSubject<SubBrand[]> = new BehaviorSubject([]);
    subBrands$: Observable<SubBrand[]> = this.subBrandCollections$.asObservable();

    subBrandLoading: boolean = false;

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
        private readonly subBrandApiService: SubBrandApiService,
        private errorMessage$: ErrorMessageService
    ) {}

    private updateFormView(): void {
        // Penetapan class pada form field berdasarkan mode form-nya.
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode(),
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
    //
    private updateSelectedCategories(categories: Array<SimpleCatalogueCategory>): void {
        // Mengambil kategori terakhir yang terpilih.
        const lastCategory = categories.length > 0 ? categories[categories.length - 1] : undefined;

        // Kategori paling terakhir tidak boleh memiliki sub-kategori. Harus memilih kategori hingga terdalam.
        if (!lastCategory || lastCategory.hasChildren) {
            this.form.get('productInfo.category').setValue('');
            this.form.get('productInfo.category').updateValueAndValidity();
        } else {
            this.form.get('productInfo.category').setValue(categories);
            this.form.get('productInfo.category').updateValueAndValidity();
        }
    }

    private checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe((urls) => {
            if (urls.filter((url) => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private checkSelectedCatalogueCategory(): void {
        this.store
            .select(CatalogueSelectors.getSelectedCategories)
            .pipe(takeUntil(this.subs$))
            .subscribe((categories) => {
                // Kategori produk yang ingin ditampilkan di front-end.
                this.productCategory$ = categories
                    .map((category) => category['name'])
                    .join(`<span class="mx-12">></span>`);
                // Meng-update form catalogue untuk bagian kategori.
                this.updateSelectedCategories(categories);
                // Memicu ChangeDetector untuk memberitahu adanya perubahan view.
                this.cdRef.markForCheck();
            });
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.trigger$,
            this.catalogueCategories$,
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.catalogueUnits$,
        ])
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    ([_, categories, catalogue, catalogueUnits], userSupplier) => ({
                        catalogue,
                        categories,
                        userSupplier,
                        catalogueUnits,
                    })
                ),
                takeUntil(this.subs$)
            )
            .subscribe(({ catalogue, categories, userSupplier, catalogueUnits }) => {
                // Butuh mengambil data katalog jika belum ada di state.
                if (!catalogue) {
                    // Mengambil ID dari parameter URL.
                    const { id } = this.route.snapshot.params;

                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueRequest({
                            payload: id,
                        })
                    );

                    this.store.dispatch(
                        CatalogueActions.setSelectedCatalogue({
                            payload: id,
                        })
                    );

                    return;
                } else {
                    // Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut.
                    if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                        this.store.dispatch(
                            CatalogueActions.spliceCatalogue({
                                payload: catalogue.id,
                            })
                        );

                        this.notice$.open('Produk tidak ditemukan.', 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });

                        setTimeout(
                            () => this.router.navigate(['pages', 'catalogues', 'list']),
                            1000
                        );

                        return;
                    }
                }

                // Get sub brand

                if (catalogue.brandId && this.isEditMode()) {
                    this._getSubBrandByBrandId(catalogue.brandId);
                }

                /** Proses pencarian kategori katalog dari daftar katalog yang ada di server. */
                const searchCategory = (
                    catalogueId,
                    selectedCategories: Array<CatalogueCategory>
                ) => {
                    const selectedCategory = selectedCategories.filter(
                        (category) => category.id === catalogueId
                    );

                    if (selectedCategory.length > 0) {
                        return {
                            id: selectedCategory[0].id,
                            name: selectedCategory[0].category,
                            parent: selectedCategory[0].parentId
                                ? selectedCategory[0].parentId
                                : null,
                            children: selectedCategory[0].children,
                        };
                    }
                };

                /** Mengambil data keyword katalog. */
                const keywords = catalogue.catalogueKeywordCatalogues.map(
                    (keyword) => keyword.catalogueKeyword.tag
                );

                (this.form.get('productInfo.tags') as FormArray).clear();

                for (const keyword of keywords) {
                    (this.form.get('productInfo.tags') as FormArray).push(this.fb.control(keyword));
                }

                /** Penetapan nilai pada form. */
                setTimeout(() => {
                    HelperService.debug(
                        '[CatalogueSkuInformationComponent - BEFORE] prepareEditCatalogue form.patchValue',
                        {
                            catalogue,
                            form: this.form.getRawValue(),
                        }
                    );
                    this.form.patchValue(
                        {
                            productInfo: {
                                id: catalogue.id,
                                externalId: catalogue.externalId,
                                name: catalogue.name,
                                description: catalogue.description || '-',
                                // information: '...',
                                brandId: catalogue.brandId,
                                brandName: catalogue.brand.name,
                                subBrandId: catalogue.subBrandId,
                                subBrandName: catalogue.subBrand && catalogue.subBrand.name,
                                stock: catalogue.stock,
                                uom: catalogue.unitOfMeasureId ? catalogue.unitOfMeasureId : '',
                                uomName: catalogueUnits
                                    .filter(
                                        (u) => String(u.id) === String(catalogue.unitOfMeasureId)
                                    )
                                    .map((u) => u.unit),
                            },
                        },
                        { onlySelf: false }
                    );

                    if (catalogue.subBrandId) {
                        this.form.get('productInfo.subBrandId').enable({ onlySelf: true });
                    }

                    HelperService.debug(
                        '[CatalogueSkuInformationComponent - AFTER] prepareEditCatalogue form.patchValue',
                        {
                            catalogue,
                            formRaw: this.form.getRawValue(),
                            form: this.form.value,
                        }
                    );

                    setTimeout(() => {
                        this.form.get('productInfo.information').setValue(catalogue.detail);
                    }, 500);
                }, 500);

                if (
                    isNaN(catalogue.lastCatalogueCategoryId) ||
                    !catalogue.lastCatalogueCategoryId
                ) {
                    /** Kategori yang terpilih akan di-reset ulang jika katalog belum ditentukan kategorinya. */
                    this.store.dispatch(CatalogueActions.resetSelectedCategories());
                } else if (categories.length > 0) {
                    /** Proses pengecekan urutan katalog dari paling dalam hingga terluar. */
                    const newCategories = [];
                    let isFirst = true;
                    do {
                        if (isFirst) {
                            newCategories.push(
                                searchCategory(catalogue.lastCatalogueCategoryId, categories)
                            );
                            isFirst = false;
                        } else {
                            const lastCategory = newCategories[newCategories.length - 1];
                            newCategories.push(searchCategory(lastCategory.parent, categories));
                        }
                    } while (newCategories[newCategories.length - 1].parent);

                    this.store.dispatch(
                        CatalogueActions.setSelectedCategories({
                            payload: [
                                ...newCategories.reverse().map((newCat) => ({
                                    id: newCat.id,
                                    name: newCat.name,
                                    parent: newCat.parent,
                                    hasChildren: newCat.children.length > 0,
                                })),
                            ],
                        })
                    );
                }

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    // private onSubmit(): void {
    //     // Menyembunyikan form toolbar agar tidak di-submit lagi.
    //     this.store.dispatch(UiActions.hideFooterAction());
    //     // Mendapatkan seluruh nilai dari form.
    //     const formValues = this.form.getRawValue();

    //     // Membuat sebuah Object dengan tipe Partial<Catalogue> untuk keperluan strict-typing.
    //     const catalogueData: Partial<CatalogueInformation> = {
    //         /**
    //          * INFORMASI PRODUK
    //          */
    //         externalId: formValues.productInfo.externalId,
    //         name:
    //             String(formValues.productInfo.name)
    //                 .charAt(0)
    //                 .toUpperCase() + String(formValues.productInfo.name).slice(1),
    //         description: formValues.productInfo.description,
    //         information: formValues.productInfo.information,
    //         detail: formValues.productInfo.information,
    //         brandId: formValues.productInfo.brandId,
    //         firstCatalogueCategoryId: formValues.productInfo.category[0].id,
    //         lastCatalogueCategoryId:
    //             formValues.productInfo.category.length === 1
    //                 ? formValues.productInfo.category[0].id
    //                 : formValues.productInfo.category[formValues.productInfo.category.length - 1].id,
    //         unitOfMeasureId: formValues.productInfo.uom,
    //     };

    //     if (this.formMode === 'edit') {
    //         this.store.dispatch(
    //             CatalogueActions.patchCatalogueRequest({
    //                 payload: { id: formValues.productInfo.id, data: catalogueData, source: 'form' }
    //             })
    //         );
    //     }
    // }

    private initCatalogueCategoryState(): void {
        this.store
            .select(CatalogueSelectors.getCatalogueCategories)
            .pipe(takeUntil(this.subs$))
            .subscribe((categories) => {
                // Melakukan request ke back-end jika belum ada unit katalog di state.
                if (categories.length === 0) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoriesRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id',
                            },
                        })
                    );
                }

                this.catalogueCategories$.next(categories);
            });
    }

    private initCatalogueUnitState(): void {
        // Mendapatkan unit katalog dari state.
        this.store
            .select(CatalogueSelectors.getCatalogueUnits)
            .pipe(takeUntil(this.subs$))
            .subscribe((units) => {
                // Melakukan request ke back-end jika belum ada unit katalog di state.
                if (units.length === 0) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id',
                            },
                        })
                    );
                } else {
                    // // Mengambil nilai ID UOM dari form.
                    // const uom = this.form.get('productInfo.uom').value;
                    // // Mengambil data UOM berdasarkan ID UOM yang terpilih.
                    // const selectedUnit = units.filter(unit => unit.id === uom);
                    // if (selectedUnit.length > 0) {
                    //     this.form.patchValue({
                    //         productInfo: {
                    //             uomName: selectedUnit[0].unit
                    //         }
                    //     });
                    // }

                    this.cdRef.markForCheck();
                }

                this.catalogueUnits$.next(units);
            });
    }

    private initCatalogueBrand(): void {
        this.brands$ = this.store.select(BrandSelectors.getAllBrands).pipe(
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            map(([brands, userSupplier]) => {
                if (userSupplier && brands.length === 0) {
                    const query: IQueryParams = { paginate: false };
                    query['supplierId'] = userSupplier.supplierId;

                    this.store.dispatch(
                        BrandActions.fetchBrandsRequest({
                            payload: query,
                        })
                    );
                }

                return brands;
            }),
            takeUntil(this.subs$)
        );
    }

    private initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>)
            .pipe(
                distinctUntilChanged(),
                debounceTime(300),
                tap((value) =>
                    HelperService.debug('CATALOGUE SKU INFORMATION FORM STATUS CHANGED:', value)
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
                        '[BEFORE MAP] CATALOGUE SKU INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                map((value) => {
                    let formValue = {
                        ...value.productInfo,
                        detail: value.productInfo.information,
                        unitOfMeasureId: value.productInfo.uom,
                    };

                    if (formValue.category.length > 0) {
                        formValue = {
                            ...formValue,
                            firstCatalogueCategoryId: value.productInfo.category[0].id,
                            lastCatalogueCategoryId:
                                value.productInfo.category.length === 1
                                    ? value.productInfo.category[0].id
                                    : value.productInfo.category[
                                          value.productInfo.category.length - 1
                                      ].id,
                        };
                    }

                    // formValue.subBrandId = value.subBrandId || null;

                    return formValue;
                }),
                tap((value) =>
                    HelperService.debug(
                        '[AFTER MAP] CATALOGUE SKU INFORMATION FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.subs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit(value);
            });
    }

    private _getSubBrandByBrandId(brandId: number): void {
        this.subBrandLoading = true;

        const subBrandIdCtrl = this.form.get('productInfo.subBrandId');

        if (subBrandIdCtrl.enabled) {
            subBrandIdCtrl.disable({ onlySelf: true });
        }

        this.subBrandApiService
            .getWithQuery<PaginateResponse<SubBrandProps>>({
                search: [
                    {
                        fieldName: 'brandId',
                        keyword: brandId,
                    },
                ],
            })
            .pipe(
                map((resp) => (resp.total > 0 ? resp.data : [])),
                take(1)
            )
            .subscribe((sources) => {
                this.subBrandLoading = false;

                if (subBrandIdCtrl.disable) {
                    subBrandIdCtrl.enable({ onlySelf: true });
                }

                this.subBrandCollections$.next(sources);
            });
    }

    onEditCategory(): void {
        this.dialog.open(CataloguesSelectCategoryComponent, { width: '1366px' });
    }

    checkExternalId(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return control.valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(500),
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    this.store.select(CatalogueSelectors.getSelectedCatalogueEntity)
                ),
                take(1),
                switchMap(([value, userSupplier, catalogue]) => {
                    if (!value) {
                        return of({
                            required: true,
                        });
                    }

                    const params: IQueryParams = {
                        limit: 1,
                        paginate: true,
                    };

                    params['externalId'] = value;
                    params['supplierId'] = userSupplier.supplierId;

                    return this.catalogue$.findAll(params).pipe(
                        map((response) => {
                            if (response.total > 0) {
                                if (!this.isAddMode()) {
                                    if (response.data[0].id === catalogue.id) {
                                        return null;
                                    }
                                }

                                return {
                                    skuSupplierExist: true,
                                };
                            }

                            return null;
                        })
                    );
                })
            );
        };
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

    onAddTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        const formArray = this.form.get('productInfo.tags') as FormArray;

        if ((value || '').trim()) {
            formArray.push(this.fb.control(value));
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveTag(index: number): void {
        this.productTagsControls.removeAt(index);
    }

    onChangeBrand(ev: MatSelectChange): void {
        HelperService.debug('[CatalogueSkuInformationComponent] onChangeBrand', {
            ev,
            formMode: this.formMode,
        });

        if (ev.value && this.isEditMode()) {
            this._getSubBrandByBrandId(ev.value);
        }
    }

    ngOnInit(): void {
        /** Menyiapkan form. */
        this.form = this.fb.group({
            productInfo: this.fb.group({
                id: [''],
                externalId: [
                    '',
                    {
                        validators: [
                            RxwebValidators.required({
                                message: this.errorMessage$.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                        asyncValidators: [this.checkExternalId()],
                    },
                ],
                name: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                description: [''],
                information: ['', []],
                brandId: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                brandName: [
                    { value: '', disabled: false },
                    // [
                    //     RxwebValidators.required({
                    //         message: this.errorMessage$.getErrorMessageNonState(
                    //             'default',
                    //             'required'
                    //         )
                    //     })
                    // ]
                ],
                subBrandId: [{ value: null, disabled: true }],
                subBrandName: [{ value: null, disabled: true }],
                category: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                uom: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                uomName: [''],
                tags: this.fb.array(
                    [],
                    [
                        // RxwebValidators.required({
                        //     conditionalExpression: controls => (controls.tags as Array<string>).length > 0 ? true : null,
                        //     message: this.errorMessageSvc.getErrorMessageNonState('product_tag', 'min_1_tag')
                        // })
                        RxwebValidators.choice({
                            minLength: 1,
                            conditionalExpression: (controls) =>
                                (controls.tags as Array<string>).length > 0 ? true : null,
                            message: this.errorMessage$.getErrorMessageNonState(
                                'product_tag',
                                'min_1_tag'
                            ),
                        }),
                    ]
                ),
            }),
        });

        this.productTagsControls = this.form.get('productInfo.tags') as FormArray;

        this.checkRoute();
        this.initFormCheck();
        this.initCatalogueBrand();
        this.initCatalogueUnitState();
        this.initCatalogueCategoryState();
        this.checkSelectedCatalogueCategory();
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

        this.catalogueCategories$.next([]);
        this.catalogueCategories$.complete();

        this.catalogueUnits$.next([]);
        this.catalogueUnits$.complete();

        this.store.dispatch(CatalogueActions.resetCatalogueUnits());
        // this.store.dispatch(UiActions.hideFooterAction());
        // this.store.dispatch(FormActions.resetCancelButtonAction());
        // this.store.dispatch(CatalogueActions.resetCatalogueUnits());
    }
}
