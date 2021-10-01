import { createFeatureSelector, createSelector } from '@ngrx/store';
import { returnsReducer } from '../reducers';

export const getReturnState = createFeatureSelector<returnsReducer.State>(returnsReducer.FEATURE_KEY);

export const getAllReturn = createSelector(getReturnState, returnsReducer.selectAllReturn);
export const getTotalReturn = createSelector(getReturnState, (state) => state.returns.total);

export const getIsLoading = createSelector(getReturnState, (state) => state.isLoading);
export const getIsRefresh = createSelector(getReturnState, (state) => state.isRefresh);

export const getTotalStatus = createSelector(getReturnState,
    (state) => state.returns.totalStatus);

export const getReturnEntities = createSelector(getReturnState,
    returnsReducer.selectReturnEntities);

export const getActiveReturnId = createSelector(getReturnState,
    (state) => state.returns.selectedReturnId);

export const getActiveReturnDetail = createSelector(
    getReturnEntities,
    getActiveReturnId,
    (entities, id) => entities[id]
);
