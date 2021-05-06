import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromCatalogueTax } from '../reducers';
import { adapter } from './../reducers/catalogue-tax.reducer';

const selectCatalogueTaxState = createFeatureSelector<
    fromCatalogueTax.FeatureState,
    fromCatalogueTax.State
>(fromCatalogueTax.catalogueTaxFeatureKey);

export const { selectAll, selectEntities, selectIds, selectTotal } = adapter.getSelectors(
    selectCatalogueTaxState
);

export const selectTotalItem = createSelector(selectCatalogueTaxState, (state) => state.total);

export const selectIsLoading = createSelector(selectCatalogueTaxState, (state) => state.isLoading);

export const selectIsRefresh = createSelector(selectCatalogueTaxState, (state) => state.isRefresh);
