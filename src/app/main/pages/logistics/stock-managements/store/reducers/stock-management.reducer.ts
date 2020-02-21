import { StockManagementActions } from '../actions';
import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';

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
    on(StockManagementActions.fetchStockManagementsSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    })
);
