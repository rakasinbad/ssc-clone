import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromStoreCore from '../reducers';
import { fromStore } from '../reducers';

// Get state from the feature key.
export const getVoucherCoreState = createFeatureSelector<
    fromStoreCore.FeatureState,
    fromStoreCore.State
>(fromStoreCore.featureKey);

export const {
    selectAll: selectAllVoucher,
    selectEntities: selectVoucherEntities,
    selectIds: selectVoucherIds,
    selectTotal: selectVoucherTotal,
} = fromStoreCore.fromStore.adapter.getSelectors();

const getVoucherState = createSelector(
    getVoucherCoreState,
    (state) => state[fromStore.FEATURE_KEY]
);

export const getVoucherEntity = createSelector(getVoucherState, selectVoucherEntities);

export const getVoucherTotalEntity = createSelector(getVoucherState, selectVoucherTotal);

export const getAllVoucher = createSelector(getVoucherState, selectAllVoucher);

export const getVoucherIds = createSelector(getVoucherState, selectVoucherIds);

export const getTotalItem = createSelector(getVoucherState, (state) => state.total);

export const getSelectedVoucher = createSelector(
    getVoucherState,
    getVoucherEntity,
    (state, Voucher) => Voucher[state.selectedId]
);

export const getLoadingState = createSelector(getVoucherState, (state) => state.isLoading);

export const getRefreshStatus = createSelector(getVoucherState, (state) => state.isRefresh);
