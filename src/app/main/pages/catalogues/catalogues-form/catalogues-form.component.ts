import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormArray,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import {
    MatCheckboxChange,
    MatDialog,
    MatRadioChange,
    MatTableDataSource,
} from '@angular/material';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSelectChange } from '@angular/material/select';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { Brand } from 'app/shared/models/brand.model';
import {
    IBreadcrumbs,
    IFooterActionConfig,
    PaginateResponse,
    TNullable,
} from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import * as numeral from 'numeral';
import Quill from 'quill';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { CataloguesSelectCategoryComponent } from '../catalogues-select-category/catalogues-select-category.component';
import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';
import {
    CatalogueCategory,
    CatalogueUnit,
    StoreSegmentationChannel,
    StoreSegmentationCluster,
    StoreSegmentationGroup,
    SubBrandProps,
} from '../models';
import {
    BrandFacadeService,
    CatalogueFacadeService,
    CataloguesService,
    CatalogueTaxFacadeService,
    SubBrandApiService,
} from '../services';
import { BrandActions, CatalogueActions } from '../store/actions';
import { fromBrand, fromCatalogue } from '../store/reducers';
import { BrandSelectors, CatalogueSelectors } from '../store/selectors';
import { CatalogueTax } from './../models/classes/catalogue-tax.class';
import { SubBrand } from './../models/sub-brand.model';

type IFormMode = 'add' | 'view' | 'edit';
interface IUomType {
    smallName: string;
    smallId: string;
    largeName: string;
    largeId: string;
}

@Component({
    selector: 'app-catalogues-form',
    templateUrl: './catalogues-form.component.html',
    styleUrls: ['./catalogues-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CataloguesFormComponent implements OnInit, OnDestroy, AfterViewInit {
    private breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Catalogue',
        },
    ];

    private footerConfig: IFooterActionConfig = {
        progress: {
            title: {
                label: 'Skor Konten Produk',
                active: true,
            },
            value: {
                active: false,
            },
            active: false,
        },
        action: {
            save: {
                label: 'Save',
                active: true,
            },
            draft: {
                label: 'Save Draft',
                active: false,
            },
            cancel: {
                label: 'Cancel',
                active: false,
            },
            goBack: {
                label: 'Back',
                active: true,
                url: '/pages/catalogues/list',
            },
        },
    };

    private unSubs$: Subject<any> = new Subject();

    formMode: IFormMode = 'add';
    maxVariantSelections = 20;
    previewHTML: SafeHtml = '';
    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };
    formClass: {
        'custom-field': boolean;
        'view-field-right': boolean;
    };

    isLoading$: Observable<boolean>;
    quantityChoices: { id: string; label: string }[];
    form: FormGroup;
    variantForm: FormGroup;
    productPhotos: FormArray;
    productOldPhotos: FormArray;

    brands$: Observable<Brand[]>;
    brandUser$: { id: string; name: string } = { id: '0', name: '' };
    productCategory$: SafeHtml;
    private readonly subBrandCollections$: BehaviorSubject<SubBrand[]> = new BehaviorSubject([]);
    uomNames$: BehaviorSubject<IUomType> = new BehaviorSubject({
        largeName: '',
        largeId: '',
        smallName: '',
        smallId: '',
    });

    subBrands$: Observable<SubBrand[]> = this.subBrandCollections$.asObservable();

    catalogueUnits: CatalogueUnit[];
    catalogueSmallUnits: CatalogueUnit[];
    catalogueLargeUnits: CatalogueUnit[];

    productTagsControls: FormArray;
    productCourierControls: AbstractControl[];
    productVariantControls: AbstractControl[];
    productVariantFormControls: AbstractControl[];
    productVariantSelectionControls: AbstractControl[];

    productVariantSelectionData: MatTableDataSource<object>[] = [];
    subBrandLoading: boolean = false;
    taxes: CatalogueTax[];

    readonly variantListColumns: string[] = ['name', 'price', 'stock', 'sku'];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromCatalogue.FeatureState>,
        private brandStore: Store<fromBrand.FeatureState>,
        private matDialog: MatDialog,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _cd: ChangeDetectorRef,
        public translate: TranslateService,
        private sanitizer: DomSanitizer,
        private brandFacade: BrandFacadeService,
        private catalogueFacade: CatalogueFacadeService,
        private $helper: HelperService,
        private errorMessageSvc: ErrorMessageService,
        private catalogueSvc: CataloguesService,
        private readonly subBrandApiService: SubBrandApiService,
        private readonly catalogueTaxFacade: CatalogueTaxFacadeService,
        private _$notice: NoticeService
    ) {
        this.quantityChoices = this.$helper.getQuantityChoices();

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        /* this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: ,
            })
        );

        this.store.dispatch(FormActions.resetFormStatus()); */
    }

    onChangeMaxOrderQty(ev: MatCheckboxChange): void {
        // HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty', { ev });
        this.form.get('productCount.maxQtyValue').reset();

        if (ev.checked) {
            this.form.get('productCount.maxQtyValue').clearValidators();
            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.maxQtyValue').disable({ onlySelf: true });


            /* HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty checked TRUE', {
                minQty,
                maxQtyValue: this.form.get('productCount.maxQtyValue'),
                qtyMasterBox: this.form.get('productCount.qtyPerMasterBox'),
            }); */
        } else {
            const minQty = this.form.get('productCount.minQtyValue').value;

            this.form.get('productCount.maxQtyValue').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.minQtyValue',
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_number', {
                        limitValue: minQty,
                    }),
                }),
            ]);

            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.maxQtyValue').enable({ onlySelf: true });

            /* HelperService.debug('[CataloguesFormComponent] onChangeMaxOrderQty checked FALSE', {
                maxQtyValue: this.form.get('productCount.maxQtyValue'),
                qtyMasterBox: this.form.get('productCount.qtyPerMasterBox'),
            }); */
        }
    }

    onChangeIsEnableLargeUnit(ev: MatCheckboxChange): void {
        //UOM Large Unit
        this.form.get('productCount.uomLargeUnit').reset();
        this.form.get('productCount.consistOfQtyLargeUnit').reset();

        if (ev.checked) {
            //UOM Large Unit
            this.form.get('productCount.uomSmallUnit').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.different({
                    fieldName: 'productCount.uomLargeUnit',
                    message: this.errorMessageSvc.getErrorMessageNonState(
                        'uom_large_unit',
                        'different',
                        {
                            fieldComparedName: 'uom_small_unit'
                        }
                    )
                })
            ])
            this.form.get('productCount.uomSmallUnit').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.uomLargeUnit').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.different({
                    fieldName: 'productCount.uomSmallUnit',
                    message: this.errorMessageSvc.getErrorMessageNonState(
                        'uom_small_unit',
                        'different',
                        {
                            fieldComparedName: 'uom_large_unit'
                        }
                    )
                })
                
            ])
            this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.uomLargeUnit').enable({ onlySelf: true });
            //consist Of Qty Large Unit
            this.form.get('productCount.consistOfQtyLargeUnit').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.minNumber({
                    value: 1,
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', {
                        minValue: 1,
                    }),
                }),
            ]);
            this.form
                .get('productCount.consistOfQtyLargeUnit')
                .updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.consistOfQtyLargeUnit').enable({ onlySelf: true });
            this.form.patchValue({
                productCount: {
                    isEnableLargeUnit: true,
                },
            });
        } else {
            //UOM Large Unit
            this.form.get('productCount.uomLargeUnit').clearValidators();
            this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.uomLargeUnit').disable({ onlySelf: true });
            //consist Of Qty Large Unit
            //consist Of Qty Large Unit
            this.form.get('productCount.consistOfQtyLargeUnit').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.minNumber({
                    value: 0,
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', {
                        minValue: 0,
                    }),
                }),
            ]);
            this.form
                .get('productCount.consistOfQtyLargeUnit')
                .updateValueAndValidity({ onlySelf: true });
            this.form.get('productCount.consistOfQtyLargeUnit').disable({ onlySelf: true });
            this.form.patchValue({
                productCount: {
                    isEnableLargeUnit: false,
                    consistOfQtyLargeUnit:0,
                    uomLargeUnit: null
                },
            });
        }
    }

    private fileSizeValidator(fieldName: string, maxSize: number = 0): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (!(control.value instanceof File)) {
                return null;
            }

            if ((control.value as File).size > maxSize) {
                return {
                    fileSize: {
                        message: this.errorMessageSvc.getErrorMessageNonState(
                            fieldName,
                            'file_size_lte',
                            { size: numeral(maxSize).format('0[.]0 b', Math.floor) }
                        ),
                        value: 1,
                    },
                };
            }

            return null;
        };
    }

    private onSubmit(): void {
        /** Membuat status form menjadi invalid. (Tidak bisa submit lagi) */
        this.store.dispatch(FormActions.setFormStatusInvalid());
        /** Mendapatkan seluruh nilai dari form. */
        const formValues = this.form.getRawValue();
        /** Mengambil foto-foto produk yang diperoleh dari back-end. */
        const oldPhotos = formValues.productMedia.oldPhotos;

        const newStock = formValues.productInfo.unlimitedStock
            ? 0
            : !formValues.productInfo.stock
            ? 0
            : formValues.productInfo.stock;

        // Warehouse
        const chosenWarehouse = formValues['productSegmentation']['chosenWarehouse'];
        const newWarehouse =
            chosenWarehouse && chosenWarehouse.length
                ? chosenWarehouse.map((item: Selection) => +item.id)
                : null;

        // Store Type
        const chosenStoreType = formValues['productSegmentation']['chosenStoreType'];
        const newStoreType =
            chosenStoreType && chosenStoreType.length
                ? chosenStoreType.map((item: Selection) => +item.id)
                : null;

        // Store Group
        const chosenStoreGroup = formValues['productSegmentation']['chosenStoreGroup'];
        const newStoreGroup =
            chosenStoreGroup && chosenStoreGroup.length
                ? chosenStoreGroup.map((item: Selection) => +item.id)
                : null;

        // Store Channel
        const chosenStoreChannel = formValues['productSegmentation']['chosenStoreChannel'];
        const newStoreChannel =
            chosenStoreChannel && chosenStoreChannel.length
                ? chosenStoreChannel.map((item: Selection) => +item.id)
                : null;

        // Store Cluster
        const chosenStoreCluster = formValues['productSegmentation']['chosenStoreCluster'];
        const newStoreCluster =
            chosenStoreCluster && chosenStoreCluster.length
                ? chosenStoreCluster.map((item: Selection) => +item.id)
                : null;

        // Get Tax Id
        const taxId =
            this.taxes && !!this.taxes.length
                ? this.taxes.find((tax) => tax.amount === formValues.productSale.tax).id
                : null;

        /** Membuat sebuah Object dengan tipe Partial<Catalogue> untuk keperluan strict-typing. */
        const catalogueData: any = {
            // PRODUCT INFORMATION
            externalId: formValues.productInfo.externalId,
            name: formValues.productInfo.name,
            // name:
            //     String(formValues.productInfo.name).charAt(0).toUpperCase() +
            //     String(formValues.productInfo.name).slice(1),
            description: formValues.productInfo.description,
            information: formValues.productInfo.information,
            detail: formValues.productInfo.information,
            brandId: formValues.productInfo.brandId,
            firstCatalogueCategoryId: formValues.productInfo.category[0].id,
            lastCatalogueCategoryId:
                formValues.productInfo.category.length === 1
                    ? formValues.productInfo.category[0].id
                    : formValues.productInfo.category[formValues.productInfo.category.length - 1]
                          .id,
            stock: newStock,
            //TODO: remove uom from product info
            // unitOfMeasureId: formValues.productInfo.uom,

            // SALES INFORMATION
            discountedRetailBuyingPrice: formValues.productSale.retailPrice
                ? formValues.productSale.retailPrice
                : null,
            retailBuyingPrice: formValues.productSale.productPrice,
            catalogueKeywords: formValues.productSale.tags,

            // MEDIA SETTING
            catalogueImages: formValues.productMedia.photos
                .filter((photo) => photo)
                .map((photo) => ({ base64: photo.base64 })),

            // DELIVERY
            catalogueDimension: isNaN(Number(formValues.productShipment.catalogueDimension))
                ? null
                : Number(formValues.productShipment.catalogueDimension),
            catalogueWeight: isNaN(Number(formValues.productShipment.catalogueWeight))
                ? null
                : Number(formValues.productShipment.catalogueWeight),
            packagedDimension: isNaN(Number(formValues.productShipment.packagedDimension))
                ? null
                : Number(formValues.productShipment.packagedDimension),
            packagedWeight: isNaN(Number(formValues.productShipment.packagedWeight))
                ? null
                : Number(formValues.productShipment.packagedWeight),
            dangerItem: false,

            // PENGATURAN JUMLAH
            unitOfMeasureId: `${this.uomNames$.value.smallId}`,//string of integer
            largeUomId: formValues.productCount.isEnableLargeUnit? `${formValues.productCount.uomLargeUnit}`: null,//string of integer
            enableLargeUom: formValues.productCount.isEnableLargeUnit,//boolean
            packagedQty: `${formValues.productCount.consistOfQtyLargeUnit}`,//string of integer
            minQty: `${formValues.productCount.minQtyValue}`,//string of integer
            minQtyType: `pcs`,//string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
            multipleQty: `${formValues.productCount.amountIncrease}`,//string of integer
            multipleQtyType: `pcs`,//string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
            //`${this.uomNames$.value.smallName}`,//string of small uom name

            // VISIBILITY SETTING
            status: formValues['productVisibility']['status'],
            isBonus: formValues['productVisibility']['isBonus'],
            isExclusive: formValues['productVisibility']['isExclusive'],

            // SEGMENTATION SETTING
            segmentationWarehouseIds: newWarehouse,
            segmentationTypeIds: newStoreType,
            segmentationGroupIds: newStoreGroup,
            segmentationChannelIds: newStoreChannel,
            segmentationClusterIds: newStoreCluster,

            // OTHERS
            displayStock: newStock === 0 ? false : true,
            unlimitedStock: formValues.productInfo.unlimitedStock,

            // SUB BRAND
            subBrandId: formValues.productInfo.subBrandId || null,

            // MAXIMUM ORDER QTY
            isMaximum: !formValues.productCount.isMaximum,//boolean
            maxQty: !formValues.productCount.isMaximum ? formValues.productCount.maxQtyValue : null ,//maxQtyValue || null

            // CatalogueTaxId
            catalogueTaxId: taxId,
        };

        // if (this.formMode === 'edit') {
        //     /** Fungsi untuk mem-filter foto untuk keperluan update gambar. */
        //     const filterPhoto = (photo, idx) => {
        //         const check = photo !== oldPhotos[idx].value && (!oldPhotos[idx].id || photo);

        //         if (check) {
        //             if (!catalogueData.deletedImages) {
        //                 catalogueData.deletedImages = [];
        //             }

        //             if (!catalogueData.uploadedImages) {
        //                 catalogueData.uploadedImages = [];
        //             }

        //             if (oldPhotos[idx].id) {
        //                 catalogueData.deletedImages.push(oldPhotos[idx].id);
        //             }

        //             catalogueData.uploadedImages.push({ base64: photo });
        //         }

        //         return check;
        //     };

        //     catalogueData.catalogueImages = formValues.productMedia.photos.filter(filterPhoto);
        // }

        if (this.formMode !== 'edit') {
            /* HelperService.debug('[CataloguesFormComponent - Add] onSubmit', {
                payload: catalogueData,
            }); */
            this.store.dispatch(
                CatalogueActions.addNewCatalogueRequest({ payload: catalogueData })
            );
        }

        // else {
        //     console.log('EDIT SUBMIT', { payload: catalogueData, id: formValues.productInfo.id });
        //     /* this.store.dispatch(
        //         CatalogueActions.patchCatalogueRequest({
        //             payload: { id: formValues.productInfo.id, data: catalogueData, source: 'form' },
        //         })
        //     ); */
        // }

        this.store.dispatch(FormActions.resetClickSaveButton());
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

                    return this.catalogueSvc.findAll(params).pipe(
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

    ngOnInit(): void {
        if (this.route.snapshot.url.filter((url) => url.path === 'edit').length > 0) {
            this.breadcrumbs.push({
                title: 'Edit Product',
                translate: 'BREADCRUMBS.EDIT_PRODUCT',
                active: true,
            });
        } else {
            this.breadcrumbs.push({
                title: 'Add New Product',
                translate: 'BREADCRUMBS.ADD_PRODUCT',
                active: true,
            });
        }

        this.catalogueFacade.createBreadcrumb(this.breadcrumbs);
        this.catalogueFacade.setFooterConfig(this.footerConfig);

        this.isLoading$ = combineLatest([
            this.catalogueFacade.isLoading$,
            this.brandFacade.isLoading$,
        ]).pipe(
            map(([catalogueLoading, brandLoading]) => {
                if (catalogueLoading && !brandLoading) {
                    return true;
                } else {
                    return false;
                }
            })
        );

        /** Mulai mengambil data kategori katalog. */
        this.store
            .select(CatalogueSelectors.getCatalogueCategories)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((categories) => {
                /** Minta kategori katalog ke back-end jika belum ada. */
                if (categories.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoriesRequest({
                            payload: {
                                paginate: false,
                            },
                        })
                    );
                }
            });

        // Get tax list
        this.catalogueTaxFacade.catalogueTaxes$
            .pipe(
                tap((taxes) => {
                    if (!taxes || !taxes.length) {
                        this.catalogueTaxFacade.fetchCatalogueTaxes();
                    }
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe((taxes) => {
                this.taxes = taxes;
            });

        /** Menyiapkan form. */
        this._initForm();

        /** Menyiapkan form untuk varian. */
        this.variantForm = this.fb.group({
            variants: this.fb.array([]),
        });

        /** Menyiapkan beberapa variabel untuk mengambil beberapa control dari induk form. */
        this.productPhotos = this.form.get('productMedia.photos') as FormArray;
        this.productOldPhotos = this.form.get('productMedia.oldPhotos') as FormArray;
        this.productTagsControls = this.form.get('productSale.tags') as FormArray;
        this.productCourierControls = (
            this.form.get('productShipment.couriers') as FormArray
        ).controls;
        this.productVariantControls = (this.form.get('productSale.variants') as FormArray).controls;
        this.productVariantFormControls = (this.variantForm.get('variants') as FormArray).controls;

        /** Melakukan subscribe ke pengambilan data brand dari state. */
        combineLatest([
            this.store.select(BrandSelectors.getAllBrands),
            this.store.select(CatalogueSelectors.getSelectedCategories),
        ])
            .pipe(
                /** Sambil mengambil dari beberapa Subscription. */
                withLatestFrom(
                    this.store.select(AuthSelectors.getUserSupplier),
                    this.store.select(CatalogueSelectors.getProductName),
                    ([brands, categories], userSupplier, productName) => [
                        brands,
                        categories,
                        userSupplier,
                        productName,
                    ]
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
                                        errors: 'Not Authenticated',
                                    },
                                })
                            );
                        }

                        return of([brands, categories, userSupplier, productName]);
                    }
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe(
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
                    /** Memasukkan nama produk ke dalam form jika bukan edit mode (nama form yang berasal dari halaman Add Product) */
                    // if (!this.isEditMode) {
                    //     this.form.get('productInfo.name').patchValue(productName);
                    // }

                    if (this.isAddMode()) {
                        this.form.get('productInfo.name').setValue(productName);
                    }

                    /** Kategori produk yang ingin ditampilkan di front-end. */
                    this.productCategory$ = this.sanitizer.bypassSecurityTrustHtml(
                        categories.map((category) => category['name']).join(`
                    <span class="mx-12">
                        >
                    </span>
                `)
                    );

                    this.updateSelectedCategories(categories);
                    this._cd.markForCheck();
                }
            );

        /** Melakukan merge Subscription untuk mendeteksi valid atau tidaknya form katalog. */
        merge(
            this.form.get('productInfo').valueChanges,
            this.form.get('productSale').valueChanges,
            this.form.get('productMedia').valueChanges,
            this.form.get('productShipment').valueChanges,
            this.form.statusChanges
        )
            .pipe(distinctUntilChanged(), debounceTime(500), takeUntil(this.unSubs$))
            .subscribe(() => {
                if (this.form.status === 'VALID') {
                    this.store.dispatch(FormActions.setFormStatusValid());
                } else {
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                }

                /** Melakukan update render pada front-end. */
                this._cd.markForCheck();
            });

        /** Melakukan subscribe ke perubahan nilai opsi Minimum Quantity Order. */
        // this.form
        //     .get('productCount.minQtyOption')
        //     .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
        //     .subscribe((value) => {
        //         /** Mengambil nilai pada input Minimum Order Quantity. */
        //         const minQtyValueController = this.form.get('productCount.minQtyValue');
        //         /** Mengambil nilai Quantity per Master Box. */
        //         const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

        //         /** Mengubah perilaku Form Control sesuai dengan opsi Minimum Order Quantity. */
        //         switch (value) {
        //             case 'master_box':
        //                 minQtyValueController.disable();
        //                 minQtyValueController.patchValue(qtyPerMasterBox ? qtyPerMasterBox : 1);
        //                 break;
        //             case 'custom':
        //                 minQtyValueController.enable();
        //                 // minQtyValueController.patchValue(1);
        //                 break;
        //             case 'pcs':
        //             default:
        //                 minQtyValueController.disable();
        //                 minQtyValueController.patchValue(1);
        //                 break;
        //         }
        //     });

        /** Melakukan subscribe ke perubahan nilai opsi Additional Quantity. */
        // this.form
        //     .get('productCount.additionalQtyOption')
        //     .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
        //     .subscribe((value) => {
        //         /** Mengambil nilai pada input Additional Quantity. */
        //         const additionalQtyValueController = this.form.get(
        //             'productCount.additionalQtyValue'
        //         );
        //         /** Mengambil nilai Quantity per Master Box. */
        //         const qtyPerMasterBox = this.form.get('productCount.qtyPerMasterBox').value;

        //         /** Mengubah perilaku Form Control sesuai dengan opsi Minimum Order Quantity. */
        //         switch (value) {
        //             case 'master_box':
        //                 additionalQtyValueController.disable();
        //                 additionalQtyValueController.patchValue(
        //                     qtyPerMasterBox ? qtyPerMasterBox : 1
        //                 );
        //                 break;
        //             case 'custom':
        //                 additionalQtyValueController.enable();
        //                 // minQtyValueController.patchValue(1);
        //                 break;
        //             case 'pcs':
        //             default:
        //                 additionalQtyValueController.disable();
        //                 additionalQtyValueController.patchValue(1);
        //                 break;
        //         }
        //     });

        /** Melakukan subscribe ke perubahan nilai input Quantity per Master Box. */
        // this.form
        //     .get('productCount.qtyPerMasterBox')
        //     .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
        //     .subscribe((value) => {
        //         /** Mengambil Form Control-nya option dan input Minimum Quantity Order. */
        //         const minQtyOption = this.form.get('productCount.minQtyOption');
        //         const minQtyValue = this.form.get('productCount.minQtyValue');
        //         /** Mengambil Form Control-nya option dan input Additional Quantity. */
        //         const additionalQtyOption = this.form.get('productCount.additionalQtyOption');
        //         const additionalQtyValue = this.form.get('productCount.additionalQtyValue');

        //         /** Menetapkan nilai input Minimum Quantity Order sesuai dengan nilai Quantity per Master Box jika opsinya adalah Master Box. */
        //         if (minQtyOption.value === 'master_box') {
        //             minQtyValue.setValue(value);
        //         }

        //         /** Menetapkan nilai input Additional Quantity sesuai dengan nilai Quantity per Master Box jika opsinya adalah Master Box. */
        //         if (additionalQtyOption.value === 'master_box') {
        //             additionalQtyValue.setValue(value);
        //         }
        //     });

        // Re-validate maximum order quantity field based on changes in minimum order quantity
        this.form
            .get('productCount.minQtyValue')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
            .subscribe((value) => {
                const isMaximum = this.form.get('productCount.isMaximum').value;

                /* HelperService.debug(
                    '[CataloguesFormComponent] productCount.minQtyValue valueChanges',
                    {
                        value,
                        minQtyOption: this.form.get('productCount.minQtyOption').value,
                        isMaximum,
                        maxQtyValueForm: this.form.get('productCount.maxQtyValue'),
                    }
                ); */

                if (isMaximum) {
                    this.form.get('productCount.maxQtyValue').reset();
                    this.form.get('productCount.maxQtyValue').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.greaterThanEqualTo({
                            fieldName: 'productCount.minQtyValue',
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'gte_number',
                                {
                                    limitValue: value,
                                }
                            ),
                        }),
                    ]);

                    this.form
                        .get('productCount.maxQtyValue')
                        .updateValueAndValidity({ onlySelf: true });
                }
            });

        /** Melakukan subscribe ketika ada aksi menekan tombol "Simpan" pada form. */
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(
                filter((isClick) => isClick),
                takeUntil(this.unSubs$)
            )
            .subscribe((isClick) => {
                /** Jika menekannya, maka submit data form-nya. */
                if (isClick) {
                    this.onSubmit();
                }
            });

        /** Melakukan subscribe ketika ada perubahan data daftar brand. */
        this.brands$ = this.store.select(BrandSelectors.getAllBrands).pipe(takeUntil(this.unSubs$));

        this.form.get('productInfo.information').setValue('---');
        setTimeout(() => this.form.get('productInfo.information').setValue(''), 100);

        if (!this.isViewMode()) {
            this.form.get('productInfo.unlimitedStock').enable();
        } else {
            this.form.get('productInfo.unlimitedStock').disable();
        }

        this.store
            .select(CatalogueSelectors.getCatalogueUnits)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((units) => {
                if (units.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueUnitRequest({
                            payload: {
                                paginate: false,
                                sort: 'asc',
                                sortBy: 'id',
                            },
                        })
                    );
                }

                // const uom = this.form.get('productInfo.uom').value;
                // const selectedUnit = units.filter((unit) => unit.id === uom);
                // if (selectedUnit.length > 0) {
                //     this.form.patchValue({
                //         productInfo: {
                //             uomName: selectedUnit[0].unit,
                //         },
                //     });
                // }

                this.form.get('productCount.uomSmallUnit')!.valueChanges.subscribe((change) => {
                    const selectedUnit = units.filter((unit) => unit.id === change);
                    this.uomNames$.next({
                        smallName: selectedUnit[0].unit,
                        smallId: selectedUnit[0].id,
                        largeName: this.uomNames$.value.largeName,
                        largeId: this.uomNames$.value.largeId,
                    });
                    this.form.get('productCount.uomSmallUnit').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                        }),
                        RxwebValidators.different({
                            fieldName: 'productCount.uomLargeUnit',
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'uom_large_unit',
                                'different',
                                {
                                    fieldComparedName: 'uom_small_unit'
                                }
                            )
                        })
                    ])
                    this.form.get('productCount.uomSmallUnit').updateValueAndValidity({ onlySelf: true });
                });

                this.form.get('productCount.uomLargeUnit')!.valueChanges.subscribe((change) => {
                    const selectedUnit = units.filter((unit) => unit.id === change);
                    this.uomNames$.next({
                        largeName: selectedUnit[0].unit,
                        largeId: selectedUnit[0].id,
                        smallName: this.uomNames$.value.smallName,
                        smallId: this.uomNames$.value.smallId,
                    });
                    this.form.get('productCount.uomLargeUnit').setValidators([
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                        }),
                        RxwebValidators.different({
                            fieldName: 'productCount.uomSmallUnit',
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'uom_small_unit',
                                'different',
                                {
                                    fieldComparedName: 'uom_large_unit'
                                }
                            )
                        })
                        
                    ])
                    this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });
                    
                });

                this.catalogueUnits = units;
                this.catalogueSmallUnits = units;
                this.catalogueLargeUnits = units;

                this._cd.markForCheck();
            });

        if (!this.isViewMode()) {
            this.store.dispatch(UiActions.showFooterAction());
        }

        this.form
            .get('productInfo.unlimitedStock')
            .valueChanges.pipe(
                tap((value: boolean) => {
                    this.form.get('productInfo.stock').setValue(0);

                    if (value) {
                        this.form.get('productInfo.stock').disable();
                    } else {
                        this.form.get('productInfo.stock').enable();
                    }
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe();

        /** Mendaftarkan toolbox pada Quill Editor yang diperlukan saja */
        this.registerQuillFormatting();

        this._checkRoute();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this.unSubs$.next();
        this.unSubs$.complete();
        this.uomNames$.next({
            largeName: '',
            largeId: '',
            smallName: '',
            smallId: '',
        });
        this.uomNames$.complete();

        this.store.dispatch(CatalogueActions.resetSelectedCatalogue());
        this.store.dispatch(CatalogueActions.resetSelectedCategories());
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(FormActions.resetFormStatus());
    }

    ngAfterViewInit(): void {
        this.requestBrands();
        this._cd.markForCheck();
    }

    private requestBrands(): void {
        const params: IQueryParams = {
            paginate: false,
        };

        return this.store.dispatch(
            BrandActions.fetchBrandsRequest({
                payload: params,
            })
        );
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

    private _prepareEditCatalogue(): void {
        combineLatest([
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(CatalogueSelectors.getCatalogueCategories),
            this.store.select(CatalogueSelectors.getCatalogueUnits),
            this.store.select(AuthSelectors.getUserSupplier),
        ])
            .pipe(takeUntil(this.unSubs$))
            .subscribe(([catalogue, categories, units, userSupplier]) => {
                /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                const { id } = this.route.snapshot.params;

                /** Butuh fetch kategori katalog jika belum ada di state. */
                if (categories.length === 0) {
                    return this.store.dispatch(
                        CatalogueActions.fetchCatalogueCategoriesRequest({
                            payload: { paginate: false },
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
                                sortBy: 'id',
                            },
                        })
                    );
                }

                /** Butuh mengambil data katalog jika belum ada di state. */
                if (!catalogue) {
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
                }

                /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                    this.store.dispatch(
                        CatalogueActions.spliceCatalogue({
                            payload: id,
                        })
                    );

                    this._$notice.open('Produk tidak ditemukan.', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });

                    return setTimeout(
                        () => this.router.navigate(['pages', 'catalogues', 'list']),
                        1000
                    );
                }

                /** Proses pencarian kategori katalog dari daftar katalog yang ada di server. */
                const searchCategory = (
                    catalogueId,
                    selectedCategories: Array<CatalogueCategory>
                ) => {
                    const selectedCategory = selectedCategories.filter(
                        (category) => category.id === catalogueId
                    );

                    return {
                        id: selectedCategory[0].id,
                        name: selectedCategory[0].category,
                        parent: selectedCategory[0].parentId ? selectedCategory[0].parentId : null,
                        children: selectedCategory[0].children,
                    };
                };

                /** Mengambil data keyword katalog. */
                const keywords = catalogue.catalogueKeywordCatalogues.map(
                    (keyword) => keyword.catalogueKeyword.tag
                );
                (this.form.get('productSale.tags') as FormArray).clear();
                for (const keyword of keywords) {
                    (this.form.get('productSale.tags') as FormArray).push(this.fb.control(keyword));
                }

                /** Memberi nilai sementara sebelum dimasukkan nilai aslinya ke Quill Editor. */
                this.form.patchValue({
                    productInfo: {
                        information: '...',
                    },
                });

                /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                setTimeout(() => {
                    this.form.patchValue({
                        productInfo: {
                            id: catalogue.id,
                            externalId: catalogue.externalId,
                            name: catalogue.name,
                            description: catalogue.description || '-',
                            // information: catalogue.detail || '-',
                            // variant: ['', Validators.required],
                            brandId: catalogue.brandId,
                            brandName: catalogue.brand.name,
                            // category: ['', Validators.required],
                            stock: catalogue.stock,
                            // uom: catalogue.unitOfMeasureId ? catalogue.unitOfMeasureId : '',
                            minQty: catalogue.minQty,
                            packagedQty: catalogue.packagedQty,
                            multipleQty: catalogue.multipleQty,
                            unlimitedStock: catalogue.unlimitedStock,
                        },
                        productSale: {
                            retailPrice: this.isViewMode()
                                ? catalogue.discountedRetailBuyingPrice
                                : String(catalogue.discountedRetailBuyingPrice).replace('.', ','),
                            productPrice: this.isViewMode()
                                ? catalogue.retailBuyingPrice
                                : String(catalogue.retailBuyingPrice).replace('.', ','),
                            // variants: this.fb.array([])
                        },
                        productMedia: {
                            photos: [...catalogue.catalogueImages.map((image) => image.imageUrl)],
                            oldPhotos: [
                                ...catalogue.catalogueImages.map((image) => image.imageUrl),
                            ],
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
                            //TODO: Penyesuaian saat integrasi
                            qtyPerMasterBox: catalogue.packagedQty,
                            minQtyOption: catalogue.minQtyType,
                            minQtyValue: catalogue.minQty,
                            additionalQtyOption: catalogue.multipleQtyType,
                            additionalQtyValue: catalogue.multipleQty,
                        },
                    });

                    // const uom = this.form.get('productInfo.uom').value;
                    // const selectedUnit = units.filter((unit) => unit.id === uom);
                    // if (selectedUnit.length > 0) {
                    //     this.form.patchValue({
                    //         productInfo: {
                    //             uomName: selectedUnit[0].unit,
                    //         },
                    //     });
                    // }
                });

                if (this.isViewMode()) {
                    this.form.get('productInfo.unlimitedStock').disable();
                } else {
                    this.form.get('productInfo.unlimitedStock').enable();
                }

                if (catalogue.unlimitedStock) {
                    this.form.get('productInfo.stock').disable();
                } else {
                    this.form.get('productInfo.stock').enable();
                }

                setTimeout(() => {
                    this.form.get('productInfo.information').setValue('');
                    this._cd.markForCheck();
                }, 100);
                setTimeout(() => {
                    this.form.get('productInfo.information').setValue(catalogue.detail);
                    this._cd.markForCheck();
                }, 150);

                /** Hanya opsi 'custom' yang diperbolehkan mengisi input pada Minimum Quantity Order. */
                if (catalogue.minQtyType !== 'custom') {
                    this.form.get('productCount.minQtyValue').disable();
                } else {
                    this.form.get('productCount.minQtyValue').enable();
                }

                /** Hanya opsi 'custom' yang diperbolehkan mengisi input pada Additional Quantity. */
                if (catalogue.multipleQtyType !== 'custom') {
                    this.form.get('productCount.additionalQtyValue').disable();
                } else {
                    this.form.get('productCount.additionalQtyValue').enable();
                }

                /** Menampilkan foto produk pada form beserta menyimpannya di form invisible untuk sewaktu-waktu ingin undo penghapusan foto. */
                for (const [idx, image] of catalogue.catalogueImages.entries()) {
                    this.productPhotos.controls[idx].setValue(image.imageUrl);
                    this.productOldPhotos.controls[idx].get('id').setValue(image.id);
                    this.productOldPhotos.controls[idx].get('value').setValue(image.imageUrl);
                }

                if (
                    isNaN(catalogue.lastCatalogueCategoryId) ||
                    !catalogue.lastCatalogueCategoryId
                ) {
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

    onAddVariant(): void {
        const $index = this.productVariantControls.push(this.fb.array([this.fb.control('')]));

        this.productVariantFormControls.push(
            this.fb.group({
                price: '',
                stock: '',
                sku: '',
            })
        );

        this.productVariantSelectionData.push(
            new MatTableDataSource((this.productVariantControls[$index - 1] as FormArray).controls)
        );
        // console.log(this.productVariants);
        // console.log(this.form.get('productSale.variants'));
        // console.log(this.productVariantSelections);
    }

    onFileBrowse($event: Event, index: number): void {
        const inputEl = $event.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0] as File;

            const photo = (this.form.get('productMedia.photos') as FormArray).controls[index];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                file['base64'] = fileReader.result;
                photo.patchValue(file);
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
        (this.form.get('productMedia.photos') as FormArray).controls[index].patchValue(
            originalImage
        );

        this._cd.markForCheck();
    }

    onAddVariantSelection(_: Event, $variant: number): void {
        (this.productVariantControls[$variant] as FormArray).push(this.fb.control(''));

        /* HelperService.debug('[CataloguesFormComponent] onAddVariantSelection', {
            ev: _,
            varian: $variant,
            variantControl: (this.productVariantControls[$variant] as FormArray).controls,
        }); */

        this.productVariantSelectionData[$variant] = new MatTableDataSource(
            (this.productVariantControls[$variant] as FormArray).controls
        );

        /* HelperService.debug('[CataloguesFormComponent] onAddVariantSelection', {
            variantSelection: this.productVariantSelectionData[$variant],
        }); */
    }

    onRemoveVariantSelection(_: Event, $variant: number, $index: number): void {
        (this.productVariantControls[$variant] as FormArray).removeAt($index);
        if ((this.productVariantControls[$variant] as FormArray).controls.length === 0) {
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

    getCatalogueImage(): string {
        return this.form.get(['productMedia', 'oldPhotos', '0', 'value'])
            ? this.form.get(['productMedia', 'oldPhotos', '0', 'value']).value
            : 'assets/images/logos/sinbad.svg';
    }

    updateFormView(): void {
        this.formClass = {
            'custom-field': !this.isViewMode(),
            'view-field-right': this.isViewMode(),
        };

        this.catalogueContent = {
            'mt-16': this.isViewMode(),
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode(),
        };
    }

    onChangeBrand(ev: MatSelectChange): void {
        /* HelperService.debug('[CataloguesFormComponent - Add] onChangeBrand', {
            ev,
        }); */

        if (ev.value) {
            this._getSubBrandByBrandId(ev.value);
        }
    }

    onChangeTax(ev: MatRadioChange): void {
        HelperService.debug('[CataloguesFormComponent - Add] onChangeTax', {
            ev,
        });

        if (ev.value) {
        }
    }

    onStoreChannelSelected(ev: StoreSegmentationChannel[]): void {
        const chosenStoreChannelCtrl = this.form.get('productSegmentation.chosenStoreChannel');

        chosenStoreChannelCtrl.markAsDirty();
        chosenStoreChannelCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreChannelCtrl.setValue(null);
        } else {
            const newStoreChannels: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-channels',
            }));

            chosenStoreChannelCtrl.setValue(newStoreChannels);
        }
    }

    onStoreClusterSelected(ev: StoreSegmentationCluster[]): void {
        const chosenStoreClusterCtrl = this.form.get('productSegmentation.chosenStoreCluster');

        chosenStoreClusterCtrl.markAsDirty();
        chosenStoreClusterCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreClusterCtrl.setValue(null);
        } else {
            const newStoreClusters: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-clusters',
            }));

            chosenStoreClusterCtrl.setValue(newStoreClusters);
        }
    }

    onStoreGroupSelected(ev: StoreSegmentationGroup[]): void {
        const chosenStoreGroupCtrl = this.form.get('productSegmentation.chosenStoreGroup');

        chosenStoreGroupCtrl.markAsDirty();
        chosenStoreGroupCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreGroupCtrl.setValue(null);
        } else {
            const newStoreGroups: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-groups',
            }));

            chosenStoreGroupCtrl.setValue(newStoreGroups);
        }
    }

    onStoreTypeSelected(ev: StoreSegmentationType[]): void {
        const chosenStoreTypeCtrl = this.form.get('productSegmentation.chosenStoreType');

        chosenStoreTypeCtrl.markAsDirty();
        chosenStoreTypeCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreTypeCtrl.setValue(null);
        } else {
            const newStoreTypes: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'store-segmentation-types',
            }));

            chosenStoreTypeCtrl.setValue(newStoreTypes);
        }
    }

    onWarehouseSelected(ev: Warehouse[]): void {
        const chosenWarehouseCtrl = this.form.get('productSegmentation.chosenWarehouse');

        chosenWarehouseCtrl.markAsDirty();
        chosenWarehouseCtrl.markAsTouched();

        if (!ev.length) {
            chosenWarehouseCtrl.setValue(null);
        } else {
            const newWarehouses: Selection[] = ev.map((item) => ({
                id: item.id,
                label: item.name,
                group: 'warehouses',
            }));

            chosenWarehouseCtrl.setValue(newWarehouses);
        }
    }

    private _checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe((urls) => {
            if (urls.filter((url) => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this._prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this._prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this.updateFormView();
        });
    }

    private _initForm(): void {
        this.form = this.fb.group({
            // PRODUCT INFORMATION
            productInfo: this.fb.group({
                id: null,
                externalId: [
                    null,
                    {
                        validators: [
                            RxwebValidators.required({
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                        ],
                        asyncValidators: [this.checkExternalId()],
                    },
                ],
                name: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                description: null,
                information: null,
                // variant: ['', Validators.required],
                brandId: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                brandName: [
                    { value: '', disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                subBrandId: [{ value: null, disabled: true }],
                subBrandName: [{ value: null, disabled: true }],
                category: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                stock: null,
                unlimitedStock: [{ value: false, disabled: true }],
                // uom: [
                //     null,
                //     [
                //         RxwebValidators.required({
                //             message: this.errorMessageSvc.getErrorMessageNonState(
                //                 'default',
                //                 'required'
                //             ),
                //         }),
                //     ],
                // ],
                // uomName: null,
                // minQty: ['', [Validators.required, Validators.min(1)]],
                // packagedQty: ['', [Validators.required, Validators.min(1)]],
                // multipleQty: ['', [Validators.required, Validators.min(1)]]
            }),

            // SALES INFORMATION
            productSale: this.fb.group({
                tax: [
                    0,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                retailPrice: null,
                productPrice: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
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
                                (controls.tags as string[]).length > 0 ? true : null,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'product_tag',
                                'min_1_tag'
                            ),
                        }),
                    ]
                ),
                variants: this.fb.array([]),
            }),

            // MEDIA SETTING
            productMedia: this.fb.group({
                photos: this.fb.array([
                    this.fb.control(null, [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'main_product_photo',
                                'min_1_photo'
                            ),
                        }),
                        this.fileSizeValidator('main_product_photo', 1 * 1048576),
                    ]),
                    this.fb.control(null, [this.fileSizeValidator('product_photo_1', 1 * 1048576)]),
                    this.fb.control(null, [this.fileSizeValidator('product_photo_2', 1 * 1048576)]),
                    this.fb.control(null, [this.fileSizeValidator('product_photo_3', 1 * 1048576)]),
                    this.fb.control(null, [this.fileSizeValidator('product_photo_4', 1 * 1048576)]),
                    this.fb.control(null, [this.fileSizeValidator('product_photo_5', 1 * 1048576)]),
                ]),
                tmpPhotos: this.fb.array([
                    this.fb.group({ id: [null], value: [null] }, { validators: [] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                ]),
                oldPhotos: this.fb.array([
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                    this.fb.group({ id: [null], value: [null] }),
                ]),
            }),

            // DELIVERY
            productShipment: this.fb.group({
                catalogueWeight: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                packagedWeight: [
                    null,
                    [
                        // RxwebValidators.required({
                        //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                        // }),
                        // RxwebValidators.minNumber({
                        //     value: 1,
                        //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                        // })
                    ],
                ],
                catalogueDimension: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                packagedDimension: [
                    null,
                    [
                        // RxwebValidators.required({
                        //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'required')
                        // }),
                        // RxwebValidators.minNumber({
                        //     value: 1,
                        //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'min_number', { minValue: 1 })
                        // })
                    ],
                ],
                // isDangerous: null,
                couriers: this.fb.array([
                    this.fb.control({
                        name: 'SiCepat REG (maks 5000g)',
                        disabled: this.fb.control(false),
                    }),
                    this.fb.control({
                        name: 'JNE REG (maks 5000g)',
                        disabled: this.fb.control(false),
                    }),
                    this.fb.control({
                        name: 'SiCepat Cargo (maks 5000g)',
                        disabled: this.fb.control(false),
                    }),
                ]),
            }),

            // AMOUNT SETTING
            productCount: this.fb.group({
                minQtyValue: [
                    { value: 1, disabled: false },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                isMaximum: true,
                uomSmallUnit: [
                    '',
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                amountIncrease: [
                    { value: '', disabled: false },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
                isEnableLargeUnit: false,
                uomLargeUnit: [
                    { value: '', disabled: true },
                ],
                consistOfQtyLargeUnit: [
                    { value: 0, disabled: true },
                ],
                maxQtyValue: [
                    { value: '', disabled: true },
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                        RxwebValidators.minNumber({
                            value: 1,
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'min_number',
                                { minValue: 1 }
                            ),
                        }),
                    ],
                ],
            }),

            // VISIBILITY
            productVisibility: this.fb.group({
                status: 'active',
                isBonus: false,
                isExclusive: false,
            }),

            // SEGMENTATION SETTING
            productSegmentation: this.fb.group({
                chosenWarehouse: [
                    null,
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
                chosenStoreType: null,
                chosenStoreGroup: null,
                chosenStoreChannel: null,
                chosenStoreCluster: null,
            }),
        });
    }

    private _initFormCheck(): void {}

    private _getSubBrandByBrandId(brandId: string): void {
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
}
