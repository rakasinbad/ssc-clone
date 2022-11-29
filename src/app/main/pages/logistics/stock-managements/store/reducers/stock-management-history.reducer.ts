import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StockManagementHistory } from '../../models';
import { StockManagementHistoryActions } from '../actions';

// Keyname for reducer
export const featureKey = 'stockManagementHistories';

export interface State extends EntityState<StockManagementHistory> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for stockManagementHistories state
export const adapter = createEntityAdapter<StockManagementHistory>({ selectId: row => row.id });

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
    on(StockManagementHistoryActions.fetchStockManagementHistoriesRequest, state => ({
        ...state,
        isLoading: true,
        isRefresh: false
    })),
    on(StockManagementHistoryActions.fetchStockManagementHistoriesFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StockManagementHistoryActions.fetchStockManagementHistoriesSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(StockManagementHistoryActions.clearState, state => {
        return adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            total: 0
        });
    })
);
