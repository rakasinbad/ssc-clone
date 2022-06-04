// import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
// import { Action, createReducer, on } from '@ngrx/store';
// import { IErrorHandler, TSource } from 'app/shared/models';
// import * as fromRoot from 'app/store/app.reducer';

// import { Catalogue, CatalogueCategory } from '../../models';
// import { CategoryActions } from '../actions';

// export const FEATURE_KEY = 'categories';

// export interface FeatureState extends fromRoot.State {
//     [FEATURE_KEY]: State | undefined;
// }

// interface CatalogueCategoryState extends EntityState<CatalogueCategory> {
//     total: number;
// }

// interface ErrorState extends EntityState<IErrorHandler> {}

// export interface State {
//     isLoading: boolean;
//     source: TSource;
//     categories: CatalogueCategoryState;
//     errors: ErrorState;
// }

// /**
//  * CATALOGUE STATE
//  */
// const adapterCatalogueCategory: EntityAdapter<CatalogueCategory> = createEntityAdapter<CatalogueCategory>({
//     selectId: category => category.id
// });
// const initialCatalogueCategoryState = adapterCatalogueCategory.getInitialState({ total: 0, limit: 10, skip: 0, data: [] });

// /**
//  * ERROR STATE
//  */
// const adapterError = createEntityAdapter<IErrorHandler>();
// const initialErrorState = adapterError.getInitialState();

// const initialState: State = {
//     isLoading: false,
//     source: 'fetch',
//     categories: initialCatalogueCategoryState,
//     errors: initialErrorState
// };

// const catalogueReducer = createReducer(
//     /** 
//      *  ===================================================================
//      *  INITIAL STATE
//      *  ===================================================================
//      */ 
//     initialState,
//     /** 
//      *  ===================================================================
//      *  REQUESTS
//      *  ===================================================================
//      */ 
//     on(
//         CategoryActions.fetchCategoryTreeRequest,
//         (state) => ({
//             ...state,
//             isLoading: true
//         })
//     ),
//     /** 
//      *  ===================================================================
//      *  FAILURES
//      *  ===================================================================
//      */ 
//     on(
//         CategoryActions.fetchCategoryTreeFailure,
//         (state, { payload }) => ({
//             ...state,
//             isLoading: false,
//             errors: adapterError.upsertOne(payload, state.errors)
//         })
//     ),
//     /** 
//      *  ===================================================================
//      *  SUCCESSES
//      *  ===================================================================
//      */ 
//     on(
//         CategoryActions.fetchCategoryTreeSuccess,
//         (state, { payload }) => ({
//             ...state,
//             isLoading: false,
//             categories: adapterCatalogueCategory.addAll(payload.categories, {
//                 ...state.categories
//             }),
//             errors: adapterError.removeOne('fetchCatalogueCategoriesFailure', state.errors)
//         })
//     ),
//     /** 
//      *  ===================================================================
//      *  ERRORS
//      *  ===================================================================
//      */ 
// );

// export function reducer(state: State | undefined, action: Action): State {
//     return catalogueReducer(state, action);
// }

// const getListCatalogueCategoryState = (state: State) => state.categories;

// export const {
//     selectAll: selectAllCatalogueCategories,
//     selectEntities: selectCatalogueCategoryEntities,
//     selectIds: selectCatalogueCategoryIds,
//     selectTotal: selectCatalogueCategoriesTotal
// } = adapterCatalogueCategory.getSelectors(getListCatalogueCategoryState);
