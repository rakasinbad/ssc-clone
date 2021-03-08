import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';

import { FeatureState as VoucherCoreState } from '../../store/reducers';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { Subject, BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    VoucherGeneralInformation as GeneralInformation,
    VoucherConditionSettings,
    VoucherEligibleProduct as EligibleProduct,
    VoucherBenefit as Benefit,
    VoucherSegmentationSettings as EligibleStore,
    VoucherLayer as LayerSetting
} from '../../models';
import { FormStatus } from 'app/shared/models/global.model';
import { takeUntil, tap, filter, withLatestFrom } from 'rxjs/operators';
import { HelperService } from 'app/shared/helpers';
import { environment } from 'environments/environment';
import { FormSelectors } from 'app/shared/store/selectors';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as moment from 'moment';
import { SupplierVoucherPayload } from '../../models/voucher.model';
import { VoucherActions } from '../../store/actions';
import { VoucherSelectors } from '../../store/selectors';

@Component({
    selector: 'voucher-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class VoucherFormComponent implements OnInit, OnDestroy {
    // Untuk keperluan unsubscribe.
    private subs$: Subject<void> = new Subject<void>();
    isLoading$: Observable<boolean>;

    // Untuk menyimpan nilai yang dikirim oleh form.
    generalInformationValue$: BehaviorSubject<GeneralInformation> = new BehaviorSubject<GeneralInformation>(null);
    conditionSettingsValue$: BehaviorSubject<VoucherConditionSettings> = new BehaviorSubject<VoucherConditionSettings>(null);
    eligibleProductValue$: BehaviorSubject<EligibleProduct> = new BehaviorSubject<EligibleProduct>(null);
    benefitValue$: BehaviorSubject<Benefit> = new BehaviorSubject<Benefit>(null);
    eligibleStoreValue$: BehaviorSubject<EligibleStore> = new BehaviorSubject<EligibleStore>(null);
    layerSettingValue$: BehaviorSubject<LayerSetting> = new BehaviorSubject<LayerSetting>(null);


    // Untuk menyimpan status masing-masing form.
    generalInformationStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    conditionSettingsStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    eligibleProductStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    benefitStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    eligibleStoreStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');
    layerStatus$: BehaviorSubject<FormStatus> = new BehaviorSubject<FormStatus>('INVALID');

    constructor(private VoucherStore: NgRxStore<VoucherCoreState>) {
        this.isLoading$ = this.VoucherStore.select(VoucherSelectors.getLoadingState).pipe(
            takeUntil(this.subs$)
        );

        // Memuat breadcrumb.
        this.VoucherStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Promo',
                    },
                    {
                        title: 'Supplier Voucher',
                        keepCase: true,
                    },
                    {
                        title: 'Add Supplier Voucher',
                        keepCase: true,
                        active: true,
                    },
                ],
            })
        );

        // Memuat footer action.
        this.VoucherStore.dispatch(
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
                            active: false,
                        },
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/promos/voucher'
                        },
                    },
                },
            })
        );

        if (!environment.production) {
            this.watchFormStatuses();
            this.watchFormValues();
        }

        this.VoucherStore.dispatch(UiActions.showFooterAction());
        this.VoucherStore.dispatch(FormActions.resetFormStatus());
        this.VoucherStore.dispatch(FormActions.setFormStatusInvalid());
        this.VoucherStore.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
    }

    private watchFormStatuses(): void {
        this.generalInformationStatus$
            .pipe(
                tap((status) => HelperService.debug('generalInformationStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.layerStatus$.
            pipe(
                tap((status) => HelperService.debug('layerStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.conditionSettingsStatus$
            .pipe(
                tap((status) => HelperService.debug('conditionSettingsStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.benefitStatus$
            .pipe(
                tap((status) => HelperService.debug('benefitStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.eligibleProductStatus$
            .pipe(
                tap((status) => HelperService.debug('eligibleProductStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.eligibleStoreStatus$
            .pipe(
                tap((status) => HelperService.debug('eligibleStoreStatus$ CHANGED', status)),
                takeUntil(this.subs$)
            )
            .subscribe();
    }

    private watchFormValues(): void {
        this.generalInformationValue$
            .pipe(
                tap((value) => HelperService.debug('generalInformationValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.layerSettingValue$
            .pipe(
                tap((value) => HelperService.debug('layerSettingValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.conditionSettingsValue$
            .pipe(
                tap((value) => HelperService.debug('conditionSettingsValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.benefitValue$
            .pipe(
                tap((value) => HelperService.debug('benefitValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.eligibleProductValue$
            .pipe(
                tap((value) => HelperService.debug('eligibleProductValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();

        this.eligibleStoreValue$
            .pipe(
                tap((value) => HelperService.debug('eligibleStoreValue$ CHANGED', value)),
                takeUntil(this.subs$)
            )
            .subscribe();
    }

    private initSubscribeFormStatuses(): void {
        combineLatest([
            this.generalInformationStatus$,
            this.layerStatus$,
            this.conditionSettingsStatus$,
            this.eligibleProductStatus$,
            this.benefitStatus$,
            this.eligibleStoreStatus$,
        ])
            .pipe(
                tap((statuses) => HelperService.debug('COMBINED FORM STATUSES CHANGED', statuses)),
                takeUntil(this.subs$)
            )
            .subscribe((statuses) => {
                if (statuses.every((status) => status === 'VALID')) {
                    this.VoucherStore.dispatch(FormActions.setFormStatusValid());
                } else {
                    this.VoucherStore.dispatch(FormActions.setFormStatusInvalid());
                }
            });
    }

    private initHandleFormSubmission(): void {
        this.VoucherStore.select(FormSelectors.getIsClickSaveButton)
            .pipe(
                tap((click) =>
                    HelperService.debug('PERIOD TARGET PROMO ADD FORM CLICKED SAVE', click)
                ),
                filter((click) => !!click),
                withLatestFrom(this.VoucherStore.select(AuthSelectors.getUserSupplier)),
                takeUntil(this.subs$)
            )
            .subscribe(([click, userSupplier]) => {
                this.submitForm(userSupplier.supplierId);
            });
    }

    private submitForm(supplierId: string): void {
        const generalInformationValue = this.generalInformationValue$.value;
        const conditionSettingsValue = this.conditionSettingsValue$.value;
        const eligibleProductValue = this.eligibleProductValue$.value;
        const benefitValue = this.benefitValue$.value;
        const eligibleStoreValue = this.eligibleStoreValue$.value;
        const layerSettingValue = this.layerSettingValue$.value;

        console.log('layerSettingValue->', layerSettingValue)

        const payload: SupplierVoucherPayload = {
            // MASTER
            supplierId,
            status: 'active',
            // GENERAL INFORMATON
            externalId: generalInformationValue.externalId,
            voucherAllocationType: generalInformationValue.voucherAllocationType,
            name: generalInformationValue.name,
            voucherType: generalInformationValue.voucherType,
            voucherHeader: generalInformationValue.voucherHeader,
            category: generalInformationValue.category,
            termsAndConditions: generalInformationValue.termsAndConditions,
            instructions: generalInformationValue.instructions,
            platform: generalInformationValue.platform,
            maxCollectionPerStore: generalInformationValue.maxCollectionPerStore,
            voucherSlot: +generalInformationValue.voucherSlot,
            voucherBudget: +generalInformationValue.voucherBudget,
            imageUrl: generalInformationValue.imageUrl,
            startDate: generalInformationValue.startDate,
            endDate: generalInformationValue.endDate,
            expirationDays: generalInformationValue.expirationDays,
            description: generalInformationValue.description,
            shortDescription: generalInformationValue.shortDescription,
            voucherTag: generalInformationValue.voucherTag,
            code: generalInformationValue.code,
            // CONDITION SETTINGS
            base: eligibleProductValue.base === 'sku'
                    ? 'sku'
                    : eligibleProductValue.base === 'brand'
                    ? 'brand'
                    : eligibleProductValue.base === 'faktur'
                    ? 'invoiceGroup'
                    : 'unknown',
            dataBase: {},
            // ELIGIBLE PRODUCT SETTINGS
            conditionBase: conditionSettingsValue.base === 'qty'
                            ? 'qty'
                            : conditionSettingsValue.base === 'order-value'
                            ? 'value'
                            : 'unknown',
            // BENEFIT SETTINGS
            benefitType: benefitValue.base === 'amount'
                            ? 'amount'
                            : benefitValue.base === 'percent'
                            ? 'percent'
                            : 'unknown',
            // ELIGIBLE STORE SETTINGS
            target:
                eligibleStoreValue.segmentationBase === 'direct-store'
                    ? 'store'
                    : eligibleStoreValue.segmentationBase === 'segmentation'
                    ? 'segmentation'
                    : 'unknown',
            dataTarget: {},
        };

        if (payload.voucherAllocationType == 'voucher_budget') {
            payload.voucherSlot = null;
        } else if (payload.voucherAllocationType == 'voucher_slot'){
            payload.voucherBudget = null;
        } else if (payload.voucherAllocationType == 'none') {
            payload.voucherSlot = null;
            payload.voucherBudget = null;
        }

        if (payload.voucherType == 'direct') {
            payload.expirationDays = null;
            payload.maxCollectionPerStore = 1;
        }

        if (payload.voucherTag == '') {
            payload.voucherTag = [];
        }

        // Klasifikasi "dataBase" untuk Condition Settings.
        if (payload.base === 'sku') {
            payload.dataBase = {
                catalogueId: eligibleProductValue.chosenSku.map((sku) => sku.id),
            };
        } else if (payload.base === 'brand') {
            payload.dataBase = {
                brandId: eligibleProductValue.chosenBrand.map((brand) => brand.id),
            };
        } else if (payload.base === 'invoiceGroup') {
            payload.dataBase = {
                invoiceGroupId: eligibleProductValue.chosenFaktur.map((faktur) => faktur.id),
            };
        }

        // Klasifikasi "condition" untuk Eligible Product.
        if (payload.conditionBase === 'qty') {
            payload['conditionQty'] = conditionSettingsValue.qty;
        } else if (payload.conditionBase === 'value') {
            payload['conditionValue'] = conditionSettingsValue.orderValue;
        }

        // Klasifikasi "benefit" untuk Benefit Settings.
        if (payload.benefitType === 'amount') {
            payload['benefitRebate'] = benefitValue.rupiah;
            payload['benefitDiscount'] = null;
            payload['benefitMaxRebate'] = null;
        } else if (payload.benefitType === 'percent') {
            payload['benefitDiscount'] = benefitValue.percent;
            payload['benefitMaxRebate'] = benefitValue.benefitMaxRebate;
            payload['benefitRebate'] = null;
        }

        // Klasifikasi "dataTarget" untuk Eligible Store Settings.
        if (payload.target === 'store') {
            payload.dataTarget = {
                storeId: eligibleStoreValue.chosenStore.map(
                    (supplierStore) => supplierStore.id
                ),
            };
        } else if (payload.target === 'segmentation') {
            // payload.dataTarget = {
            //     warehouseId:
            //         eligibleStoreValue.chosenWarehouse.length === 0
            //             ? 'all'
            //             : eligibleStoreValue.chosenWarehouse.map(
            //                   (warehouse) => warehouse.id
            //               ),
            //     typeId:
            //         eligibleStoreValue.chosenStoreType.length === 0
            //             ? 'all'
            //             : eligibleStoreValue.chosenStoreType.map(
            //                   (storeType) => storeType.id
            //               ),
            //     groupId:
            //         eligibleStoreValue.chosenStoreGroup.length === 0
            //             ? 'all'
            //             : eligibleStoreValue.chosenStoreGroup.map(
            //                   (storeGroup) => storeGroup.id
            //               ),
            //     clusterId:
            //         eligibleStoreValue.chosenStoreCluster.length === 0
            //             ? 'all'
            //             : eligibleStoreValue.chosenStoreCluster.map(
            //                   (storeCluster) => storeCluster.id
            //               ),
            //     channelId:
            //         eligibleStoreValue.chosenStoreChannel.length === 0
            //             ? 'all'
            //             : eligibleStoreValue.chosenStoreChannel.map(
            //                   (storeChannel) => storeChannel.id
            //               ),
            // };
        }

        payload['layer'] = layerSettingValue.layer;
        payload['promoOwner'] = layerSettingValue.promoOwner;

        console.log('isi payload voucher->', payload)
        this.VoucherStore.dispatch(UiActions.hideFooterAction());

        this.VoucherStore.dispatch(
            VoucherActions.addSupplierVoucherRequest({
                payload,
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

        this.VoucherStore.dispatch(UiActions.hideFooterAction());
        this.VoucherStore.dispatch(UiActions.createBreadcrumb({ payload: null }));

        // Reset form status state
        this.VoucherStore.dispatch(FormActions.resetFormStatus());

        // Reset click reset button state
        this.VoucherStore.dispatch(FormActions.resetClickResetButton());

        // Reset click save button state
        this.VoucherStore.dispatch(FormActions.resetClickSaveButton());

        this.VoucherStore.dispatch(VoucherActions.resetSupplierVoucher());
    }
}
