import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { JourneyPlanSales } from '../../models';
import { JourneyPlanSalesActions } from '../actions';

// Keyname for reducer
const featureKey = 'journeyPlanSales';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<JourneyPlanSales>}
 */
interface State extends EntityState<JourneyPlanSales> {
    isLoading: boolean;
    isRefresh?: boolean;
    selectedId: string;
    total: number;
}

// Adapter for journeyPlanSales state
const adapter = createEntityAdapter<JourneyPlanSales>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(JourneyPlanSalesActions.setJourneyPlanSales, (state, { payload }) => {
        return adapter.addAll(payload, state);
    }),
    on(JourneyPlanSalesActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
