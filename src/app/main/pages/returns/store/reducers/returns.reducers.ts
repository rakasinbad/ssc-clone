import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { Action, createReducer } from '@ngrx/store';

export const FEATURE_KEY = 'returns';

interface ErrorState extends EntityState<IErrorHandler> {}

interface ReturnState extends EntityState<any> {
    selectedReturnId: string | number;
    total: number;
}

export interface State {
    isLoading: boolean;
    source: TSource;
    returns: ReturnState;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterReturn = createEntityAdapter<any>({
    selectId: (row) => row.id,
});

const initialReturnState = adapterReturn.getInitialState({
    selectedReturnId: null,
    total: 0,
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    source: 'fetch',
    returns: initialReturnState,
    errors: initialErrorState,
};

const returnReducer = createReducer(
    initialState
);

export function reducer(state: State | undefined, action: Action): State {
    return returnReducer(state, action);
}

const getReturnsState = (state: State) => state.returns;

export const {
    selectAll: selectAllReturn,
    selectEntities: selectReturnEntities,
    selectIds: selectReturnIds,
    selectTotal: selectReturnTotal,
} = adapterReturn.getSelectors(getReturnsState);