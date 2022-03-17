import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { StoreSegmentationChannel, StoreSegmentationCluster, StoreSegmentationGroup } from 'app/main/pages/catalogues/models';
// import { Warehouse } from 'app/main/pages/logistics/warehouses/models';
import { StoreSegmentationType } from 'app/shared/components/dropdowns/store-segmentation-2/models';
import { Selection } from 'app/shared/components/multiple-selection/models';
import { FormMode, FormStatus } from 'app/shared/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatalogueSegmentation, CatalogueSegmentationFormDto, PatchCatalogueSegmentationInfoDto } from '../../../models';

@Component({
    selector: 'app-catalogue-segmentation-information-form',
    templateUrl: './catalogue-segmentation-information-form.component.html',
    styleUrls: ['./catalogue-segmentation-information-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationInformationFormComponent implements OnChanges, OnInit, OnDestroy {
    @Input()
    form: FormGroup;

    @Input()
    formMode: FormMode;

    @Input()
    item: CatalogueSegmentation;

    @Input()
    isLoading: boolean;

    @Output()
    formStatus: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    updateFormValue: EventEmitter<PatchCatalogueSegmentationInfoDto> = new EventEmitter();

    private unSubs$: Subject<any> = new Subject();

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['item']) {
            if (changes['item'].currentValue && this.formMode === 'edit') {
                this._setEditForm(changes['item'].currentValue);
            }
        }
    }

    ngOnInit(): void {
        this.form.statusChanges.pipe(takeUntil(this.unSubs$)).subscribe({
            next: (status: FormStatus) => {
                if (status === 'VALID') {
                    this._handleFormValue();
                }

                this.formStatus.emit(status);
            },
        });
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onStoreChannelSelected(ev: StoreSegmentationChannel[]): void {
        const chosenStoreChannelCtrl = this.form.get('chosenStoreChannel');

        chosenStoreChannelCtrl.markAsDirty();
        chosenStoreChannelCtrl.markAsTouched();

        if (!ev.length) {
            chosenStoreChannelCtrl.setValue(null);
        } else {
            const newStoreChannels: Selection[] = ev
                .map(
                    (item) =>
                        typeof item !== 'undefined' && {
                            id: item.id,
                            label: item.name,
                            group: 'store-segmentation-channels',
                        }
                )
                .filter((item) => !!item);

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
            const newStoreClusters: Selection[] = ev
                .map(
                    (item) =>
                        typeof item && {
                            id: item.id,
                            label: item.name,
                            group: 'store-segmentation-clusters',
                        }
                )
                .filter((item) => !!item);

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
            const newStoreGroups: Selection[] = ev
                .map(
                    (item) =>
                        typeof item !== 'undefined' && {
                            id: item.id,
                            label: item.name,
                            group: 'store-segmentation-groups',
                        }
                )
                .filter((item) => !!item);

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
            const newStoreTypes: Selection[] = ev
                .map(
                    (item) =>
                        typeof item !== 'undefined' && {
                            id: item.id,
                            label: item.name,
                            group: 'store-segmentation-types',
                        }
                )
                .filter((item) => !!item);

            chosenStoreTypeCtrl.setValue(newStoreTypes);
        }
    }

    onWarehouseSelected(ev: any[]): void {
        const chosenWarehouseCtrl = this.form.get('chosenWarehouse');

        chosenWarehouseCtrl.markAsDirty();
        chosenWarehouseCtrl.markAsTouched();

        if (!ev.length) {
            chosenWarehouseCtrl.setValue(null);
        } else {
            const newWarehouses: Selection[] = ev
                .map(
                    (item) =>
                        typeof item !== 'undefined' && {
                            id: item.id,
                            label: item.name,
                            group: 'warehouses',
                        }
                )
                .filter((item) => !!item);

            chosenWarehouseCtrl.setValue(newWarehouses);
        }
    }

    onSelectAllWarehouse(ev: boolean): void {
        return;
    }

    private _handleFormValue(): void {
        const {
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
                : [];

        // Store Cluster
        const clusterIds =
            chosenStoreCluster && chosenStoreCluster.length
                ? chosenStoreCluster.map((item) => item.id)
                : [];

        // Store Group
        const groupIds =
            chosenStoreGroup && chosenStoreGroup.length
                ? chosenStoreGroup.map((item) => item.id)
                : [];

        // Store Type
        const typeIds =
            chosenStoreType && chosenStoreType.length ? chosenStoreType.map((item) => item.id) : [];

        // Warehouse
        const warehouseIds =
            chosenWarehouse && chosenWarehouse.length ? chosenWarehouse.map((item) => item.id) : [];

        // Segmentation Name
        const name = segmentationName && segmentationName.trim();

        if (this.formMode === 'edit') {
            const payload: any = {
                channelIds,
                clusterIds,
                groupIds,
                name,
                typeIds,
                warehouseIds,
            };

            this.updateFormValue.emit(payload);
        }
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

            // Warehouse
            if (item.warehouses && item.warehouses.length) {
                const newWarehouses: Selection[] = item.warehouses.map((warehouse) => ({
                    id: warehouse.id,
                    label: warehouse.name,
                    group: 'warehouses',
                }));

                warehouseCtrl.setValue(newWarehouses);
            }

            // Store Type
            if (item.types && item.types.length) {
                const newStoreTypes: Selection[] = item.types.map((type) => ({
                    id: type.id,
                    label: type.name,
                    group: 'store-segmentation-types',
                }));

                storeTypeCtrl.setValue(newStoreTypes);
            }

            // Store Group
            if (item.groups && item.groups.length) {
                const newStoreGroups: Selection[] = item.groups.map((group) => ({
                    id: group.id,
                    label: group.name,
                    group: 'store-segmentation-groups',
                }));

                storeGroupCtrl.setValue(newStoreGroups);
            }

            // Store Channel
            if (item.channels && item.channels.length) {
                const newStoreChannels = item.channels.map((channel) => ({
                    id: channel.id,
                    label: channel.name,
                    group: 'store-segmentation-channels',
                }));

                storeChannelCtrl.setValue(newStoreChannels);
            }

            // Store Cluster
            if (item.clusters && item.clusters.length) {
                const newStoreClusters: Selection[] = item.clusters.map((cluster) => ({
                    id: cluster.id,
                    label: cluster.name,
                    group: 'store-segmentation-clusters',
                }));

                storeClusterCtrl.setValue(newStoreClusters);
            }
        }
    }
}
