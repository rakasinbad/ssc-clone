import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { SkpModel } from '../../models';
import { SkpActions } from '../actions';

// Keyname for reducer
export const featureKey = 'SkpCombos';

export interface State extends EntityState<SkpModel> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for SkpCombos state
export const adapter = createEntityAdapter<SkpModel>({
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
        SkpActions.fetchSkpRequest,
        SkpActions.fetchSkpListRequest,
        SkpActions.createSkpRequest,
        SkpActions.updateSkpRequest,
        SkpActions.changeStatusRequest,
        SkpActions.deleteSkpRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        SkpActions.fetchSkpFailure,
        SkpActions.fetchSkpListFailure,
        SkpActions.createSkpFailure,
        SkpActions.updateSkpFailure,
        SkpActions.changeStatusFailure,
        SkpActions.deleteSkpFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(SkpActions.fetchSkpRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload.id,
    })),
    on(SkpActions.fetchSkpSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false })
    ),
    on(SkpActions.fetchSkpListSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(SkpActions.changeStatusSuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(SkpActions.deleteSkpSuccess, (state, { payload }) =>
        adapter.removeOne(payload, {
            ...state,
            isLoading: false,
            selectedId: null,
            total: state.total - 1,
        })
    ),
    on(SkpActions.clearState, () => initialState)
);
