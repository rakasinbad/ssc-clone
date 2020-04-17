import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import {
    PeriodTargetPromo,
    PeriodTargetPromoGeneralInformation as GeneralInformation,
    PeriodTargetPromoTriggerInformation as TriggerInformation,
    PeriodTargetConditionBenefit as ConditionBenefit,
    PeriodTargetPromoReward as PromoReward,
    PeriodTargetPromoCustomerSegmentationSettings as CustomerSegmentation,
} from '../../models';
import { FeatureState as PeriodTargetPromoCoreState } from '../../store/reducers';
import { PeriodTargetPromoSelectors } from '../../store/selectors';
import { takeUntil, tap, withLatestFrom, map } from 'rxjs/operators';
// import { Router } from '@angular/router';
import { FormStatus, IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { PeriodTargetPromoActions } from '../../store/actions';
import { HelperService } from 'app/shared/helpers';
import { PeriodTargetPromoPayload } from '../../models/period-target-promo.model';
import * as moment from 'moment';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'period-target-promo-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoDetailComponent implements OnInit, AfterViewInit, OnDestroy {

    private subs$: Subject<void> = new Subject<void>();
    navigationSub$: Subject<void> = new Subject<void>();

    isLoading$: Observable<boolean>;

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'general-information';

    formMode: IFormMode = 'view';
    // tslint:disable-next-line
    formValue: Partial<PeriodTargetPromo> | Partial<GeneralInformation> | Partial<TriggerInformation> | Partial<ConditionBenefit> | Partial<PromoReward> | Partial<CustomerSegmentation>;

    selectedPromo$: Observable<PeriodTargetPromo>;

    @ViewChild('detail', { static: true, read: ElementRef }) promoDetailRef: ElementRef<HTMLElement>;

    constructor(
        // private router: Router,
        private cdRef: ChangeDetectorRef,
        private PeriodTargetPromoStore: NgRxStore<PeriodTargetPromoCoreState>,
    ) {
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home'
            },
            {
                title: 'Promo'
            },
            {
                title: 'Period Target Promo'
            },
            {
                title: 'Period Target Promo Detail',
                active: true,
                keepCase: true
            }
        ];

        this.PeriodTargetPromoStore.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs
            })
        );

        this.isLoading$ = combineLatest([
            this.PeriodTargetPromoStore.select(PeriodTargetPromoSelectors.getLoadingState),
        ]).pipe(
            map(loadingStates => loadingStates.includes(true)),
            takeUntil(this.subs$)
        );

        this.PeriodTargetPromoStore.dispatch(
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
                            label: 'Save',
                            active: true
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false
                        },
                        cancel: {
                            label: 'Cancel',
                            active: true
                        },
                    }
                }
            })
        );

        this.PeriodTargetPromoStore.dispatch(FormActions.resetFormStatus());
        this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusInvalid());
        this.PeriodTargetPromoStore.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
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
                this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusValid());
            } else {
                this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusInvalid());
            }
        }
    }

    onFormValueChanged($event: GeneralInformation | TriggerInformation | ConditionBenefit | PromoReward | CustomerSegmentation): void {
        switch (this.section) {
            case 'general-information': {
                const {
                    id,
                    sellerId,
                    name,
                    platform,
                    maxRedemptionPerBuyer,
                    budget,
                    activeStartDate,
                    activeEndDate,
                    imageSuggestion,
                    isAllowCombineWithVoucher,
                    isFirstBuy,
                } = ($event as GeneralInformation);

                this.formValue = {
                    id,
                    sellerId,
                    name,
                    platform,
                    maxRedemptionPerBuyer,
                    budget,
                    activeStartDate,
                    activeEndDate,
                    imageSuggestion,
                    isAllowCombineWithVoucher,
                    isFirstBuy,
                };

                break;
            }
            case 'trigger': {
                const {
                    id,
                    base,
                    chosenSku = [],
                    chosenBrand = [],
                    chosenFaktur = [],
                } = ($event as TriggerInformation);

                this.formValue = {
                    id,
                    base,
                    chosenSku,
                    chosenBrand,
                    chosenFaktur,
                };

                break;
            }
            case 'condition-benefit': {
                const {
                    id,
                    calculationMechanism,
                    conditionBenefit,
                } = ($event as ConditionBenefit);

                this.formValue = {
                    id,
                    calculationMechanism,
                    conditionBenefit,
                };

                break;
            }
            case 'reward': {
                const {
                    id,
                    rewardValidDate,
                    trigger,
                    condition,
                    miscellaneous,
                } = ($event as PromoReward);

                this.formValue = {
                    id,
                    rewardValidDate,
                    trigger,
                    condition,
                    miscellaneous,
                };

                break;
            }
            case 'customer-segmentation': {
                const {
                    id,
                    segmentationBase,
                    chosenStore = [],
                    chosenWarehouse = [],
                    chosenStoreType = [],
                    chosenStoreGroup = [],
                    chosenStoreChannel = [],
                    chosenStoreCluster = [],
                } = ($event as CustomerSegmentation);

                this.formValue = {
                    id,
                    segmentationBase,
                    chosenStore,
                    chosenWarehouse,
                    chosenStoreType,
                    chosenStoreGroup,
                    chosenStoreChannel,
                    chosenStoreCluster,
                };

                break;
            }
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0: this.section = 'general-information'; break;
            case 1: this.section = 'trigger'; break;
            case 2: this.section = 'condition-benefit'; break;
            case 3: this.section = 'reward'; break;
            case 4: this.section = 'customer-segmentation'; break;
        }
    }

    editCatalogue(): void {
        this.formMode = 'edit';

        this.PeriodTargetPromoStore.dispatch(UiActions.showFooterAction());
        this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusInvalid());
        this.PeriodTargetPromoStore.dispatch(FormActions.resetClickCancelButton());

        this.cdRef.markForCheck();
    }

    scrollTop(element: ElementRef<HTMLElement>): void {
        element.nativeElement.scrollTop = 0;
    }

    private processGeneralInformationForm(): void {
        const formValue = this.formValue as Partial<GeneralInformation>;

        const payload: Partial<PeriodTargetPromoPayload> = {
            externalId: formValue.sellerId,
            name: formValue.name,
            platform: formValue.platform,
            maxRedemptionPerStore: +formValue.maxRedemptionPerBuyer,
            promoBudget: +formValue.budget,
            startDate: (formValue.activeStartDate as unknown as moment.Moment).toISOString(),
            endDate: (formValue.activeEndDate as unknown as moment.Moment).toISOString(),
            voucherCombine: !!formValue.isAllowCombineWithVoucher,
            firstBuy: !!formValue.isFirstBuy,
        };

        if (formValue.imageSuggestion.startsWith('data:image')) {
            payload.image = formValue.imageSuggestion;
        }

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                }
            })
        );
    }

    ngOnInit(): void {
        this.selectedPromo$ = this.PeriodTargetPromoStore.select(
            PeriodTargetPromoSelectors.getSelectedPeriodTargetPromo
        ).pipe(
            tap(value => HelperService.debug('[PERIOD TARGET PROMO/DETAILS] GET SELECTED PERIOD TARGET PROMO', value)),
            takeUntil(this.subs$)
        );

        this.navigationSub$.pipe(
            withLatestFrom(this.selectedPromo$),
            takeUntil(this.subs$)
        ).subscribe(([_, { id: catalogueId }]) => {
            this.formMode = 'edit';
            this.cdRef.markForCheck();
            // this.router.navigate([`/pages/catalogues/edit/${this.section}/${catalogueId}`]);
        });
    }

    ngAfterViewInit(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.
        this.PeriodTargetPromoStore.select(
            PeriodTargetPromoSelectors.getRefreshStatus
        ).pipe(
            withLatestFrom(this.selectedPromo$),
            takeUntil(this.subs$)
        ).subscribe(([needRefresh, catalogue]) => {
            if (needRefresh) {
                this.formMode = 'view';

                this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                this.PeriodTargetPromoStore.dispatch(FormActions.resetClickCancelButton());
                this.PeriodTargetPromoStore.dispatch(FormActions.resetClickSaveButton());
                this.PeriodTargetPromoStore.dispatch(PeriodTargetPromoActions.setRefreshStatus({ payload: false }));

                this.PeriodTargetPromoStore.dispatch(
                    PeriodTargetPromoActions.fetchPeriodTargetPromoRequest({
                        payload: catalogue.id
                    })
                );

                // Scrolled to top.
                this.scrollTop(this.promoDetailRef);
            }
        });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "cancel".
        this.PeriodTargetPromoStore.select(
            FormSelectors.getIsClickCancelButton
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(isClick => {
            if (isClick) {
                this.formMode = 'view';
                
                this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                this.PeriodTargetPromoStore.dispatch(FormActions.resetClickCancelButton());
                this.PeriodTargetPromoStore.dispatch(FormActions.resetClickSaveButton());
            }
        });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "save".
        this.PeriodTargetPromoStore.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            withLatestFrom(this.selectedPromo$),
            takeUntil(this.subs$)
        ).subscribe(([isClick, catalogue]) => {
            if (isClick) {
                this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());

                switch (this.section) {
                    case 'general-information': {
                        this.processGeneralInformationForm();
                        break;
                    }
                    // case 'media-settings': {
                    //     const formPhotos = this.formValue as CatalogueMediaForm;
                    //     const oldPhotos = formPhotos.oldPhotos;
                    //     const formCatalogue: CatalogueMedia = {
                    //         deletedImages: [],
                    //         uploadedImages: [],
                    //     };

                    //     /** Fungsi untuk mem-filter foto untuk keperluan update gambar. */
                    //     const filterPhoto = (photo, idx) => {
                    //         const isDeleted = photo === null && oldPhotos[idx].value !== null;
                    //         const isNewUpload = photo !== null && oldPhotos[idx].value === null;
                    //         const isReplaced = photo !== null && oldPhotos[idx].value !== null && photo !== oldPhotos[idx].value;

                    //         if (isDeleted) {
                    //             formCatalogue.deletedImages.push(oldPhotos[idx].id);
                    //         }

                    //         if (isNewUpload) {
                    //             formCatalogue.uploadedImages.push({ base64: photo });
                    //         }

                    //         if (isReplaced) {
                    //             formCatalogue.deletedImages.push(oldPhotos[idx].id);
                    //             formCatalogue.uploadedImages.push({ base64: photo });
                    //         }
                    //     };

                    //     // Mulai mem-filter foto.
                    //     formPhotos.photos.forEach(filterPhoto);

                    //     this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                    //     this.PeriodTargetPromoStore.dispatch(CatalogueActions.patchCatalogueRequest({
                    //         payload: {
                    //             id: catalogue.id,
                    //             data: formCatalogue,
                    //             source: 'form',
                    //             section: this.section
                    //         }
                    //     }));

                    //     break;
                    // }
                    // case 'weight-and-dimension': {
                    //     this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                    //     this.PeriodTargetPromoStore.dispatch(CatalogueActions.patchCatalogueRequest({
                    //         payload: {
                    //             id: catalogue.id,
                    //             data: this.formValue as CatalogueWeightDimension,
                    //             source: 'form',
                    //             section: this.section
                    //         }
                    //     }));

                    //     break;
                    // }
                    // case 'price-settings': {
                    //     this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                    //     this.PeriodTargetPromoStore.dispatch(CatalogueActions.patchCatalogueRequest({
                    //         payload: {
                    //             id: catalogue.id,
                    //             data: this.formValue as Catalogue,
                    //             source: 'form',
                    //             section: this.section
                    //         }
                    //     }));

                    //     break;
                    // }
                    // case 'amount-settings': {
                    //     this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
                    //     this.PeriodTargetPromoStore.dispatch(CatalogueActions.patchCatalogueRequest({
                    //         payload: {
                    //             id: catalogue.id,
                    //             data: this.formValue as Catalogue,
                    //             source: 'form',
                    //             section: this.section
                    //         }
                    //     }));

                    //     break;
                    // }
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.navigationSub$.next();
        this.navigationSub$.complete();

        this.PeriodTargetPromoStore.dispatch(PeriodTargetPromoActions.deselectPeriodTargetPromo());
        this.PeriodTargetPromoStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

}
