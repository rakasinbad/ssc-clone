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
                    rewardId,
                    rewardValidDate,
                    trigger,
                    condition,
                    miscellaneous,
                } = ($event as PromoReward);

                this.formValue = {
                    id,
                    rewardId,
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
                    source: 'detail-edit',
                }
            })
        );
    }

    private processTriggerInformationForm(): void {
        const formValue = this.formValue as Partial<TriggerInformation>;

        const payload: Partial<PeriodTargetPromoPayload> = {
            base: formValue.base === 'sku' ? 'sku'
                    : formValue.base === 'brand' ? 'brand'
                    : formValue.base === 'faktur' ? 'invoiceGroup'
                    : 'unknown',
            dataBase: {},
        };

        // Klasifikasi "dataBase" untuk Trigger Information.
        if (payload.base === 'sku') {
            payload.dataBase = {
                catalogueId: formValue.chosenSku.map(sku => sku.id),
            };
        } else if (payload.base === 'brand') {
            payload.dataBase = {
                brandId: formValue.chosenBrand.map(brand => brand.id),
            };
        } else if (payload.base === 'invoiceGroup') {
            payload.dataBase = {
                invoiceGroupId: formValue.chosenFaktur.map(faktur => faktur.id),
            };
        }

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                }
            })
        );
    }

    private processConditionBenefitForm(): void {
        const formValue = this.formValue as Partial<ConditionBenefit>;

        const payload: Partial<PeriodTargetPromoPayload> = {
            // CONDITION & BENEFIT SETTINGS
            conditions: [],
        };

        const isMultiplication = !!formValue.conditionBenefit[0].benefit.qty.multiplicationOnly;

        // Klasifikasi "conditions" untuk Condition & Benefit Settings
        for (const [index, { id, condition, benefit }] of formValue.conditionBenefit.entries()) {
            if ((isMultiplication && index === 0) || !isMultiplication) {
                // Condition Payload Master.
                const conditionPayload = {
                    conditionBase: condition.base === 'qty' ? 'qty'
                                    : condition.base === 'order-value' ? 'value'
                                    : 'unknown',
                    benefitType: benefit.base === 'qty' ? 'qty'
                                    : benefit.base === 'cash' ? 'amount'
                                    : benefit.base === 'percent' ? 'percent'
                                    : 'unknown',
                    multiplication: isMultiplication,
                };

                /**
                 * Payload untuk ID condition.
                 * 
                 * Jika ID nya valid, maka itu penambahan condition & benefit baru.
                 * Jika ID valid, maka itu ada perubahan condition & benefit.
                 */
                if (id) {
                    conditionPayload['id'] = id;
                }

                // Payload untuk Condition.
                if (conditionPayload.conditionBase === 'qty') {
                    conditionPayload['conditionQty'] = +condition.qty;
                } else if (conditionPayload.conditionBase === 'value') {
                    conditionPayload['conditionValue'] = +condition.value;
                }

                // Payload untuk Benefit.
                if (conditionPayload.benefitType === 'qty') {
                    conditionPayload['benefitCatalogueId'] = +benefit.qty.bonusSku.id;
                    conditionPayload['benefitBonusQty'] = +benefit.qty.bonusQty;
                } else if (conditionPayload.benefitType === 'amount') {
                    conditionPayload['benefitRebate'] = +benefit.cash.rebate;
                } else if (conditionPayload.benefitType === 'percent') {
                    conditionPayload['benefitDiscount'] = +benefit.percent.percentDiscount;
                    conditionPayload['benefitMaxRebate'] = +benefit.percent.maxRebate;
                }

                payload.conditions.push(conditionPayload);
            }
        }

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                }
            })
        );
    }

    private processCustomerSegmentationForm(): void {
        const formValue = this.formValue as Partial<CustomerSegmentation>;

        const payload: Partial<PeriodTargetPromoPayload> = {
            target: formValue.segmentationBase === 'direct-store' ? 'store'
                    : formValue.segmentationBase === 'segmentation' ? 'segmentation'
                    : 'unknown',
            dataTarget: {},
        };

        // Klasifikasi "dataTarget" untuk Customer Segmentation Settings.
        if (payload.target === 'store') {
            payload.dataTarget = {
                storeId: formValue.chosenStore.map(supplierStore => supplierStore.storeId)
            };
        } else if (payload.target === 'segmentation') {
            payload.dataTarget = {
                warehouseId: formValue.chosenWarehouse.length === 0 ? 'all'
                            : formValue.chosenWarehouse.map(warehouse => warehouse.id),
                typeId: formValue.chosenStoreType.length === 0 ? 'all'
                            : formValue.chosenStoreType.map(storeType => storeType.id),
                groupId: formValue.chosenStoreGroup.length === 0 ? 'all'
                            : formValue.chosenStoreGroup.map(storeGroup => storeGroup.id),
                clusterId: formValue.chosenStoreCluster.length === 0 ? 'all'
                            : formValue.chosenStoreCluster.map(storeCluster => storeCluster.id),
                channelId: formValue.chosenStoreChannel.length === 0 ? 'all'
                            : formValue.chosenStoreChannel.map(storeChannel => storeChannel.id),
            };
        }

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                }
            })
        );
    }

    private processRewardForm(): void {
        const formValue = this.formValue as Partial<PromoReward>;

        const payload: Partial<PeriodTargetPromoPayload> = {
            reward: {
                startDate: (formValue.rewardValidDate.activeStartDate as unknown as moment.Moment).toISOString(),
                endDate: (formValue.rewardValidDate.activeEndDate as unknown as moment.Moment).toISOString(),
                triggerBase: formValue.trigger.base === 'sku' ? 'sku'
                            : formValue.trigger.base === 'brand' ? 'brand'
                            : formValue.trigger.base === 'faktur' ? 'invoiceGroup'
                            : 'unknown',
                conditionBase: formValue.condition.base === 'qty' ? 'qty'
                            : formValue.condition.base === 'order-value' ? 'value'
                            : 'unknown',
                termCondition: formValue.miscellaneous.description,
            },
        };

        if (formValue.miscellaneous.couponImage.startsWith('data:image')) {
            payload.reward.image = formValue.miscellaneous.couponImage;
        }
        /**
         * Payload untuk ID condition.
         * 
         * Jika ID nya valid, maka itu penambahan condition & benefit baru.
         * Jika ID valid, maka itu ada perubahan condition & benefit.
         */
        if (formValue.rewardId) {
            payload.reward.id = formValue.rewardId;
        }

        // Klasifikasi "reward -> conditionBase" untuk Reward Information.
        if (payload.reward.conditionBase === 'qty') {
            payload.reward['conditionQty'] = formValue.condition.qty;
        } else if (payload.reward.conditionBase === 'value') {
            payload.reward['conditionValue'] = formValue.condition.value;
        }

        // Klasifikasi "reward -> triggerBase" untuk Trigger Information.
        if (payload.reward.triggerBase === 'sku') {
            payload.reward['catalogueId'] = formValue.trigger.chosenSku.map(sku => sku.id);
        } else if (payload.reward.triggerBase === 'brand') {
            payload.reward['brandId'] = formValue.trigger.chosenBrand.map(brand => brand.id);
        } else if (payload.reward.triggerBase === 'invoiceGroup') {
            payload.reward['invoiceGroupId'] = formValue.trigger.chosenFaktur.map(faktur => faktur.id);
        }

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
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
        ).subscribe(([isClick, _]) => {
            if (isClick) {
                this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());

                switch (this.section) {
                    case 'general-information': {
                        this.processGeneralInformationForm();
                        break;
                    }
                    case 'trigger': {
                        this.processTriggerInformationForm();
                        break;
                    }
                    case 'condition-benefit': {
                        this.processConditionBenefitForm();
                        break;
                    }
                    case 'customer-segmentation': {
                        this.processCustomerSegmentationForm();
                        break;
                    }
                    case 'reward': {
                        this.processRewardForm();
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

        this.PeriodTargetPromoStore.dispatch(PeriodTargetPromoActions.deselectPeriodTargetPromo());
        this.PeriodTargetPromoStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

}
