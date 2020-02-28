import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { WarehouseCoverage } from 'app/shared/models';

import { WarehouseCoverageActions } from '../actions';

// Keyname for reducer
export const featureKey = 'warehouseCoverages';

export interface State extends EntityState<WarehouseCoverage> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouse coverages state
export const adapter = createEntityAdapter<WarehouseCoverage>({ selectId: row => row.id });

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
    on(WarehouseCoverageActions.fetchWarehouseCoveragesFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseCoverageActions.fetchWarehouseCoveragesSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(WarehouseCoverageActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);
