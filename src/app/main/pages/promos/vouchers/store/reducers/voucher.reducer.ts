import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { environment } from 'environments/environment';
import { Voucher } from '../../models/voucher.model';
import { VoucherActions } from '../actions';

// Set reducer's feature key
export const FEATURE_KEY = 'voucher';

// Store's Voucher
export interface VoucherState extends EntityState<Voucher> {
    isLoading: boolean;
    needRefresh: boolean;
    limit: number;
    skip: number;
    total: number;
    selectedId: string;
}

export const adapterVoucher: EntityAdapter<Voucher> = createEntityAdapter<Voucher>({
    selectId: (voucher) => voucher.id as string,
});

// Initial value for Voucher State.
const initialVoucherState: VoucherState = adapterVoucher.getInitialState<
    Omit<VoucherState, 'ids' | 'entities'>
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
    initialVoucherState,
    /**
     * REQUEST STATES.
     */
    on(
        VoucherActions.fetchVoucherRequest,
        VoucherActions.addVoucherRequest,
        VoucherActions.updateVoucherRequest,
        VoucherActions.removeVoucherRequest,
        (state) => ({
            ...state,
            isLoading: true,
        })
    ),
    /**
     * FAILURE STATES.
     */
    on(
        VoucherActions.fetchVoucherFailure,
        VoucherActions.addVoucherSuccess,
        VoucherActions.addVoucherFailure,
        VoucherActions.updateVoucherFailure,
        VoucherActions.removeVoucherFailure,
        (state) => ({
            ...state,
            isLoading: false,
        })
    ),
    /**
     * FETCH SUCCESS STATE.
     */
    on(VoucherActions.fetchVoucherSuccess, (state, { payload }) => {
        if (Array.isArray(payload.data)) {
            return adapterVoucher.upsertMany(payload.data, {
                ...state,
                total: payload.total,
                isLoading: false,
            });
        }

        return adapterVoucher.upsertOne(payload.data, {
            ...state,
            isLoading: false,
        });
    }),
    /**
     * ADD SUCCESS STATE.
     */
    on(VoucherActions.addVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * REMOVE SUCCESS STATE.
     */
    on(VoucherActions.removeVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * UPDATE SUCCESS STATE.
     */
    on(VoucherActions.updateVoucherSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
    })),
    /**
     * SELECTION STATE.
     */
    on(VoucherActions.selectVoucher, (state, { payload }) => ({
        ...state,
        selectedId: payload,
    })),
    on(VoucherActions.deselectVoucher, (state) => ({
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
    on(VoucherActions.resetVoucher, () => initialVoucherState)
);
