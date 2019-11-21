import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Brand } from '../../models';
import { BrandActions } from '../actions';

export const FEATURE_KEY = 'brands';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

interface BrandState extends EntityState<Brand> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    source: TSource;
    brands: BrandState;
    errors: ErrorState;
}

/**
 * BRAND STATE
 */
const adapterBrand: EntityAdapter<Brand> = createEntityAdapter<Brand>({
    selectId: brand => brand.id
});
const initialBrandState = adapterBrand.getInitialState({ total: 0 });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    source: 'fetch',
    brands: initialBrandState,
    errors: initialErrorState
};

const brandReducer = createReducer(
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
        BrandActions.fetchBrandsFailure,
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
        BrandActions.fetchBrandsFailure,
        (state, { payload }) => ({
            ...state,
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
        BrandActions.fetchBrandsSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            brands: adapterBrand.addAll(payload.brands, {
                ...state.brands,
                total: payload.brands.length
            }),
            errors: adapterError.removeOne('fetchBrandsFailure', state.errors)
        })
    ),
    /** 
     *  ===================================================================
     *  ERRORS
     *  ===================================================================
     */ 
);

export function reducer(state: State | undefined, action: Action): State {
    return brandReducer(state, action);
}

const getListBrandState = (state: State) => state.brands;

export const {
    selectAll: selectAllBrands,
    selectEntities: selectBrandEntities,
    selectIds: selectBrandIds,
    selectTotal: selectBrandsTotal
} = adapterBrand.getSelectors(getListBrandState);
