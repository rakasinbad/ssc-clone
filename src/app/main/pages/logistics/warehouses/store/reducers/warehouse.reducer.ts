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
    on(WarehouseActions.createWarehouseRequest, WarehouseActions.fetchWarehousesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(
        WarehouseActions.createWarehouseFailure,
        WarehouseActions.fetchWarehousesFailure,
        WarehouseActions.fetchWarehouseFailure,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(WarehouseActions.createWarehouseSuccess, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseActions.fetchWarehouseRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload
    })),
    on(WarehouseActions.fetchWarehouseSuccess, (state, { payload }) => {
        return adapter.addOne(payload, { ...state, isLoading: false });
    }),
    on(WarehouseActions.fetchWarehousesSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(WarehouseActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);
