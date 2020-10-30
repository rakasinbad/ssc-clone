import {
    Component,
    OnInit,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    AfterViewInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import {
    SupplierVoucher,
    VoucherGeneralInformation as GeneralInformation,
    VoucherConditionSettings,
    VoucherEligibleProduct as EligibleProduct,
    VoucherBenefit as Benefit,
    VoucherSegmentationSettings as EligibleStore,
} from '../../models';
import { FeatureState as VoucherCoreState } from '../../store/reducers';
import { VoucherSelectors } from '../../store/selectors';
import { takeUntil, tap, withLatestFrom, map } from 'rxjs/operators';
// import { Router } from '@angular/router';
import { FormStatus, IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions, FormActions } from 'app/shared/store/actions';
import { FormSelectors } from 'app/shared/store/selectors';
import { VoucherActions } from '../../store/actions';
import { HelperService } from 'app/shared/helpers';
import { SupplierVoucherPayload } from '../../models/voucher.model';
import * as moment from 'moment';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'voucher-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VoucherDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    private subs$: Subject<void> = new Subject<void>();
    navigationSub$: Subject<void> = new Subject<void>();

    isLoading$: Observable<boolean>;

    // tslint:disable-next-line: no-inferrable-types
    section: string = 'general-information';

    formMode: IFormMode = 'view';
    // tslint:disable-next-line
    formValue:
        | Partial<SupplierVoucher>
        | Partial<GeneralInformation>
        | Partial<VoucherConditionSettings>
        | Partial<EligibleProduct>
        | Partial<Benefit>
        | Partial<EligibleStore>;

    selectedPromo$: Observable<SupplierVoucher>;

    @ViewChild('detail', { static: true, read: ElementRef }) promoDetailRef: ElementRef<
        HTMLElement
    >;

    constructor(
        // private router: Router,
        private cdRef: ChangeDetectorRef,
        private VoucherStore: NgRxStore<VoucherCoreState>
    ) {
        const breadcrumbs: Array<IBreadcrumbs> = [
            {
                title: 'Home',
            },
            {
                title: 'Promo',
            },
            {
                title: 'Voucher',
            },
            {
                title: 'Voucher Detail',
                active: true,
                keepCase: true,
            },
        ];

        this.VoucherStore.dispatch(
            UiActions.createBreadcrumb({
                payload: breadcrumbs,
            })
        );

        this.isLoading$ = combineLatest([
            this.VoucherStore.select(VoucherSelectors.getLoadingState),
        ]).pipe(
            map((loadingStates) => loadingStates.includes(true)),
            takeUntil(this.subs$)
        );

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
                            active: true,
                        },
                    },
                },
            })
        );

        this.VoucherStore.dispatch(FormActions.resetFormStatus());
        this.VoucherStore.dispatch(FormActions.setFormStatusInvalid());
        this.VoucherStore.dispatch(FormActions.setCancelButtonAction({ payload: 'CANCEL' }));
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
                this.VoucherStore.dispatch(FormActions.setFormStatusValid());
            } else {
                this.VoucherStore.dispatch(FormActions.setFormStatusInvalid());
            }
        }
    }

    onFormValueChanged(
        $event:
            | GeneralInformation
            | VoucherConditionSettings
            | EligibleProduct
            | Benefit
            | EligibleStore
    ): void {
        switch (this.section) {
            case 'general-information': {
                const {
                    id,
                    externalId,
                    name,
                    platform,
                    maxCollectionPerStore,
                    maxVoucherRedemption,
                    // budget,
                    startDate,
                    endDate,
                    description,
                    shortDescription,
                    // imageSuggestion,
                    // isAllowCombineWithVoucher,
                    // isFirstBuy,
                } = $event as GeneralInformation;

                this.formValue = {
                    id,
                    externalId,
                    name,
                    platform,
                    maxCollectionPerStore,
                    maxVoucherRedemption,
                    // budget,
                    startDate,
                    endDate,
                    description,
                    shortDescription,
                    // imageSuggestion,
                    // isAllowCombineWithVoucher,
                    // isFirstBuy,
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
                } = $event as EligibleProduct;

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
                    base,
                    qty,
                    orderValue
                } = $event as VoucherConditionSettings;

                this.formValue = {
                    id,
                    base,
                    qty,
                    orderValue
                };

                break;
            }
            case 'reward': {
                const {
                    id,
                    base,
                    percent,
                    rupiah
                } = $event as Benefit;

                this.formValue = {
                    id,
                    base,
                    percent,
                    rupiah
                };

                break;
            }
            case 'customer-segmentation': {
                const {
                    id,
                    segmentationBase,
                    chosenStore = [],
                    // chosenWarehouse = [],
                    // chosenStoreType = [],
                    // chosenStoreGroup = [],
                    // chosenStoreChannel = [],
                    // chosenStoreCluster = [],
                } = $event as EligibleStore;

                this.formValue = {
                    id,
                    segmentationBase,
                    chosenStore,
                    // chosenWarehouse,
                    // chosenStoreType,
                    // chosenStoreGroup,
                    // chosenStoreChannel,
                    // chosenStoreCluster,
                };

                break;
            }
        }
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 0:
                this.section = 'general-information';
                break;
            case 1:
                this.section = 'trigger';
                break;
            case 2:
                this.section = 'condition-benefit';
                break;
            case 3:
                this.section = 'reward';
                break;
            case 4:
                this.section = 'customer-segmentation';
                break;
        }
    }

    editCatalogue(): void {
        this.formMode = 'edit';

        this.VoucherStore.dispatch(UiActions.showFooterAction());
        this.VoucherStore.dispatch(FormActions.setFormStatusInvalid());
        this.VoucherStore.dispatch(FormActions.resetClickCancelButton());

        this.cdRef.markForCheck();
    }

    scrollTop(element: ElementRef<HTMLElement>): void {
        element.nativeElement.scrollTop = 0;
    }

    private processGeneralInformationForm(): void {
        const formValue = this.formValue as Partial<GeneralInformation>;

        const payload: Partial<SupplierVoucherPayload> = {
            externalId: formValue.externalId,
            name: formValue.name,
            platform: formValue.platform,
            maxCollectionPerStore: +formValue.maxCollectionPerStore,
            startDate: ((formValue.startDate as unknown) as moment.Moment).toISOString(),
            endDate: ((formValue.endDate as unknown) as moment.Moment).toISOString(),
            description: formValue.description,
            shortDescription: formValue.shortDescription,
        };

        this.VoucherStore.dispatch(
            VoucherActions.updateSupplierVoucherRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                },
            })
        );
    }

    private processVoucherConditionSettingsForm(): void {
        const formValue = this.formValue as Partial<EligibleProduct>;

        const payload: Partial<SupplierVoucherPayload> = {
            base:
                formValue.base === 'sku'
                    ? 'sku'
                    : formValue.base === 'brand'
                    ? 'brand'
                    : formValue.base === 'faktur'
                    ? 'invoice_group'
                    : 'unknown',
            dataBase: {},
        };

        // Klasifikasi "dataBase" untuk Trigger Information.
        if (payload.base === 'sku') {
            payload.dataBase = {
                catalogueId: formValue.chosenSku.map((sku) => sku.id),
            };
        } else if (payload.base === 'brand') {
            payload.dataBase = {
                brandId: formValue.chosenBrand.map((brand) => brand.id),
            };
        } else if (payload.base === 'invoice_group') {
            payload.dataBase = {
                invoiceGroupId: formValue.chosenFaktur.map((faktur) => faktur.id),
            };
        }

        this.VoucherStore.dispatch(
            VoucherActions.updateSupplierVoucherRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                },
            })
        );
    }

    private processEligibleProductForm(): void {
        const formValue = this.formValue as Partial<VoucherConditionSettings>;

        const payload: Partial<SupplierVoucherPayload> = {
            // CONDITION & BENEFIT SETTINGS
            conditionBase: formValue.base === 'order-value' ? 'value' : formValue.base
        };

        if (payload.conditionBase === 'qty') {
            payload.conditionQty = formValue.qty;
        } else if (payload.conditionBase === 'value') {
            payload.conditionValue = formValue.orderValue;
        }

        this.VoucherStore.dispatch(
            VoucherActions.updateSupplierVoucherRequest({
                payload: {
                    id: String(formValue.id),
                    data: payload,
                    source: 'detail-edit',
                },
            })
        );
    }

    private processEligibleStoreForm(): void {
        const formValue = this.formValue as Partial<EligibleStore>;

        const payload: Partial<SupplierVoucherPayload> = {
            target:
                formValue.segmentationBase === 'direct-store'
                    ? 'store'
                    : formValue.segmentationBase === 'segmentation'
                    ? 'segmentation'
                    : 'unknown',
            dataTarget: {},
        };

        // Klasifikasi "dataTarget" untuk Customer Segmentation Settings.
        if (payload.target === 'store') {
            payload.dataTarget = {
                storeId: formValue.chosenStore.map((supplierStore) => supplierStore.storeId),
            };
        } else if (payload.target === 'segmentation') {
            // payload.dataTarget = {
            //     warehouseId:
            //         formValue.chosenWarehouse.length === 0
            //             ? 'all'
            //             : formValue.chosenWarehouse.map((warehouse) => warehouse.id),
            //     typeId:
            //         formValue.chosenStoreType.length === 0
            //             ? 'all'
            //             : formValue.chosenStoreType.map((storeType) => storeType.id),
            //     groupId:
            //         formValue.chosenStoreGroup.length === 0
            //             ? 'all'
            //             : formValue.chosenStoreGroup.map((storeGroup) => storeGroup.id),
            //     clusterId:
            //         formValue.chosenStoreCluster.length === 0
            //             ? 'all'
            //             : formValue.chosenStoreCluster.map((storeCluster) => storeCluster.id),
            //     channelId:
            //         formValue.chosenStoreChannel.length === 0
            //             ? 'all'
            //             : formValue.chosenStoreChannel.map((storeChannel) => storeChannel.id),
            // };
        }

        this.VoucherStore.dispatch(
            VoucherActions.updateSupplierVoucherRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                },
            })
        );
    }

    private processRewardForm(): void {
        const formValue = this.formValue as Partial<Benefit>;

        const payload: Partial<SupplierVoucherPayload> = {
            benefitType: formValue.base,
        };

        if (payload.benefitType === 'amount') {
            payload['benefitRebate'] = formValue.rupiah;
        } else if (payload.benefitType === 'percent') {
            payload['benefitDiscount'] = formValue.percent;
        }

        this.VoucherStore.dispatch(
            VoucherActions.updateSupplierVoucherRequest({
                payload: {
                    id: formValue.id,
                    data: payload,
                    source: 'detail-edit',
                },
            })
        );
    }

    ngOnInit(): void {
        this.selectedPromo$ = this.VoucherStore.select(VoucherSelectors.getSelectedVoucher).pipe(
            tap((value) =>
                HelperService.debug(
                    '[PERIOD TARGET PROMO/DETAILS] GET SELECTED PERIOD TARGET PROMO',
                    value
                )
            ),
            takeUntil(this.subs$)
        );

        this.navigationSub$
            .pipe(withLatestFrom(this.selectedPromo$), takeUntil(this.subs$))
            .subscribe(([_, { id: catalogueId }]) => {
                this.formMode = 'edit';
                this.cdRef.markForCheck();
                // this.router.navigate([`/pages/catalogues/edit/${this.section}/${catalogueId}`]);
            });
    }

    ngAfterViewInit(): void {
        // Memeriksa status refresh untuk keperluan memuat ulang data yang telah di-edit.
        this.VoucherStore.select(VoucherSelectors.getRefreshStatus)
            .pipe(withLatestFrom(this.selectedPromo$), takeUntil(this.subs$))
            .subscribe(([needRefresh, catalogue]) => {
                if (needRefresh) {
                    this.formMode = 'view';

                    this.VoucherStore.dispatch(UiActions.hideFooterAction());
                    this.VoucherStore.dispatch(FormActions.resetClickCancelButton());
                    this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
                    this.VoucherStore.dispatch(VoucherActions.setRefreshStatus({ payload: false }));

                    this.VoucherStore.dispatch(
                        VoucherActions.fetchSupplierVoucherRequest({
                            payload: catalogue.id,
                        })
                    );

                    // Scrolled to top.
                    this.scrollTop(this.promoDetailRef);
                }
            });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "cancel".
        this.VoucherStore.select(FormSelectors.getIsClickCancelButton)
            .pipe(takeUntil(this.subs$))
            .subscribe((isClick) => {
                if (isClick) {
                    this.formMode = 'view';

                    this.VoucherStore.dispatch(UiActions.hideFooterAction());
                    this.VoucherStore.dispatch(FormActions.resetClickCancelButton());
                    this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
                }
            });

        // Memeriksa kejadian ketika adanya penekanan pada tombol "save".
        this.VoucherStore.select(FormSelectors.getIsClickSaveButton)
            .pipe(withLatestFrom(this.selectedPromo$), takeUntil(this.subs$))
            .subscribe(([isClick, _]) => {
                if (isClick) {
                    this.VoucherStore.dispatch(UiActions.hideFooterAction());

                    switch (this.section) {
                        case 'general-information': {
                            this.processGeneralInformationForm();
                            break;
                        }
                        case 'trigger': {
                            this.processVoucherConditionSettingsForm();
                            break;
                        }
                        case 'condition-benefit': {
                            this.processEligibleProductForm();
                            break;
                        }
                        case 'customer-segmentation': {
                            this.processEligibleStoreForm();
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

        this.VoucherStore.dispatch(VoucherActions.deselectSupplierVoucher());
        this.VoucherStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }
}
