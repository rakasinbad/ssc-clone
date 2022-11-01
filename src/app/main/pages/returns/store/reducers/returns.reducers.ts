import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { Action, createReducer, on } from '@ngrx/store';
import { ReturnActions } from '../actions';
import { ITotalReturnModel, IReturnAmount } from '../../models';

export const FEATURE_KEY = 'returns';

interface ErrorState extends EntityState<IErrorHandler> {}

interface ReturnState extends EntityState<any> {
    selectedReturnId: string | number;
    total: number;
    totalStatus: ITotalReturnModel;
    returnAmount: IReturnAmount;
}

export interface State {
    isRefresh?: boolean;
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
    totalStatus: {
        totalReturn: 0,
        totalPending: 0,
        totalApproved: 0,
        totalApprovedReturned: 0,
        totalClosed: 0,
        totalRejected: 0
    },
    returnAmount: {
        returnQty: 0,
        returnAmount: 0,
        returnItems: []
    }
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
    initialState,

    on(
        ReturnActions.fetchReturnRequest,
        ReturnActions.fetchReturnDetailRequest,
        ReturnActions.fetchTotalReturnRequest,
        ReturnActions.fetchReturnAmountRequest,
        ReturnActions.updateStatusReturnRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    on(
        ReturnActions.fetchReturnFailure,
        ReturnActions.fetchReturnDetailFailure,
        ReturnActions.fetchTotalReturnFailure,
        ReturnActions.fetchReturnAmountFailure,
        ReturnActions.updateStatusReturnFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors),
        })
    ),

    on(ReturnActions.fetchReturnSuccess, (state, { payload }) => ({
            ...state,
            isEdit: false,
            isLoading: false,
            isRefresh: undefined,
            returns: adapterReturn.addAll(payload.data, { ...state.returns, total: payload.total }),
            errors: adapterError.removeOne('fetchReturnFailure', state.errors),
        })
    ),
    on(ReturnActions.fetchReturnDetailSuccess, (state, { payload }) => ({
            ...state,
            isEdit: false,
            isLoading: false,
            isRefresh: undefined,
            returns: adapterReturn.addOne(
                payload.data,
                { ...state.returns, selectedReturnId: payload.data.returnParcelId  }
            ),
            errors: adapterError.removeOne('fetchReturnDetailFailure', state.errors),
        })
    ),
    on(ReturnActions.fetchTotalReturnSuccess, (state, { payload }) => {
        return ({
            ...state,
            returns: {
                ...state.returns,
                totalStatus: payload
            },
            errors: adapterError.removeOne('fetchTotalReturnFailure', state.errors)
        });
    }),
    on(ReturnActions.updateStatusReturnSuccess, (state, { payload }) =>  ({
            ...state,
            isEdit: false,
            isLoading: false,
            isRefresh: undefined,
            returns: adapterReturn.updateOne(
                {
                    id: payload.id,
                    changes: {
                        status: payload.status,
                        returned: payload.returned,
                        returnParcelLogs: payload.returnParcelLogs,
                    }
                },
                state.returns
            ),
            errors: adapterError.removeOne('updateStatusReturnFailure', state.errors),
        })
    ),
    on(ReturnActions.fetchReturnAmountSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        returns: {
            ...state.returns,
            returnAmount: payload
        },
        errors: adapterError.removeOne('fetchReturnAmountFailure', state.errors)
    })),

    on(ReturnActions.resetReturn, (state) => ({
        ...state,
        isEdit: false,
        returns: initialState.returns,
        errors: adapterError.removeOne('fetchOrdersFailure', state.errors),
    }))
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
