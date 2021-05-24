import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Catalogue } from '../../models';
import { AvailableCatalogueActions } from '../actions';

export const dataAvailableCatalogueFeatureKey = 'dataAvailableCatalogue';

export interface State extends EntityState<Catalogue> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export const adapter = createEntityAdapter<Catalogue>({ selectId: (row) => row.id });

export const initialState: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

const reducerFn = createReducer(
    initialState,
    on(AvailableCatalogueActions.fetchAvailableCataloguesRequest, (state) => ({
        ...state,
        isLoading: true,
        isRefresh: false,
    })),
    on(AvailableCatalogueActions.fetchAvailableCataloguesFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(AvailableCatalogueActions.fetchAvailableCataloguesSuccess, (state, { data, total }) =>
        adapter.addAll(data, { ...state, isLoading: false, total })
    ),
    on(AvailableCatalogueActions.resetState, () => initialState)
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
