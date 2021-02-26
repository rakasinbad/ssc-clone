import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { PromoHierarchy } from '../../models';
import { PromoHierarchyActions } from '../actions';

// Keyname for reducer
export const featureKey = 'promoHierarchys';

export interface State extends EntityState<PromoHierarchy> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for crossSellingPromo state
export const adapter = createEntityAdapter<PromoHierarchy>({
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
        PromoHierarchyActions.fetchPromoHierarchyRequest,
        PromoHierarchyActions.updatePromoHierarchyRequest,
        PromoHierarchyActions.fetchPromoHierarchyDetailRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        PromoHierarchyActions.fetchPromoHierarchyFailure,
        PromoHierarchyActions.updatePromoHierarchyFailure,
        PromoHierarchyActions.fetchPromoHierarchyDetailFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(PromoHierarchyActions.fetchPromoHierarchyDetailRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload.id,
    })),
    on(PromoHierarchyActions.fetchPromoHierarchyDetailSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false })
    ),
    on(PromoHierarchyActions.fetchPromoHierarchySuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    on(PromoHierarchyActions.updatePromoHierarchySuccess, (state, { payload }) =>
        adapter.updateOne(payload, { ...state, isLoading: false })
    ),
    on(PromoHierarchyActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(PromoHierarchyActions.clearState, () => initialState)
);
