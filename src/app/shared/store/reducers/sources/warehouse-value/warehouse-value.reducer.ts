import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { WarehouseValue } from 'app/shared/models';
import { WarehouseValueActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'warehouseValues';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<WarehouseValue>}
 */
interface State extends EntityState<WarehouseValue> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouse values state
const adapter = createEntityAdapter<WarehouseValue>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(WarehouseValueActions.fetchWarehouseValueRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(WarehouseValueActions.fetchWarehouseValueFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseValueActions.fetchWarehouseValueSuccess, (state, { payload }) => {
        return adapter.addAll(payload, {
            ...state,
            isLoading: false,
            selectedId: null
        });
    }),
    on(WarehouseValueActions.clearWarehouseValueState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
