import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { ICalculateCollectionStatusPayment } from '../../models';
import { CollectionActions } from '../actions';

export const featureKey = 'collectionTypes';

interface CollectionTypeState extends EntityState<any> {
    selectedCollectionStatusId: string | number;
    total: number;
    dataCollectionType: ICalculateCollectionStatusPayment;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    source: TSource;
    paymentStatuses: CollectionTypeState;
    errors: ErrorState;
    selectedId: string;
}

export interface FeatureState extends fromRoot.State {
    [featureKey]: State | undefined;
}

const adapter = createEntityAdapter<any>({
    selectId: paymentStatus => paymentStatus.id
});
const initialCollectionType = adapter.getInitialState({
    selectedCollectionStatusId: null,
    total: 0,
    dataCollectionType: {
        id: null,
        status: '',
        title: '',
        detail: '',
        total: 0
    },
    isLoading: false,
    isRefresh: undefined,
    selectedId: null,
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isLoading: false,
    source: 'fetch',
    paymentStatuses: initialCollectionType,
    errors: initialErrorState,
    isRefresh: undefined,
    selectedId: null,

};

const reducers = createReducer(
    initialState,
    on(
        CollectionActions.fetchCalculateCollectionStatusRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        CollectionActions.fetchCalculateCollectionStatusFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(CollectionActions.fetchCalculateCollectionStatusSuccess, (state, { payload }) => ({
        ...state,
        paymentStatuses: {
            ...state.paymentStatuses,
            dataCollectionType: payload
        },
        errors: adapterError.removeOne('fetchCalculateCollectionStatusFailure', state.errors)
    })),
    on(CollectionActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(CollectionActions.clearState, () => initialState)
    
);

export function reducer(state: State | undefined, action: Action): State {
    return reducers(state, action);
}

const getPaymentStatusesState = (state: State) => state.paymentStatuses;

export const {
    selectAll: selectAllPaymentStatus,
    selectEntities: selectPaymentStatusEntities,
    selectIds: selectPaymentStatusIds,
    selectTotal: selectPaymentStatusTotal
} = adapter.getSelectors(getPaymentStatusesState);
