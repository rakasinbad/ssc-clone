import { SegmentationBase } from 'app/shared/models/segmentation-base.model';

export interface SettingTargetDto {
    channelId?: number[];
    clusterId?: number[];
    groupId?: number[];
    storeId?: number[];
    typeId?: number[];
    warehouseId?: number[];
}

export interface SegmentSettingFormDto {
    dataTarget: SettingTargetDto;
    isActiveStore: boolean;
    isNewStore: boolean;
    target: SegmentationBase;
}
