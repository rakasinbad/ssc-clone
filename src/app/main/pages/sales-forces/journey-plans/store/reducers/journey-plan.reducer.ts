import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { JourneyPlan } from '../../models';
import { JourneyPlanActions } from '../actions';

// Keyname for reducer
const featureKey = 'journeyPlans';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<JourneyPlan>}
 */
interface State extends EntityState<JourneyPlan> {
    isLoading: boolean;
    isRefresh?: boolean;
    selectedId: string;
    total: number;
}

// Adapter for journeyPlans state
const adapter = createEntityAdapter<JourneyPlan>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(JourneyPlanActions.fetchJourneyPlansRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(JourneyPlanActions.fetchJourneyPlansFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(JourneyPlanActions.fetchJourneyPlansSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total });
    }),
    on(JourneyPlanActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
