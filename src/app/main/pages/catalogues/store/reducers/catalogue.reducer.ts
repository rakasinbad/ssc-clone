import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TNullable, TSource } from 'app/shared/models/global.model';
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
    isUpdating?: boolean;
    isLoading: boolean;
    needRefresh: boolean;
    selectedCatalogueId: string | number;
    selectedCategories: Array<{
        id: string;
        name: string;
        parent: TNullable<string>;
        hasChildren?: boolean;
    }>;
    productName: string;
    category?: CatalogueCategory;
    categories: Array<CatalogueCategory>;
    categoryTree: Array<CatalogueCategory>;
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
const initialCatalogueState = adapterCatalogue.getInitialState({
    total: 0,
    limit: 10,
    skip: 0,
    data: []
});

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isDeleting: false,
    isUpdating: false,
    isLoading: false,
    needRefresh: false,
    selectedCatalogueId: null,
    selectedCategories: [],
    productName: '',
    categories: [],
    categoryTree: [],
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
    on(CatalogueActions.addSelectedCategory, (state, { payload }) => ({
        ...state,
        selectedCategories: [
            ...state.selectedCategories,
            {
                id: payload.id,
                name: payload.name,
                parent: payload.parent,
                hasChildren: payload.hasChildren
            }
        ]
    })),
    on(CatalogueActions.setSelectedCategories, (state, { payload }) => ({
        ...state,
        selectedCategories: payload
    })),
    on(CatalogueActions.setProductName, (state, { payload }) => ({
        ...state,
        productName: payload
    })),
    on(CatalogueActions.spliceCatalogue, (state, { payload }) => ({
        ...state,
        catalogues: adapterCatalogue.removeOne(payload, state.catalogues)
    })),
    /**
     *  ===================================================================
     *  REQUESTS
     *  ===================================================================
     */

    on(CatalogueActions.fetchCatalogueStockRequest, state => state),
    on(
        CatalogueActions.fetchCatalogueRequest,
        CatalogueActions.fetchCataloguesRequest,
        CatalogueActions.fetchCategoryTreeRequest,
        CatalogueActions.fetchCatalogueUnitRequest,
        CatalogueActions.fetchCatalogueCategoryRequest,
        CatalogueActions.fetchCatalogueCategoriesRequest,
        CatalogueActions.addNewCatalogueRequest,
        // CatalogueActions.fetchTotalCatalogueStatusRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        CatalogueActions.patchCatalogueRequest,
        CatalogueActions.patchCataloguesRequest,
        CatalogueActions.importCataloguesRequest,
        CatalogueActions.setCatalogueToActiveRequest,
        CatalogueActions.setCatalogueToInactiveRequest,
        state => ({
            ...state,
            isLoading: true,
            isUpdating: true
        })
    ),
    on(CatalogueActions.removeCatalogueRequest, state => ({
        ...state,
        isLoading: true,
        isDeleting: true
    })),
    /**
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */
    on(
        CatalogueActions.fetchCategoryTreeFailure,
        CatalogueActions.fetchCatalogueUnitFailure,
        CatalogueActions.fetchCatalogueCategoryFailure,
        CatalogueActions.fetchCatalogueCategoriesFailure,
        CatalogueActions.addNewCatalogueFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        CatalogueActions.patchCatalogueFailure,
        CatalogueActions.patchCataloguesFailure,
        CatalogueActions.importCataloguesFailure,
        CatalogueActions.setCatalogueToActiveFailure,
        CatalogueActions.setCatalogueToInactiveFailure,
        (state, { payload }) => ({
            ...state,
            isUpdating: initialState.isUpdating,
            isLoading: initialState.isLoading,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(
        CatalogueActions.fetchCatalogueFailure,
        CatalogueActions.fetchCataloguesFailure,
        CatalogueActions.removeCatalogueFailure,
        CatalogueActions.fetchCatalogueStockFailure,
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

    on(CatalogueActions.addNewCatalogueSuccess, state => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('addNewCatalogueSuccess', state.errors)
    })),
    on(CatalogueActions.fetchCatalogueStockSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        catalogues: adapterCatalogue.updateOne(
            {
                id: payload.catalogueId,
                changes: {
                    stockEnRoute: payload.stock.stockEnRoute
                }
            },
            state.catalogues
        ),
        errors: adapterError.removeOne('fetchCatalogueStockFailure', state.errors)
    })),
    on(CatalogueActions.fetchCatalogueCategorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        category: payload.category,
        errors: adapterError.removeOne('fetchCatalogueCategoryFailure', state.errors)
    })),
    on(CatalogueActions.fetchCategoryTreeSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        categoryTree: payload.categoryTree,
        errors: adapterError.removeOne('fetchCategoryTreeFailure', state.errors)
    })),
    on(CatalogueActions.fetchCatalogueCategoriesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        categories: payload.categories,
        errors: adapterError.removeOne('fetchCatalogueCategoriesFailure', state.errors)
    })),
    on(CatalogueActions.patchCatalogueSuccess, CatalogueActions.patchCataloguesSuccess, state => ({
        ...state,
        isLoading: initialState.isLoading,
        isDeleting: initialState.isDeleting,
        isUpdating: initialState.isUpdating,
        errors: adapterError.removeOne('fetchCatalogueFailure', state.errors)
    })),
    on(CatalogueActions.importCataloguesSuccess, state => ({
        ...state,
        isLoading: initialState.isLoading,
        isDeleting: initialState.isDeleting,
        isUpdating: initialState.isUpdating,
        errors: adapterError.removeOne('importCataloguesFailure', state.errors)
    })),
    on(CatalogueActions.fetchCatalogueSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        catalogue: payload.catalogue,
        catalogues: adapterCatalogue.upsertOne(payload.catalogue, state.catalogues),
        errors: adapterError.removeOne('fetchCatalogueFailure', state.errors)
    })),
    on(CatalogueActions.fetchCataloguesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: initialState.isDeleting,
        catalogues: adapterCatalogue.addAll(payload.catalogues, {
            ...state.catalogues,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchCataloguesFailure', state.errors)
    })),
    on(
        CatalogueActions.setCatalogueToActiveSuccess,
        CatalogueActions.setCatalogueToInactiveSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            errors: adapterError.removeOne('removeCatalogueFailure', state.errors),
            catalogues: adapterCatalogue.updateOne(payload, state.catalogues)
        })
    ),
    on(CatalogueActions.removeCatalogueSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: true,
        catalogues: adapterCatalogue.removeOne(payload.id, state.catalogues),
        errors: adapterError.removeOne('removeCatalogueFailure', state.errors)
    })),
    on(CatalogueActions.fetchCatalogueUnitSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        units: payload.units,
        errors: adapterError.removeOne('removeCatalogueFailure', state.errors)
    })),
    on(CatalogueActions.fetchTotalCatalogueStatusSuccess, (state, { payload }) => ({
        ...state,
        // isLoading: false,
        totalAllStatus: isNaN(+payload.totalAllStatus) ? 0 : +payload.totalAllStatus,
        totalEmptyStock: isNaN(+payload.totalEmptyStock) ? 0 : +payload.totalEmptyStock,
        totalActive: isNaN(+payload.totalActive) ? 0 : +payload.totalActive,
        totalInactive: isNaN(+payload.totalInactive) ? 0 : +payload.totalInactive,
        totalBanned: isNaN(+payload.totalBanned) ? 0 : +payload.totalBanned,
    })),
    /**
     *  ===================================================================
     *  UPDATE
     *  ===================================================================
     */

    on(CatalogueActions.updateCatalogue, (state, { catalogue }) => ({
        ...state,
        catalogues: adapterCatalogue.updateOne(catalogue, state.catalogues)
    })),
    /**
     *  ===================================================================
     *  SETS
     *  ===================================================================
     */
    on(CatalogueActions.setSelectedCatalogue, (state, { payload: selectedCatalogueId }) => ({
        ...state,
        selectedCatalogueId
    })),
    on(CatalogueActions.setRefreshStatus, (state, { status }) => ({
        ...state,
        needRefresh: status
    })),
    /**
     *  ===================================================================
     *  RESETS
     *  ===================================================================
     */

    on(CatalogueActions.resetSelectedCategories, state => ({
        ...state,
        selectedCategories: []
    })),
    on(CatalogueActions.resetSelectedCatalogue, state => ({
        ...state,
        selectedCatalogueId: initialState.selectedCatalogueId
    })),
    on(CatalogueActions.resetCatalogue, state => ({
        ...state,
        catalogue: initialState.catalogue,
        errors: adapterError.removeOne('fetchCatalogueFailure', state.errors)
    })),
    on(CatalogueActions.resetCatalogues, state => ({
        ...state,
        catalogues: initialState.catalogues,
        errors: adapterError.removeOne('fetchCataloguesFailure', state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return catalogueReducer(state, action);
}

export const getSelectedCatalogue = (state: State) => state.selectedCatalogueId;

const getListCatalogueState = (state: State) => state.catalogues;

export const {
    selectAll: selectAllCatalogues,
    selectEntities: selectCatalogueEntities,
    selectIds: selectCatalogueIds,
    selectTotal: selectCataloguesTotal
} = adapterCatalogue.getSelectors(getListCatalogueState);
