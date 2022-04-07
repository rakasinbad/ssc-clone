import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromCatalogueMssSettings } from '../reducers';

const selectCatalogueMssSettingsState = createFeatureSelector<
    fromCatalogueMssSettings.State
>(fromCatalogueMssSettings.FEATURE_KEY);

export const getSegmentations = createSelector(
    selectCatalogueMssSettingsState,
    fromCatalogueMssSettings.selectAllSegmentations
);

export const getTotalSegmentations = createSelector(
    selectCatalogueMssSettingsState,
    fromCatalogueMssSettings.selectSegmentationsTotal
);

export const getIsLoading = createSelector(selectCatalogueMssSettingsState, (state) => state.isLoading);
