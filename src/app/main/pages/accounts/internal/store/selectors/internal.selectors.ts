import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromInternal } from '../reducers';

export const getInternalEmployeeState = createFeatureSelector<fromInternal.State>(
    fromInternal.FEATURE_KEY
);

// -----------------------------------------------------------------------------------------------------
// Internal Employees State
// -----------------------------------------------------------------------------------------------------

export const getAllInternalEmployee = createSelector(
    getInternalEmployeeState,
    fromInternal.selectAllInternalEmployee
);

export const getInternalEmployeeEntities = createSelector(
    getInternalEmployeeState,
    fromInternal.selectInternalEmployeeEntities
);

export const getInternalEmployeeIds = createSelector(
    getInternalEmployeeState,
    fromInternal.selectInternalEmployeeIds
);

export const getTotalInternalEmployeeEntity = createSelector(
    getInternalEmployeeState,
    fromInternal.selectInternalEmployeeTotal
);

export const getTotalInternalEmployee = createSelector(
    getInternalEmployeeState,
    state => state.internalEmployees.total
);

export const getSelectedInternalEmployeeId = createSelector(
    getInternalEmployeeState,
    state => state.internalEmployees.selectedEmployeeId
);

export const getSelectedInternalEmployee = createSelector(
    getInternalEmployeeEntities,
    getSelectedInternalEmployeeId,
    (entities, id) => entities[id]
);

// -----------------------------------------------------------------------------------------------------
// Internal mployee State
// -----------------------------------------------------------------------------------------------------

export const getInternalEmployee = createSelector(
    getInternalEmployeeState,
    state => state.internalEmployee
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getInternalEmployeeState, state => state.isRefresh);

export const getIsLoading = createSelector(getInternalEmployeeState, state => state.isLoading);
