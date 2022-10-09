import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { AvailableSupplierStore } from '../../models/available-supplier-store.model';

enum Actions {
    FetchAvailableSupplierStoresFailure = '[Order Manual Supplier Stores] Fetch Available Supplier Stores Failure',
    FetchAvailableSupplierStoresRequest = '[Order Manual Supplier Stores] Fetch Available Supplier Stores Request',
    FetchAvailableSupplierStoresSuccess = '[Order Manual Supplier Stores] Fetch Available Supplier Stores Success',
    ResetState = '[Order Manual Supplier Stores] Reset Available Supplier Stores Data',
    SelectSupplierStore = '[Order Manual Supplier Stores] Select Supplier Store',
    DeselectSupplierStore = '[Order Manual Supplier Stores] Deselect Supplier Store'
}

export const fetchAvailableSupplierStoresRequest = createAction(
    Actions.FetchAvailableSupplierStoresRequest,
    props<{ payload: IQueryParams }>()
);

export const fetchAvailableSupplierStoresSuccess = createAction(
    Actions.FetchAvailableSupplierStoresSuccess,
    props<{ data: AvailableSupplierStore[]; total: number }>()
);

export const fetchAvailableSupplierStoresFailure = createAction(
    Actions.FetchAvailableSupplierStoresFailure,
    props<{ payload: ErrorHandler }>()
);

export const selectSupplierStore = createAction(
    Actions.SelectSupplierStore,
    props<{ payload: number }>()
);

export const deselectSupplierStore = createAction(Actions.DeselectSupplierStore);

export const resetState = createAction(Actions.ResetState);

export type FailureActions = 'fetchAvailableSupplierStoresFailure';

