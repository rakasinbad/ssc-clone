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
import { fuseAnimations } from '@fuse/animations';
import {
    StoreSegmentationChannel,
    StoreSegmentationCluster,
    StoreSegmentationGroup,
} from 'app/main/pages/catalogues/models';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { CardHeaderActionConfig } from 'app/shared/components/card-header/models/card-header.model';
import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models/warehouse.model';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { FormMode, FormStatus } from 'app/shared/models';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
    Catalogue,
    CatalogueSegmentation,
    CatalogueSegmentationFormDto,
    CreateCatalogueSegmentationDto,
} from '../../../models';

@Component({
    selector: 'app-catalogue-segmentation-form',
    templateUrl: './catalogue-segmentation-form.component.html',
    styleUrls: ['./catalogue-segmentation-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationFormComponent implements OnChanges, OnInit, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 my-16',
        title: {
            label: 'Table',
        },
        batchAction: {
            actions: [],
            show: false,
        },
        search: {
            active: true,
        },
    };

    clickUnassignAllSelection: boolean = false;
    isShowSelectAllCatalogueAction: boolean = false;
    isResetAllCatalogue: boolean = false;
    isSelectAllCatalogue: boolean = false;
    isSelectAllWarehouse: boolean = false;
    keyword: string = null;

    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Input()
    item: CatalogueSegmentation;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    createFormValue: EventEmitter<CreateCatalogueSegmentationDto> = new EventEmitter();

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) {
            if (changes['item'].currentValue && this.formMode === 'edit') {
                this._setEditForm(changes['item'].currentValue);
            }
        }
    }

    ngOnInit(): void {
        combineLatest([this.form.statusChanges, this.form.get('chosenCatalogue').valueChanges])
            .pipe(
                map(([status, chosenCatalogue]) => {
                    if (!chosenCatalogue || (chosenCatalogue && !chosenCatalogue.length)) {
                        return 'INVALID';
                    }

                    return status;
                }),
                takeUntil(this.unSubs$)
            )
            .subscribe((status: FormStatus) => {
                if (status === 'VALID') {
                    this._handleFormValue();
                }

                this.formStatus.emit(status);
            });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onActionSelected(action: CardHeaderActionConfig): void {
        switch (action.id) {
            case 'select-all':
                this.isSelectAllCatalogue = true;
                break;

            case 'reset-all':
                this.isResetAllCatalogue = true;
                break;

            case 'unassigned-all-selection':
                this.clickUnassignAllSelection = true;
                break;

            default:
                break;
        }
    }

    onCatalogueSelected(ev: Catalogue[] | 'all'): void {
        const chosenCatalogueCtrl = this.form.get('chosenCatalogue');

        chosenCatalogueCtrl.markAsDirty();
        chosenCatalogueCtrl.markAsTouched();

        if (!ev.length && ev !== 'all') {
            chosenCatalogueCtrl.setValue(null);
        } else {
            const newCatalogue: string[] | 'all' = ev === 'all' ? ev : ev.map((item) => item.id);

            chosenCatalogueCtrl.setValue(newCatalogue);
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

    onWarehouseSelected(ev: Warehouse[]): void {
        const chosenWarehouseCtrl = this.form.get('chosenWarehouse');

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

    onSelectAllWarehouse(ev: boolean): void {
        return;
    }

    onUpdateBatchActions({
        isShowBatchActions,
        totalItem,
    }: {
        isShowBatchActions: boolean;
        totalItem: number;
    }): void {
        let actions: CardHeaderActionConfig[] = [];

        if (isShowBatchActions) {
            if (this.formMode === 'add') {
                actions = [
                    {
                        id: 'select-all',
                        label: `Select all ${totalItem} product${totalItem > 1 ? 's' : ''}`,
                    },
                ];
            }

            if (this.formMode === 'edit') {
                actions = [
                    {
                        id: 'unassigned-all-selection',
                        label: 'Unassign',
                    },
                ];
            }

            actions = [
                ...actions,
                {
                    id: 'reset-all',
                    label: 'Reset Selection',
                },
            ];
        }

        this.cardHeaderConfig = {
            ...this.cardHeaderConfig,
            batchAction: {
                ...this.cardHeaderConfig.batchAction,
                actions,
                show: !!actions.length,
            },
        };
    }

    private _handleFormValue(): void {
        const {
            chosenCatalogue: catalogueIds,
            chosenStoreChannel,
            chosenStoreCluster,
            chosenStoreGroup,
            chosenStoreType,
            chosenWarehouse,
            segmentationName,
        } = this.form.getRawValue() as CatalogueSegmentationFormDto;

        // Store Channel
        const channelIds =
            chosenStoreChannel && chosenStoreChannel.length
                ? chosenStoreChannel.map((item) => item.id)
                : null;

        // Store Cluster
        const clusterIds =
            chosenStoreCluster && chosenStoreCluster.length
                ? chosenStoreCluster.map((item) => item.id)
                : null;

        // Store Group
        const groupIds =
            chosenStoreGroup && chosenStoreGroup.length
                ? chosenStoreGroup.map((item) => item.id)
                : null;

        // Store Type
        const typeIds =
            chosenStoreType && chosenStoreType.length
                ? chosenStoreType.map((item) => item.id)
                : null;

        // Warehouse
        const warehouseIds =
            chosenWarehouse && chosenWarehouse.length && chosenWarehouse.map((item) => item.id);

        // Segmentation Name
        const name = segmentationName && segmentationName.trim();

        if (this.formMode === 'add') {
            const payload: CreateCatalogueSegmentationDto = {
                catalogueIds,
                channelIds,
                clusterIds,
                groupIds,
                name,
                supplierId: null,
                typeIds,
                warehouseIds,
            };

            this.createFormValue.emit(payload);
        }

        // else if (this.formMode === 'edit') {
        //     const payload = {};
        // }
    }

    private _setEditForm(item: CatalogueSegmentation): void {
        if (this.form) {
            const segmentationNameCtrl = this.form.get('segmentationName');
            const warehouseCtrl = this.form.get('chosenWarehouse');
            const storeTypeCtrl = this.form.get('chosenStoreType');
            const storeGroupCtrl = this.form.get('chosenStoreGroup');
            const storeChannelCtrl = this.form.get('chosenStoreChannel');
            const storeClusterCtrl = this.form.get('chosenStoreCluster');

            // Segmentation Name
            if (item.name) {
                segmentationNameCtrl.setValue(item.name);
            }

            segmentationNameCtrl.disable({ onlySelf: true });

            // Warehouse
            if (item.warehouses && item.warehouses.length) {
                const newWarehouses: Selection[] = item.warehouses.map((warehouse) => ({
                    id: warehouse.id,
                    label: warehouse.name,
                    group: 'warehouses',
                }));

                warehouseCtrl.setValue(newWarehouses);
            }

            warehouseCtrl.disable({ onlySelf: true });

            // Store Type
            if (item.types && item.types.length) {
                const newStoreTypes: Selection[] = item.types.map((type) => ({
                    id: type.id,
                    label: type.name,
                    group: 'store-segmentation-types',
                }));

                storeTypeCtrl.setValue(newStoreTypes);
            }

            storeTypeCtrl.disable({ onlySelf: true });

            // Store Group
            if (item.groups && item.groups.length) {
                const newStoreGroups: Selection[] = item.groups.map((group) => ({
                    id: group.id,
                    label: group.name,
                    group: 'store-segmentation-groups',
                }));

                storeGroupCtrl.setValue(newStoreGroups);
            }

            storeGroupCtrl.disable({ onlySelf: true });

            // Store Channel
            if (item.channels && item.channels.length) {
                const newStoreChannels = item.channels.map((channel) => ({
                    id: channel.id,
                    label: channel.name,
                    group: 'store-segmentation-channels',
                }));

                storeChannelCtrl.setValue(newStoreChannels);
            }

            storeChannelCtrl.disable({ onlySelf: true });

            // Store Cluster
            if (item.clusters && item.clusters.length) {
                const newStoreClusters: Selection[] = item.clusters.map((cluster) => ({
                    id: cluster.id,
                    label: cluster.name,
                    group: 'store-segmentation-clusters',
                }));

                storeClusterCtrl.setValue(newStoreClusters);
            }

            storeClusterCtrl.disable({ onlySelf: true });
        }
    }
}
