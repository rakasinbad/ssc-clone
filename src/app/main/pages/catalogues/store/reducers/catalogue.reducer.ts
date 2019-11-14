import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TNullable, TSource } from 'app/shared/models';
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
    selectedCategories: Array<{ id: string; name: string; parent: TNullable<string>; }>;
    productName: string;
    category?: CatalogueCategory;
    categories: Array<CatalogueCategory>;
    units?: Array<CatalogueUnit>;
    source: TSource;
    catalogue?: Catalogue;
    catalogues: CatalogueState;
    totalAllStatus: number;
    totalEmptyStock: number;
    totalActive: number;
    totalInactive: number;
    totalBanned: number;
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
    totalAllStatus: 0,
    totalEmptyStock: 0,
    totalActive: 0,
    totalInactive: 0,
    totalBanned: 0,
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
        CatalogueActions.addSelectedCategory,
        (state, { payload }) => ({
            ...state,
            selectedCategories: [...state.selectedCategories, {
                id: payload.id, name: payload.name, parent: payload.parent
            }]
        })
    ),
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
        CatalogueActions.fetchCategoryTreeRequest,
        CatalogueActions.fetchCatalogueUnitRequest,
        CatalogueActions.setCatalogueToActiveRequest,
        CatalogueActions.setCatalogueToInactiveRequest,
        CatalogueActions.fetchCatalogueCategoryRequest,
        CatalogueActions.fetchTotalCatalogueStatusRequest,
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
        CatalogueActions.setCatalogueToActiveFailure,
        CatalogueActions.setCatalogueToInactiveFailure,
        CatalogueActions.fetchCatalogueCategoryFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        CatalogueActions.fetchCatalogueFailure,
        CatalogueActions.fetchCataloguesFailure,
        CatalogueActions.removeCatalogueFailure,
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
        CatalogueActions.fetchCatalogueCategorySuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            category: payload.category,
            errors: adapterError.removeOne('fetchCatalogueCategoryFailure', state.errors)
        })
    ),
    on(
        CatalogueActions.fetchCategoryTreeSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            categories: payload.categories,
            errors: adapterError.removeOne('fetchCategoryTreeFailure', state.errors)
        })
    ),
    on(
        CatalogueActions.fetchCatalogueSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: initialState.isDeleting,
            catalogue: payload.catalogue,
            errors: adapterError.removeOne('fetchCatalogueFailure', state.errors)
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
    on(
        CatalogueActions.fetchTotalCatalogueStatusSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            totalAllStatus: payload.totalAllStatus,
            totalEmptyStock: payload.totalEmptyStock,
            totalActive: payload.totalActive,
            totalInactive: payload.totalInactive,
            totalBanned: payload.totalBanned
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
