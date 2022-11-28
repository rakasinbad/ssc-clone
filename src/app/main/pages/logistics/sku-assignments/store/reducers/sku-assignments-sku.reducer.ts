import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { SkuAssignmentsSku } from '../../models';
import { SkuAssignmentsSkuActions } from '../actions';

// Keyname for reducer
const featureKey = 'skuAssignmentsSku';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<SkuAssignmentsSku>}
 */
interface State extends EntityState<SkuAssignmentsSku> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
    textSearch: string;
}

// Adapter for Sku Assignment Sku state
const adapter = createEntityAdapter<SkuAssignmentsSku>({ selectId: row => row.id });

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
    on(SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuRequest, state => ({
        ...state,
        total: 0,
        isLoading: true
    })),
    on(SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(SkuAssignmentsSkuActions.resetSkuAssignmentsSku, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    }),
    on(SkuAssignmentsSkuActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
