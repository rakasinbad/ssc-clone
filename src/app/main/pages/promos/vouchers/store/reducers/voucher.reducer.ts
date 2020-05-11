import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { SupplierVoucher } from '../../models/voucher.model';
import { VoucherActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'voucher';

// Store's Voucher
export interface SupplierVoucherState extends EntityState<SupplierVoucher> {
    isLoading: boolean;
    needRefresh: boolean;
    limit: number;
    skip: number;
    total: number;
    selectedId: string;
}

export const adapterSupplierVoucher: EntityAdapter<SupplierVoucher> = createEntityAdapter<SupplierVoucher>({
    selectId: (SupplierVoucher) => SupplierVoucher.id as string,
});

// Initial value for SupplierVoucher State.
const initialSupplierVoucherState: SupplierVoucherState = adapterSupplierVoucher.getInitialState<
    Omit<SupplierVoucherState, 'ids' | 'entities'>
>({
    isLoading: false,
    needRefresh: false,
    total: 0,
    limit: environment.pageSize,
    skip: 0,
    selectedId: null,
});

// Create the reducer.
export const reducer = createReducer(
    initialSupplierVoucherState,
    /**
     * REQUEST STATES.
     */
    on(
        VoucherActions.fetchSupplierVoucherRequest,
        VoucherActions.addSupplierVoucherRequest,
        VoucherActions.updateSupplierVoucherRequest,
        VoucherActions.removeSupplierVoucherRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        VoucherActions.fetchSupplierVoucherFailure,
        VoucherActions.addSupplierVoucherSuccess,
        VoucherActions.addSupplierVoucherFailure,
        VoucherActions.updateSupplierVoucherFailure,
        VoucherActions.removeSupplierVoucherFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(VoucherActions.fetchSupplierVoucherSuccess, (state, { payload }) => {
        if (Array.isArray(payload.data)) {
            return adapterSupplierVoucher.upsertMany(payload.data, {
                ...state,
                total: payload.total,
                isLoading: false,
            });
        }

        return adapterSupplierVoucher.upsertOne(payload.data, {
            ...state,
            isLoading: false,
        });
    }),
    /**
     * ADD SUCCESS STATE.
     */
    on(VoucherActions.addSupplierVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * REMOVE SUCCESS STATE.
     */
    on(VoucherActions.removeSupplierVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * UPDATE SUCCESS STATE.
     */
    on(VoucherActions.updateSupplierVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * SELECTION STATE.
     */
    on(VoucherActions.selectSupplierVoucher, (state, { payload }) => ({
        ...state,
        selectedId: payload,
    })),
    on(VoucherActions.deselectSupplierVoucher, (state) => ({
        ...state,
        selectedId: null,
    })),
    /**
     * RESET STATE.
     */
    on(VoucherActions.setRefreshStatus, (state, { payload }) => ({
        ...state,
        needRefresh: payload,
    })),
    on(VoucherActions.resetSupplierVoucher, () => initialSupplierVoucherState)
);
