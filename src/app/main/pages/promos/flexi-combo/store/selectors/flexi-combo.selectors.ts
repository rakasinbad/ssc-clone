import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFlexiComboCore from '../reducers';
import { fromFlexiCombo } from '../reducers';
import { TNullable } from 'app/shared/models/global.model';

// Get state from the feature key.
export const getFlexiComboCoreState = createFeatureSelector<
    fromFlexiComboCore.FeatureState,
    fromFlexiComboCore.State
>(fromFlexiComboCore.featureKey);

export const {
    selectAll: selectAllFlexiCombo,
    selectEntities: selectFlexiComboEntities,
    selectIds: selectFlexiComboIds,
    selectTotal: selectFlexiComboTotal
} = fromFlexiComboCore.fromFlexiCombo.adapterFlexiCombo.getSelectors();

const getFlexiComboState = createSelector(
    getFlexiComboCoreState,
    state => state[fromFlexiCombo.FEATURE_KEY].flexiCombo
);

export const getFlexiComboEntity = createSelector(getFlexiComboState, selectFlexiComboEntities);

export const getFlexiComboTotalEntity = createSelector(getFlexiComboState, selectFlexiComboTotal);

export const getAllFlexiCombo = createSelector(getFlexiComboState, selectAllFlexiCombo);

export const getFlexiComboIds = createSelector(getFlexiComboState, selectFlexiComboIds);

export const getLoadingState = createSelector(getFlexiComboState, state => state.isLoading);
