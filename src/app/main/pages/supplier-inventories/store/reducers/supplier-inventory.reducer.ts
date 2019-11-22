import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { SupplierInventoryActions } from '../actions';

export const FEATURE_KEY = 'supplierInventories';

interface SupplierInventoryState extends EntityState<any> {
    selectedSupplierInventoryId: string | number;
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isRefresh?: boolean;
    isLoading: boolean;
    supplierInventories: SupplierInventoryState;
    supplierInventory?: any;
    errors: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterSupplierInventory = createEntityAdapter<any>({ selectId: row => row.id });
const initialSupplierInventory = adapterSupplierInventory.getInitialState({
    selectedSupplierInventoryId: null,
    total: 0
});

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isLoading: false,
    supplierInventories: initialSupplierInventory,
    errors: initialErrorState
};

const supplierInventoryReducer = createReducer(
    initialState,
    on(
        SupplierInventoryActions.updateSupplierInventoryRequest,
        SupplierInventoryActions.fetchSupplierInventoryRequest,
        SupplierInventoryActions.fetchSupplierInventoriesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(
        SupplierInventoryActions.updateSupplierInventoryFailure,
        SupplierInventoryActions.fetchSupplierInventoryFailure,
        SupplierInventoryActions.fetchSupplierInventoriesFailure,
        (state, { payload }) => ({
            ...state,
            isLoading: false,
            isRefresh: undefined,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    on(SupplierInventoryActions.fetchSupplierInventoriesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        supplierInventories: adapterSupplierInventory.addAll(payload.data, {
            ...state.supplierInventories,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchSupplierInventoriesFailure', state.errors)
    })),
    on(SupplierInventoryActions.fetchSupplierInventorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isRefresh: undefined,
        // supplierInventories: adapterSupplierInventory.updateOne(payload, {
        //     ...state.supplierInventories,
        //     selectedSupplierInventoryId: payload.id
        // }),
        supplierInventories: adapterSupplierInventory.addOne(payload, {
            ...state.supplierInventories,
            selectedSupplierInventoryId: payload.id
        }),
        errors: adapterError.removeOne('fetchSupplierInventoryFailure', state.errors)
    })),
    on(SupplierInventoryActions.updateSupplierInventorySuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.removeOne('updateSupplierInventoryFailure', state.errors)
    })),
    on(SupplierInventoryActions.resetSupplierInventories, state => ({
        ...state,
        supplierInventories: initialState.supplierInventories,
        errors: adapterError.removeOne('fetchSupplierInventoriesFailure', state.errors)
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return supplierInventoryReducer(state, action);
}

const getSupplierInventoriesState = (state: State) => state.supplierInventories;

export const {
    selectAll: selectAllSupplierInventory,
    selectEntities: selectSupplierInventoryEntities,
    selectIds: selectSupplierInventoryIds,
    selectTotal: selectSupplierInventoryTotal
} = adapterSupplierInventory.getSelectors(getSupplierInventoriesState);
