import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { JourneyPlan, ViewBy } from '../../models';
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
    viewBy?: ViewBy;
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
    on(
        JourneyPlanActions.fetchJourneyPlansRequest,
        JourneyPlanActions.deleteJourneyPlanRequest,
        JourneyPlanActions.exportRequest,
        JourneyPlanActions.importRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        JourneyPlanActions.fetchJourneyPlansFailure,
        JourneyPlanActions.deleteJourneyPlanFailure,
        JourneyPlanActions.exportFailure,
        JourneyPlanActions.exportSuccess,
        JourneyPlanActions.importFailure,
        JourneyPlanActions.importSuccess,
        state => ({
            ...state,
            isLoading: false
        })
    ),
    on(JourneyPlanActions.fetchJourneyPlansSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, { ...state, isLoading: false, total: payload.total });
    }),
    on(JourneyPlanActions.deleteJourneyPlanSuccess, (state, { payload }) => {
        return adapter.removeOne(payload, { ...state, isLoading: false, total: state.total - 1 });
    }),
    on(JourneyPlanActions.setViewBy, (state, { payload }) => ({
        ...state,
        viewBy: payload
    })),
    on(JourneyPlanActions.clearState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    }),
    on(JourneyPlanActions.clearViewBy, state => ({
        ...state,
        viewBy: undefined
    }))
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
