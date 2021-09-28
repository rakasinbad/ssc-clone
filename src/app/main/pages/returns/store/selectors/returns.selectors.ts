import { createFeatureSelector, createSelector } from '@ngrx/store';
import { returnsReducer } from '../reducers';

export const getReturnState = createFeatureSelector<returnsReducer.State>(returnsReducer.FEATURE_KEY);

export const getAllReturn = createSelector(getReturnState, returnsReducer.selectAllReturn);
export const getTotalReturn = createSelector(getReturnState, (state) => state.returns.total);
export const getIsLoading = createSelector(getReturnState, (state) => state.isLoading);
