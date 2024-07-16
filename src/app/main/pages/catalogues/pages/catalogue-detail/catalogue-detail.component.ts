import { Location } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { FormStatus, IBreadcrumbs } from 'app/shared/models/global.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import {
    Catalogue,
    CatalogueInformation,
    CatalogueWeightDimension,
    UpsertMssSettings,
} from '../../models';
import { CatalogueMedia, CatalogueMediaForm } from '../../models/catalogue-media.model';
import { CatalogueActions, CatalogueMssSettingsActions } from '../../store/actions';
import { fromCatalogue } from '../../store/reducers';
import {
    BrandSelectors,
    CatalogueSelectors,
    CatalogueMssSettingsSelectors,
} from '../../store/selectors';
import { assetUrl } from 'single-spa/asset-url';
import { MatTabChangeEvent } from '@angular/material';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'app-catalogue-detail',
    templateUrl: './catalogue-detail.component.html',
    styleUrls: ['./catalogue-detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CatalogueDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    private subs$: Subject<void> = new Subject<void>();
    navigationSub$: Subject<void> = new Subject<void>();

    isLoading$: Observable<boolean>;

    bulkPriceSettingStatus: string = 'group_pricing';

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'sku-information';

    formMode: IFormMode = 'view';
    formValue:
        | Partial<Catalogue>
        | Partial<CatalogueInformation>
        | Partial<CatalogueMediaForm>
        | Partial<CatalogueWeightDimension>
        | Partial<UpsertMssSettings>;

    selectedCatalogue$: Observable<Catalogue>;

    @ViewChild('catalogueDetails', { static: true, read: ElementRef })
    catalogueDetailRef: ElementRef<HTMLElement>;
    @ViewChild('cataloguePriceSettings', { static: false, read: ElementRef })
    cataloguePriceSettingRef: ElementRef<HTMLElement>;

    // Assets
    sinbadNoPhoto = assetUrl('images/catalogue/no_photo.png');

    tabIndex: number = 0;

    mssSettingTabLabel: string = 'MSS Settings';

    constructor(
        private route: ActivatedRoute,
        private cdRef: ChangeDetectorRef,
        private location: Location,
        private router: Router,
        private ngxPermissions: NgxPermissionsService,
        private store: NgRxStore<fromCatalogue.FeatureState>
    ) {
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
                // translate: 'BREADCRUMBS.HOME',
                active: false,
            },
            {
                title: 'Catalogue',
                translate: 'BREADCRUMBS.CATALOGUE',
                active: false,
                // url: '/pages/catalogues'
            },
            {
                title: 'Manage Product',
                active: false,
                // translate: 'BREADCRUMBS.CATALOGUE',
                // url: '/pages/catalogues'
            },
            {
                title: 'SKU Detail',
                keepCase: true,
                active: true,
                // translate: 'BREADCRUMBS.CATALOGUE',
                // url: '/pages/catalogues'
            },
        ];

        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs,
            })
        );

        this.isLoading$ = combineLatest([
            this.store.select(BrandSelectors.getIsLoading),
            this.store.select(CatalogueSelectors.getIsLoading),
            this.store.select(CatalogueMssSettingsSelectors.getIsLoading),
        ]).pipe(
            map((loadingStates) => loadingStates.includes(true)),
            takeUntil(this.subs$)
        );

        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
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
                            active: true,
                        },
                    },
                },
            })
        );

        //data bulk price setting
        this.store
            .select(CatalogueSelectors.getCataloguePriceBulkSettings)
            .pipe(takeUntil(this.subs$))
            .subscribe((payload) => {
                this.bulkPriceSettingStatus = payload.code;
            });

        this.store.dispatch(FormActions.resetFormStatus());
        this.store.dispatch(FormActions.setFormStatusInvalid());
        this.store.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
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

    onFormStatusChanged(value: FormStatus): void {
        if (this.isEditMode()) {
            if (value === 'VALID') {
                this.store.dispatch(FormActions.setFormStatusValid());
            } else {
                this.store.dispatch(FormActions.setFormStatusInvalid());
            }
        }
    }

    goBack(): void {
        this.location.back();
    }

    onFormValueChanged(
        $event: CatalogueInformation | CatalogueMediaForm | CatalogueWeightDimension
    ): void {
        switch (this.section) {
            case 'sku-information': {
                const {
                    externalId,
                    name,
                    description,
                    information,
                    detail,
                    brandId,
                    subBrandId = null,
                    firstCatalogueCategoryId,
                    lastCatalogueCategoryId,
                    // unitOfMeasureId,
                    tags: catalogueKeywords,
                } = $event as CatalogueInformation;

                this.formValue = {
                    externalId,
                    name,
                    description,
                    information,
                    detail,
                    brandId,
                    subBrandId,
                    firstCatalogueCategoryId,
                    lastCatalogueCategoryId,
                    // unitOfMeasureId,
                    catalogueKeywords,
                } as unknown as CatalogueInformation;

                break;
            }
            case 'media-settings': {
                const { photos, oldPhotos } = $event as CatalogueMediaForm;

                this.formValue = {
                    photos,
                    oldPhotos,
                };

                break;
            }
            case 'price-settings': {
                const {
                    retailBuyingPrice,
                    catalogueTaxId,
                    discountedRetailBuyingPrice,
                    bulkPrices,
                    pricingInputWithTaxFlag,
                } = $event as Catalogue;

                this.formValue = {};

                if (typeof retailBuyingPrice !== 'undefined') {
                    this.formValue = { ...this.formValue, retailBuyingPrice };
                }

                if (typeof catalogueTaxId !== 'undefined') {
                    this.formValue = { ...this.formValue, catalogueTaxId };
                }

                if (typeof discountedRetailBuyingPrice !== 'undefined') {
                    this.formValue = { ...this.formValue, discountedRetailBuyingPrice };
                }

                if (typeof bulkPrices !== undefined) {
                    this.formValue = { ...this.formValue, bulkPrices };
                }

                if (typeof pricingInputWithTaxFlag !== undefined) {
                    this.formValue = { ...this.formValue, pricingInputWithTaxFlag };
                }

                break;
            }
            case 'amount-settings': {
                const {
                    packagedQty,
                    minQty,
                    minQtyType,
                    multipleQty,
                    multipleQtyType,
                    isMaximum,
                    maxQty,
                    largeUomId,
                    enableLargeUom,
                    unitOfMeasureId,
                } = $event as Catalogue;

                this.formValue = {
                    packagedQty,
                    minQty,
                    minQtyType,
                    multipleQty,
                    multipleQtyType,
                    isMaximum: !isMaximum,
                    maxQty,
                    largeUomId,
                    enableLargeUom,
                    unitOfMeasureId,
                };

                break;
            }
            case 'weight-and-dimension': {
                const {
                    catalogueDimension,
                    catalogueWeight,
                    packagedDimension,
                    packagedWeight,
                    dangerItem = false,
                } = $event as CatalogueWeightDimension;

                this.formValue = {
                    catalogueDimension,
                    catalogueWeight,
                    packagedDimension,
                    packagedWeight,
                    dangerItem,
                };

                break;
            }
            case 'visibility': {
                const { status, isBonus, isExclusive, platformVisibility } = $event as Catalogue;

                this.formValue = {
                    status,
                    isBonus,
                    isExclusive,
                    platformVisibility,
                };

                break;
            }
            case 'mss-settings': {
                const { catalogueId, supplierId, data } = $event as unknown as UpsertMssSettings;

                this.formValue = {
                    catalogueId,
                    supplierId,
                    data,
                } as unknown as UpsertMssSettings;
                break;
            }
        }
    }

    onSelectedTab(tabChangeEvent: MatTabChangeEvent): void {
        const isGroupPricing = this.bulkPriceSettingStatus === 'group_pricing';

        switch (tabChangeEvent.index) {
            case 0:
                this.section = 'sku-information';
                break;
            case 1:
                this.section = 'price-settings';
                break;
            case 2:
                if (isGroupPricing) {
                    this.section = 'group-price';
                    this.router.navigateByUrl(
                        `/catalogues/v2/${this.route.snapshot.params.id}/detail?tab=group-price`,
                        { replaceUrl: true }
                    );
                } else {
                    this.section = 'media-settings';
                }
                break;
            case 3:
                if (isGroupPricing) {
                    this.section = 'media-settings';
                } else {
                    this.section = 'weight-and-dimension';
                }
                break;
            case 4:
                if (isGroupPricing) {
                    this.section = 'weight-and-dimension';
                } else {
                    this.section = 'amount-settings';
                    this.router.navigateByUrl(
                        `/catalogues/v2/${this.route.snapshot.params.id}/detail?tab=amount-settings`,
                        { replaceUrl: true }
                    );
                }
                break;
            case 5:
                if (isGroupPricing) {
                    this.section = 'amount-settings';
                    this.router.navigateByUrl(
                        `/catalogues/v2/${this.route.snapshot.params.id}/detail?tab=amount-settings`,
                        { replaceUrl: true }
                    );
                } else {
                    this.section = 'visibility';
                }
                break;
            case 6:
                if (isGroupPricing) {
                    this.section = 'visibility';
                } else {
                    this.section = 'mss-settings';
                }

                if (tabChangeEvent.tab.textLabel === this.mssSettingTabLabel)
                    this.section = 'mss-settings';
                break;
            case 7:
                if (isGroupPricing) {
                    this.section = 'mss-settings';
                }
                break;
        }

        if (this.section !== 'group-price' && this.section !== 'amount-settings') {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    tab: this.section,
                },
                replaceUrl: true,
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            });
        }
    }

    editCatalogue(): void {
        const canUpdate = this.ngxPermissions.hasPermission('CATALOGUE.UPDATE');

        canUpdate.then((hasAccess) => {
            if (hasAccess) {
                this.formMode = 'edit';

                this.store.dispatch(UiActions.showFooterAction());
                this.store.dispatch(FormActions.setFormStatusInvalid());
                this.store.dispatch(FormActions.resetClickCancelButton());
            } else {
                this.router.navigateByUrl('/pages/errors/403', { replaceUrl: true });
            }
        });

        // this.cdRef.markForCheck();
    }

    scrollTop(element: ElementRef<HTMLElement>): void {
        element.nativeElement.scrollTop = 0;
    }

    ngOnInit(): void {
        this.selectedCatalogue$ = this.store
            .select(CatalogueSelectors.getSelectedCatalogueEntity)
            .pipe(
                tap((catalogue) =>
                    HelperService.debug(
                        '[CatalogueDetailComponent] ngOnInit getSelectedCatalogueEntity',
                        {
                            catalogue,
                        }
                    )
                ),
                takeUntil(this.subs$)
            );

        this.navigationSub$
            .pipe(withLatestFrom(this.selectedCatalogue$), takeUntil(this.subs$))
            .subscribe(([_, { id: catalogueId }]) => {
                this.formMode = 'edit';
                // this.cdRef.markForCheck();
                // this.router.navigate([`/pages/catalogues/edit/${this.section}/${catalogueId}`]);
            });

        this.store.dispatch(CatalogueActions.fetchPricingSettingsRequest());

        //data bulk price setting
        this.store
            .select(CatalogueSelectors.getCataloguePriceBulkSettings)
            .pipe(takeUntil(this.subs$))
            .subscribe((payload) => {
                this.bulkPriceSettingStatus =
                    payload.code && payload.code.length
                        ? payload.code
                        : this.bulkPriceSettingStatus;
            });

        this.selectedCatalogue$.subscribe((item) => {
            localStorage.setItem('ssc-product-detail', JSON.stringify(item));
        });
    }

    ngAfterViewInit(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.
        let tab: string = this.route.snapshot.queryParamMap.get('tab');
        const isGroupPricing = this.bulkPriceSettingStatus === 'group_pricing';

        if (tab) {
            this.section = tab;
            switch (this.section) {
                case 'sku-information':
                    this.tabIndex = 0;
                    break;
                case 'price-settings':
                    this.tabIndex = 1;
                    break;
                case 'media-settings':
                    if (isGroupPricing) {
                        this.tabIndex = 3;
                    } else {
                        this.tabIndex = 2;
                    }
                    break;
                case 'weight-and-dimension':
                    if (isGroupPricing) {
                        this.tabIndex = 4;
                    } else {
                        this.tabIndex = 3;
                    }
                    break;
                case 'amount-settings':
                    if (isGroupPricing) {
                        this.tabIndex = 5;
                    } else {
                        this.tabIndex = 4;
                    }
                    break;
                case 'visibility':
                    if (isGroupPricing) {
                        this.tabIndex = 6;
                    } else {
                        this.tabIndex = 5;
                    }
                    break;
                case 'mss-settings':
                    if (isGroupPricing) {
                        this.tabIndex = 7;
                    } else {
                        this.tabIndex = 6;
                    }
                    break;
            }
        }

        this.store
            .select(CatalogueSelectors.getRefreshStatus)
            .pipe(withLatestFrom(this.selectedCatalogue$), takeUntil(this.subs$))
            .subscribe(([needRefresh, catalogue]) => {
                if (needRefresh) {
                    const canView = this.ngxPermissions.hasPermission('CATALOGUE.READ');

                    canView.then((hasAccess) => {
                        if (hasAccess) {
                            this.formMode = 'view';

                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(FormActions.resetClickCancelButton());
                            this.store.dispatch(FormActions.resetClickSaveButton());
                            this.store.dispatch(
                                CatalogueActions.setRefreshStatus({ status: false })
                            );

                            this.store.dispatch(
                                CatalogueActions.fetchCatalogueRequest({
                                    payload: catalogue.id,
                                })
                            );

                            // Scrolled to top.
                            this.scrollTop(this.catalogueDetailRef);
                        } else {
                            this.router.navigateByUrl('/pages/errors/403', { replaceUrl: true });
                        }
                    });
                }
            });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "cancel".
        this.store
            .select(FormSelectors.getIsClickCancelButton)
            .pipe(takeUntil(this.subs$))
            .subscribe((isClick) => {
                if (isClick) {
                    this.formMode = 'view';

                    this.store.dispatch(UiActions.hideFooterAction());
                    this.store.dispatch(FormActions.resetClickCancelButton());
                    this.store.dispatch(FormActions.resetClickSaveButton());
                }
            });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "save".
        this.store
            .select(FormSelectors.getIsClickSaveButton)
            .pipe(withLatestFrom(this.selectedCatalogue$), takeUntil(this.subs$))
            .subscribe(([isClick, catalogue]) => {
                if (isClick) {
                    /* HelperService.debug('[CatalogueDetailComponent] getIsClickSaveButton', {
                        payload: this.formValue,
                        section: this.section,
                    }); */

                    switch (this.section) {
                        case 'sku-information': {
                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: this.formValue as CatalogueInformation,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'media-settings': {
                            const formPhotos = this.formValue as CatalogueMediaForm;
                            const oldPhotos = formPhotos.oldPhotos;
                            const formCatalogue: CatalogueMedia = {
                                deletedImages: [],
                                uploadedImages: [],
                            };

                            /** Fungsi untuk mem-filter foto untuk keperluan update gambar. */
                            const filterPhoto = (photo, idx) => {
                                const isDeleted = photo === null && oldPhotos[idx].value !== null;
                                const isNewUpload = photo !== null && oldPhotos[idx].value === null;
                                const isReplaced =
                                    photo !== null &&
                                    oldPhotos[idx].value !== null &&
                                    photo !== oldPhotos[idx].value;

                                if (isDeleted) {
                                    formCatalogue.deletedImages.push(oldPhotos[idx].id);
                                }

                                if (isNewUpload) {
                                    formCatalogue.uploadedImages.push({ base64: photo });
                                }

                                if (isReplaced) {
                                    formCatalogue.deletedImages.push(oldPhotos[idx].id);
                                    formCatalogue.uploadedImages.push({ base64: photo });
                                }
                            };

                            // Mulai mem-filter foto.
                            formPhotos.photos.forEach(filterPhoto);

                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: formCatalogue,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'weight-and-dimension': {
                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: this.formValue as CatalogueWeightDimension,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'price-settings': {
                            let {
                                retailBuyingPrice,
                                discountedRetailBuyingPrice,
                                bulkPrices,
                                pricingInputWithTaxFlag,
                            } = this.formValue as Partial<Catalogue>;

                            const sanitize = (value: string): number =>
                                Number(value.replace(/\./g, '').replace(/,/g, '.'));

                            retailBuyingPrice = sanitize(String(retailBuyingPrice));

                            discountedRetailBuyingPrice =
                                String(discountedRetailBuyingPrice).length > 0 &&
                                String(discountedRetailBuyingPrice) !== 'null'
                                    ? sanitize(String(discountedRetailBuyingPrice))
                                    : null;

                            const editBulkpricing = bulkPrices;
                            if (editBulkpricing && editBulkpricing.length > 0) {
                                for (var i = 0; i < editBulkpricing.length; i++) {
                                    editBulkpricing[i].level = i + 1;
                                    editBulkpricing[i].minQty = Number(editBulkpricing[i].minQty);
                                    editBulkpricing[i].price = Number(editBulkpricing[i].price);
                                }
                            }

                            bulkPrices = editBulkpricing;

                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: {
                                            ...this.formValue,
                                            retailBuyingPrice,
                                            discountedRetailBuyingPrice,
                                            bulkPrices,
                                            pricingInputWithTaxFlag,
                                        } as Catalogue,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'amount-settings': {
                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: this.formValue as Catalogue,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'visibility': {
                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: this.formValue as Catalogue,
                                        source: 'form',
                                        section: this.section,
                                    },
                                })
                            );

                            break;
                        }

                        case 'mss-settings': {
                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueMssSettingsActions.upsertRequest({
                                    payload: this.formValue as UpsertMssSettings,
                                })
                            );

                            break;
                        }
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.navigationSub$.next();
        this.navigationSub$.complete();

        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideFooterAction());
        this.store.dispatch(UiActions.hideCustomToolbar());
        this.store.dispatch(FormActions.resetFormStatus());
    }
}
