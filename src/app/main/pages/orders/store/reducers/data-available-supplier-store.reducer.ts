import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { AvailableSupplierStore } from '../../models';
import { AvailableSupplierStoreActions } from '../actions';

export const FEATURE_KEY = 'dataAvailableSupplierStore';

export interface State extends EntityState<AvailableSupplierStore> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: number;
    total: number;
}

export const adapter = createEntityAdapter<AvailableSupplierStore>({ selectId: (row) => row.storeId });

const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

const reducerFn = createReducer<State>(
    initialState,
    on(AvailableSupplierStoreActions.fetchAvailableSupplierStoresRequest, (state) => ({
        ...state,
        isLoading: true,
        isRefresh: false,
    })),
    on(AvailableSupplierStoreActions.fetchAvailableSupplierStoresFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(AvailableSupplierStoreActions.fetchAvailableSupplierStoresSuccess, (state, { data, total }) =>
        adapter.upsertMany(data, { ...state, isLoading: false, total })
    ),
    on(
        AvailableSupplierStoreActions.selectSupplierStore,
        (state, { payload }) => ({
            ...state,
            selectedId: payload
        })
    ),
    on(
        AvailableSupplierStoreActions.deselectSupplierStore,
        state => ({
            ...state,
            selectedId: null
        })
    ),
    on(AvailableSupplierStoreActions.resetState, () => initialState)
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
