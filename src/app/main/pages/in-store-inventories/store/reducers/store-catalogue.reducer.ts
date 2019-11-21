import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

// import { StoreCatalogue } from '../../models';
import { StoreCatalogueActions } from '../actions';

export const FEATURE_KEY = 'storeCatalogues';

interface StoreCatalogueState extends EntityState<any> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedStoreCatalogueId: string | number;
    source: TSource;
    storeCatalogue: any;
    storeCatalogues: StoreCatalogueState;
    errors: ErrorState;
}

const adapterStoreCatalogue = createEntityAdapter<any>({
    selectId: storeCatalogue => storeCatalogue.id
});
const initialStoreCatalogueState = adapterStoreCatalogue.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedStoreCatalogueId: null,
    source: 'fetch',
    storeCatalogue: undefined,
    storeCatalogues: initialStoreCatalogueState,
    errors: initialErrorState
};

const storeCatalogueReducer = createReducer(
    initialState,
    on(
        StoreCatalogueActions.fetchStoreCatalogueRequest,
        StoreCatalogueActions.fetchStoreCataloguesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        StoreCatalogueActions.fetchStoreCatalogueFailure,
        StoreCatalogueActions.fetchStoreCataloguesFailure,
        (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(
        StoreCatalogueActions.fetchStoreCatalogueSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            storeCatalogue: adapterStoreCatalogue.addOne(payload, {
                ...state.storeCatalogues,
                total: state.storeCatalogues.total + 1
            }),
            errors: adapterError.removeOne('fetchStoreCatalogueFailure', state.errors)
        })
    ),
    on(
        StoreCatalogueActions.fetchStoreCataloguesSuccess,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isDeleting: false,
            storeCatalogues: adapterStoreCatalogue.addAll(payload.storeCatalogues, {
                ...state.storeCatalogues,
                total: payload.total
            }),
            errors: adapterError.removeOne('fetchAttendancesFailure', state.errors)
        })
    ),
);

export function reducer(state: State | undefined, action: Action): State {
    return storeCatalogueReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListStoreCatalogueState = (state: State) => state.storeCatalogues;

export const {
    selectAll: selectAllStoreCatalogues,
    selectEntities: selectStoreCatalogueEntities,
    selectIds: selectStoreCatalogueIds,
    selectTotal: selectStoreCatalogueTotal
} = adapterStoreCatalogue.getSelectors(getListStoreCatalogueState);
