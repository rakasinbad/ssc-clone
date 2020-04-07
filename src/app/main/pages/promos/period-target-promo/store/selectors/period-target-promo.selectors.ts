import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromPeriodTargetPromoCore from '../reducers';
import { fromPeriodTargetPromo } from '../reducers';

// Get state from the feature key.
export const getPeriodTargetPromoCoreState = createFeatureSelector<fromPeriodTargetPromoCore.FeatureState, fromPeriodTargetPromoCore.State>(fromPeriodTargetPromoCore.featureKey);

export const {
    selectAll: selectAllPeriodTargetPromo,
    selectEntities: selectPeriodTargetPromoEntities,
    selectIds: selectPeriodTargetPromoIds,
    selectTotal: selectPeriodTargetPromoTotal
} = fromPeriodTargetPromoCore.fromPeriodTargetPromo.adapterPeriodTargetPromo.getSelectors();

const getPeriodTargetPromoState = createSelector(
    getPeriodTargetPromoCoreState,
    state => state[fromPeriodTargetPromo.FEATURE_KEY]
);

export const getPeriodTargetPromoEntity = createSelector(getPeriodTargetPromoState, selectPeriodTargetPromoEntities);

export const getPeriodTargetPromoTotalEntity = createSelector(getPeriodTargetPromoState, selectPeriodTargetPromoTotal);

export const getAllPeriodTargetPromo = createSelector(getPeriodTargetPromoState, selectAllPeriodTargetPromo);

export const getPeriodTargetPromoIds = createSelector(getPeriodTargetPromoState, selectPeriodTargetPromoIds);

export const getSelectedPeriodTargetPromo = createSelector(
    getPeriodTargetPromoState,
    getPeriodTargetPromoEntity,
    (state, periodTargetPromo) => periodTargetPromo[state.selectedId]
);

export const getLoadingState = createSelector(getPeriodTargetPromoState, state => state.isLoading);
