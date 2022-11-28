import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StockManagementActions } from '../actions';

// Keyname for reducer
export const featureKey = 'stockManagements';

export interface State extends EntityState<any> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for stockManagements state
export const adapter = createEntityAdapter<any>({ selectId: row => row.id });

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
    on(StockManagementActions.fetchStockManagementsRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(
        StockManagementActions.fetchStockManagementsFailure,
        StockManagementActions.fetchStockManagementFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(StockManagementActions.fetchStockManagementRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload
    })),
    on(StockManagementActions.fetchStockManagementSuccess, (state, { payload }) => {
        return adapter.addOne(payload, { ...state, isLoading: false });
    }),
    on(StockManagementActions.fetchStockManagementsSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(StockManagementActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);
