import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Warehouse } from 'app/shared/components/dropdowns/single-warehouse/models';
import { SegmentChannelAutocomplete } from 'app/shared/components/segment-channel-autocomplete/models';
import { SegmentClusterAutocomplete } from 'app/shared/components/segment-cluster-autocomplete/models';
import { SegmentGroupAutocomplete } from 'app/shared/components/segment-group-autocomplete/models';
import { SegmentTypeAutocomplete } from 'app/shared/components/segment-type-autocomplete/models';
import { DefaultCheckbox } from 'app/shared/components/sinbad-filter/models';
import { FormMode } from 'app/shared/models';
import { IQueryParams, IQuerySearchParams } from 'app/shared/models/query.model';
import { CatalogueSegmentationModule } from '../catalogue-segmentation.module';
import { CatalogueSegmentationFilterDto } from '../models';

@Injectable({ providedIn: CatalogueSegmentationModule })
export class CatalogueSegmentationService {
    constructor() {}

    checkFormMode(page: 'form' | 'view', route: ActivatedRoute, router: Router): FormMode {
        const { id } = route.snapshot.params;

        switch (page) {
            case 'form':
                if (id && router.url.endsWith('edit')) {
                    return 'edit';
                } else if (router.url.endsWith('add')) {
                    return 'add';
                }

                return null;

            case 'view':
                if (id && router.url.endsWith('detail')) {
                    return 'view';
                }

                return null;

            default:
                return null;
        }
    }

    handleSearchGlobalFilter(
        paramsSearch: IQuerySearchParams[] = [],
        globalFilter: CatalogueSegmentationFilterDto
    ): IQuerySearchParams[] {
        if (globalFilter) {
            if (globalFilter.status) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'status',
                        keyword: globalFilter.status,
                    },
                ];
            }

            if (globalFilter.warehouseId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'warehouseId',
                        keyword: globalFilter.warehouseId,
                    },
                ];
            }

            if (globalFilter.typeId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'typeId',
                        keyword: globalFilter.typeId,
                    },
                ];
            }

            if (globalFilter.groupId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'groupId',
                        keyword: globalFilter.groupId,
                    },
                ];
            }

            if (globalFilter.channelId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'channelId',
                        keyword: globalFilter.channelId,
                    },
                ];
            }

            if (globalFilter.clusterId) {
                paramsSearch = [
                    ...paramsSearch,
                    {
                        fieldName: 'clusterId',
                        keyword: globalFilter.clusterId,
                    },
                ];
            }
        }

        return paramsSearch;
    }

    prepareSegmentChannelValue(value: SegmentChannelAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareSegmentClusterValue(value: SegmentClusterAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareSegmentGroupValue(value: SegmentGroupAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareSegmentTypeValue(value: SegmentTypeAutocomplete): number {
        if (typeof value !== 'object') {
            return null;
        }

        return value && value.hasOwnProperty('id') ? +value.id : null;
    }

    prepareStatusValue(
        status: DefaultCheckbox[],
        totalSource: number
    ): 'all' | 'active' | 'inactive' {
        if (status && status.length) {
            if (status.length === totalSource) {
                return 'all';
            }

            const statusId = status.length === 1 ? status.map((item) => item.id)[0] : null;

            switch (statusId) {
                case 'active':
                    return 'active';

                case 'inactive':
                    return 'inactive';

                default:
                    return null;
            }
        }

        return null;
    }

    prepareWarehouseValue(value: Warehouse): number {
        if (value instanceof Warehouse) {
            return +value.id;
        }

        return null;
    }
}
