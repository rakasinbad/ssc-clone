import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, of, combineLatest } from 'rxjs';

import { fromCatalogue } from '../../store/reducers';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { FormGroup, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { distinctUntilChanged, debounceTime, withLatestFrom, take, switchMap, map, takeUntil } from 'rxjs/operators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { CatalogueSelectors, BrandSelectors } from '../../store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { CataloguesService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { CatalogueUnit, CatalogueCategory, Catalogue } from '../../models';
import { CatalogueActions, BrandActions } from '../../store/actions';
import { MatDialog } from '@angular/material';
import { CataloguesSelectCategoryComponent } from '../../catalogues-select-category/catalogues-select-category.component';
import { Brand } from 'app/shared/models/brand.model';
import { SafeHtml } from '@angular/platform-browser';
import { TNullable } from 'app/shared/models/global.model';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'catalogue-sku-information',
    templateUrl: './catalogue-sku-information.component.html',
    styleUrls: ['./catalogue-sku-information.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogueSkuInformationComponent implements OnInit, AfterViewInit, OnDestroy {

    private subs$: Subject<void> = new Subject<void>();

    brands$: Observable<Array<Brand>>;

    catalogueUnits: Array<CatalogueUnit>;

    productCategory$: SafeHtml;

    formMode: IFormMode = 'add';

    form: FormGroup;

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
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
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'view-field-right': this.isViewMode()
        };

        this.catalogueContent = {
            'mt-16': this.isViewMode(),
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode()
        };
    }

    private updateSelectedCategories(
        categories: Array<{
            id: string;
            name: string;
            parent: TNullable<string>;
            hasChildren?: boolean;
        }>
    ): void {
        /** Mengambil kategori terakhir yang terpilih. */
        const lastCategory = categories.length > 0 ? categories[categories.length - 1] : undefined;

        /** Kategori paling terakhir tidak boleh memiliki sub-kategori. Harus memilih kategori hingga terdalam. */
        if (!lastCategory || lastCategory.hasChildren) {
            this.form.get('productInfo.category').setValue('');
            this.form.get('productInfo.category').updateValueAndValidity();
        } else {
            this.form.get('productInfo.category').setValue(categories);
            this.form.get('productInfo.category').updateValueAndValidity();
        }
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

    private checkSelectedCatalogueCategory(): void {
        /** Melakukan subscribe ke pengambilan data brand dari state. */
        combineLatest([
            this.store.select(BrandSelectors.getAllBrands),
            this.store.select(CatalogueSelectors.getSelectedCategories)
        ]).pipe(
                /** Sambil mengambil dari beberapa Subscription. */
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    this.store.select(CatalogueSelectors.getProductName),
                    ([brands, categories], userSupplier, productName) => [brands, categories, userSupplier, productName]
                ),
                switchMap(
                    ([brands, categories, userSupplier, productName]: [
                        Array<Brand>,
                        Array<{
                            id: string;
                            name: string;
                            parent: TNullable<string>;
                            hasChildren?: boolean;
                        }>,
                        UserSupplier,
                        string
                    ]) => {
                        if (!userSupplier) {
                            return of(
                                BrandActions.fetchBrandsFailure({
                                    payload: {
                                        id: 'fetchBrandsFailure',
                                        errors: 'Not Authenticated'
                                    }
                                })
                            );
                        }

                        return of([brands, categories, userSupplier, productName]);
                    }
                ),
                takeUntil(this.subs$)
            ).subscribe(
                ([brands, categories, userSupplier, productName]: [
                    Array<Brand>,
                    Array<{
                        id: string;
                        name: string;
                        parent: TNullable<string>;
                        hasChildren?: boolean;
                    }>,
                    UserSupplier,
                    string
                ]) => {
                    /** Mengambil data brand jika belum ada di state. */
                    if (!brands || brands.length === 0) {
                        const params: IQueryParams = {
                            paginate: false
                        };

                        /** Mengambil brand berdasarkan ID supplier-nya dari state. */
                        params['supplierId'] = userSupplier.supplierId;
                        return this.store.dispatch(
                            BrandActions.fetchBrandsRequest({
                                payload: params
                            })
                        );
                    }

                    if (this.isAddMode()) {
                        this.form.get('productInfo.name').setValue(productName);
                    }

                    /** Kategori produk yang ingin ditampilkan di front-end. */
                    this.productCategory$ = categories.map(category => category['name']).join(`<span class="mx-12">></span>`);

                    this.updateSelectedCategories(categories);
                    this.cdRef.markForCheck();
                }
            );
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(CatalogueSelectors.getCatalogueCategories),
            this.store.select(CatalogueSelectors.getCatalogueUnits),
            this.store.select(AuthSelectors.getUserSupplier)
        ])
            .pipe(
                takeUntil(this.subs$)
            ).subscribe(([catalogue, categories, units, userSupplier]: [Catalogue, Array<CatalogueCategory>, Array<CatalogueUnit>, UserSupplier]) => {
                /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                const { id } = this.route.snapshot.params;

                /** Butuh fetch kategori katalog jika belum ada di state. */
                if (categories.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoriesRequest({
                            payload: { paginate: false }
                        })
                    );
                }

                /** Butuh fetch unit kategori jika belum ada di state. */
                if (units.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id'
                            }
                        })
                    );
                }

                /** Butuh mengambil data katalog jika belum ada di state. */
                if (!catalogue) {
                    this.store.dispatch(
                        CatalogueActions.fetchCatalogueRequest({
                            payload: id
                        })
                    );

                    this.store.dispatch(
                        CatalogueActions.setSelectedCatalogue({
                            payload: id
                        })
                    );

                    return;
                }

                /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: id
                        })
                    );

                    this.notice$.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    setTimeout(() => this.router.navigate(['pages', 'catalogues', 'list']), 1000);

                    return;
                }

                /** Proses pencarian kategori katalog dari daftar katalog yang ada di server. */
                const searchCategory = (
                    catalogueId,
                    selectedCategories: Array<CatalogueCategory>
                ) => {
                    const selectedCategory = selectedCategories.filter(
                        category => category.id === catalogueId
                    );

                    return {
                        id: selectedCategory[0].id,
                        name: selectedCategory[0].category,
                        parent: selectedCategory[0].parentId ? selectedCategory[0].parentId : null,
                        children: selectedCategory[0].children
                    };
                };

                /** Memberi nilai sementara sebelum dimasukkan nilai aslinya ke Quill Editor. */
                this.form.patchValue({
                    productInfo: {
                        information: '...'
                    }
                });

                /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                setTimeout(() => {
                    this.form.patchValue({
                        productInfo: {
                            id: catalogue.id,
                            externalId: catalogue.externalId,
                            name: catalogue.name,
                            description: catalogue.description || '-',
                            brandId: catalogue.brandId,
                            brandName: catalogue.brand.name,
                            stock: catalogue.stock,
                            uom: catalogue.unitOfMeasureId ? catalogue.unitOfMeasureId : '',
                        },
                    });

                    const uom = this.form.get('productInfo.uom').value;
                    const selectedUnit = units.filter(unit => unit.id === uom);
                    if (selectedUnit.length > 0) {
                        this.form.patchValue({
                            productInfo: {
                                uomName: selectedUnit[0].unit
                            }
                        });
                    }
                });

                setTimeout(() => {
                    this.form.get('productInfo.information').setValue('');
                    this.cdRef.markForCheck();

                    setTimeout(() => {
                        this.form.get('productInfo.information').setValue(catalogue.detail);
                        this.cdRef.markForCheck();
                    }, 150);
                }, 100);

                if (isNaN(catalogue.lastCatalogueCategoryId) || !catalogue.lastCatalogueCategoryId) {
                    /** Kategori yang terpilih akan di-reset ulang jika katalog belum ditentukan kategorinya. */
                    this.store.dispatch(CatalogueActions.resetSelectedCategories());
                } else {
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
                                ...newCategories.reverse().map(newCat => ({
                                    id: newCat.id,
                                    name: newCat.name,
                                    parent: newCat.parent,
                                    hasChildren: newCat.children.length > 0
                                }))
                            ]
                        })
                    );
                }

                /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                this.form.markAsDirty({ onlySelf: false });
                this.form.markAllAsTouched();
                this.form.markAsPristine();
            });
    }

    private initCatalogueUnitState(): void {
        this.store
            .select(CatalogueSelectors.getCatalogueUnits)
            .pipe(takeUntil(this.subs$))
            .subscribe(units => {
                if (units.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id'
                            }
                        })
                    );
                }

                const uom = this.form.get('productInfo.uom').value;
                const selectedUnit = units.filter(unit => unit.id === uom);
                if (selectedUnit.length > 0) {
                    this.form.patchValue({
                        productInfo: {
                            uomName: selectedUnit[0].unit
                        }
                    });
                }

                this.catalogueUnits = units;
                this.cdRef.markForCheck();
            });
    }

    onEditCategory(id: string): void {
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
                            required: true
                        });
                    }

                    const params: IQueryParams = {
                        limit: 1,
                        paginate: true
                    };

                    params['externalId'] = value;
                    params['supplierId'] = userSupplier.supplierId;

                    return this.catalogue$.findAll(params).pipe(
                        map(response => {
                            if (response.total > 0) {
                                if (!this.isAddMode()) {
                                    if (response.data[0].id === catalogue.id) {
                                        return null;
                                    }
                                }

                                return {
                                    skuSupplierExist: true
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
                                )
                            })
                        ],
                        asyncValidators: [this.checkExternalId()]
                    }
                ],
                name: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                description: [''],
                information: [
                    '',
                    []
                ],
                brandId: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                brandName: [
                    { value: '', disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                category: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                stock: [''],
                unlimitedStock: [{ value: false, disabled: true }],
                uom: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessage$.getErrorMessageNonState(
                                'default',
                                'required'
                            )
                        })
                    ]
                ],
                uomName: ['']
            }),
        });

        this.checkRoute();
        this.checkSelectedCatalogueCategory();
    }

    ngAfterViewInit(): void {
        this.initCatalogueUnitState();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

}
