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
import { Router } from '@angular/router';
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

    constructor(
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
                const { retailBuyingPrice, catalogueTaxId, discountedRetailBuyingPrice } =
                    $event as Catalogue;

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
                    platformVisibility
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

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'sku-information';
                break;
            case 1:
                this.section = 'price-settings';
                break;
            case 2:
                this.section = 'media-settings';
                break;
            case 3:
                this.section = 'weight-and-dimension';
                break;
            case 4:
                this.section = 'amount-settings';
                break;
            case 5:
                this.section = 'visibility';
                break;
            case 6:
                this.section = 'mss-settings';
                break;
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
    }

    ngAfterViewInit(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.
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
                            let { retailBuyingPrice, discountedRetailBuyingPrice } = this
                                .formValue as Partial<Catalogue>;

                            const sanitize = (value: string): number =>
                                Number(value.replace(/\./g, '').replace(/,/g, '.'));

                            retailBuyingPrice = sanitize(String(retailBuyingPrice));

                            discountedRetailBuyingPrice =
                                (String(discountedRetailBuyingPrice).length > 0 && String(discountedRetailBuyingPrice) !== 'null')
                                    ? sanitize(String(discountedRetailBuyingPrice))
                                    : null;

                            this.store.dispatch(UiActions.hideFooterAction());
                            this.store.dispatch(
                                CatalogueActions.patchCatalogueRequest({
                                    payload: {
                                        id: catalogue.id,
                                        data: {
                                            ...this.formValue,
                                            retailBuyingPrice,
                                            discountedRetailBuyingPrice,
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
