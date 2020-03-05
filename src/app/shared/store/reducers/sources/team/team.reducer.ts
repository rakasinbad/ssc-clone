import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Team } from 'app/shared/models/team.model';
import { TeamActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'teams';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Team>}
 */
interface State extends EntityState<Team> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for teams state
const adapter = createEntityAdapter<Team>({ selectId: row => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(TeamActions.fetchTeamRequest, state => ({
        ...state,
        isLoading: true
    })),
    on(TeamActions.fetchTeamFailure, state => ({
        ...state,
        isLoading: false
    })),
    on(TeamActions.fetchTeamSuccess, (state, { payload }) => {
        return adapter.addAll(payload.data, {
            ...state,
            isLoading: false,
            selectedId: null,
            total: payload.total
        });
    }),
    on(TeamActions.clearTeamState, state => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
