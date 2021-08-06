import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { SupplierVoucherStore } from '../../models/voucher.model';
import { VoucherActions } from '../actions';

export const FEATURE_KEY = 'voucherStore';

// NOTE Defined additional state with entity (https://ngrx.io/guide/entity/interfaces#entitystatet)
export interface State extends EntityState<SupplierVoucherStore> {
    isLoading: boolean;
    isRefresh: boolean;
    selectedId: string;
    total: number;
}

// NOTE Entity adapter (https://ngrx.io/guide/entity/adapter#createentityadaptert)
export const adapter = createEntityAdapter<SupplierVoucherStore>({ 
    selectId: (row) => row.externalId as string 
});

// NOTE Init additional state (https://ngrx.io/guide/entity/adapter#getinitialstate)
export const initialState: State = adapter.getInitialState({
    isLoading: false,
    isRefresh: false,
    selectedId: null,
    total: 0,
});

// SECTION Handle the action (https://ngrx.io/guide/Voucher/reducers#creating-the-reducer-function)
export const reducerFn = createReducer(
    initialState,

    // NOTE Handle request action
    on(
        VoucherActions.fetchSupplierVoucherStoreRequest,
        (state) => ({
            ...state,
            isLoading: true,
            isRefresh: false,
        })
    ),

    // NOTE Handle failure action
    on(
        VoucherActions.fetchSupplierVoucherStoreFailure,
        (state) => ({
            ...state,
            isLoading: false,
            isRefresh: false,
        })
    ),

    // NOTE Fetch sinbad Vouchers success
    on(
        VoucherActions.fetchSupplierVoucherStoreSuccess, 
        (state, { payload }) =>
        adapter.upsertMany(payload.data, { ...state, isLoading: false, total: payload.total })
    ),
    
    // NOTE Reset data state
    on(VoucherActions.resetSupplierVoucherStore, (state) => initialState)
);

export function reducer(state = initialState || undefined, action: Action): State {
    return reducerFn(state, action);
}
// !SECTION
