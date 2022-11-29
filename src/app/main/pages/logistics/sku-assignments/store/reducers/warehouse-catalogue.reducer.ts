import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { WarehouseCatalogue } from '../../models/warehouse-catalogue.model';
import { WarehouseCatalogueActions } from '../actions';

// Keyname for reducer
const featureKey = 'warehouseCatalogue';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<WarehouseCatalogue>}
 */
interface State extends EntityState<WarehouseCatalogue> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
    textSearch: string;
}

// Adapter for Sku Assignment Warehouse state
const adapter = createEntityAdapter<WarehouseCatalogue>({ selectId: row => row.id });

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
    on(WarehouseCatalogueActions.fetchWarehouseCataloguesRequest, state => ({
        ...state,
        total: 0,
        isLoading: true
    })),
    on(WarehouseCatalogueActions.fetchWarehouseCataloguesFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(WarehouseCatalogueActions.fetchWarehouseCataloguesSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(WarehouseCatalogueActions.resetWarehouseCatalogue, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    }),
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
