import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { WarehouseCatalogue } from '../../models';
import { WarehouseSkuStockActions } from '../actions';

// Keyname for reducer
export const featureKey = 'warehouseSkuStocks';

export interface State extends EntityState<WarehouseCatalogue> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouse sku stocks state
export const adapter = createEntityAdapter<WarehouseCatalogue>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(WarehouseSkuStockActions.fetchWarehouseSkuStocksRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseSkuStockActions.fetchWarehouseSkuStocksFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseSkuStockActions.fetchWarehouseSkuStocksSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(WarehouseSkuStockActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);
