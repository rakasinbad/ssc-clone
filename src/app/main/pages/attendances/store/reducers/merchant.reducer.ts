import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Store as Merchant } from '../../models';
import { MerchantActions } from '../actions';

export const FEATURE_KEY = 'merchants';

interface MerchantState extends EntityState<Merchant> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedMerchantId: string | number;
    source: TSource;
    merchant: Merchant | undefined;
    merchants: MerchantState;
    errors: ErrorState;
}

const adapterMerchant = createEntityAdapter<Merchant>({
    selectId: merchant => merchant.id
});
const initialMerchantState = adapterMerchant.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedMerchantId: null,
    source: 'fetch',
    merchant: undefined,
    merchants: initialMerchantState,
    errors: initialErrorState
};

const merchantReducer = createReducer(
    initialState,
    on(
        MerchantActions.fetchStoreRequest,
        MerchantActions.fetchStoresRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(MerchantActions.fetchStoresFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(MerchantActions.fetchStoresSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        merchants: adapterMerchant.addAll(payload.merchants, {
            ...state.merchants,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchStoresFailure', state.errors)
    })),
    on(MerchantActions.fetchStoreFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(MerchantActions.fetchStoreSuccess, (state, { payload }) => {
        let newState = {
            ...state,
            source: payload.source
        };

        if (newState.source === 'fetch') {
            newState = {
                ...newState,
                isLoading: false,
                merchant: payload.merchant,
                errors: adapterError.removeOne('fetchStoreFailure', state.errors)
            };
        } else {
            newState = {
                ...newState,
                isLoading: false,
                merchant: undefined,
                errors: adapterError.removeOne('fetchStoreFailure', state.errors)
            };
        }

        return newState;
    })
);

export function reducer(state: State | undefined, action: Action): State {
    return merchantReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListMerchantState = (state: State) => state.merchants;

export const {
    selectAll: selectAllMerchants,
    selectEntities: selectMerchantEntities,
    selectIds: selectMerchantIds,
    selectTotal: selectMerchantTotal
} = adapterMerchant.getSelectors(getListMerchantState);
