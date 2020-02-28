import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromSkuAssignmentsCore from '../reducers';
import { fromSkuAssignments } from '../reducers';
import { Catalogue, TNullable } from 'app/shared/models';

// Get state from the feature key.
export const getSkuAssignmentsCoreState = createFeatureSelector<fromSkuAssignmentsCore.FeatureState, fromSkuAssignmentsCore.State>(fromSkuAssignmentsCore.featureKey);

export const {
    selectAll: selectAllSkuAssignments,
    selectEntities: selectSkuAssignmentsEntities,
    selectIds: selectSkuAssignmentsIds,
    selectTotal: selectSkuAssignmentsTotal
} = fromSkuAssignmentsCore.fromSkuAssignments.adapterSkuAssignments.getSelectors();

const getSkuAssignmentsState = createSelector(
    getSkuAssignmentsCoreState,
    state => state[fromSkuAssignments.FEATURE_KEY].skuAssignment
);

export const getSkuAssignmentsEntity = createSelector(
    getSkuAssignmentsState,
    selectSkuAssignmentsEntities
);

export const getSkuAssignmentsTotalEntity = createSelector(
    getSkuAssignmentsState,
    selectSkuAssignmentsTotal
);

export const getAllSkuAssignments = createSelector(getSkuAssignmentsState, selectAllSkuAssignments);

export const getSkuAssignmentsIds = createSelector(getSkuAssignmentsState, selectSkuAssignmentsIds);

export const getLoadingState = createSelector(getSkuAssignmentsState, state => state.isLoading);

// New SKU

export const {
    selectAll: selectAllNewCatalogueAssignments,
    selectEntities: selectNewCatalogueAssignmentsEntities,
    selectIds: selectNewCatalogueAssignmentsIds,
    selectTotal: selectNewCatalogueAssignmentsTotal
} = fromSkuAssignmentsCore.fromSkuAssignments.adapterNewCatalogue.getSelectors();

const getCatalogueNewStoreEntity = createSelector(
    getSkuAssignmentsCoreState,
    state => state[fromSkuAssignments.FEATURE_KEY].newSku
);

export const getCatalogueNewStoreIds = createSelector(
    getCatalogueNewStoreEntity,
    selectNewCatalogueAssignmentsIds
);

export const getCatalogueNewStore = createSelector(
    getCatalogueNewStoreEntity,
    getCatalogueNewStoreIds,
    (catalogues, ids) => catalogues[ids[0]] as TNullable<Catalogue>
);

export const getCatalogueNewStores = createSelector(
    getCatalogueNewStoreEntity,
    selectAllNewCatalogueAssignments
);

export const getTotalCatalogueNewStoreEntity = createSelector(
    getCatalogueNewStoreEntity,
    selectNewCatalogueAssignmentsTotal
);
