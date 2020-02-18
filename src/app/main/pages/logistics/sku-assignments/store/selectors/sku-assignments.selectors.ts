import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromSkuAssignments } from '../reducers';

// Get state from the feature key.
export const getSkuAssignmentsState = createFeatureSelector<fromSkuAssignments.SkuAssignmentsState>(fromSkuAssignments.FEATURE_KEY);

export const {
    selectAll: selectAllSkuAssignments,
    selectEntities: selectSkuAssignmentsEntities,
    selectIds: selectSkuAssignmentsIds,
    selectTotal: selectSkuAssignmentsTotal
} = fromSkuAssignments.adapterSkuAssignments.getSelectors();

export const getSkuAssignmentsEntity = createSelector(
    getSkuAssignmentsState,
    selectSkuAssignmentsEntities
);

export const getSkuAssignmentsTotalEntity = createSelector(
    getSkuAssignmentsState,
    selectSkuAssignmentsTotal
);

export const getAllSkuAssignments = createSelector(
    getSkuAssignmentsState,
    selectAllSkuAssignments
);

export const getSkuAssignmentsIds = createSelector(
    getSkuAssignmentsState,
    selectSkuAssignmentsIds
);

export const getLoadingState = createSelector(
    getSkuAssignmentsState,
    state => state.isLoading
);
