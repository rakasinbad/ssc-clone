import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';

import { FeatureState as PeriodTargetPromoCoreState } from '../../store/reducers';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { Subject, BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    PeriodTargetPromoGeneralInformation as GeneralInformation,
    PeriodTargetPromoTriggerInformation as TriggerInformation,
    PeriodTargetConditionBenefit as ConditionBenefit,
    PeriodTargetPromoReward as Reward,
    PeriodTargetPromoCustomerSegmentationSettings as CustomerSegmentation
} from '../../models';
import { FormStatus } from 'app/shared/models/global.model';
import { takeUntil, tap, filter, withLatestFrom } from 'rxjs/operators';
import { HelperService } from 'app/shared/helpers';
import { environment } from 'environments/environment';
import { FormSelectors } from 'app/shared/store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as moment from 'moment';
import { PeriodTargetPromoPayload } from '../../models/period-target-promo.model';
import { PeriodTargetPromoActions } from '../../store/actions';
import { PeriodTargetPromoSelectors } from '../../store/selectors';

@Component({
    selector: 'period-target-promo-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PeriodTargetPromoFormComponent implements OnInit, OnDestroy {

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();
    isLoading$: Observable<boolean>;

    // Untuk menyimpan nilai yang dikirim oleh form.
    generalInformationValue$: BehaviorSubject<GeneralInformation> = new BehaviorSubject<GeneralInformation>(null);
    triggerInformationValue$: BehaviorSubject<TriggerInformation> = new BehaviorSubject<TriggerInformation>(null);
    conditionBenefitValue$: BehaviorSubject<ConditionBenefit> = new BehaviorSubject<ConditionBenefit>(null);
    rewardValue$: BehaviorSubject<Reward> = new BehaviorSubject<Reward>(null);
    customerSegmentationValue$: BehaviorSubject<CustomerSegmentation> = new BehaviorSubject<CustomerSegmentation>(null);

    // Untuk menyimpan status masing-masing form.
    generalInformationStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    triggerInformationStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    conditionBenefitStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    rewardStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    customerSegmentationStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');

    constructor(
        private PeriodTargetPromoStore: NgRxStore<PeriodTargetPromoCoreState>
    ) {
        this.isLoading$ = this.PeriodTargetPromoStore.select(
            PeriodTargetPromoSelectors.getLoadingState
        ).pipe(
            takeUntil(this.subs$)
        );

        // Memuat breadcrumb.
        this.PeriodTargetPromoStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                    },
                    {
                        title: 'Promo'
                    },
                    {
                        title: 'Period Target Promo',
                        keepCase: true
                    },
                    {
                        title: 'Add Period Target Promo',
                        keepCase: true,
                        active: true
                    }
                ]
            })
        );

        // Memuat footer action.
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
                            active: false
                        },
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/promos/period-target-promo'
                        }
                    }
                }
            })
        );

        if (!environment.production) {
            this.watchFormStatuses();
            this.watchFormValues();
        }

        this.PeriodTargetPromoStore.dispatch(UiActions.showFooterAction());
        this.PeriodTargetPromoStore.dispatch(FormActions.resetFormStatus());
        this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusInvalid());
        this.PeriodTargetPromoStore.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    private watchFormStatuses(): void {
        this.generalInformationStatus$.pipe(
            tap(status => HelperService.debug('generalInformationStatus$ CHANGED', status)),
            takeUntil(this.subs$)
        ).subscribe();

        this.triggerInformationStatus$.pipe(
            tap(status => HelperService.debug('triggerInformationStatus$ CHANGED', status)),
            takeUntil(this.subs$)
        ).subscribe();

        this.conditionBenefitStatus$.pipe(
            tap(status => HelperService.debug('conditionBenefitStatus$ CHANGED', status)),
            takeUntil(this.subs$)
        ).subscribe();

        this.rewardStatus$.pipe(
            tap(status => HelperService.debug('rewardStatus$ CHANGED', status)),
            takeUntil(this.subs$)
        ).subscribe();

        this.customerSegmentationStatus$.pipe(
            tap(status => HelperService.debug('customerSegmentationStatus$ CHANGED', status)),
            takeUntil(this.subs$)
        ).subscribe();
    }
    
    private watchFormValues(): void {
        this.generalInformationValue$.pipe(
            tap(value => HelperService.debug('generalInformationValue$ CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe();

        this.triggerInformationValue$.pipe(
            tap(value => HelperService.debug('triggerInformationValue$ CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe();

        this.conditionBenefitValue$.pipe(
            tap(value => HelperService.debug('conditionBenefitValue$ CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe();

        this.rewardValue$.pipe(
            tap(value => HelperService.debug('rewardValue$ CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe();

        this.customerSegmentationValue$.pipe(
            tap(value => HelperService.debug('customerSegmentationValue$ CHANGED', value)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private initSubscribeFormStatuses(): void {
        combineLatest([
            this.generalInformationStatus$,
            this.triggerInformationStatus$,
            this.conditionBenefitStatus$,
            this.rewardStatus$,
            this.customerSegmentationStatus$,
        ]).pipe(
            tap(statuses => HelperService.debug('COMBINED FORM STATUSES CHANGED', statuses)),
            takeUntil(this.subs$)
        ).subscribe(statuses => {
            if (statuses.every(status => status === 'VALID')) {
                this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusValid());
            } else {
                this.PeriodTargetPromoStore.dispatch(FormActions.setFormStatusInvalid());
            }
        });
    }

    private initHandleFormSubmission(): void {
        this.PeriodTargetPromoStore.select(
            FormSelectors.getIsClickSaveButton
        ).pipe(
            tap(click => HelperService.debug('PERIOD TARGET PROMO ADD FORM CLICKED SAVE', click)),
            filter(click => !!click),
            withLatestFrom(this.PeriodTargetPromoStore.select(AuthSelectors.getUserSupplier)),
            takeUntil(this.subs$)
        ).subscribe(([click, userSupplier]) => {
            this.submitForm(userSupplier.supplierId);
        });
    }

    private submitForm(supplierId: string): void {
        const generalInformationValue = this.generalInformationValue$.value;
        const triggerInformationValue = this.triggerInformationValue$.value;
        const conditionBenefitValue = this.conditionBenefitValue$.value;
        const rewardValue = this.rewardValue$.value;
        const customerSegmentationValue = this.customerSegmentationValue$.value;
        
        const payload: PeriodTargetPromoPayload = {
            // MASTER
            supplierId,
            type: 'target',
            status: 'active',
            // GENERAL INFORMATON
            externalId: generalInformationValue.sellerId,
            name: generalInformationValue.name,
            platform: generalInformationValue.platform,
            maxRedemptionPerStore: +generalInformationValue.maxRedemptionPerBuyer,
            promoBudget: +generalInformationValue.budget,
            startDate: (generalInformationValue.activeStartDate as unknown as moment.Moment).toISOString(),
            endDate: (generalInformationValue.activeEndDate as unknown as moment.Moment).toISOString(),
            image: generalInformationValue.imageSuggestion,
            voucherCombine: !!generalInformationValue.isAllowCombineWithVoucher,
            firstBuy: !!generalInformationValue.isFirstBuy,
            // TRIGGER INFORMATION
            base: triggerInformationValue.base === 'sku' ? 'sku'
                    : triggerInformationValue.base === 'brand' ? 'brand'
                    : triggerInformationValue.base === 'faktur' ? 'invoiceGroup'
                    : 'unknown',
            dataBase: {},
            // CONDITION & BENEFIT SETTINGS
            conditions: [],
            // REWARD INFORMATION
            reward: {
                name: generalInformationValue.name,
                startDate: (rewardValue.rewardValidDate.activeStartDate as unknown as moment.Moment).toISOString(),
                endDate: (rewardValue.rewardValidDate.activeEndDate as unknown as moment.Moment).toISOString(),
                triggerBase: rewardValue.trigger.base === 'sku' ? 'sku'
                            : rewardValue.trigger.base === 'brand' ? 'brand'
                            : rewardValue.trigger.base === 'faktur' ? 'invoiceGroup'
                            : 'unknown',
                conditionBase: rewardValue.condition.base === 'qty' ? 'qty'
                            : rewardValue.condition.base === 'order-value' ? 'value'
                            : 'unknown',
                termCondition: rewardValue.miscellaneous.description,
                image: rewardValue.miscellaneous.couponImage,
            },
            // CUSTOMER SEGMENTATION SETTINGS
            target: customerSegmentationValue.segmentationBase === 'direct-store' ? 'store'
                    : customerSegmentationValue.segmentationBase === 'segmentation' ? 'segmentation'
                    : 'unknown',
            dataTarget: {},
        };

        const isMultiplication = !!conditionBenefitValue.conditionBenefit[0].benefit.qty.multiplicationOnly;

        // Klasifikasi "conditions" untuk Condition & Benefit Settings
        for (const [index, { condition, benefit }] of conditionBenefitValue.conditionBenefit.entries()) {
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

        // Klasifikasi "reward -> conditionBase" untuk Reward Information.
        if (payload.reward.conditionBase === 'qty') {
            payload.reward['conditionQty'] = rewardValue.condition.qty;
        } else if (payload.reward.conditionBase === 'value') {
            payload.reward['conditionValue'] = rewardValue.condition.value;
        }

        // Klasifikasi "reward -> triggerBase" untuk Trigger Information.
        if (payload.reward.triggerBase === 'sku') {
            payload.reward['catalogueId'] = rewardValue.trigger.chosenSku.map(sku => sku.id);
        } else if (payload.reward.triggerBase === 'brand') {
            payload.reward['brandId'] = rewardValue.trigger.chosenBrand.map(brand => brand.id);
        } else if (payload.reward.triggerBase === 'invoiceGroup') {
            payload.reward['invoiceGroupId'] = rewardValue.trigger.chosenFaktur.map(faktur => faktur.id);
        }

        // Klasifikasi "dataBase" untuk Trigger Information.
        if (payload.base === 'sku') {
            payload.dataBase = {
                catalogueId: triggerInformationValue.chosenSku.map(sku => sku.id),
            };
        } else if (payload.base === 'brand') {
            payload.dataBase = {
                brandId: triggerInformationValue.chosenBrand.map(brand => brand.id),
            };
        } else if (payload.base === 'invoiceGroup') {
            payload.dataBase = {
                invoiceGroupId: triggerInformationValue.chosenFaktur.map(faktur => faktur.id),
            };
        }

        // Klasifikasi "dataTarget" untuk Customer Segmentation Settings.
        if (payload.target === 'store') {
            payload.dataTarget = {
                storeId: customerSegmentationValue.chosenStore.map(supplierStore => supplierStore.storeId)
            };
        } else if (payload.target === 'segmentation') {
            payload.dataTarget = {
                warehouseId: customerSegmentationValue.chosenWarehouse.length === 0 ? 'all' : customerSegmentationValue.chosenWarehouse.map(warehouse => warehouse.id),
                typeId: customerSegmentationValue.chosenStoreType.length === 0 ? 'all' : customerSegmentationValue.chosenStoreType.map(storeType => storeType.id),
                groupId: customerSegmentationValue.chosenStoreGroup.length === 0 ? 'all' : customerSegmentationValue.chosenStoreGroup.map(storeGroup => storeGroup.id),
                clusterId: customerSegmentationValue.chosenStoreCluster.length === 0 ? 'all' : customerSegmentationValue.chosenStoreCluster.map(storeCluster => storeCluster.id),
                channelId: customerSegmentationValue.chosenStoreChannel.length === 0 ? 'all' : customerSegmentationValue.chosenStoreChannel.map(storeChannel => storeChannel.id),
            };
        }

        this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());

        this.PeriodTargetPromoStore.dispatch(
            PeriodTargetPromoActions.addPeriodTargetPromoRequest({
                payload
            })
        );
    }

    ngOnInit(): void {
        this.initSubscribeFormStatuses();
        this.initHandleFormSubmission();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
        this.PeriodTargetPromoStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

}
