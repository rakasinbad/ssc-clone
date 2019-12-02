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
import { GeneratorService } from 'app/shared/helpers';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { merge, of, Observable, Subject, Subscription } from 'rxjs';
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
import { Catalogue, CatalogueUnit } from '../models';

import { CataloguesSelectCategoryComponent } from '../catalogues-select-category/catalogues-select-category.component';
import { IQueryParams, Brand } from 'app/shared/models';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

    form: FormGroup;
    variantForm: FormGroup;
    productPhotos: FormArray;
    productOldPhotos: FormArray;
    subs: Subscription = new Subscription();

    brands$: Observable<Array<Brand>>;
    brandUser$: { id: string; name: string; } = { id: '0', name: '' };
    productCategory$: string;

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
        private sanitizer: DomSanitizer
    ) {
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
        this.store.dispatch(FormActions.setFormStatusInvalid());
        const formValues = this.form.getRawValue();
        const oldPhotos = formValues.productMedia.oldPhotos;

        const catalogueData: Partial<Catalogue> = {
            externalId: formValues.productInfo.externalId,
            name: formValues.productInfo.name,
            description: formValues.productInfo.description,
            information: formValues.productInfo.description,
            detail: formValues.productInfo.description,
            brandId: formValues.productInfo.brandId,
            firstCatalogueCategoryId: formValues.productInfo.category[0].id,
            lastCatalogueCategoryId: formValues.productInfo.category.length === 1 ?
                                        formValues.productInfo.category[0].id
                                        : formValues.productInfo.category[formValues.productInfo.category.length - 1].id,
            stock: formValues.productInfo.stock,
            unitOfMeasureId:  formValues.productInfo.uom,
            suggestRetailPrice: formValues.productSale.retailPrice,
            productPrice: formValues.productSale.productPrice,
            weight: isNaN(Number(formValues.productShipment.weight)) ? null : Number(formValues.productShipment.weight),
            height: isNaN(Number(formValues.productSize.height)) ? null : Number(formValues.productSize.height),
            width: isNaN(Number(formValues.productSize.width)) ? null : Number(formValues.productSize.width),
            length: isNaN(Number(formValues.productSize.length)) ? null : Number(formValues.productSize.length),
            minQty: formValues.productInfo.minQty,
            packagedQty: formValues.productInfo.packagedQty,
            multipleQty: formValues.productInfo.multipleQty,
            displayStock: true,
            catalogueTaxId: 1,
            dangerItem: false,
            unlimitedStock: false,
            catalogueKeywords: formValues.productSale.tags,
            catalogueImages: formValues.productMedia.photos
                            .filter(photo => photo)
                            .map(photo => ({ base64: photo }))
        };

        if (this.isEditMode) {
            catalogueData.catalogueImages 
            = formValues.productMedia.photos
                .filter((photo, idx) => {
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
                });
        }

        // delete catalogueData.catalogueImages;
        // console.log(catalogueData);

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
                externalId: ['', Validators.required],
                name: ['', Validators.required],
                description: [''],
                // variant: ['', Validators.required],
                brandId: ['', Validators.required],
                brandName: [{ value: '', disabled: true }, Validators.required],
                category: ['', Validators.required],
                stock: [''],
                uom: [''],
                minQty: ['', [Validators.required, Validators.min(1)]],
                packagedQty: ['', [Validators.required, Validators.min(1)]],
                multipleQty: ['', [Validators.required, Validators.min(1)]]
            }),
            productSale: this.fb.group({
                retailPrice: ['', Validators.required],
                productPrice: ['', Validators.required],
                tags: this.fb.array([], Validators.required),
                variants: this.fb.array([])
            }),
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control(null, Validators.required),
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
            productSize: this.fb.group({
                length: [''],
                width: [''],
                height: ['']
            }),
            productShipment: this.fb.group({
                weight: [''],
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
                let categories;

                if (data[1][0]) {
                    categories = (!this.isEditMode || !data[1][0].parent) ? data[1] : Array(...data[1]).reverse();
                }

                // this.brandUser$.id = auth.data.userBrands[0].brand.id;
                // this.brandUser$.name = auth.data.userBrands[0].brand.name;
                this.form.get('productInfo.brandId').patchValue(data[0].user.userSuppliers[0].id);
                this.form.get('productInfo.brandName').patchValue(data[0].user.userSuppliers[0].name);

                this.form.get('productInfo.category').patchValue(categories);

                this.startFetchBrands(data[0].user.userSuppliers[0].id);
                
                if (!this.isEditMode) {
                    this.form.get('productInfo.name').patchValue(data[2]);
                }

                if (Array.isArray(categories)) {
                    this.productCategory$ = categories.map(category => category.name).join(' > ');
                }

                this._cd.markForCheck();
                console.log(this.form.getRawValue());
            });

        this.subs.add(
            this.form
                .valueChanges
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(1000)
                )
                .subscribe(() => {
                    console.log('FORM', this.form);
                    console.log('FORM VALUE', this.form.getRawValue());
                    // this.previewHTML = this.sanitizer.bypassSecurityTrustHtml(this.form.get('productInfo.description').value);

                    const pristineStatuses = [
                        this.form.get('productInfo').pristine,
                        this.form.get('productSale').pristine,
                        this.form.get('productMedia').pristine,
                        this.form.get('productSize').pristine,
                        this.form.get('productShipment').pristine
                    ];

                    if (this.form.status === 'VALID' && this.form.dirty && !this.form.untouched) {
                        this.store.dispatch(FormActions.setFormStatusValid());
                    } else if (this.form.status === 'INVALID') {
                        this.store.dispatch(FormActions.setFormStatusInvalid());
                    }

                    this._cd.markForCheck();
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
            this
                .store
                .select(CatalogueSelectors.getSelectedCatalogue)
                .pipe(takeUntil(this._unSubs$))
                .subscribe(catalogue => {
                    if (catalogue) {
                        for (const keyword of catalogue.catalogueKeywordCatalogues) {
                            if ((this.form.get('productSale.tags') as FormArray).controls.length > catalogue.catalogueKeywordCatalogues.length) {
                                (this.form.get('productSale.tags') as FormArray).clear();
                            }

                            (this.form.get('productSale.tags') as FormArray).push(
                                this.fb.control(keyword.catalogueKeyword.tag)
                            );
                        }

                        this.form.patchValue({
                            productInfo: {
                                id: catalogue.id,
                                externalId: catalogue.externalId,
                                name: catalogue.name,
                                description: catalogue.description,
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
                                retailPrice: catalogue.suggestRetailPrice.toString().replace('.', ','),
                                productPrice: catalogue.productPrice.toString().replace('.', ','),
                                // variants: this.fb.array([])
                            }, productMedia: {
                                photos: [
                                    ...catalogue.catalogueImages.map(image => image.imageUrl)
                                ],
                                oldPhotos: [
                                    ...catalogue.catalogueImages.map(image => image.imageUrl)
                                ]
                            },
                            productSize: {
                                length: catalogue.length,
                                width: catalogue.width,
                                height: catalogue.height
                            },
                            productShipment: {
                                weight: catalogue.weight,
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
                            }
                        });

                        this.previewHTML = this.sanitizer.bypassSecurityTrustHtml(this.form.get('productInfo.description').value);

                        for (const [idx, image] of catalogue.catalogueImages.entries()) {
                            this.productPhotos.controls[idx].setValue(image.imageUrl);
                            this.productOldPhotos.controls[idx].get('id').setValue(image.id);
                            this.productOldPhotos.controls[idx].get('value').setValue(image.imageUrl);
                        }

                        this.store.dispatch(
                            CatalogueActions
                                .fetchCatalogueCategoryRequest({
                                    payload: String(catalogue.lastCatalogueCategoryId)
                                })
                            );
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
}
