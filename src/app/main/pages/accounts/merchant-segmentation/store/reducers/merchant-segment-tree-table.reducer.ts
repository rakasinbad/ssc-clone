import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer } from '@ngrx/store';

import { StoreSegmentTree } from '../../models';

// Keyname for reducer
export const featureKey = 'storeSegmentTreeTable';

export interface State extends EntityState<StoreSegmentTree> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// Adapter for storeSegmentTrees state
export const adapter = createEntityAdapter<StoreSegmentTree>({ selectId: row => row.id });

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
    total: 0
});

// Reducer manage the action
export const reducer = createReducer<State>(initialState);
