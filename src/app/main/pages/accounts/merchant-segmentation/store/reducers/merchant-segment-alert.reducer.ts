import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreSegmentAlert } from '../../models';
import { StoreAlertActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeSegmentAlert';

export interface State extends EntityState<StoreSegmentAlert> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for storeSegmentAlert state
export const adapter = createEntityAdapter<StoreSegmentAlert>({ selectId: row => row.id });

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
    on(StoreAlertActions.fetchStoreAlertRequest, state => ({ ...state, isLoading: true })),
    on(StoreAlertActions.fetchStoreAlertFailure, state => ({ ...state, isLoading: false })),
    on(StoreAlertActions.fetchStoreAlertSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(StoreAlertActions.clearState, state =>
        adapter.removeAll({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            selectedId: null,
            total: 0
        })
    )
);
