import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { ICatalogue } from '../../models';
import { CatalogueActions } from '../actions';

export const FEATURE_KEY = 'catalogues';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface CatalogueState extends EntityState<ICatalogue> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting?: boolean;
    isLoading: boolean;
    selectedCatalogueId: string | number;
    source: TSource;
    catalogue?: ICatalogue;
    catalogues: CatalogueState;
    errors: ErrorState;
}

/**
 * CATALOGUE STATE
 */
const adapterCatalogue: EntityAdapter<ICatalogue> = createEntityAdapter<ICatalogue>({
    selectId: catalogue => catalogue.id
});
const initialCatalogueState = adapterCatalogue.getInitialState({ total: 0 });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isDeleting: false,
    isLoading: false,
    selectedCatalogueId: null,
    source: 'fetch',
    catalogues: initialCatalogueState,
    errors: initialErrorState
};

const catalogueReducer = createReducer(
    /** 
     *  ===================================================================
     *  INITIAL STATE
     *  ===================================================================
     */ 
    initialState,
    /** 
     *  ===================================================================
     *  REQUESTS
     *  ===================================================================
     */ 
    on(
        CatalogueActions.fetchCatalogueRequest,
        CatalogueActions.fetchCataloguesRequest,
        (state) => ({
            ...state,
            isLoading: true
        })
    ),
    /** 
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */ 
    on(
        CatalogueActions.fetchCatalogueFailure,
        CatalogueActions.fetchCataloguesFailure,
        (state, { payload }) => ({
            ...state,
            isDeleting: initialState.isDeleting,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    /** 
     *  ===================================================================
     *  SUCCESSES
     *  ===================================================================
     */ 
    on(
        CatalogueActions.fetchCataloguesSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: initialState.isDeleting,
            catalogues: adapterCatalogue.addAll(payload.catalogues, {
                ...state.catalogues,
                total: payload.total
            }),
            errors: adapterError.removeOne('fetchCataloguesFailure', state.errors)
        })
    ),
    /** 
     *  ===================================================================
     *  ERRORS
     *  ===================================================================
     */ 
    on(
        CatalogueActions.resetCatalogue,
        state => ({
            ...state,
            catalogue: initialState.catalogue,
            errors: adapterError.removeOne('fetchCatalogueFailure', state.errors)
        })
    ),
    on(
        CatalogueActions.resetCatalogues,
        state => ({
            ...state,
            catalogues: initialState.catalogues,
            errors: adapterError.removeOne('fetchCataloguesFailure', state.errors)
        })
    )
);

export function reducer(state: State | undefined, action: Action): State {
    return catalogueReducer(state, action);
}

const getListCatalogueState = (state: State) => state.catalogues;

export const {
    selectAll: selectAllCatalogues,
    selectEntities: selectCatalogueEntities,
    selectIds: selectCatalogueIds,
    selectTotal: selectCataloguesTotal
} = adapterCatalogue.getSelectors(getListCatalogueState);
