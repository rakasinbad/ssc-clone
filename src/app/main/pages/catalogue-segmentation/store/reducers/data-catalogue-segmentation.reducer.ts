import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CatalogueSegmentation } from '../../models';
import { CatalogueSegmentationActions } from '../actions';

export const dataCatalogueSegmentationFeatureKey = 'dataCatalogueSegmentation';

export interface State extends EntityState<CatalogueSegmentation> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

export const adapter = createEntityAdapter<CatalogueSegmentation>({ selectId: (row) => row.id });

export const initialState: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

const reducerFn = createReducer(
    initialState,
    on(CatalogueSegmentationActions.fetchCatalogueSegmentationsRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(CatalogueSegmentationActions.fetchCatalogueSegmentationsFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(CatalogueSegmentationActions.fetchCatalogueSegmentationsSuccess, (state, { data, total }) =>
        adapter.addAll(data, { ...state, isLoading: false, total })
    ),
    on(CatalogueSegmentationActions.refreshTable, (state, data) => ({
        ...state,
        isRefresh: data.payload.refreshStatus,
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
