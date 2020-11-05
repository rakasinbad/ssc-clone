import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Catalogue } from '../../models';
import { CatalogueActions } from '../actions';

export const dataCatalogueFeatureKey = 'dataCatalogue';

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
    on(CatalogueActions.fetchCataloguesRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(CatalogueActions.fetchCataloguesFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(CatalogueActions.fetchCataloguesSuccess, (state, { data, total }) =>
        adapter.addAll(data, { ...state, isLoading: false, total })
    )
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
