import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromImportProductsProgress } from '../reducers';

export const getImportProductsProgressState = createFeatureSelector<fromImportProductsProgress.State>(fromImportProductsProgress.FEATURE_KEY);

export const getIsLoading = createSelector(getImportProductsProgressState, (state) => state.isLoading);

export const getPayload = createSelector(getImportProductsProgressState, (state) => {
  state.payload.results.map(item => ({
    ...item,
    errorQty: null
  }))
  return state.payload
});

export const getError = createSelector(getImportProductsProgressState, (state) => {
  const { entities } = state.error;
  if (entities["importProductsProgressFailure"]){
    return entities["importProductsProgressFailure"].errors.error
  }
  return null
});

