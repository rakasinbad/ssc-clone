import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromCrossSellingPromoCore from '../reducers';
import * as fromCrossSellingPromos from '../reducers/cross-selling-promo.reducer';

export const getCrossSellingPromoCoreState = createFeatureSelector<
fromCrossSellingPromoCore.FeatureState,
fromCrossSellingPromoCore.State
>(fromCrossSellingPromoCore.featureKey);

export const getCrossSellingEntitiesState = createSelector(
    getCrossSellingPromoCoreState,
    (state) => state.crossSellingPromo
);

export const {
    selectAll,
    selectEntities,
    selectIds,
    selectTotal,
} = fromCrossSellingPromos.adapter.getSelectors(getCrossSellingEntitiesState);

export const getTotalItem = createSelector(getCrossSellingEntitiesState, (state) => state.total);

export const getSelectedId = createSelector(
    getCrossSellingEntitiesState,
    (state) => state.selectedId
);

export const getSelectedItem = createSelector(
    selectEntities,
    getSelectedId,
    (entities, id) => entities[id]
);

export const getIsLoading = createSelector(getCrossSellingEntitiesState, (state) => state.isLoading);