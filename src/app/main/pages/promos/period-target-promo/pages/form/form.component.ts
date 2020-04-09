import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';

import { FeatureState as PeriodTargetPromoCoreState } from '../../store/reducers';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import {
    PeriodTargetPromoGeneralInformation as GeneralInformation,
    PeriodTargetPromoTriggerInformation as TriggerInformation,
    PeriodTargetConditionBenefit as ConditionBenefit,
    PeriodTargetPromoReward as Reward,
    PeriodTargetPromoCustomerSegmentationSettings as CustomerSegmentation
} from '../../models';
import { FormStatus } from 'app/shared/models/global.model';
import { takeUntil, tap } from 'rxjs/operators';
import { HelperService } from 'app/shared/helpers';
import { environment } from 'environments/environment';

@Component({
    selector: 'period-target-promo-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PeriodTargetPromoFormComponent implements OnInit, OnDestroy {

    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();

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

    ngOnInit(): void {
        this.initSubscribeFormStatuses();
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.PeriodTargetPromoStore.dispatch(UiActions.hideFooterAction());
        this.PeriodTargetPromoStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

}
