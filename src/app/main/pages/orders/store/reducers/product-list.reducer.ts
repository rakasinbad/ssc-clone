import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { ProductList } from '../../models';
import { ProductListActions } from '../actions';

// Keyname for reducer
export const productListFeatureKey = 'productLists';

export interface State extends EntityState<ProductList> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export const adapter = createEntityAdapter<ProductList>({ selectId: (row) => row._id });

export const initialStateProdList: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

// Create the reducer.
export const reducerFn = createReducer(
    initialStateProdList,
    on(ProductListActions.fetchProductListRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(ProductListActions.fetchProductListFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(ProductListActions.fetchProductListSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(ProductListActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(ProductListActions.clearState, () => initialStateProdList)
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
