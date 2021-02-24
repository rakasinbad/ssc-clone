import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { PromoHierarchy } from '../../models/promo-hierarchy.model';
import { PromoHierarchyActions } from '../actions';

// Set reducer's feature key
export const featureKey = 'promoHierarchy';

// export interface State extends EntityState<CrossSelling> {
//     isLoading: boolean;
//     isRefresh: boolean;
//     selectedId: string;
//     total: number;
// }

export interface PromoHierarchyState extends EntityState<PromoHierarchy> {
    isLoading: boolean;
    needRefresh: boolean;
    limit: number;
    skip: number;
    total: number;
    selectedId: string;
}

// Adapter for promoHierarchy state
export const adapter = createEntityAdapter<PromoHierarchy>({
    selectId: (row) => row.id,
});

// Initial value for PromoHierarchy State.
const initialPromoHierarchyState: PromoHierarchyState = adapter.getInitialState<
    Omit<PromoHierarchyState, 'ids' | 'entities'>
>({
    isLoading: false,
    needRefresh: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0,
    selectedId: null,
});

// Create the reducer.
export const reducer = createReducer(
    initialPromoHierarchyState,
    /**
     * REQUEST STATES.
     */
    on(
        PromoHierarchyActions.fetchPromoHierarchyRequest,
        PromoHierarchyActions.updatePromoHierarchyRequest,
        PromoHierarchyActions.fetchPromoHierarchyDetailRequest,
        PromoHierarchyActions.removePromoHierarchyRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        PromoHierarchyActions.fetchPromoHierarchyFailure,
        PromoHierarchyActions.updatePromoHierarchyFailure,
        PromoHierarchyActions.fetchPromoHierarchyDetailFailure,
        PromoHierarchyActions.removePromoHierarchyFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(PromoHierarchyActions.fetchPromoHierarchySuccess, (state, { payload }) =>
        adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    /**
     * REMOVE SUCCESS STATE.
     */
    on(PromoHierarchyActions.removePromoHierarchySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * UPDATE SUCCESS STATE.
     */
    on(PromoHierarchyActions.updatePromoHierarchySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    on(PromoHierarchyActions.fetchPromoHierarchyDetailRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedId: payload.id,
    })),
    on(PromoHierarchyActions.fetchPromoHierarchyDetailSuccess, (state, { payload }) =>
        adapter.addOne(payload, { ...state, isLoading: false })
    ),
    /**
     * SELECTION STATE.
     */
    on(PromoHierarchyActions.selectPromoHierarchy, (state, { payload }) => ({
        ...state,
        selectedId: payload,
    })),
    on(PromoHierarchyActions.deselectPromoHierarchy, (state) => ({
        ...state,
        selectedId: null,
    })),
    /**
     * RESET STATE.
     */
    on(PromoHierarchyActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(PromoHierarchyActions.resetPromoHierarchy, () => initialPromoHierarchyState)
);
