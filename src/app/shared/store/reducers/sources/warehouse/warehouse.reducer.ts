import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Warehouse } from 'app/main/pages/logistics/warehouses/models';
import { WarehouseActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'warehouses';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Warehouse>}
 */
interface State extends EntityState<Warehouse> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouses state
const adapter = createEntityAdapter<Warehouse>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(WarehouseActions.fetchWarehouseRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseActions.fetchWarehouseFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseActions.fetchWarehouseSuccess, (state, { payload, total }) => {
        return adapter.upsertMany(payload, {
            ...state,
            isLoading: false,
            selectedId: null,
            total
        });
    }),
    on(WarehouseActions.clearWarehouseState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
