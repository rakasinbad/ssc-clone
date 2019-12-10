import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { HelperService, ErrorMessageService } from 'app/shared/helpers';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { combineLatest, merge, of, Observable, Subject, Subscription } from 'rxjs';
import { map, filter, switchMap, withLatestFrom, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validator,
    Validators,
    FormControl,
    AbstractControl
} from '@angular/forms';
import Quill from 'quill';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { statusCatalogue } from '../status';
import { fromCatalogue } from '../store/reducers';
import { CatalogueActions, BrandActions } from '../store/actions';
import { CatalogueSelectors, BrandSelectors } from '../store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { Catalogue, CatalogueUnit, CatalogueCategory } from '../models';

import { CataloguesSelectCategoryComponent } from '../catalogues-select-category/catalogues-select-category.component';
import { IQueryParams, Brand } from 'app/shared/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
    selector: 'app-catalogues-form',
    templateUrl: './catalogues-form.component.html',
    styleUrls: ['./catalogues-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesFormComponent implements OnInit, OnDestroy {
    isEditMode = false;
    maxVariantSelections = 20;
    previewHTML: SafeHtml = '';

    quantityChoices: Array<{ id: string; label: string }>;
    form: FormGroup;
    variantForm: FormGroup;
    productPhotos: FormArray;
    productOldPhotos: FormArray;
    subs: Subscription = new Subscription();

    brands$: Observable<Array<Brand>>;
    brandUser$: { id: string; name: string; } = { id: '0', name: '' };
    productCategory$: SafeHtml;

    catalogueUnits$: Observable<Array<CatalogueUnit>>;

    productTagsControls: FormArray;
    productCourierControls: AbstractControl[];
    productVariantControls: AbstractControl[];
    productVariantFormControls: AbstractControl[];
    productVariantSelectionControls: AbstractControl[];

    productVariantSelectionData: Array<MatTableDataSource<object>> = [];

    readonly variantListColumns: Array<string> = [
        'name', 'price', 'stock', 'sku'
    ];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    private _unSubs$: Subject<void>;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private store: Store<fromCatalogue.FeatureState>,
        private matDialog: MatDialog,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        public translate: TranslateService,
        private sanitizer: DomSanitizer,
        private $helper: HelperService,
        private errorMessageSvc: ErrorMessageService
    ) {
        this.quantityChoices = this.$helper.getQuantityChoices();

        const breadcrumbs = [
            {
                title: 'Home',
                translate: 'BREADCRUMBS.HOME',
                active: false
            },
            {
                title: 'Catalogue',
                translate: 'BREADCRUMBS.CATALOGUE',
                url: '/pages/catalogues'
            },
        ];

        if (this.route.snapshot.url.filter(url => url.path === 'edit').length > 0) {
            breadcrumbs.push({
                title: 'Edit Product',
                translate: 'BREADCRUMBS.EDIT_PRODUCT',
                active: true
            });
        } else {
            breadcrumbs.push({
                title: 'Add New Product',
                translate: 'BREADCRUMBS.ADD_PRODUCT',
                active: true
            });
        }

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );

        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor Konten Produk',
                            active: true
                        },
                        value: {
                            active: false
                        },
                        active: false
                    },
                    action: {
                        save: {
                            label: 'Simpan',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Batal',
                            active: false
                        },
                        goBack: {
                            label: 'Kembali',
                            active: true,
                            url: '/pages/catalogues/list'
                        }
                    }
                }
            })
        );

        this.store.dispatch(FormActions.resetFormStatus());

        this.store.dispatch(UiActions.showFooterAction());

        this.store.dispatch(CatalogueActions.fetchCatalogueUnitRequest({
            payload: {
                limit: 10,
                skip: 0,
                sort: 'asc',
                sortBy: 'id'
            }
        }));
        this.catalogueUnits$ = this.store.select(CatalogueSelectors.getCatalogueUnits);
    }

    private onSubmit(): void {
        /** Membuat status form menjadi invalid. (Tidak bisa submit lagi) */
        this.store.dispatch(FormActions.setFormStatusInvalid());
        /** Mendapatkan seluruh nilai dari form. */
        const formValues = this.form.getRawValue();
        /** Mengambil foto-foto produk yang diperoleh dari back-end. */
        const oldPhotos = formValues.productMedia.oldPhotos;

        /** Membuat sebuah Object dengan tipe Partial<Catalogue> untuk keperluan strict-typing. */
        const catalogueData: Partial<Catalogue> = {
            /**
             * INFORMASI PRODUK
             */
            externalId: formValues.productInfo.externalId,
            name: formValues.productInfo.name,
            description: formValues.productInfo.description,
            information: formValues.productInfo.information,
            detail: formValues.productInfo.description,
            brandId: formValues.productInfo.brandId,
            firstCatalogueCategoryId: formValues.productInfo.category[0].id,
            lastCatalogueCategoryId: formValues.productInfo.category.length === 1 ?
                                        formValues.productInfo.category[0].id
                                        : formValues.productInfo.category[formValues.productInfo.category.length - 1].id,
            stock: formValues.productInfo.stock,
            unitOfMeasureId:  formValues.productInfo.uom,
            /**
             * INFORMASI PENJUALAN
             */
            discountedRetailBuyingPrice: formValues.productSale.retailPrice ? formValues.productSale.retailPrice : null,
            retailBuyingPrice: formValues.productSale.productPrice,
            catalogueKeywords: formValues.productSale.tags,
            /**
             * PENGATURAN MEDIA
             */
            catalogueImages: formValues.productMedia.photos
                            .filter(photo => photo)
                            .map(photo => ({ base64: photo })),
            /**
             * PENGIRIMAN
             */
            catalogueDimension: isNaN(Number(formValues.productShipment.catalogueDimension)) ? null : Number(formValues.productShipment.catalogueDimension),
            catalogueWeight: isNaN(Number(formValues.productShipment.catalogueWeight)) ? null : Number(formValues.productShipment.catalogueWeight),
            packagedDimension: isNaN(Number(formValues.productShipment.packagedDimension)) ? null : Number(formValues.productShipment.packagedDimension),
            packagedWeight: isNaN(Number(formValues.productShipment.packagedWeight)) ? null : Number(formValues.productShipment.packagedWeight),
            dangerItem: false,
            /** 
             * PENGATURAN JUMLAH
             */
            packagedQty: formValues.productCount.qtyPerMasterBox,
            minQty: formValues.productCount.minQtyValue,
            minQtyType: formValues.productCount.minQtyOption,
            multipleQty: formValues.productCount.additionalQtyValue,
            multipleQtyType: formValues.productCount.additionalQtyOption,
            /**
             * LAINNYA
             */
            displayStock: true,
            catalogueTaxId: 1,
            unlimitedStock: false,
        };

        if (this.isEditMode) {
            /** Fungsi untuk mem-filter foto untuk keperluan update gambar. */
            const filterPhoto = (photo, idx) => {
                const check = photo !== oldPhotos[idx].value && (!oldPhotos[idx].id || photo);

                if (check) {
                    if (!catalogueData.deletedImages) {
                        catalogueData.deletedImages = [];
                    }

                    if (!catalogueData.uploadedImages) {
                        catalogueData.uploadedImages = [];
                    }
                    
                    if (oldPhotos[idx].id) {
                        catalogueData.deletedImages.push(oldPhotos[idx].id);
                    }

                    catalogueData.uploadedImages.push({ base64: photo });
                }

                return check; 
            };

            catalogueData.catalogueImages = formValues.productMedia.photos.filter(filterPhoto);
        }

        if (!this.isEditMode) {
            this.store.dispatch(CatalogueActions.addNewCatalogueRequest({ payload: catalogueData }));
        } else {
            this.store.dispatch(CatalogueActions.patchCatalogueRequest({ payload: { id: formValues.productInfo.id, data: catalogueData, source: 'form' } }));
        }

        this.store.dispatch(FormActions.resetClickSaveButton());
    }

    ngOnInit(): void {
        this._unSubs$ = new Subject<void>();

        this.form = this.fb.group({
            productInfo: this.fb.group({
                id: [''],
                externalId: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                name: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                description: [''],
                information: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                // variant: ['', Validators.required],
                brandId: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                brandName: [{ value: '', disabled: true }, [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                category: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                stock: [''],
                uom: [''],
                // minQty: ['', [Validators.required, Validators.min(1)]],
                // packagedQty: ['', [Validators.required, Validators.min(1)]],
                // multipleQty: ['', [Validators.required, Validators.min(1)]]
            }),
            productSale: this.fb.group({
                retailPrice: [''],
                productPrice: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    })
                ]],
                tags: this.fb.array([], [
                    // RxwebValidators.required({
                    //     conditionalExpression: controls => (controls.tags as Array<string>).length > 0 ? true : null,
                    //     message: this.errorMessageSvc.getErrorMessageNonState('product_tag', 'min_1_tag')
                    // })
                    RxwebValidators.choice({
                        minLength: 1,
                        conditionalExpression: controls => (controls.tags as Array<string>).length > 0 ? true : null,
                        message: this.errorMessageSvc.getErrorMessageNonState('product_tag', 'min_1_tag')
                    })
                ]),
                variants: this.fb.array([])
            }),
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control(null, [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('product_photo', 'min_1_photo')
                        })
                    ]),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                ]),
                oldPhotos: this.fb.array([
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                ])
            }),
            productShipment: this.fb.group({
                catalogueWeight: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                packagedWeight: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                catalogueDimension: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                packagedDimension: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                isDangerous: [''],
                couriers: this.fb.array([
                    this.fb.control({
                        name: 'SiCepat REG (maks 5000g)',
                        disabled: this.fb.control(false)
                    }),
                    this.fb.control({
                        name: 'JNE REG (maks 5000g)',
                        disabled: this.fb.control(false)
                    }),
                    this.fb.control({
                        name: 'SiCepat Cargo (maks 5000g)',
                        disabled: this.fb.control(false)
                    })
                ])
            }),
            productCount: this.fb.group({
                qtyPerMasterBox: ['', [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                minQtyOption: ['pcs'],
                minQtyValue: [{ value: '1', disabled: true }, [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
                additionalQtyOption: ['pcs'],
                additionalQtyValue: [{ value: '1', disabled: true }, [
                    RxwebValidators.required({
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                    })
                ]],
            })
        });

        this.variantForm = this.fb.group({
            variants: this.fb.array([])
        });

        this.productPhotos = this.form.get('productMedia.photos') as FormArray;
        this.productOldPhotos = this.form.get('productMedia.oldPhotos') as FormArray;
        this.productTagsControls = (this.form.get('productSale.tags') as FormArray);
        this.productCourierControls = (this.form.get(
            'productShipment.couriers'
        ) as FormArray).controls;
        this.productVariantControls = (this.form.get(
            'productSale.variants'
        ) as FormArray).controls;
        this.productVariantFormControls = (this.variantForm.get(
            'variants'
        ) as FormArray).controls;

        this.store.select(CatalogueSelectors.getSelectedCategories)
            .pipe(
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserState),
                    this.store.select(CatalogueSelectors.getProductName),
                    (categories, auth, productName) => ({ categories, auth, productName })
                ),
                switchMap(data => {
                    if (data.auth.user.userSuppliers.length === 0) {
                        return of(
                            BrandActions.fetchBrandsFailure({
                                payload: { id: 'fetchBrandsFailure', errors: 'Not Authenticated' }
                            })
                        );
                    }

                    return of([data.auth, data.categories, data.productName]);
                }),
                takeUntil(this._unSubs$)
            ).subscribe(data => {
                const auth = data[0];
                const categories = data[1];
                const productName = data[2];
                
                this.form.get('productInfo.brandId').patchValue(auth.user.userSuppliers[0].id);
                this.form.get('productInfo.brandName').patchValue(auth.user.userSuppliers[0].name);
                this.form.get('productInfo.category').patchValue(categories);

                this.startFetchBrands(auth.user.userSuppliers[0].id);

                if (!this.isEditMode) {
                    this.form.get('productInfo.name').patchValue(productName);
                }
                
                this.productCategory$ = this.sanitizer.bypassSecurityTrustHtml(
                    categories.map(category => category['name']).join(`
                        <span class="mx-12">
                            >
                        </span>
                    `)
                );

                this._cd.markForCheck();
                // console.log(this.form.getRawValue());
            });

        this.subs.add(
            merge(
                this.form.get('productInfo').valueChanges,
                this.form.get('productSale').valueChanges,
                this.form.get('productMedia').valueChanges,
                this.form.get('productShipment').valueChanges
            ).pipe(
                distinctUntilChanged(),
                debounceTime(500)
            ).subscribe(() => {
                if (this.form.status === 'VALID' && !this.form.pristine) {
                    this.store.dispatch(FormActions.setFormStatusValid());
                } else {
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                }

                this._cd.markForCheck();
            })
        );

        this.subs.add(
            this.form.get('productCount.minQtyOption')
                .valueChanges
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const minQtyValueController = this.form.get('productCount.minQtyValue');
                    const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

                    switch (value) {
                        case 'master_box':
                            minQtyValueController.disable();
                            minQtyValueController.patchValue(qtyPerMasterBox ? qtyPerMasterBox : 1);
                            break;
                        case 'custom':
                            minQtyValueController.enable();
                            // minQtyValueController.patchValue(1);
                            break;
                        case 'pcs':
                        default:
                            minQtyValueController.disable();
                            minQtyValueController.patchValue(1);
                            break;
                    }
                })
        );

        this.subs.add(
            this.form.get('productCount.additionalQtyOption')
                .valueChanges
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const additionalQtyValueController = this.form.get('productCount.additionalQtyValue');
                    const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

                    switch (value) {
                        case 'master_box':
                            additionalQtyValueController.disable();
                            additionalQtyValueController.patchValue(qtyPerMasterBox ? qtyPerMasterBox : 1);
                            break;
                        case 'custom':
                            additionalQtyValueController.enable();
                            // minQtyValueController.patchValue(1);
                            break;
                        case 'pcs':
                        default:
                            additionalQtyValueController.disable();
                            additionalQtyValueController.patchValue(1);
                            break;
                    }
                })
        );

        this.subs.add(
            this.form.get('productCount.qtyPerMasterBox')
                .valueChanges
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const minQtyOption = this.form.get('productCount.minQtyOption');
                    const minQtyValue = this.form.get('productCount.minQtyValue');
                    const additionalQtyOption = this.form.get('productCount.additionalQtyOption');
                    const additionalQtyValue = this.form.get('productCount.additionalQtyValue');

                    if (minQtyOption.value === 'master_box') {
                        minQtyValue.setValue(value);
                    }

                    if (additionalQtyOption.value === 'master_box') {
                        additionalQtyValue.setValue(value);
                    }
                })
        );

        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter(isClick => !!isClick),
                takeUntil(this._unSubs$)
            )
            .subscribe(isClick => {
                console.log('CLICK SUBMIT', isClick);

                if (isClick) {
                    this.onSubmit();
                }
            });

        this.brands$ = this.store.select(BrandSelectors.getAllBrands).pipe(takeUntil(this._unSubs$));

        if (!this.isEditMode) {
            this.form.get('productInfo.description').setValue('---');
            setTimeout(() => this.form.get('productInfo.description').setValue(''), 100);
        }

        // this.previewHTML = this.sanitizer.bypassSecurityTrustHtml(this.form.get('productInfo.description').value);
        this.registerQuillFormatting();
        this._prepareEditCatalogue();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.store.dispatch(CatalogueActions.resetSelectedCategories());
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this.store.dispatch(FormActions.resetFormStatus());

        this._unSubs$.next();
        this._unSubs$.complete();

        this.subs.unsubscribe();
    }

    private startFetchBrands(supplierId: string): void {
        const data: IQueryParams = {
            paginate: false,
        };

        data['supplierId'] = supplierId;

        this.store.dispatch(BrandActions.fetchBrandsRequest({ payload: data }));
    }

    private registerQuillFormatting(): void {
        const Block = Quill.import('blots/block');
        const Inline = Quill.import('blots/inline');

        (Block as any).tagName = 'DIV';
        Quill.register(Block, true);

        class BoldBlot extends Inline {}

        (BoldBlot as any).blotName = 'bold';
        (BoldBlot as any).tagName = 'b';

        class ItalicBlot extends Inline {}

        (ItalicBlot as any).blotName = 'italic';
        (ItalicBlot as any).tagName = 'i';

        Quill.register(BoldBlot);
        Quill.register(ItalicBlot);
    }

    private _prepareEditCatalogue(): void {
        const { id } = this.route.snapshot.params;

        if (!id) {
            this.isEditMode = false;
        } else {
            this.isEditMode = true;

            // this.productTagsControls.clear();
            // (this.form.get('productSale.tags') as FormArray).clear();

            this
                .store
                .dispatch(CatalogueActions.fetchCatalogueRequest({ payload: id }));
            
            combineLatest([
                this.store.select(CatalogueSelectors.getSelectedCatalogue),
                this.store.select(CatalogueSelectors.getCatalogueCategories)
            ]).pipe(
                takeUntil(this._unSubs$)
            ).subscribe(([catalogue, categories]) => {
                if (categories.length === 0) {
                    this.store.dispatch(CatalogueActions.fetchCatalogueCategoriesRequest({ payload: { paginate: false } }));
                } else if (categories.length > 0 && catalogue) {
                    const searchCategory = (catalogueId, selectedCategories: Array<CatalogueCategory> ) => {
                        const selectedCategory = selectedCategories.filter(category => category.id === catalogueId);

                        return {
                            id: selectedCategory[0].id,
                            name: selectedCategory[0].category,
                            parent: selectedCategory[0].parentId ? selectedCategory[0].parentId : null,
                            children: selectedCategory[0].children
                        };
                    };

                    const newCategories = [];
                    let isFirst = true;
                    do {
                        if (isFirst) {
                            newCategories.push(searchCategory(catalogue.lastCatalogueCategoryId, categories));
                            isFirst = false;
                        } else {
                            const lastCategory = newCategories[newCategories.length - 1];
                            newCategories.push(searchCategory(lastCategory.parent, categories));
                        }
                    } while (newCategories[newCategories.length - 1].parent);


                    this.store.dispatch(CatalogueActions.setSelectedCategories({
                        payload: [
                            ...newCategories.reverse().map(newCat => ({ id: newCat.id, name: newCat.name, parent: newCat.parent }))
                        ]
                    }));

                    const keywords = catalogue.catalogueKeywordCatalogues.map(keyword => keyword.catalogueKeyword.tag);
                    (this.form.get('productSale.tags') as FormArray).clear();
                    for (const keyword of keywords) {
                        (this.form.get('productSale.tags') as FormArray).push(this.fb.control(keyword));
                    }

                    this.form.patchValue({
                        productInfo: {
                            id: catalogue.id,
                            externalId: catalogue.externalId,
                            name: catalogue.name,
                            description: catalogue.description,
                            information: catalogue.information,
                            // variant: ['', Validators.required],
                            brandId: catalogue.brandId,
                            // brandName: 'ini cuma unusued brand',
                            // category: ['', Validators.required],
                            stock: catalogue.stock,
                            uom: catalogue.unitOfMeasureId ? catalogue.unitOfMeasureId : '',
                            minQty: catalogue.minQty,
                            packagedQty: catalogue.packagedQty,
                            multipleQty: catalogue.multipleQty
                        }, productSale: {
                            retailPrice: String(catalogue.discountedRetailBuyingPrice).replace('.', ','),
                            productPrice: String(catalogue.retailBuyingPrice).replace('.', ','),
                            // variants: this.fb.array([])
                        }, productMedia: {
                            photos: [
                                ...catalogue.catalogueImages.map(image => image.imageUrl)
                            ],
                            oldPhotos: [
                                ...catalogue.catalogueImages.map(image => image.imageUrl)
                            ]
                        },
                        productShipment: {
                            catalogueWeight: catalogue.catalogueWeight,
                            packagedWeight: catalogue.packagedWeight,
                            catalogueDimension: catalogue.catalogueDimension,
                            packagedDimension: catalogue.packagedDimension,
                            // isDangerous: [''],
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
                        },
                        productCount: {
                            qtyPerMasterBox: catalogue.packagedQty,
                            minQtyOption: catalogue.minQtyType,
                            minQtyValue: catalogue.minQty,
                            additionalQtyOption: catalogue.multipleQtyType,
                            additionalQtyValue: catalogue.multipleQty,
                        }
                    });

                    if (catalogue.minQtyType !== 'custom') {
                        this.form.get('productCount.minQtyValue').disable();
                    } else {
                        this.form.get('productCount.minQtyValue').enable();
                    }

                    if (catalogue.multipleQtyType !== 'custom') {
                        this.form.get('productCount.additionalQtyValue').disable();
                    } else {
                        this.form.get('productCount.additionalQtyValue').enable();
                    }

                    // this.previewHTML = this.sanitizer.bypassSecurityTrustHtml(this.form.get('productInfo.description').value);

                    for (const [idx, image] of catalogue.catalogueImages.entries()) {
                        this.productPhotos.controls[idx].setValue(image.imageUrl);
                        this.productOldPhotos.controls[idx].get('id').setValue(image.id);
                        this.productOldPhotos.controls[idx].get('value').setValue(image.imageUrl);
                    }

                    this.form.markAsPristine();
                    // this.store.dispatch(
                    //     CatalogueActions
                    //         .fetchCatalogueCategoryRequest({
                    //             payload: String(catalogue.lastCatalogueCategoryId)
                    //         })
                    //     );
                }
            });
        }
    }

    onAddVariant(): void {
        const $index = this.productVariantControls.push(this.fb.array([this.fb.control('')]));

        this.productVariantFormControls.push(
            this.fb.group({
                price: '',
                stock: '',
                sku: ''
            })
        );

        this.productVariantSelectionData.push(
            new MatTableDataSource(
                (this.productVariantControls[$index - 1] as FormArray).controls
            )
        );
        // console.log(this.productVariants);
        // console.log(this.form.get('productSale.variants'));
        // console.log(this.productVariantSelections);
    }

    onFileBrowse($event: Event, index: number): void {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            const photo = (this.form.get('productMedia.photos') as FormArray).controls[index];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                photo.patchValue(fileReader.result);
                this.form.markAsTouched();
                this._cd.markForCheck();

            };

            fileReader.readAsDataURL(file);
        }

        return;
    }

    onAbortUploadPhoto($event: HTMLInputElement, index: number): void {
        $event.value = '';

        (this.form.get('productMedia.photos') as FormArray).controls[index].patchValue(null);
        this._cd.markForCheck();
    }

    onResetImage(index: number): void {
        const originalImage = this.productOldPhotos.controls[index].get('value').value;
        (this.form.get('productMedia.photos') as FormArray).controls[index].patchValue(originalImage);

        this._cd.markForCheck();
    }

    onAddVariantSelection(_: Event, $variant: number): void {
        (this.productVariantControls[$variant] as FormArray).push(this.fb.control(''));

        console.log((this.productVariantControls[$variant] as FormArray).controls);
        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );
        console.log(this.productVariantSelectionData[$variant]);
    }

    onRemoveVariantSelection(_: Event, $variant: number, $index: number): void {
        (this.productVariantControls[$variant] as FormArray).removeAt($index);
        if (
            (this.productVariantControls[$variant] as FormArray).controls.length === 0
        ) {
            this.productVariantFormControls.splice($variant, 1);
            this.productVariantControls.splice($variant, 1);
        }
        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );
    }

    onAddTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        const formArray = this.form.get('productSale.tags') as FormArray;

        if ((value || '').trim()) {
            formArray.push(this.fb.control(value));
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveTag(index: number): void {
        // const formArray = this.productTagsControls.removeAt indexOf(control => control.value) this.form.get('productSale.tags').value as Array<string>;
        // const index = formArray.indexOf(tag);

        // if (index >= 0) {
        //     formArray.splice(index, 1);
        // }
        this.productTagsControls.removeAt(index);
    }

    onEditCategory(id: string): void {
        this.matDialog.open(CataloguesSelectCategoryComponent, { width: '1366px' });
    }

    printLog(val: any): void {
        console.log(val);
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const {
            ignoreTouched,
            ignoreDirty
        } = args;

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
}
