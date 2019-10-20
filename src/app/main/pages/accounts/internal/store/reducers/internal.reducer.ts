import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { IInternalDemo } from '../../models';
import { InternalActions } from '../actions';

export const FEATURE_KEY = 'internals';

interface InternalState extends EntityState<IInternalDemo> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isLoading: boolean;
    selectedInternalId: string | number;
    source: TSource;
    internals: InternalState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterInternal = createEntityAdapter<IInternalDemo>({ selectId: internal => internal.id });
const initialInternalState = adapterInternal.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    selectedInternalId: null,
    source: 'fetch',
    internals: initialInternalState,
    errors: initialErrorState
};

const internalReducer = createReducer(
    initialState,
    on(InternalActions.generateInternalDemo, (state, { payload }) => ({
        ...state,
        internals: adapterInternal.addAll(payload, state.internals)
    })),
    on(InternalActions.getInternalDemoDetail, (state, { payload }) => ({
        ...state,
        selectedInternalId: payload
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return internalReducer(state, action);
}

const getListInternalState = (state: State) => state.internals;

export const {
    selectAll: selectAllInternals,
    selectEntities: selectInternalEntities,
    selectIds: selectInternalIds,
    selectTotal: selectInternalsTotal
} = adapterInternal.getSelectors(getListInternalState);
