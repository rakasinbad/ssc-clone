import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { PromoHierarchy } from '../../models/promo-hierarchy.model';
import { PromoHierarchyActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'promoHierarchy';

// Store's Voucher
export interface PromoHierarchyState extends EntityState<PromoHierarchy> {
    isLoading: boolean;
    needRefresh: boolean;
    limit: number;
    skip: number;
    total: number;
    selectedId: string;
}

export const adapterPromoHierarchy: EntityAdapter<PromoHierarchy> = createEntityAdapter<PromoHierarchy>({
    selectId: (SupplierVoucher) => SupplierVoucher.id as string,
});

// Initial value for PromoHierarchy State.
const initialPromoHierarchyState: PromoHierarchyState = adapterPromoHierarchy.getInitialState<
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
        // VoucherActions.addPromoHierarchyRequest,
        PromoHierarchyActions.updatePromoHierarchyRequest,
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
        // VoucherActions.addSupplierVoucherSuccess,
        // PromoHierarchyActions.addPromoHierarchyFailure,
        PromoHierarchyActions.updatePromoHierarchyFailure,
        PromoHierarchyActions.removePromoHierarchyFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(PromoHierarchyActions.fetchPromoHierarchySuccess, (state, { payload }) => {
        if (Array.isArray(payload.data)) {
            return adapterPromoHierarchy.upsertMany(payload.data, {
                ...state,
                total: payload.total,
                isLoading: false,
            });
        }

        return adapterPromoHierarchy.upsertOne(payload.data, {
            ...state,
            isLoading: false,
        });
    }),
    /**
     * ADD SUCCESS STATE.
     */
    // on(VoucherActions.addPromoHierarchySuccess, (state, { payload }) => ({
    //     ...state,
    //     isLoading: false,
    // })),
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
