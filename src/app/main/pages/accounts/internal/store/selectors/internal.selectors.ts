import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromInternal } from '../reducers';

export const getInternalEmployeeState = createFeatureSelector<fromInternal.State>(
    fromInternal.FEATURE_KEY
);

export const getAllInternalEmployee = createSelector(
    getInternalEmployeeState,
    fromInternal.selectAllInternalEmployees
);

export const getInternalEmployeeEntities = createSelector(
    getInternalEmployeeState,
    fromInternal.selectInternalEmployeeEntities
);

export const getTotalInternalEmployeeEntity = createSelector(
    getInternalEmployeeState,
    fromInternal.selectInternalEmployeesTotal
);

export const getTotalInternalEmployee = createSelector(
    getInternalEmployeeState,
    state => state.internalEmployees.total
);

export const getSelectedInternalEmployeeId = createSelector(
    getInternalEmployeeState,
    state => state.selectedInternalEmployeeId
);

export const getSelectedInternalEmployee = createSelector(
    getInternalEmployeeEntities,
    getSelectedInternalEmployeeId,
    (internalEmployeeEntities, internalEmployeeId) => internalEmployeeEntities[internalEmployeeId]
);

export const getSelectedInternalEmployeeInfo = createSelector(
    getInternalEmployeeState,
    state => state.internalEmployee
);

export const getIsRefresh = createSelector(
    getInternalEmployeeState,
    state => state.isRefresh
);

export const getIsLoading = createSelector(
    getInternalEmployeeState,
    state => state.isLoading
);
