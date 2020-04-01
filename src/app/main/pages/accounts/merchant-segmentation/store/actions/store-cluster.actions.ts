import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import {
    PayloadStoreCluster,
    PayloadStoreClusterPatch,
    StoreCluster,
    StoreSegment,
    StoreSegmentTree
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Store Clusters
// -----------------------------------------------------------------------------------------------------

export const fetchStoreClustersRequest = createAction(
    '[Store Segmentation] Fetch Store Clusters Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreClustersFailure = createAction(
    '[Store Segmentation] Fetch Store Clusters Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreClustersSuccess = createAction(
    '[Store Segmentation] Fetch Store Clusters Success',
    props<{ payload: StoreSegment<StoreCluster> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Last Cluster
// -----------------------------------------------------------------------------------------------------

export const fetchStoreLastClusterRequest = createAction(
    '[Store Segmentation] Fetch Store Last Cluster Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoreLastClusterFailure = createAction(
    '[Store Segmentation] Fetch Store Last Cluster Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchStoreLastClusterSuccess = createAction(
    '[Store Segmentation] Fetch Store Last Cluster Success',
    props<{ payload: { data: Array<StoreSegmentTree>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Refresh Store Clusters
// -----------------------------------------------------------------------------------------------------

export const refreshStoreClustersRequest = createAction(
    '[Store Segmentation] Refresh Store Clusters Request',
    props<{ payload: IQueryParams }>()
);

export const refreshStoreClustersFailure = createAction(
    '[Store Segmentation] Refresh Store Clusters Failure',
    props<{ payload: ErrorHandler }>()
);

export const refreshStoreClustersSuccess = createAction(
    '[Store Segmentation] Refresh Store Clusters Success',
    props<{ payload: StoreSegment<StoreCluster> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE] Store Cluster
// -----------------------------------------------------------------------------------------------------

export const createStoreClusterRequest = createAction(
    '[Store Segmentation] Create Store Cluster Request',
    props<{ payload: PayloadStoreCluster }>()
);

export const createStoreClusterFailure = createAction(
    '[Store Segmentation] Create Store Cluster Failure',
    props<{ payload: ErrorHandler }>()
);

export const createStoreClusterSuccess = createAction(
    '[Store Segmentation] Create Store Cluster Success'
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Store Cluster
// -----------------------------------------------------------------------------------------------------

export const updateStoreClusterRequest = createAction(
    '[Store Segmentation] Update Store Cluster Request',
    props<{ payload: { body: PayloadStoreClusterPatch; id: string } }>()
);

export const updateStoreClusterFailure = createAction(
    '[Store Segmentation] Update Store Cluster Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateStoreClusterSuccess = createAction(
    '[Store Segmentation] Update Store Cluster Success'
);

export const clearState = createAction('[Store Segmentation] Reset Store Clusters Core State');

export const clearTableState = createAction(
    '[Store Segmentation] Reset Store Last Cluster Core State'
);

export type FailureActions =
    | 'fetchStoreClustersFailure'
    | 'fetchStoreLastClusterFailure'
    | 'refreshStoreClustersFailure'
    | 'createStoreClusterFailure'
    | 'updateStoreClusterFailure';
