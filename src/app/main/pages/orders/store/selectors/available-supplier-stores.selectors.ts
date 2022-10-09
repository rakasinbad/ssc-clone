import { createFeatureSelector } from '@ngrx/store';
import { fromAvailableSupplierStore } from '../reducers';

export const selectAvailableSupplierStoreState = createFeatureSelector<
    fromAvailableSupplierStore.FeatureState,
    fromAvailableSupplierStore.State
>(fromAvailableSupplierStore.FEATURE_KEY);
