import { createFeatureSelector, createSelector } from '@ngrx/store';
import { returnsReducer } from '../reducers';

export const getReturnState = createFeatureSelector<returnsReducer.State>(returnsReducer.FEATURE_KEY);

export const getAllReturn = createSelector(getReturnState, returnsReducer.selectAllReturn);
export const getTotalReturn = createSelector(getReturnState, (state) => state.returns.total);

export const getIsLoading = createSelector(getReturnState, (state) => state.isLoading);
export const getIsRefresh = createSelector(getReturnState, (state) => state.isRefresh);

export const getTotalStatusState = createSelector(getReturnState, (state) => state.returns.totalStatus);

export const getTotalStatusReturn = createSelector(getTotalStatusState, (state) => state.totalReturn);
export const getTotalStatusPending = createSelector(getTotalStatusState, (state) => state.totalPending);
export const getTotalStatusApproved = createSelector(getTotalStatusState, (state) => state.totalApproved);
export const getTotalStatusApprovedReturned = createSelector(
    getTotalStatusState,
    (state) => state.totalApprovedReturned
);
export const getTotalStatusClosed = createSelector(getTotalStatusState, (state) => state.totalClosed);
export const getTotalStatusRejected = createSelector(getTotalStatusState, (state) => state.totalRejected);