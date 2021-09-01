import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromCollectionType from '../reducers/collection-type.reducer';
import { getOrderState } from '../../../../orders/store/selectors/order.selectors';

export const getPaymentStatusState = createFeatureSelector<fromCollectionType.State>(
    fromCollectionType.featureKey
);

// -----------------------------------------------------------------------------------------------------
// Calculate Collection Type
// -----------------------------------------------------------------------------------------------------

export const getCollectionType = createSelector(
    getPaymentStatusState,
    state => state.paymentStatuses.dataCollectionType
);

// -----------------------------------------------------------------------------------------------------
// Helper State
// -----------------------------------------------------------------------------------------------------

export const getIsRefresh = createSelector(getPaymentStatusState, state => state.isRefresh);

export const getIsLoading = createSelector(getPaymentStatusState, state => state.isLoading);

