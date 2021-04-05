import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { CrossSelling } from '../../models';
import { CrossSellingPromoActions } from '../actions';

// Keyname for reducer
export const featureKey = 'crossSellingPromo';

export interface State extends EntityState<CrossSelling> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for crossSellingPromo state
export const adapter = createEntityAdapter<CrossSelling>({
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
        CrossSellingPromoActions.fetchCrossSellingPromoListRequest,
        CrossSellingPromoActions.fetchCrossSellingPromoDetailRequest,
        CrossSellingPromoActions.createCrossSellingPromoRequest,
        // CrossSellingPromoActions.updateCrossSellingPromoRequest,
        CrossSellingPromoActions.changeStatusRequest,
        CrossSellingPromoActions.extendPromoRequest,
        CrossSellingPromoActions.deleteCrossSellingPromoRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        CrossSellingPromoActions.fetchCrossSellingPromoListFailure,
        CrossSellingPromoActions.fetchCrossSellingPromoDetailFailure,
        CrossSellingPromoActions.createCrossSellingPromoFailure,
        // CrossSellingPromoActions.updateCrossSellingPromoFailure,
        CrossSellingPromoActions.changeStatusFailure,
        CrossSellingPromoActions.extendPromoFailure,
        CrossSellingPromoActions.deleteCrossSellingPromoFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(CrossSellingPromoActions.fetchCrossSellingPromoDetailRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload.id,
    })),
    on(CrossSellingPromoActions.fetchCrossSellingPromoDetailSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false })
    ),
    on(CrossSellingPromoActions.fetchCrossSellingPromoListSuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(CrossSellingPromoActions.changeStatusSuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(CrossSellingPromoActions.extendPromoSuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(CrossSellingPromoActions.deleteCrossSellingPromoSuccess, (state, { payload }) =>
        adapter.removeOne(payload, {
            ...state,
            isLoading: false,
            selectedId: null,
            total: state.total - 1,
        })
    ),
    on(CrossSellingPromoActions.clearState, () => initialState)
);