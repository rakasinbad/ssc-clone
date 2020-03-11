import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StockManagementCatalogue } from '../../models';
import { StockManagementCatalogueActions } from '../actions';

// Keyname for reducer
export const featureKey = 'stockManagementCatalogues';

export interface State extends EntityState<StockManagementCatalogue> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for stockManagementCatalogues state
export const adapter = createEntityAdapter<StockManagementCatalogue>({ selectId: row => row.id });

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
    on(StockManagementCatalogueActions.fetchStockManagementCataloguesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StockManagementCatalogueActions.fetchStockManagementCataloguesFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(
        StockManagementCatalogueActions.fetchStockManagementCataloguesSuccess,
        (state, { payload }) => {
            return adapter.addAll(payload.data, {
                ...state,
                isLoading: false,
                total: payload.total
            });
        }
    ),
    on(StockManagementCatalogueActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);
