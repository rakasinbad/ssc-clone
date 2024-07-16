import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Region } from 'app/shared/models/region.model';
import { RegionActions } from 'app/shared/store/actions';

// Keyname for reducer
const featureKey = 'region';

/**
 *
 * Main interface for reducer
 * @interface State
 * @extends {EntityState<Region>}
 */
interface State extends EntityState<Region> {
    isRefresh?: boolean;
    isLoading: boolean;
    selectedId: string;
    total: number;
}

// Adapter for region state
const adapter = createEntityAdapter<Region>({ selectId: (row) => row.id });

// Initialize state
const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    selectedId: null,
    total: 0,
});

// Reducer manage the action
const reducer = createReducer<State>(
    initialState,
    on(RegionActions.fetchRegionRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(RegionActions.fetchRegionFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(RegionActions.fetchRegionSuccess, (state, { payload, total }) => {
        return adapter.upsertMany(payload, {
            ...state,
            isLoading: false,
            selectedId: null,
            total,
        });
    }),
    on(RegionActions.clearRegionState, (state) => {
        return adapter.removeAll({ ...state, isLoading: false, selectedId: null, total: 0 });
    })
);

// Set anything for the export
export { adapter, featureKey, initialState, reducer, State };
