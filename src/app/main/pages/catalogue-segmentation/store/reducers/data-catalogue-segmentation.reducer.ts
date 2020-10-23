import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer } from '@ngrx/store';

export const dataCatalogueSegmentationFeatureKey = 'dataCatalogueSegmentation';

export interface State extends EntityState<any> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export const adapter = createEntityAdapter<any>({ selectId: (row) => row.id });

export const initialState: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

const reducerFn = createReducer(initialState);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
