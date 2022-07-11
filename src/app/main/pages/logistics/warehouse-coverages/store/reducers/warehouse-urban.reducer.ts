import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { WarehouseUrbanActions } from '../actions';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';

// Keyname for reducer
export const featureKey = 'coverages';

export interface State extends EntityState<WarehouseCoverage> {
    isLoading: boolean;
    total: number;
}

// Adapter for warehouses state
export const adapter = createEntityAdapter<WarehouseCoverage>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(WarehouseUrbanActions.fetchWarehouseUrbansRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseUrbanActions.fetchWarehouseUrbansFailure, (state) => ({
        ...state,
        isLoading: false,
        total: 0
    })),
    on(WarehouseUrbanActions.fetchWarehouseUrbansSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    // TRUNCATE
    on(WarehouseUrbanActions.truncateWarehouseUrbans, (state) =>
        adapter.removeAll({
            ...state,
            total: 0,
            isLoading: false,
        })
    ),
);
