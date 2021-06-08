import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { CatalogueSegmentation } from '../../models';
import {
    CatalogueSegmentationActions,
    CatalogueSegmentationDetailActions,
    CatalogueSegmentationFormActions,
} from '../actions';

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
    on(
        CatalogueSegmentationActions.fetchCatalogueSegmentationsRequest,
        CatalogueSegmentationFormActions.createCatalogueSegmentationRequest,
        CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoRequest,
        CatalogueSegmentationFormActions.updateCatalogueSegmentationRequest,
        (state) => ({
            ...state,
            isLoading: true,
            isRefresh: false,
        })
    ),
    on(
        CatalogueSegmentationActions.fetchCatalogueSegmentationsFailure,
        CatalogueSegmentationDetailActions.fetchCatalogueSegmentationFailure,
        CatalogueSegmentationFormActions.createCatalogueSegmentationFailure,
        CatalogueSegmentationFormActions.updateCatalogueSegmentationFailure,
        CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoFailure,
        CatalogueSegmentationFormActions.updateCatalogueSegmentationSuccess,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    on(CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoSuccess, (state) => ({
        ...state,
        isLoading: false,
        isRefresh: true,
    })),
    on(CatalogueSegmentationActions.fetchCatalogueSegmentationsSuccess, (state, { data, total }) =>
        adapter.addAll(data, { ...state, isLoading: false, total })
    ),
    on(CatalogueSegmentationDetailActions.fetchCatalogueSegmentationRequest, (state, { id }) => ({
        ...state,
        isLoading: true,
        selectedId: id,
    })),
    on(CatalogueSegmentationDetailActions.fetchCatalogueSegmentationSuccess, (state, { data }) =>
        adapter.upsertOne(data, { ...state, isLoading: false })
    ),
    on(CatalogueSegmentationActions.refreshTable, (state, data) => ({
        ...state,
        isRefresh: data.payload.refreshStatus,
    })),
    on(
        CatalogueSegmentationFormActions.createCatalogueSegmentationSuccess,
        CatalogueSegmentationActions.resetState,
        () => initialState
    )
);

export function reducer(state: State | undefined, action: Action): State {
    return reducerFn(state, action);
}
