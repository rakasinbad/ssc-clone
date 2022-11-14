import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { OrderLineType } from 'app/shared/models/order-line-type.model';
import { flatten, map } from 'lodash';
import { fromImportProducts } from '../reducers';

export const getImportProductsState = createFeatureSelector<fromImportProducts.State>(fromImportProducts.FEATURE_KEY);

export const getIsLoadingImport = createSelector(getImportProductsState, (state) => state.isLoadingImport);

export const getIdImportedFile = createSelector(getImportProductsState, (state) => state.idImportedFile);

export const getErrorImport = createSelector(getImportProductsState, (state) => {
  const { entities } = state.errorImport;
  if (entities["importProductsFailure"]){
    return entities["importProductsFailure"].errors.error
  }
  return null
});

