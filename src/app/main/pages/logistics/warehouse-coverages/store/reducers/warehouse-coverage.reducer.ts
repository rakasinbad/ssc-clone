import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { WarehouseCoverageActions } from '../actions';
import { NotCoveredWarehouse } from '../../models/not-covered-warehouse.model';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';

// Keyname for reducer
export const featureKey = 'warehouseCoverages';

export interface State extends EntityState<WarehouseCoverage | NotCoveredWarehouse> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouses state
export const adapter = createEntityAdapter<WarehouseCoverage | NotCoveredWarehouse>({ selectId: row => row.id });

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
    on(WarehouseCoverageActions.fetchWarehouseCoveragesRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseCoverageActions.fetchWarehouseCoveragesFailure, (state) => ({
        ...state,
        isLoading: false,
        total: 0
    })),
    on(WarehouseCoverageActions.fetchWarehouseCoveragesSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    // CREATE
    on(WarehouseCoverageActions.createWarehouseCoverageRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseCoverageActions.createWarehouseCoverageFailure, (state) => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseCoverageActions.createWarehouseCoverageSuccess, (state) => ({
        ...state,
        isLoading: false,
    })),
    // SELECTIONS
    on(WarehouseCoverageActions.selectWarehouse, (state, { payload }) => ({
        ...state,
        selectedId: payload
    })),
    on(WarehouseCoverageActions.deselectWarehouse, (state) => ({
        ...state,
        selectedId: null
    })),
    // TRUNCATE
    on(WarehouseCoverageActions.truncateWarehouseCoverages, (state) =>
        adapter.removeAll({
            ...state,
            total: 0,
            isLoading: false,
            isRefresh: false,
        })
    ),
);
