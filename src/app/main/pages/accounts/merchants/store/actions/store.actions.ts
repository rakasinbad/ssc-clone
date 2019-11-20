import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import {
    Store
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Stores
// -----------------------------------------------------------------------------------------------------

export const fetchStoresRequest = createAction(
    '[Stores API] Fetch Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchStoresFailure = createAction(
    '[Stores API] Fetch Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoresSuccess = createAction(
    '[Stores API] Fetch Stores Success',
    props<{ payload: { stores: Store[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store
// -----------------------------------------------------------------------------------------------------

export const fetchStoreRequest = createAction(
    '[Stores API] Fetch Store Request',
    props<{ payload: { params?: IQueryParams; storeId: string } }>()
);

export const fetchStoreFailure = createAction(
    '[Stores API] Fetch Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreSuccess = createAction(
    '[Stores API] Fetch Store Success',
    props<{ payload: { store: Store; source: TSource } }>()
);

// -----------------------------------------------------------------------------------------------------
// CRUD Store Actions
// -----------------------------------------------------------------------------------------------------

export const createStoreRequest = createAction(
    '[Stores API] Create Store Request',
    props<{ payload: Partial<Store> }>()
);

export const createStoreFailure = createAction(
    '[Stores API] Create Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const createStoreSuccess = createAction(
    '[Stores API] Create Store Success',
    props<{ payload: Store }>()
);

export const updateStoreRequest = createAction(
    '[Stores API] Patch Store Request',
    props<{ payload: { id: string; store: Partial<Store> } }>()
);

export const updateStoreFailure = createAction(
    '[Stores API] Patch Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreSuccess = createAction(
    '[Stores API] Patch Store Success',
    props<{ payload: Store }>()
);

export const confirmDeleteStore = createAction(
    '[Stores Page] Confirm Delete Store',
    props<{ payload: Store }>()
);

export const deleteStoreRequest = createAction(
    '[Stores API] Delete Store Request',
    props<{ payload: string }>()
);

export const deleteStoreFailure = createAction(
    '[Stores API] Delete Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteStoreSuccess = createAction(
    '[Stores API] Delete Store Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetBrandStores = createAction('[Brand Stores Page] Reset Brand Stores State');

export const resetBrandStore = createAction('[Brand Stores Page] Reset Brand Store State');

export const resetStoreEmployees = createAction(
    '[Store Employees Page] Reset Store Employees State'
);

export const resetStoreEmployee = createAction('[Store Employee Page] Reset Store Employee State');

export const resetGoPage = createAction('[Accounts Page] Reset Go Page State');

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const startLoading = createAction('[Brand Stores Page] Start Loading');

export const endLoading = createAction('[Brand Stores Page] End Loading');

export const goPage = createAction('[Accounts Page] Go Page', props<{ payload: string }>());

export const searchBrandStore = createAction(
    '[Brand Stores Page] Search Brand Store',
    props<{ query: string }>()
);

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

// export const generateStoresDemo = createAction(
//     '[Stores Page] Generate Stores Demo',
//     props<{ payload: IMerchantDemo[] }>()
// );

// export const getStoreDemoDetail = createAction(
//     '[Stores Page] Get Store Demo Detail',
//     props<{ payload: string }>()
// );

// export const generateStoreEmployeesDemo = createAction(
//     '[Stores Page] Generate Store Employees Demo',
//     props<{ payload: IStoreEmployeeDemo[] }>()
// );
