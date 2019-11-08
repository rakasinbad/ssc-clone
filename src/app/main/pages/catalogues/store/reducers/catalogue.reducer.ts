import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Catalogue, CatalogueCategory, CatalogueUnit } from '../../models';
import { CatalogueActions } from '../actions';

export const FEATURE_KEY = 'catalogues';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface CatalogueState extends EntityState<Catalogue> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting?: boolean;
    isLoading: boolean;
    selectedCatalogueId: string | number;
    selectedCategories: Array<{ id: string; name: string; }>;
    productName: string;
    categories: Array<CatalogueCategory>;
    units?: Array<CatalogueUnit>;
    source: TSource;
    catalogue?: Catalogue;
    catalogues: CatalogueState;
    errors: ErrorState;
}

/**
 * CATALOGUE STATE
 */
const adapterCatalogue: EntityAdapter<Catalogue> = createEntityAdapter<Catalogue>({
    selectId: catalogue => catalogue.id
});
const initialCatalogueState = adapterCatalogue.getInitialState({ total: 0, limit: 10, skip: 0, data: [] });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isDeleting: false,
    isLoading: false,
    selectedCatalogueId: null,
    selectedCategories: [],
    productName: '',
    categories: [],
    source: 'fetch',
    units: [],
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
     *  GETTERS & SETTERS
     *  ===================================================================
     */ 
    on(
        CatalogueActions.setSelectedCategories,
        (state, { payload }) => ({
            ...state,
            selectedCategories: payload
        })
    ),
    on(
        CatalogueActions.setProductName,
        (state, { payload }) => ({
            ...state,
            productName: payload
        })
    ),
    /** 
     *  ===================================================================
     *  REQUESTS
     *  ===================================================================
     */ 
    on(
        CatalogueActions.fetchCatalogueRequest,
        CatalogueActions.fetchCataloguesRequest,
        CatalogueActions.fetchCatalogueUnitRequest,
        (state) => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        CatalogueActions.setCatalogueToActiveRequest,
        CatalogueActions.setCatalogueToInactiveRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        CatalogueActions.fetchCategoryTreeRequest,
        (state) => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        CatalogueActions.removeCatalogueRequest,
        (state) => ({
            ...state,
            isLoading: true,
            isDeleting: true
        })
    ),
    /** 
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */
    on(
        CatalogueActions.fetchCategoryTreeFailure,
        CatalogueActions.fetchCatalogueUnitFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
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
    on(
        CatalogueActions.setCatalogueToActiveFailure,
        CatalogueActions.setCatalogueToInactiveFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        CatalogueActions.removeCatalogueFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: initialState.isDeleting,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    /** 
     *  ===================================================================
     *  SUCCESSES
     *  ===================================================================
     */ 
    on(
        CatalogueActions.fetchCategoryTreeSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            categories: payload.categories,
            errors: adapterError.removeOne('fetchCatalogueCategoriesFailure', state.errors)
        })
    ),
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
    on(
        CatalogueActions.setCatalogueToActiveSuccess,
        CatalogueActions.setCatalogueToInactiveSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false, 
            errors: adapterError.removeOne('removeCatalogueFailure', state.errors),
            catalogues: adapterCatalogue.updateOne(payload, state.catalogues),
        })
    ),
    on(
        CatalogueActions.removeCatalogueSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: true,
            catalogues: adapterCatalogue.removeOne(payload.id, state.catalogues),
            errors: adapterError.removeOne('removeCatalogueFailure', state.errors)
        })
    ),
    on(
        CatalogueActions.fetchCatalogueUnitSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            units: payload.units,
            errors: adapterError.removeOne('removeCatalogueFailure', state.errors)
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
