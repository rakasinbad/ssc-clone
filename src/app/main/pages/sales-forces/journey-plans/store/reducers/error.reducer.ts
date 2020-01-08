import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';

import { JourneyPlanActions, JourneyPlanStoreActions } from '../actions';

// Keyname for reducer
const featureKey = 'errors';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<ErrorHandler>}
 */
interface State extends EntityState<ErrorHandler> {
    selectedId: string;
}

// Adapter for errors state
const adapter = createEntityAdapter<ErrorHandler>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    selectedId: null
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(
        JourneyPlanActions.fetchJourneyPlansFailure,
        JourneyPlanStoreActions.fetchJourneyPlanStoresFailure,
        (state, { payload }) => {
            return adapter.upsertOne(payload, state);
        }
    ),
    on(JourneyPlanActions.fetchJourneyPlansSuccess, state => {
        return adapter.removeOne('fetchJourneyPlansFailure', state);
    }),
    on(JourneyPlanStoreActions.fetchJourneyPlanStoresSuccess, state => {
        return adapter.removeOne('fetchJourneyPlanStoresFailure', state);
    }),
    on(JourneyPlanActions.clearState, state => {
        return adapter.removeAll({ ...state });
    })
);

// Set anything for the export
export { featureKey, initialState, reducer, State };
