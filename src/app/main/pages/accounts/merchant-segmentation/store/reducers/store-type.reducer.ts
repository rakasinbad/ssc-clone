import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StoreType } from '../../models';
import { StoreTypeActions } from '../actions';

// Keyname for reducer
export const featureKey = 'storeTypes';

export interface State extends EntityState<StoreType> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    deepestLevel: number;
}

// Adapter for store types state
export const adapter = createEntityAdapter<StoreType>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    deepestLevel: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(
    initialState,
    on(StoreTypeActions.fetchStoreTypesRequest, StoreTypeActions.createStoreTypeRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(StoreTypeActions.fetchStoreTypesFailure, StoreTypeActions.createStoreTypeFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(StoreTypeActions.createStoreTypeSuccess, state => ({
        ...state,
        isLoading: false
    })),
    on(StoreTypeActions.fetchStoreTypesSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            deepestLevel: payload.deepestLevel
        });
    }),
    on(StoreTypeActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, deepestLevel: 0 });
    })
);
