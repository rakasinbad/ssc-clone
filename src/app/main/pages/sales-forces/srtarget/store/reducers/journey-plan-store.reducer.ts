import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StorePortfolio } from '../../models';
import { JourneyPlanStoreActions } from '../actions';

// Keyname for reducer
const featureKey = 'journeyPlanStoresSource';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<StorePortfolio>}
 */
interface State extends EntityState<StorePortfolio> {
    invoiceGroupId?: string;
    isLoading: boolean;
    isRefresh?: boolean;
    selectedId: string;
    total: number;
    type?: string;
}

// Adapter for journeyPlanStoresSource state
const adapter = createEntityAdapter<StorePortfolio>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0,
    type: 'inside'
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(JourneyPlanStoreActions.fetchJourneyPlanStoresRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(JourneyPlanStoreActions.fetchJourneyPlanStoresFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(JourneyPlanStoreActions.fetchJourneyPlanStoresSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            selectedId: null,
            total: payload.total
        });
    }),
    on(JourneyPlanStoreActions.setFilterStore, (state, { payload }) => ({
        ...state,
        type: payload
    })),
    on(JourneyPlanStoreActions.setInvoiceGroupId, (state, { payload }) => ({
        ...state,
        invoiceGroupId: payload
    })),
    on(JourneyPlanStoreActions.clearStoreState, state => {
        return adapter.removeAll({
            ...state,
            isLoading: false,
            selectedId: null,
            total: 0
        });
    }),
    on(JourneyPlanStoreActions.clearState, state => {
        return adapter.removeAll({
            ...state,
            invoiceGroupId: undefined,
            isLoading: false,
            selectedId: null,
            total: 0,
            type: 'inside'
        });
    }),
    on(JourneyPlanStoreActions.clearInvoiceGroupIdState, state => ({
        ...state,
        invoiceGroupId: undefined
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
