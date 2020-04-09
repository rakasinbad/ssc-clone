import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { FlexiCombo } from '../../models';
import { FlexiComboActions } from '../actions';

// Keyname for reducer
export const featureKey = 'flexiCombos';

export interface State extends EntityState<FlexiCombo> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for flexiCombos state
export const adapter = createEntityAdapter<FlexiCombo>({
    selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0,
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(
        FlexiComboActions.fetchFlexiComboRequest,
        FlexiComboActions.createFlexiComboRequest,
        FlexiComboActions.updateFlexiComboRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        FlexiComboActions.fetchFlexiComboFailure,
        FlexiComboActions.createFlexiComboFailure,
        FlexiComboActions.updateFlexiComboFailure,

        (state) => ({
            ...state,
            isLoading: false,
        })
    ),

    on(FlexiComboActions.fetchFlexiCombosSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(FlexiComboActions.clearState, () => initialState)
);
