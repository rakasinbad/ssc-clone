import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';

import { StockManagementActions, StockManagementCatalogueActions } from '../actions';

// Keyname for reducer
export const featureKey = 'errors';

/**
 *
 * Main interface for reducer
 * @export
 * @interface State
 * @extends {EntityState<ErrorHandler>}
 */
export interface State extends EntityState<ErrorHandler> {
    selectedId: string;
}

// Adapter for errors state
export const adapter = createEntityAdapter<ErrorHandler>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    selectedId: null
});

// Reducer manage the action
export const reducer = createReducer(
    initialState,
    on(
        StockManagementActions.fetchStockManagementFailure,
        StockManagementActions.fetchStockManagementsFailure,
        StockManagementCatalogueActions.fetchStockManagementCataloguesFailure,
        StockManagementCatalogueActions.updateStockManagementCatalogueFailure,
        (state, { payload }) => {
            return adapter.upsertOne(payload, state);
        }
    ),
    on(StockManagementActions.fetchStockManagementSuccess, state => {
        return adapter.removeOne('fetchStockManagementFailure', state);
    }),
    on(StockManagementActions.fetchStockManagementsSuccess, state => {
        return adapter.removeOne('fetchStockManagementsFailure', state);
    }),
    on(StockManagementCatalogueActions.fetchStockManagementCataloguesSuccess, state => {
        return adapter.removeOne('fetchStockManagementCataloguesFailure', state);
    }),
    on(StockManagementCatalogueActions.updateStockManagementCatalogueSuccess, state => {
        return adapter.removeOne('updateStockManagementCatalogueFailure', state);
    }),
    on(StockManagementActions.clearState, state => {
        return adapter.removeAll({ ...state });
    })
);
