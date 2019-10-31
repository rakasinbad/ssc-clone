import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { ICatalogueDemo } from '../../models';
import { CatalogueActions } from '../actions';

export const FEATURE_KEY = 'catalogues';

interface CatalogueState extends EntityState<ICatalogueDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedCatalogueId: string | number;
    source: TSource;
    catalogues: CatalogueState;
    errors: ErrorState;
}

const adapterCatalogue: EntityAdapter<ICatalogueDemo> = createEntityAdapter<ICatalogueDemo>({
    selectId: catalogue => catalogue.id
});
const initialOrderState = adapterCatalogue.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    selectedCatalogueId: null,
    source: 'fetch',
    catalogues: initialOrderState,
    errors: initialErrorState
};

const catalogueReducer = createReducer(
    initialState,
    on(CatalogueActions.generateCataloguesDemo, (state, { payload }) => ({
        ...state,
        catalogues: adapterCatalogue.addAll(payload, state.catalogues)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return catalogueReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListCatalogueState = (state: State) => state.catalogues;

export const {
    selectAll: selectAllCatalogues,
    selectEntities: selectCatalogueEntities,
    selectIds: selectCatalogueIds,
    selectTotal: selectCataloguesTotal
} = adapterCatalogue.getSelectors(getListCatalogueState);
