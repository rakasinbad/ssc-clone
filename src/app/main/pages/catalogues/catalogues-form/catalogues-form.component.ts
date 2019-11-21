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

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import { statusCatalogue } from '../status';
import { fromCatalogue } from '../store/reducers';
import { CatalogueActions } from '../store/actions';
import { CatalogueSelectors } from '../store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { MatTableDataSource } from '@angular/material';
import { CatalogueUnit } from '../models';

@Component({
    selector: 'app-catalogues-form',
    templateUrl: './catalogues-form.component.html',
    styleUrls: ['./catalogues-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CataloguesFormComponent implements OnInit {
    maxVariantSelections = 20;

    form: FormGroup;
    variantForm: FormGroup;
    productPhotos: FormGroup;
    subs: Subscription = new Subscription();

    brandUser$: { id: string; name: string; } = { id: '0', name: '' };
    productCategory$: string;

    catalogueUnits$: Observable<Array<CatalogueUnit>>;

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
        private store: Store<fromCatalogue.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        public translate: TranslateService
    ) {
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Catalogue',
                        translate: 'BREADCRUMBS.CATALOGUE'
                    },
                    {
                        title: 'Add New Product',
                        translate: 'BREADCRUMBS.ADD_PRODUCT',
                        active: true
                    }
                ]
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
                        active: true
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
                            active: true
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

    private onSubmit() {
        const formValues = this.form.getRawValue();

        const catalogueData = {
            sku: formValues.productInfo.sku,
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
            weight: isNaN(Number(formValues.productShipment.weight)) ? 0 : Number(formValues.productShipment.weight),
            height: isNaN(Number(formValues.productSize.height)) ? 0 : Number(formValues.productSize.height),
            width: isNaN(Number(formValues.productSize.width)) ? 0 : Number(formValues.productSize.width),
            length: isNaN(Number(formValues.productSize.length)) ? 0 : Number(formValues.productSize.length),
            minQty: 20,
            packagedQty: 20,
            multipleQty: 20,
            displayStock: true,
            catalogueTaxId: 1,
            dangerItem: false,
            unlimitedStock: false,
            catalogueKeywords: formValues.productSale.tags,
            catalogueImages: formValues.productMedia.photos
                            .filter(photo => photo)
                            .map(photo => ({ 'base64': photo }))
        };

        this.store.dispatch(CatalogueActions.addNewCatalogueRequest({ payload: catalogueData }));
    }

    ngOnInit() {
        this._unSubs$ = new Subject<void>();

        this.form = this.fb.group({
            productInfo: this.fb.group({
                sku: ['', Validators.required],
                name: ['', Validators.required],
                description: [''],
                // variant: ['', Validators.required],
                brandId: ['', Validators.required],
                brandName: [{ value: '', disabled: true }, Validators.required],
                category: ['', Validators.required],
                stock: [''],
                uom: ['']
            }),
            productSale: this.fb.group({
                retailPrice: ['', Validators.required],
                productPrice: ['', Validators.required],
                tags: [[], control => (control.value as Array<string>).length > 0 ? true : null],
                variants: this.fb.array([])
            }),
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control(null, Validators.required),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null),
                    this.fb.control(null)
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

        this.productPhotos = this.form.get('productMedia.photos') as FormGroup;
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
                            CatalogueActions.fetchCategoryTreeFailure({
                                payload: { id: 'fetchCategoryTreeFailure', errors: 'Not Authenticated' }
                            })
                        );
                    }

                    return of([data.auth, data.categories, data.productName]);
                })
            ).subscribe(data => {
                // this.brandUser$.id = auth.data.userBrands[0].brand.id;
                // this.brandUser$.name = auth.data.userBrands[0].brand.name;
                this.form.get('productInfo.brandId').setValue(data[0].data.userBrands[0].brand.id);
                this.form.get('productInfo.brandName').setValue(data[0].data.userBrands[0].brand.name);

                this.form.get('productInfo.category').patchValue(data[1]);
                this.form.get('productInfo.name').patchValue(data[2]);
                this.productCategory$ = data[1].map(category => category.name).join(' > ');

                console.log(this.form.getRawValue());
            });

        this.subs.add(
            this.form
                .statusChanges
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(1000)
                )
                .subscribe(status => {
                    console.log('FORM', this.form);
                    console.log('FORM VALUE', this.form.getRawValue());

                    if (status === 'VALID') {
                        this.store.dispatch(FormActions.setFormStatusValid());
                    }
    
                    if (status === 'INVALID') {
                        this.store.dispatch(FormActions.setFormStatusInvalid());
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
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this.store.dispatch(FormActions.resetFormStatus());

        this._unSubs$.next();
        this._unSubs$.complete();

        this.subs.unsubscribe();
    }

    onAddVariant() {
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

    onFileBrowse($event: Event, index: number) {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            const photo = (this.form.get('productMedia.photos') as FormArray).controls[index];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                photo.patchValue(fileReader.result);
                this._cd.markForCheck();

            };

            fileReader.readAsDataURL(file);
        }

        return;
    }

    onAddVariantSelection(_: Event, $variant: number) {
        (this.productVariantControls[$variant] as FormArray).push(this.fb.control(''));

        console.log((this.productVariantControls[$variant] as FormArray).controls);
        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );
        console.log(this.productVariantSelectionData[$variant]);
    }

    onRemoveVariantSelection(_: Event, $variant: number, $index: number) {
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

    onAddTag(event: MatChipInputEvent) {
        const input = event.input;
        const value = event.value;
        const formArray = this.form.get('productSale.tags');

        if ((value || '').trim()) {
            formArray.value.push(value);
        }

        if (input) {
            input.value = '';
        }
    }

    onRemoveTag(tag: string) {
        const formArray = this.form.get('productSale.tags') as FormArray;
        const index = (formArray.value as Array<string>).indexOf(tag);

        if (index >= 0) {
            formArray.removeAt(index);
        }
    }

    printLog(val: any) {
        console.log(val);
    }
}
