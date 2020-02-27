import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { SkuAssignmentsWarehouse } from '../../models';
import { SkuAssignmentsWarehouseActions } from '../actions';

// Keyname for reducer
const featureKey = 'skuAssignmentsWarehouse';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<SkuAssignmentsWarehouse>}
 */
interface State extends EntityState<SkuAssignmentsWarehouse> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
    textSearch: string;
}

// Adapter for Sku Assignment Warehouse state
const adapter = createEntityAdapter<SkuAssignmentsWarehouse>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0,
    textSearch: ''
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseRequest, state => ({
        ...state,
        total: 0,
        isLoading: true
    })),
    on(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(SkuAssignmentsWarehouseActions.resetSkuAssignmentsWarehouse, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    }),
    on(SkuAssignmentsWarehouseActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
