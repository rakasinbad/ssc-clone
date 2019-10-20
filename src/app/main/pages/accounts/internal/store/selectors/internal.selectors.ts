import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromInternal } from '../reducers';

export const getInternalState = createFeatureSelector<fromInternal.State>(fromInternal.FEATURE_KEY);

export const getAllInternal = createSelector(
    getInternalState,
    fromInternal.selectAllInternals
);

export const getInternalEntities = createSelector(
    getInternalState,
    fromInternal.selectInternalEntities
);

export const getTotalInternalEntity = createSelector(
    getInternalState,
    fromInternal.selectInternalsTotal
);

export const getTotalInternal = createSelector(
    getInternalState,
    state => state.internals.total
);

export const getSelectedInternalId = createSelector(
    getInternalState,
    state => state.selectedInternalId
);

export const getSelectedInternal = createSelector(
    getInternalEntities,
    getSelectedInternalId,
    (internalEntities, internalId) => internalEntities[internalId]
);
