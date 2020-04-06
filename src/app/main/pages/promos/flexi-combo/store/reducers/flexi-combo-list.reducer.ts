import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { FlexiComboList } from '../../models';
import { FlexiComboListActions } from '../actions';

// Keyname for reducer
const featureKey = 'flexiComboList';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<FlexiComboList>}
 */
interface State extends EntityState<FlexiComboList> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
    textSearch: string;
}

// Adapter for Flexi Combo List state
const adapter = createEntityAdapter<FlexiComboList>({ selectId: row => row.id });

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
    on(FlexiComboListActions.fetchFlexiComboListRequest, state => ({
        ...state,
        total: 0,
        isLoading: true
    })),
    on(FlexiComboListActions.fetchFlexiComboListFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(FlexiComboListActions.fetchFlexiComboListSuccess, (state, { payload }) => {
        return adapter.upsertMany(payload.data, {
            ...state,
            isLoading: false,
            total: payload.total
        });
    }),
    on(FlexiComboListActions.resetFlexiComboList, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    }),
    on(FlexiComboListActions.setSearchValue, (state, { payload }) => ({
        ...state,
        textSearch: payload
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
