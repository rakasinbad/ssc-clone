import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { Warehouse } from '../../models';
import { WarehouseActions } from './../actions';

// Keyname for reducer
export const featureKey = 'warehouses';

export interface State extends EntityState<Warehouse> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouses state
export const adapter = createEntityAdapter<Warehouse>({ selectId: row => row.id });

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
    on(WarehouseActions.fetchWarehousesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseActions.fetchWarehousesSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    })
);
