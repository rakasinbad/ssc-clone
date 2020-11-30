import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import {
    StoreSegmentationChannel,
    StoreSegmentationCluster,
    StoreSegmentationGroup,
} from 'app/main/pages/catalogues/models';
// import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models/warehouse.model';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { ErrorMessageService, NoticeService } from 'app/shared/helpers';
import { FormMode, FormStatus, SpecifiedTarget } from 'app/shared/models';
import { SegmentationBasePromo } from 'app/shared/models/segmentation-base.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SegmentSettingFormDto, SettingTargetDto } from '../../../models';
import { CrossSellingPromoFormService } from '../../../services';

@Component({
    selector: 'app-cross-selling-promo-segment-setting-form',
    templateUrl: './cross-selling-promo-segment-setting-form.component.html',
    styleUrls: ['./cross-selling-promo-segment-setting-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingPromoSegmentSettingFormComponent implements OnInit, OnChanges, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    segmentationBasePromo: { id: SegmentationBasePromo; label: string }[];
    specifiedTarget: { id: SpecifiedTarget; label: string }[];
    segmentBasePromo = SegmentationBasePromo;
    specifiedTargetType = SpecifiedTarget;

    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Input() fakturId: string;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValue: EventEmitter<SegmentSettingFormDto> = new EventEmitter();

    public storeTypeSelectAll: string;
    public storeTypeLength: number;
    public storeGroupSelectAll: string;
    public storeGroupLength: number;
    public storeChannelSelectAll: string;
    public storeChannelLength: number;
    public storeClusterSelectAll: string;
    public storeClusterLength: number;
    message:any;
    segmentBases: string;
    selectFaktur: string;
    public typePromo = 'crossSelling';

    constructor(
        private crossSellingPromoFormService: CrossSellingPromoFormService,
        private errorMessageService: ErrorMessageService,
        private noticeService: NoticeService
    ) {}

    ngOnInit(): void {
        this.segmentationBasePromo = this.crossSellingPromoFormService.segmentationBasePromo;
        this.specifiedTarget = this.crossSellingPromoFormService.specifiedTarget;

        this.segmentBases = 'segmentation';
        this.form.statusChanges.pipe(takeUntil(this.unSubs$)).subscribe((status: FormStatus) => {
            if (status === 'VALID') {
                this._handleFormValue();
            }

            this.formStatus.emit(status);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('fakturId->', changes['fakturId'])
        if (changes['fakturId']) {
            this.selectFaktur = changes['fakturId'].currentValue;
        }

        if (changes['form']) {
            if (changes['form'].firstChange) {
                const status: FormStatus = this.form.valid
                    ? 'VALID'
                    : this.form.invalid
                    ? 'INVALID'
                    : 'PENDING';

                if (status === 'VALID') {
                    this._handleFormValue();
                }

                this.formStatus.emit(status);
            }
        }
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onChangeSegmentBase(ev: MatRadioChange): void {
        switch (ev.value) {
            case SegmentationBasePromo.SEGMENTATION:
                this._setSpecifiedTargetValidation();
                this.segmentBases = this.form.get('specifiedTarget').value;
                break;

            case SegmentationBasePromo.ALLSEGMENTATION:
                this._setSpecifiedTargetValidation();
                this.segmentBases = this.form.get('specifiedTarget').value;
                break;

            case SegmentationBasePromo.STORE:
                this._clearSpecifiedTargetValidation();
                break;

            default:
                this.noticeService.open('Sorry, unknown segmentation base!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
                return;
        }
    }

    /**
     *
     * Handle change event for All Segmentation
     * @output bring value store type
     * @param {event} 
     * @returns {void}
     * @memberof Cross Selling Promo Segmentation Setting
     */
    dataValueStore(value): void {
        let storeTypeValue = value.data[0];
        this.storeTypeLength = value.total;
        if (value.total > 1) {
            this.storeTypeSelectAll = storeTypeValue.name + ' (+'+(this.storeTypeLength - 1)+' others)';
        } else {
            this.storeTypeSelectAll = storeTypeValue.name;
        }
    }

       /**
     *
     * Handle change event for All Segmentation
     * @output bring value store group
     * @param {event} 
     * @returns {void}
     * @memberof Cross Selling Promo Segmentation Setting
     */
    dataValueGroup(value): void {
        let storeGroupValue = value.data[0];
        this.storeGroupLength = value.total;
        if (value.total > 1) {
            this.storeGroupSelectAll = storeGroupValue.name + ' (+'+(this.storeGroupLength - 1)+' others)';
        } else {
            this.storeGroupSelectAll = storeGroupValue.name;
        }
    }

      /**
     *
     * Handle change event for All Segmentation
     * @output bring value store channel
     * @param {event} 
     * @returns {void}
     * @memberof Cross Selling Promo Segmentation Setting
     */
    dataValueChannel(value): void {
        let storeChannelValue = value.data[0];
        this.storeChannelLength = value.total;
        if (value.total > 1) {
            this.storeChannelSelectAll = storeChannelValue.name + ' (+'+(this.storeChannelLength - 1)+' others)';
        } else {
            this.storeChannelSelectAll = storeChannelValue.name;
        }
    }

    /**
     *
     * Handle change event for All Segmentation
     * @output bring value store cluster
     * @param {event} 
     * @returns {void}
     * @memberof Cross Selling Promo Segmentation Setting
     */
    dataValueCluster(value): void {
        let storeClusterValue = value.data[0];
        this.storeClusterLength = value.total;
        if (value.total > 1) {
            this.storeClusterSelectAll = storeClusterValue.name + ' (+'+(this.storeClusterLength - 1)+' others)';
        } else {
            this.storeClusterSelectAll = storeClusterValue.name;
        }
    }

    onStoreSelected(ev: SupplierStore[]): void {
        const chosenStoreCtrl = this.form.get('chosenStore');

        chosenStoreCtrl.markAsDirty();
        chosenStoreCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreCtrl.setValue(null);
        } else {
            const newStores: Selection[] = ev.map((item) => ({
                id: item.store.id,
                label: item.store.name,
                group: 'supplier-stores',
            }));

            chosenStoreCtrl.setValue(newStores);
        }
    }

    onStoreChannelSelected(ev: StoreSegmentationChannel[]): void {
        const chosenStoreChannelCtrl = this.form.get('chosenStoreChannel');

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
        const chosenStoreClusterCtrl = this.form.get('chosenStoreCluster');

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
        const chosenStoreGroupCtrl = this.form.get('chosenStoreGroup');

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
        const chosenStoreTypeCtrl = this.form.get('chosenStoreType');

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

    // onWarehouseSelected(ev: Warehouse[]): void {
    //     const chosenWarehouseCtrl = this.form.get('chosenWarehouse');

    //     chosenWarehouseCtrl.markAsDirty();
    //     chosenWarehouseCtrl.markAsTouched();

    //     if (!ev.length) {
    //         chosenWarehouseCtrl.setValue(null);
    //     } else {
    //         const newWarehouses: Selection[] = ev.map((item) => ({
    //             id: item.id,
    //             label: item.name,
    //             group: 'warehouses',
    //         }));

    //         chosenWarehouseCtrl.setValue(newWarehouses);
    //     }
    // }

    private _handleFormValue(): void {
        const {
            chosenStore,
            chosenStoreChannel,
            chosenStoreCluster,
            chosenStoreGroup,
            chosenStoreType,
            chosenWarehouse,
            segmentationBasePromo,
            specifiedTarget,
        } = this.form.getRawValue();

        const payload: SegmentSettingFormDto = {
            dataTarget: {},
            target: this.form.get('segmentationBase').value,
            isNewStore: specifiedTarget === SpecifiedTarget.NEW_STORE,
            isActiveStore: specifiedTarget === SpecifiedTarget.ACTIVE_STORE,
        };

        switch (payload['target']) {
            case SegmentationBasePromo.SEGMENTATION:

                payload['dataTarget'] = this._payloadTypeSegment(payload['dataTarget'], {
                    chosenStoreChannel,
                    chosenStoreCluster,
                    chosenStoreGroup,
                    chosenStoreType,
                });
                break;

                case SegmentationBasePromo.ALLSEGMENTATION:
                    payload['dataTarget'] = this._payloadTypeSegment(payload['dataTarget'], {
                        chosenStoreChannel,
                        chosenStoreCluster,
                        chosenStoreGroup,
                        chosenStoreType,
                    });
                    break;

            case SegmentationBasePromo.STORE:
                payload['dataTarget'] = this._payloadTypeDirectStore(payload['dataTarget'], {
                    chosenStore,
                });
                break;

            // default:
            //     this.noticeService.open('Sorry, unknown segmentation base!', 'error', {
            //         verticalPosition: 'bottom',
            //         horizontalPosition: 'right',
            //     });
            //     return;
        }
        this.formValue.emit(payload);
    }

    private _payloadTypeSegment(payload: SettingTargetDto, body: any): SettingTargetDto {
        delete payload['chosenStore'];

        const {
            chosenStoreChannel,
            chosenStoreCluster,
            chosenStoreGroup,
            chosenStoreType,
            // chosenWarehouse,
        } = body;

        // // Warehouse
        // const newWarehouse =
        //     chosenWarehouse && chosenWarehouse.length
        //         ? chosenWarehouse.map((item: Selection) => +item.id)
        //         : [];
        // payload['warehouseId'] = newWarehouse;

        // Store Type
        const newStoreType =
            chosenStoreType && chosenStoreType.length
                ? chosenStoreType.map((item: Selection) => +item.id)
                : [];
        payload['typeId'] = newStoreType;

        // Store Group
        const newStoreGroup =
            chosenStoreGroup && chosenStoreGroup.length
                ? chosenStoreGroup.map((item: Selection) => +item.id)
                : [];
        payload['groupId'] = newStoreGroup;

        // Store Channel
        const newStoreChannel =
            chosenStoreChannel && chosenStoreChannel.length
                ? chosenStoreChannel.map((item: Selection) => +item.id)
                : [];
        payload['channelId'] = newStoreChannel;

        // Store Cluster
        const newStoreCluster =
            chosenStoreCluster && chosenStoreCluster.length
                ? chosenStoreCluster.map((item: Selection) => +item.id)
                : [];
        payload['clusterId'] = newStoreCluster;

        return payload;
    }

    private _payloadTypeDirectStore(payload: SettingTargetDto, body: any): SettingTargetDto {
        delete payload['warehouseId'];
        delete payload['typeId'];
        delete payload['groupId'];
        delete payload['channelId'];
        delete payload['clusterId'];

        const { chosenStore } = body;

        // Store
        const newStore =
            chosenStore && chosenStore.length ? chosenStore.map((item: Selection) => +item.id) : [];
        payload['storeId'] = newStore;

        return payload;
    }

    private _setSpecifiedTargetValidation(): void {
        this.form.get('specifiedTarget').setValidators(
            RxwebValidators.required({
                message: this.errorMessageService.getErrorMessageNonState('default', 'required'),
            })
        );
        this.form.get('specifiedTarget').updateValueAndValidity();
    }

    private _clearSpecifiedTargetValidation(): void {
        this.form.get('specifiedTarget').clearValidators();
        this.form.get('specifiedTarget').updateValueAndValidity();
    }
}
