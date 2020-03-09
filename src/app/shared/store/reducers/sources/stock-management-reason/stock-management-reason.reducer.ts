import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';
import { StockManagementReasonActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'stockManagementReasons';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<StockManagementReason>}
 */
interface State extends EntityState<StockManagementReason> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for warehouses state
const adapter = createEntityAdapter<StockManagementReason>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(StockManagementReasonActions.fetchStockManagementReasonRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StockManagementReasonActions.fetchStockManagementReasonFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StockManagementReasonActions.fetchStockManagementReasonSuccess, (state, { payload }) => {
        return adapter.addAll(payload, {
            ...state,
            isLoading: false,
            selectedId: null
        });
    }),
    on(StockManagementReasonActions.clearStockManagementReasonState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
