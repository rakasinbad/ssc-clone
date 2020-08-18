import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { StorePortfolio } from '../../models';
import { JourneyPlanStoreSelectedActions } from '../actions';

// Keyname for reducer
const featureKey = 'journeyPlanStoresSelected';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<StorePortfolio>}
 */
interface State extends EntityState<StorePortfolio> {
    isLoading: boolean;
    isRefresh?: boolean;
    selectedId: string;
    total: number;
    type?: string;
}

// Adapter for journeyPlanStoresSelected state
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
    on(JourneyPlanStoreSelectedActions.addSelectedStores, (state, { payload }) => {
        return adapter.upsertOne(payload, state);
    }),
    on(JourneyPlanStoreSelectedActions.deleteSelectedStores, (state, { payload }) => {
        return adapter.removeOne(payload, state);
    }),
    on(JourneyPlanStoreSelectedActions.clearSelectedStores, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
