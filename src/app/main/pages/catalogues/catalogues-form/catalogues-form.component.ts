import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    Inject,
    LOCALE_ID,
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
    ConditionBulkDto,
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
import { CatalogueTax } from '../models/classes/catalogue-tax.class';
import { SubBrand } from '../models/sub-brand.model';
import { assetUrl } from 'single-spa/asset-url';
import {
    CalculateAfterTaxPipe,
    CalculateBeforeTaxPipe,
    CalculateTaxBulkPipe,
    FormatPricePipe,
} from '../pipes';
import { Console } from 'console';
import { split } from 'lodash';
import { SinbadAutocompleteSource } from 'app/shared/components/sinbad-autocomplete/models';

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
                label: 'Next',
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
    formBulkPrice: FormArray;
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

    bulkPrice = null;
    statusAddBulkFirst: boolean = false;
    bulkPriceSettingStatus: string = null;
    statusFormBulk: boolean = false;
    statusDeleteCondition: boolean = false;

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
        private _$notice: NoticeService,
        @Inject(LOCALE_ID) public locale: string,
        private calculateAfterTaxPipe: CalculateAfterTaxPipe,
        private calculateBeforeTaxPipe: CalculateBeforeTaxPipe,
        private calculateTaxBulkTaxPipe: CalculateTaxBulkPipe,
        private formatPricePipe: FormatPricePipe
    ) {
        this.quantityChoices = this.$helper.getQuantityChoices();

        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.store.dispatch(CatalogueActions.fetchPricingSettingsRequest());

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
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                        fieldComparedName: 'Maximum Order Quantity / Consist Of',
                    }),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.consistOfQtyLargeUnit',
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                        fieldComparedName: 'Maximum Order Quantity / Consist Of',
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

    onChangeMinOrderQty(val: string) {
        const minQty = val ? parseInt(val.split('.').join('')) : 0;
        const maxQty = this.form.get('productCount.maxQtyValue').value;

        if (minQty > maxQty && !this.form.get('productCount.isMaximum').value) {
            this.form.get('productCount.maxQtyValue').reset();
            this.form.get('productCount.maxQtyValue').setValidators([
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.minQtyValue',
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                        fieldComparedName: 'Maximum Order Quantity / Consist Of',
                    }),
                }),
                RxwebValidators.greaterThanEqualTo({
                    fieldName: 'productCount.consistOfQtyLargeUnit',
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                        fieldComparedName: 'Maximum Order Quantity / Consist Of',
                    }),
                }),
            ]);

            this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.get('productCount.maxQtyValue').markAsDirty({ onlySelf: false });
            this.form.get('productCount.maxQtyValue').markAllAsTouched();
            this.form.get('productCount.maxQtyValue').markAsPristine();
        } else {
            this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });

            /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
            this.form.get('productCount.maxQtyValue').markAsDirty({ onlySelf: false });
            this.form.get('productCount.maxQtyValue').markAllAsTouched();
            this.form.get('productCount.maxQtyValue').markAsPristine();
        }

        //jika min order qty > bulk price min Qty level 1 maka minQty level 1 error
        if (this.bulkPriceSettingStatus === 'bulk_pricing') {
            if (this.form.get('bulkPrices').value.length > 0) {
                if (document.getElementById(`bulkPrice.minQty.${0}`)) {
                    if (minQty > this.form.get('bulkPrices').value[0].minQty) {
                        this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'error', 348);
                        this._checkConditionsBulkPrices(
                            this.form.get('bulkPrices'),
                            'product',
                            'minQty'
                        );
                        this.comparedata(this.form.get('bulkPrices').value);
                        this.statusFormBulk = true;
                    }
                }
            }
        }
    }

    onChangeIsEnableLargeUnit(ev: MatCheckboxChange): void {
        //UOM Large Unit
        this.form.get('productCount.uomLargeUnit').reset();
        this.form.get('productCount.consistOfQtyLargeUnit').reset();

        if (ev.checked) {
            //UOM Large Unit

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
            // this.form.get('productCount.uomLargeUnit').clearValidators();
            // this.form.get('productCount.uomLargeUnit').updateValueAndValidity({ onlySelf: true });
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
                    consistOfQtyLargeUnit: 0,
                    uomLargeUnit: null,
                },
            });
        }
    }

    onChangeConsistOf(val: string) {
        let consistOf = val ? parseInt(val.split('.').join('')) : 0;
        if (consistOf > this.form.get('productCount.maxQtyValue').value) {
            this.form.get('productCount.maxQtyValue').reset();
        }
        this.form.get('productCount.maxQtyValue').setValidators([
            RxwebValidators.required({
                message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
            }),
            RxwebValidators.greaterThanEqualTo({
                fieldName: 'productCount.minQtyValue',
                message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                    fieldComparedName: 'Maximum Order Quantity / Consist Of',
                }),
            }),
            RxwebValidators.greaterThanEqualTo({
                fieldName: 'productCount.consistOfQtyLargeUnit',
                message: this.errorMessageSvc.getErrorMessageNonState('default', 'gte_field', {
                    fieldComparedName: 'Maximum Order Quantity / Consist Of',
                }),
            }),
        ]);

        this.form.get('productCount.maxQtyValue').updateValueAndValidity({ onlySelf: true });

        /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
        this.form.get('productCount.maxQtyValue').markAsDirty({ onlySelf: false });
        this.form.get('productCount.maxQtyValue').markAllAsTouched();
        this.form.get('productCount.maxQtyValue').markAsPristine();
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
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

        // SALES INFORMATION BULK PRICING
        const newBulkpricing = formValues['bulkPrices'];
        if (newBulkpricing.length > 0) {
            for (var i = 0; i < newBulkpricing.length; i++) {
                newBulkpricing[i].level = i + 1;
                newBulkpricing[i].minQty = parseInt(newBulkpricing[i].minQty);
                newBulkpricing[i].price = parseInt(newBulkpricing[i].price);
                delete newBulkpricing[i].priceAfterTax;
            }
        }

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
            discountedRetailBuyingPrice:
                String(formValues.productSale.retailPrice).length > 0 &&
                String(formValues.productSale.retailPrice) !== 'null'
                    ? formValues.productSale.retailPrice
                    : null,
            retailBuyingPrice: formValues.productSale.productPrice
                .replace('.', '')
                .replace(',', '.'),
            catalogueKeywords: formValues.productSale.tags,

            //bulk pricing
            bulkPrices: newBulkpricing,

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
            unitOfMeasureId: `${this.uomNames$.value.smallId}`, //string of integer
            largeUomId: formValues.productCount.isEnableLargeUnit
                ? `${formValues.productCount.uomLargeUnit}`
                : null, //string of integer
            enableLargeUom: formValues.productCount.isEnableLargeUnit, //boolean
            packagedQty: `${formValues.productCount.consistOfQtyLargeUnit}`, //string of integer
            minQty: `${formValues.productCount.minQtyValue}`, //string of integer
            minQtyType: `pcs`, //string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
            multipleQty: `${formValues.productCount.amountIncrease}`, //string of integer
            multipleQtyType: `pcs`, //string of small uom name (master_box,custom,pcs)//sementara hardcode pcs
            //`${this.uomNames$.value.smallName}`,//string of small uom name

            // VISIBILITY SETTING
            status: formValues['productVisibility']['status'],
            platformVisibility: formValues['productVisibility']['platformVisibility'],
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
            isMaximum: !formValues.productCount.isMaximum, //boolean
            maxQty: !formValues.productCount.isMaximum ? formValues.productCount.maxQtyValue : null, //maxQtyValue || null

            // CatalogueTaxId
            catalogueTaxId: taxId,
            pricingInputWithTaxFlag:
                formValues.productSale.typePricing === 'exclude' ? false : true,
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

    onSelectedBrand(value: SinbadAutocompleteSource): void {
        if (value && value.id) {
            this.form.get('productInfo.brandId').setValue(value.id);
            this._getSubBrandByBrandId(value.id);
        } else {
            this.form.get('productInfo.brandId').setValue(value);
        }
    }

    onClickBrandField(): void {
        this.form.get('productInfo.brandId').markAsTouched()
        
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

        //data bulk price setting
        this.store
            .select(CatalogueSelectors.getCataloguePriceBulkSettings)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((payload) => {
                this.bulkPriceSettingStatus = payload.code;
                if (payload.code !== 'group_pricing') {
                    this.footerConfig.action.save.label = 'Save';
                    this.catalogueFacade.setFooterConfig(this.footerConfig);
                }
            });

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

        this.statusAddBulkFirst = false;
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
        this.formBulkPrice = this.form.get('bulkPricing') as FormArray;
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
            this.form
                .get('productInfo')
                .valueChanges.pipe(
                    tap((v) =>
                        HelperService.debug('[CATALOGUE ADD FORM / PRODUCT INFO] Value changed', v)
                    )
                ),
            this.form
                .get('productSale')
                .valueChanges.pipe(
                    tap((v) =>
                        HelperService.debug('[CATALOGUE ADD FORM / PRODUCT SALE] Value changed', v)
                    )
                ),
            this.form
                .get('productMedia')
                .valueChanges.pipe(
                    tap((v) =>
                        HelperService.debug('[CATALOGUE ADD FORM / PRODUCT MEDIA] Value changed', v)
                    )
                ),
            this.form
                .get('productShipment')
                .valueChanges.pipe(
                    tap((v) =>
                        HelperService.debug(
                            '[CATALOGUE ADD FORM / PRODUCT SHIPMENT] Value changed',
                            v
                        )
                    )
                ),
            this.form.statusChanges.pipe(
                tap((v) =>
                    HelperService.debug('[CATALOGUE ADD FORM / FORM STATUS] Status changed', v)
                )
            )
        )
            .pipe(distinctUntilChanged(), debounceTime(500), takeUntil(this.unSubs$))
            .subscribe(() => {
                if (this.statusFormBulk === true) {
                    this.store.dispatch(FormActions.setFormStatusInvalid());
                } else {
                    if (this.form.status === 'VALID') {
                        this.store.dispatch(FormActions.setFormStatusValid());
                    } else {
                        this.store.dispatch(FormActions.setFormStatusInvalid());
                    }
                }

                this.bulkPrice = this.form.get('productSale.productPrice').value;
                if (!this.bulkPrice || this.bulkPrice === '0') {
                    this.statusAddBulkFirst = false;
                } else {
                    this.statusAddBulkFirst = true;
                }
                let countDataBulk = this.form.get('bulkPrices').value;
                if (countDataBulk.length > 1) {
                    this.comparedata(countDataBulk);
                }

                this.form
                    .get('productSale.typePricing')
                    .valueChanges.pipe(
                        distinctUntilChanged(),
                        debounceTime(100),
                        takeUntil(this.unSubs$)
                    )
                    .subscribe((value) => {
                        let retailBP = parseFloat(
                            String(this.form.get('productSale.productPrice').value)
                                .replace(new RegExp('Rp', 'g'), '')
                                .split('.')
                                .join('')
                                .replace(new RegExp(',', 'g'), '.')
                        );

                        let retailBPAft = parseFloat(
                            String(this.form.get('productSale.retailBuyingPriceAfterTax').value)
                                .replace(new RegExp('Rp', 'g'), '')
                                .split('.')
                                .join('')
                                .replace(new RegExp(',', 'g'), '.')
                        );

                        if (this.form.get('bulkPrices').value.length > 0) {
                            let dataPriceBulk = parseFloat(
                                this.form.get('bulkPrices').value[0].price
                            );

                            let dataPriceBulkAftTax = parseFloat(
                                this.form.get('bulkPrices').value[0].priceAfterTax
                            );

                            if (this.form.get('bulkPrices').value.length < 2) {
                                if (dataPriceBulk <= 0 && value === 'exclude') {
                                    this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 1019);
                                    this.statusFormBulk = true;
                                } else if (dataPriceBulkAftTax <= 0 && value === 'include') {
                                    this._onChangeInputStyle(
                                        `bulkPrice.priceAfterTax.${0}`,
                                        'error',
                                        1030
                                    );
                                    this.statusFormBulk = true;
                                } else if (dataPriceBulk >= retailBP && value === 'exclude') {
                                    this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 1025);
                                    this.statusFormBulk = true;
                                } else if (
                                    dataPriceBulkAftTax >= retailBPAft &&
                                    value === 'include'
                                ) {
                                    this._onChangeInputStyle(
                                        `bulkPrice.priceAfterTax.${0}`,
                                        'error',
                                        1043
                                    );
                                    this.statusFormBulk = true;
                                }
                            } else {
                                this.comparedata(this.form.get('bulkPrices').value);
                            }
                        }
                    });

                this.checkFormBulkPrice();

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

        // // Re-validate maximum order quantity field based on changes in minimum order quantity
        // this.form
        //     .get('productCount.minQtyValue')
        //     .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
        //     .subscribe((value) => {
        //         const isMaximum = this.form.get('productCount.isMaximum').value;

        //         /* HelperService.debug(
        //             '[CataloguesFormComponent] productCount.minQtyValue valueChanges',
        //             {
        //                 value,
        //                 minQtyOption: this.form.get('productCount.minQtyOption').value,
        //                 isMaximum,
        //                 maxQtyValueForm: this.form.get('productCount.maxQtyValue'),
        //             }
        //         ); */

        //         if (isMaximum) {
        //             this.form.get('productCount.maxQtyValue').reset();
        //             this.form.get('productCount.maxQtyValue').setValidators([
        //                 RxwebValidators.required({
        //                     message: this.errorMessageSvc.getErrorMessageNonState(
        //                         'default',
        //                         'required'
        //                     ),
        //                 }),
        //                 RxwebValidators.greaterThanEqualTo({
        //                     fieldName: 'productCount.minQtyValue',
        //                     message: this.errorMessageSvc.getErrorMessageNonState(
        //                         'default',
        //                         'gte_field',
        //                         {
        //                             fieldComparedName: 'Maximum Order Quantity / Consist Of',
        //                         }
        //                     ),
        //                 }),
        //                 RxwebValidators.greaterThanEqualTo({
        //                     fieldName: 'productCount.consistOfQtyLargeUnit',
        //                     message: this.errorMessageSvc.getErrorMessageNonState(
        //                         'default',
        //                         'gte_field',
        //                         {
        //                             fieldComparedName: 'Maximum Order Quantity / Consist Of',
        //                         }
        //                     ),
        //                 }),
        //             ]);

        //             this.form
        //                 .get('productCount.maxQtyValue')
        //                 .updateValueAndValidity({ onlySelf: true });
        //         }
        //     });

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

                this.form
                    .get('productCount.uomSmallUnit')
                    .valueChanges.pipe(
                        debounceTime(100),
                        distinctUntilChanged(),
                        takeUntil(this.unSubs$)
                    )
                    .subscribe((change) => {
                        const selectedUnit: any = units.filter((unit) => unit.id === change);
                        if (selectedUnit && selectedUnit.length > 0) {
                            this.uomNames$.next({
                                smallName: selectedUnit[0].unit,
                                smallId: selectedUnit[0].id,
                                largeName: this.uomNames$.value.largeName,
                                largeId: this.uomNames$.value.largeId,
                            });
                        }

                        this.form.get('productCount.uomSmallUnit').setValidators([
                            RxwebValidators.required({
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                            RxwebValidators.different({
                                fieldName: 'productCount.uomLargeUnit',
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'small_unit',
                                    'different',
                                    {
                                        fieldComparedName: 'large_unit',
                                    }
                                ),
                            }),
                        ]);
                        this.form
                            .get('productCount.uomSmallUnit')
                            .updateValueAndValidity({ onlySelf: true });
                        this.form
                            .get('productCount.uomLargeUnit')
                            .updateValueAndValidity({ onlySelf: true });
                    });

                this.form
                    .get('productCount.uomLargeUnit')
                    .valueChanges.pipe(
                        debounceTime(100),
                        distinctUntilChanged(),
                        takeUntil(this.unSubs$)
                    )
                    .subscribe((change) => {
                        const selectedUnit: any = units.filter((unit) => unit.id === change);

                        if (selectedUnit && selectedUnit.length > 0) {
                            this.uomNames$.next({
                                largeName: selectedUnit[0].unit,
                                largeId: selectedUnit[0].id,
                                smallName: this.uomNames$.value.smallName,
                                smallId: this.uomNames$.value.smallId,
                            });
                        }
                        this.form.get('productCount.uomLargeUnit').setValidators([
                            RxwebValidators.required({
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'default',
                                    'required'
                                ),
                            }),
                            RxwebValidators.different({
                                fieldName: 'productCount.uomSmallUnit',
                                message: this.errorMessageSvc.getErrorMessageNonState(
                                    'large_unit',
                                    'different',
                                    {
                                        fieldComparedName: 'small_unit',
                                    }
                                ),
                            }),
                        ]);
                        this.form
                            .get('productCount.uomLargeUnit')
                            .updateValueAndValidity({ onlySelf: true });
                        this.form
                            .get('productCount.uomSmallUnit')
                            .updateValueAndValidity({ onlySelf: true });
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

    ngAfterViewInit(): void {
        this.requestBrands();
        this._cd.markForCheck();
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
        // this.subBrandCollections$.complete();

        this.store.dispatch(CatalogueActions.resetSelectedCatalogue());
        this.store.dispatch(CatalogueActions.resetSelectedCategories());
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(FormActions.resetFormStatus());
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

    checkFormBulkPrice() {
        this.form
            .get('bulkPrices')
            .valueChanges.pipe(distinctUntilChanged(), debounceTime(100), takeUntil(this.unSubs$))
            .subscribe((value) => {
                let retailBP = parseFloat(
                    String(this.form.get('productSale.productPrice').value)
                        .replace(new RegExp('Rp', 'g'), '')
                        .split('.')
                        .join('')
                        .replace(new RegExp(',', 'g'), '.')
                );
                let retailBPAft = parseFloat(
                    String(this.form.get('productSale.retailBuyingPriceAfterTax').value)
                        .replace(new RegExp('Rp', 'g'), '')
                        .split('.')
                        .join('')
                        .replace(new RegExp(',', 'g'), '.')
                );

                if (this.form.get('bulkPrices').value.length > 0) {
                    let dataPriceBulk = parseFloat(
                        String(this.form.get('bulkPrices').value[0].price)
                            .replace(new RegExp('Rp', 'g'), '')
                            .replace(new RegExp(',', 'g'), '.')
                    );

                    let dataPriceBulkAftTax = parseInt(
                        this.form.get('bulkPrices').value[0].priceAfterTax
                    );

                    if (this.form.get('bulkPrices').value.length < 2) {
                        if (
                            dataPriceBulk <= 0 &&
                            dataPriceBulk <= retailBP &&
                            this.form.get('productSale.typePricing').value === 'exclude'
                        ) {
                            this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 1739);
                            this.store.dispatch(FormActions.setFormStatusInvalid());
                        } else if (
                            dataPriceBulkAftTax <= 0 &&
                            dataPriceBulkAftTax <= retailBPAft &&
                            this.form.get('productSale.typePricing').value === 'include'
                        ) {
                            this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error', 1759);
                            this.store.dispatch(FormActions.setFormStatusInvalid());
                        } else if (
                            dataPriceBulk >= retailBP &&
                            this.form.get('productSale.typePricing').value === 'exclude'
                        ) {
                            this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 1752);
                            this.store.dispatch(FormActions.setFormStatusInvalid());
                        } else if (
                            dataPriceBulkAftTax >= retailBPAft &&
                            this.form.get('productSale.typePricing').value === 'include'
                        ) {
                            this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error', 1771);
                            this.store.dispatch(FormActions.setFormStatusInvalid());
                        }
                    } else {
                        this.comparedata(this.form.get('bulkPrices').value);
                    }
                }
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
        // console.log(val);
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
            : assetUrl('images/logos/sinbad.svg');
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

    convertType(type: string) {
        if (type === 'exclude') {
            this.bulkPriceSettingCtrl.forEach((element) => {
                element.get('price').enable();
                element.get('priceAfterTax').disable();
            });
        } else if (type === 'include') {
            this.bulkPriceSettingCtrl.forEach((element) => {
                element.get('priceAfterTax').enable();
                element.get('price').disable();
            });
        }
    }

    get bulkPriceSetting(): Readonly<FormArray> {
        return this.form.get('bulkPrices') as FormArray;
    }

    get bulkPriceSettingCtrl(): AbstractControl[] {
        return this.bulkPriceSetting.controls;
    }

    isBulkPriceInputDisabled(conditionIdx, propertyName: string): boolean {
        return (
            this.bulkPriceSettingCtrl[conditionIdx]['controls'][propertyName].status === 'DISABLED'
        );
    }

    addCondition(idx?: number): void {
        this.statusAddBulkFirst = true;

        const conditions = this.bulkPriceSetting.getRawValue();

        if (conditions && conditions.length > 0) {
            const nextIdx = conditions.length;
            const prevIdx = conditions.length - 1;

            if (prevIdx >= 0) {
                const prevCondition = conditions[prevIdx];

                //setting auto fill if add minQty+2 dan price -1

                //jika pny min Qty dan > 0
                if (prevCondition && prevCondition.minQty > 0) {
                    prevCondition.minQty = parseInt(prevCondition.minQty);
                } else {
                    //jika min Qty kosong "" atau 0
                    prevCondition.minQty = nextIdx * 2;
                }

                //jika pny price dan > 0
                if (prevCondition && prevCondition.price > 0) {
                    prevCondition.price = parseFloat(prevCondition.price);
                } else {
                    let produkBasePrice = this.form.get('retailBuyingPrice').value;
                    prevCondition.price = parseFloat(produkBasePrice) - nextIdx;
                }

                this.bulkPriceSetting.push(
                    this._createConditionsBulk(new ConditionBulkDto(prevCondition), nextIdx + 1)
                );
            }

            this.bulkPriceSettingCtrl.forEach((data, idx) => {
                if (data.value.price < 1 || data.value.priceAfterTax < 1) {
                    this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error', 2124);
                    this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error', 2125);
                } else {
                    this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                    this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
                }
            });

            return;
        }

        this.bulkPriceSetting.push(this._createConditionsBulk());

        this.bulkPriceSettingCtrl.forEach((data, idx) => {
            if (data.value.price < 1 || data.value.priceAfterTax < 1) {
                this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'error', 2139);
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'error', 2140);
            } else {
                this._onChangeInputStyle(`bulkPrice.price.${idx}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${idx}`, 'success');
            }
        });
    }

    deleteCondition(idx: number) {
        if (typeof idx !== 'number') {
            return;
        }

        let lastIdx = idx;
        let prevLastIdx = idx;

        this.bulkPriceSetting.removeAt(idx);

        const pricingType = this.form.get('productSale.typePricing').value;
        const tax = this.form.get('productSale.tax').value;

        const config =
            pricingType === 'exclude'
                ? {
                      bulkPriceProperty: 'price',
                      priceProperty: 'productSale.productPrice',
                  }
                : {
                      bulkPriceProperty: 'priceAfterTax',
                      priceProperty: 'productSale.retailBuyingPriceAfterTax',
                  };

        const conditionsBulknya = this.bulkPriceSetting.getRawValue();

        if (conditionsBulknya && conditionsBulknya.length > 0) {
            const nextIdx = conditionsBulknya.length;
            lastIdx = nextIdx - 1;
            prevLastIdx = nextIdx;
            let newValue = [];
            let retailBuyingPrice = 0;

            if (this.form.get(config.priceProperty).value) {
                retailBuyingPrice = isNaN(
                    parseInt(
                        String(this.form.get(config.priceProperty).value)
                            .replace(new RegExp('Rp', 'g'), '')
                            .split('.')
                            .join('')
                    )
                )
                    ? 0
                    : parseInt(
                          String(this.form.get(config.priceProperty).value)
                              .replace(new RegExp('Rp', 'g'), '')
                              .split('.')
                              .join('')
                      );
            }

            for (var i = 0; i < conditionsBulknya.length; i++) {
                conditionsBulknya[i].level = i + 1;
                newValue.push(conditionsBulknya[i]);

                const currentPrice = parseInt(
                    String(conditionsBulknya[i][config.bulkPriceProperty]).replace(/\.00/g, ''),
                    10
                );
                const previousLevelPrice = conditionsBulknya[i - 1]
                    ? parseInt(
                          String(conditionsBulknya[i - 1][config.bulkPriceProperty]).replace(
                              /\.00/g,
                              ''
                          ),
                          10
                      )
                    : retailBuyingPrice;

                /** pengecekan level saat ini ke level sebelumnya */
                if (pricingType === 'exclude') {
                    if (currentPrice >= previousLevelPrice) {
                        newValue[i].price = previousLevelPrice - 1;
                    } else {
                        newValue[i].price = currentPrice;
                    }
                    newValue[i].priceAfterTax = this.calculateAfterTaxPipe.transform(
                        newValue[i].price.toString(),
                        tax
                    );
                } else {
                    if (currentPrice >= previousLevelPrice) {
                        newValue[i].priceAfterTax = previousLevelPrice - 1;
                    } else {
                        newValue[i].priceAfterTax = currentPrice;
                    }
                    newValue[i].price = this.calculateBeforeTaxPipe.transform(
                        newValue[i].priceAfterTax.toString(),
                        tax
                    );
                }

                this._onChangeInputStyle(`bulkPrice.price.${i}`, 'success');
                this._onChangeInputStyle(`bulkPrice.price.${i + 1}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${i}`, 'success');
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${i + 1}`, 'success');
            }

            if (newValue.length) {
                this.bulkPriceSetting.setValue(newValue);
            }
        } else {
            while (idx <= lastIdx) {
                // this._newTierValidation(idx);
                idx++;
            }
        }

        if (conditionsBulknya.length > 0) {
            this.comparedata(this.form.get('bulkPrices').value);
        }

        if (this.form.status === 'VALID' && !this.statusFormBulk) {
            this.store.dispatch(FormActions.setFormStatusValid());
        } else if (this.form.status === 'VALID' && this.statusFormBulk) {
            this.store.dispatch(FormActions.setFormStatusInvalid());
        }
    }

    onChangeMinQtyBulk(val: string, idx): void {
        const minQtyBulk = val ? parseInt(val.split('.').join('')) : 0;
        const minQtyAmount = this.form.get('productCount.minQtyValue').value;

        if (document.getElementById(`bulkPrice.minQty.${0}`)) {
            if (idx === 0) {
                if (minQtyBulk <= minQtyAmount) {
                    this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'error');
                    this._checkConditionsBulkPrices(
                        this.form.get('bulkPrices'),
                        'product',
                        'minQty'
                    );
                    this.statusFormBulk = true;
                } else {
                    if (this.form.get('bulkPrices').value.length < 2) {
                        this.statusFormBulk = false;
                        this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'success');
                        this._checkConditionsBulkPrices(
                            this.form.get('bulkPrices'),
                            null,
                            'minQty'
                        );
                    } else {
                        if (idx === 0) {
                            this._onChangeInputStyle(`bulkPrice.minQty.${0}`, 'success');
                        }
                        // } else {
                        this.comparedata(this.form.get('bulkPrices').value);
                        // }
                    }
                }
            } else {
                if (this.form.get('bulkPrices').value.length > 1) {
                    this.comparedata(this.form.get('bulkPrices').value);
                }
            }
        }
    }

    selectPPN(value: number) {
        const pricingType = this.form.get('productSale.typePricing').value;
        const retailBuyingPrice = this._getPriceNumber('productSale.productPrice');
        const rbpAfterTax = this._getPriceNumber('productSale.retailBuyingPriceAfterTax');
        if (pricingType === 'exclude') {
            this.form
                .get('productSale.retailBuyingPriceAfterTax')
                .setValue(
                    this.calculateAfterTaxPipe.transform(retailBuyingPrice.toString(), value)
                );
            this.bulkPriceSettingCtrl.forEach((element) => {
                const price = parseInt(String(element.get('price').value).replace(/\.00/g, ''), 10);
                element
                    .get('priceAfterTax')
                    .setValue(this.calculateAfterTaxPipe.transform(price.toString(), value));
            });
        } else {
            this.form
                .get('productSale.productPrice')
                .setValue(this.calculateBeforeTaxPipe.transform(rbpAfterTax.toString(), value));

            this.bulkPriceSettingCtrl.forEach((element) => {
                const price = parseInt(
                    String(element.get('priceAfterTax').value).replace(/\.00/g, ''),
                    10
                );
                element
                    .get('price')
                    .setValue(this.calculateBeforeTaxPipe.transform(price.toString(), value));
            });
        }

        this._cd.markForCheck();
        this._cd.detectChanges();
    }

    onChangeretailBuyingPrice(val: string) {
        const retailBP = val
            ? parseFloat(
                  val
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        const tax = this.form.get('productSale.tax').value;

        let rbpAftTransform = this.calculateAfterTaxPipe.transform(retailBP.toString(), tax);

        let rbpAfter = rbpAftTransform.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');
        this.form.get('productSale.retailBuyingPriceAfterTax').setValue(rbpAftTransform);
    }

    onChangeretailBuyingPriceAft(val: string) {
        const retailPriceAft = val
            ? parseFloat(
                  val
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        const tax = this.form.get('productSale.tax').value;
        this.form
            .get('productSale.productPrice')
            .setValue(this.calculateBeforeTaxPipe.transform(retailPriceAft.toString(), tax));
    }

    onChangeBulkPrice(val: string, idx, type = 'beforeTax') {
        const bulkPrice = val
            ? parseFloat(
                  val
                      .replace(new RegExp('Rp', 'g'), '')
                      .split('.')
                      .join('')
                      .replace(new RegExp(',', 'g'), '.')
              )
            : 0;

        const retailBuyingPrice = this._getPriceNumber(
            type === 'beforeTax'
                ? 'productSale.productPrice'
                : 'productSale.retailBuyingPriceAfterTax'
        );

        const tax = this.form.get('productSale.tax').value;

        if (idx === 0) {
            if (bulkPrice >= retailBuyingPrice) {
                this.statusFormBulk = true;

                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 2481);
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error', 2411);
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
                this.comparedata(this.form.get('bulkPrices').value);
            } else if (isNaN(bulkPrice) || bulkPrice === 0) {
                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'error', 2486);
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error', 2416);
                this.comparedata(this.form.get('bulkPrices').value);
            } else {
                this._onChangeInputStyle(`bulkPrice.price.${0}`, 'success', 2490);
                this._onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'success');
                this.comparedata(this.form.get('bulkPrices').value);
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
            }
        } else {
            if (this.form.get('bulkPrices').value.length > 1) {
                this.comparedata(this.form.get('bulkPrices').value);
                this._checkConditionsBulkPrices(this.form.get('bulkPrices'));
            }
        }

        if (type === 'beforeTax') {
            this.bulkPriceSettingCtrl[idx].patchValue({
                priceAfterTax: this.calculateAfterTaxPipe.transform(bulkPrice.toString(), tax),
            });
        } else {
            this.bulkPriceSettingCtrl[idx].patchValue({
                price: this.calculateBeforeTaxPipe.transform(bulkPrice.toString(), tax),
            });
        }
    }

    _getPriceNumber(formName: string): number {
        let price = 0;

        if (this.form.get(formName).value) {
            price = isNaN(
                parseInt(
                    String(this.form.get(formName).value)
                        .replace(new RegExp('Rp', 'g'), '')
                        .split('.')
                        .join('')
                )
            )
                ? 0
                : parseInt(
                      String(this.form.get(formName).value)
                          .replace(new RegExp('Rp', 'g'), '')
                          .split('.')
                          .join('')
                  );
        }

        return price;
    }

    //Exclude
    onChangePriceBulk(val, idx): void {}

    //Include
    onChangePriceBulkInclude(val, idx): void {}

    comparedata(data) {
        const onCheckPrice = (
            { curItem, prevItem },
            elementId: string,
            propertyName: string,
            callback: Function,
            comparePriceValue: number
        ) => {
            if (parseFloat(curItem[propertyName]) >= parseFloat(prevItem[propertyName])) {
                callback();
                this._onChangeInputStyle(elementId, 'error', 2480);
            } else if (parseFloat(curItem[propertyName]) < 1) {
                callback();
                this._onChangeInputStyle(elementId, 'error', 2483);
            } else if (parseFloat(prevItem[propertyName]) < 1) {
                callback();
                this._onChangeInputStyle(elementId, 'error', 2486);
            } else if (parseFloat(curItem[propertyName]) >= comparePriceValue) {
                callback();
                this._onChangeInputStyle(elementId, 'error', 2489);
            } else if (parseFloat(prevItem[propertyName]) >= comparePriceValue) {
                callback();
                this._onChangeInputStyle(elementId, 'error', 2492);
            }
        };
        let retailBuyingPrice = 0;
        let retailBuyingPriceAfterTax = 0;
        if (this.form.get('productSale.productPrice').value) {
            retailBuyingPrice = this._getPriceNumber('productSale.productPrice');
            retailBuyingPriceAfterTax = this._getPriceNumber(
                'productSale.retailBuyingPriceAfterTax'
            );
        }
        const invalidPrice = [];
        const invalidMinQty = [];

        const minQtyValue = this.form.get('productCount.minQtyValue').value;

        if (data) {
            if (data.length > 1) {
                data.forEach(
                    (
                        curItem: {
                            level: any;
                            minQty: string;
                            price: string;
                            priceAfterTax: string;
                        },
                        index: number,
                        arr: Array<{
                            level: any;
                            minQty: string;
                            price: string;
                            priceAfterTax: string;
                        }>
                    ) => {
                        if (!index) {
                            return;
                        }

                        const prevItem = arr[index - 1];
                        if (
                            Number(curItem.minQty) <= Number(prevItem.minQty) ||
                            Number(curItem.minQty) <= minQtyValue ||
                            Number(prevItem.minQty) <= minQtyValue
                        ) {
                            invalidMinQty.push(index);
                        }

                        if (curItem.price && prevItem.price) {
                            onCheckPrice(
                                { curItem, prevItem },
                                `bulkPrice.price.${index}`,
                                'price',
                                () => invalidPrice.push(index),
                                retailBuyingPrice
                            );
                        }
                        if (curItem.priceAfterTax && prevItem.priceAfterTax) {
                            onCheckPrice(
                                { curItem, prevItem },
                                `bulkPrice.priceAfterTax.${index}`,
                                'priceAfterTax',
                                () => invalidPrice.push(index),
                                retailBuyingPriceAfterTax
                            );
                        }
                    }
                );

                if (parseInt(data[0].minQty) <= minQtyValue) {
                    invalidMinQty.push(0);
                }
                if (data[0].price) {
                    if (parseFloat(data[0].price) >= retailBuyingPrice) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error', 2566);
                    } else if (parseFloat(data[0].price) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error', 2569);
                    }
                }
                if (data[0].priceAfterTax) {
                    if (parseFloat(data[0].priceAfterTax) >= retailBuyingPriceAfterTax) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error', 2575);
                    } else if (parseFloat(data[0].priceAfterTax) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error', 2578);
                    }
                }
            } else if (data.length === 1) {
                if (parseInt(data[0].minQty) <= minQtyValue) {
                    invalidMinQty.push(0);
                }
                if (data[0].price) {
                    if (parseFloat(data[0].price) >= retailBuyingPrice) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error', 2588);
                    } else if (parseFloat(data[0].price) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.price.0`, 'error', 2591);
                    }
                }
                if (data[0].priceAfterTax) {
                    if (parseFloat(data[0].priceAfterTax) >= retailBuyingPriceAfterTax) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error', 2597);
                    } else if (parseFloat(data[0].priceAfterTax) === 0) {
                        invalidPrice.push(0);
                        this._onChangeInputStyle(`bulkPrice.priceAfterTax.0`, 'error', 2600);
                    }
                }
            }
        }

        if (invalidMinQty.length > 0 || invalidPrice.length > 0) {
            this.statusFormBulk = true;
        } else {
            this.statusFormBulk = false;
        }
    }

    private _createConditionsBulk(condition?: ConditionBulkDto, id?: number): FormGroup {
        let produkPrice = this.form
            .get('productSale.productPrice')
            .value.replace(new RegExp('Rp', 'g'), '')
            .split('.')
            .join('');

        let priceDefaultFirst = parseInt(produkPrice) - 1;
        let minQtyProductCount = parseInt(this.form.get('productCount.minQtyValue').value);

        let minQtyBulkCompare = 0;
        if (!id) {
            if (minQtyProductCount > 1) {
                minQtyBulkCompare = minQtyProductCount + 2;
            } else {
                minQtyBulkCompare = +2;
            }
        }

        const price =
            id && condition.price > 0
                ? condition.price - 1
                : id && !condition.price
                ? parseInt(produkPrice) - (id - 1)
                : priceDefaultFirst;

        const pricingType = this.form.get('productSale.typePricing').value;

        // event.value
        return this.fb.group({
            level: id ? id : 1,
            minQty: id ? condition.minQty + 2 : minQtyBulkCompare,
            price: { value: price, disabled: pricingType === 'include' },
            priceAfterTax: {
                value: this.calculateAfterTaxPipe.transform(
                    price.toString(),
                    this.form.get('productSale.tax').value
                ),
                disabled: pricingType === 'exclude',
            },
        });
    }

    _onChangeInputStyle(elementId, type, tracker: any = '') {
        HelperService.debug(
            '[CataloguesFormComponent - Add] input style called: ',
            `${tracker} - elementId: ${elementId} - type: ${type}`
        );
        const attribute =
            type === 'success'
                ? {
                      color: 'black',
                      border: '1px solid lightgray',
                      borderRadius: '4px',
                  }
                : {
                      color: 'red',
                      border: '1px solid red',
                      borderRadius: '4px',
                  };
        if (document.getElementById(elementId)) {
            try {
                document.getElementById(elementId).style.color = attribute.color;
                document.getElementById(elementId).style.border = attribute.border;
                document.getElementById(elementId).style.borderRadius = attribute.borderRadius;
            } catch (err) {
                console.error(err);
            }
        }
    }

    private _checkConditionsBulkPrices(
        control: AbstractControl,
        type?: string,
        typeInvalid?: string,
        priceType?: string
        // priceRbp?: any
    ): ValidationErrors {
        const onChangeInputStyle = (elementId, type) => {
            const attribute =
                type === 'success'
                    ? {
                          color: 'black',
                          border: '1px solid lightgray',
                          borderRadius: '4px',
                      }
                    : {
                          color: 'red',
                          border: '1px solid red',
                          borderRadius: '4px',
                      };
            if (document.getElementById(elementId)) {
                try {
                    document.getElementById(elementId).style.color = attribute.color;
                    document.getElementById(elementId).style.border = attribute.border;
                    document.getElementById(elementId).style.borderRadius = attribute.borderRadius;
                } catch (err) {
                    console.error(err);
                }
            }
        };

        const values = control.value;

        const invalidMinQty = [];
        const invalidPrice = [];
        const invalidPriceAfterTax = [];
        let statusnya = false;

        if (values.length === 1) {
            if (Math.floor(Number(values[values.length - 1].minQty)) === 0) {
                onChangeInputStyle(`bulkPrice.minQty.${0}`, 'error');
                invalidMinQty.push(0);
            }
            if (Math.floor(Number(values[values.length - 1].price)) === 0) {
                onChangeInputStyle(`bulkPrice.price.${0}`, 'error');
                invalidPrice.push(0);
            }
            if (Math.floor(Number(values[values.length - 1].priceAfterTax)) === 0) {
                onChangeInputStyle(`bulkPrice.priceAfterTax.${0}`, 'error');
                invalidPriceAfterTax.push(0);
            }
        } else {
            values.forEach(
                (
                    curItem: { level: any; minQty: string; price: string; priceAfterTax: string },
                    index: number,
                    arr: Array<{ level: any; minQty: string; price: string; priceAfterTax: string }>
                ) => {
                    if (!index) {
                        return;
                    }

                    const prevItem = arr[index - 1];

                    if (parseFloat(curItem.minQty) <= parseFloat(prevItem.minQty)) {
                        invalidMinQty.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.minQty.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.minQty.${index}`, 'success');
                    }

                    if (parseFloat(curItem.price) >= parseFloat(prevItem.price)) {
                        invalidPrice.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.price.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.price.${index}`, 'success');
                    }

                    if (parseFloat(curItem.priceAfterTax) >= parseFloat(prevItem.priceAfterTax)) {
                        invalidPrice.push(index);
                        statusnya = true;
                        onChangeInputStyle(`bulkPrice.priceAfterTax.${index}`, 'error');
                    } else {
                        onChangeInputStyle(`bulkPrice.priceAfterTax.${index}`, 'success');
                    }
                }
            );
        }

        if (!invalidMinQty.length && !invalidPrice.length && !invalidPriceAfterTax.length) {
            return null;
        }

        const errors = new Map();

        invalidMinQty.forEach((item) => {
            errors.set(item, {
                invalidMinQty: true,
            });
        });

        invalidPrice.forEach((item) => {
            const co = errors.get(item) || {};

            errors.set(item, {
                ...co,
                invalidPrice: true,
            });
        });

        invalidPriceAfterTax.forEach((item) => {
            const co = errors.get(item) || {};

            errors.set(item, {
                ...co,
                invalidPriceAfterTax: true,
            });
        });

        return errors;
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
                typePricing: [
                    'exclude' || 'include',
                    [
                        RxwebValidators.required({
                            message: this.errorMessageSvc.getErrorMessageNonState(
                                'default',
                                'required'
                            ),
                        }),
                    ],
                ],
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
                retailBuyingPriceAfterTax: [
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

            // SALES INFORMATION BULK PRICING
            bulkPrices: this.fb.array([], this._checkConditionsBulkPrices as ValidatorFn),

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
                uomLargeUnit: [{ value: '', disabled: true }],
                consistOfQtyLargeUnit: [{ value: 0, disabled: true }],
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
                platformVisibility: 'all',
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
