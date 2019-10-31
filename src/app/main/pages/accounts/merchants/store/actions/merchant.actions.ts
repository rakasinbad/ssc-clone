import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import {
    BrandStore,
    IMerchantDemo,
    IStoreEmployeeDemo,
    StoreEmployee,
    StoreEmployeeDetail
} from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Brand Stores
// -----------------------------------------------------------------------------------------------------

export const fetchBrandStoresRequest = createAction(
    '[Brand Stores API] Fetch Brand Stores Request',
    props<{ payload: IQueryParams }>()
);

export const fetchBrandStoresFailure = createAction(
    '[Brand Stores API] Fetch Brand Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchBrandStoresSuccess = createAction(
    '[Brand Stores API] Fetch Brand Stores Success',
    props<{ payload: { brandStores: BrandStore[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Brand Store
// -----------------------------------------------------------------------------------------------------

export const fetchBrandStoreRequest = createAction(
    '[Brand Store API] Fetch Brand Store Request',
    props<{ payload: string }>()
);

export const fetchBrandStoreFailure = createAction(
    '[Brand Store API] Fetch Brand Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchBrandStoreSuccess = createAction(
    '[Brand Store API] Fetch Brand Store Success',
    props<{ payload: { brandStore?: BrandStore; source: TSource } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Employees
// -----------------------------------------------------------------------------------------------------

export const fetchStoreEmployeesRequest = createAction(
    '[Store Employees API] Fetch Store Employees Request',
    props<{ payload: { params: IQueryParams; storeId: string } }>()
);

export const fetchStoreEmployeesFailure = createAction(
    '[Store Employees API] Fetch Store Employees Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreEmployeesSuccess = createAction(
    '[Store Employees API] Fetch Store Employees Success',
    props<{ payload: { employees: StoreEmployee[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Employee
// -----------------------------------------------------------------------------------------------------

export const fetchStoreEmployeeRequest = createAction(
    '[Store Employee API] Fetch Store Employee Request',
    props<{ payload: string }>()
);

export const fetchStoreEmployeeFailure = createAction(
    '[Store Employee API] Fetch Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreEmployeeSuccess = createAction(
    '[Store Employee API] Fetch Store Employee Success',
    props<{ payload: { employee?: StoreEmployeeDetail; source: TSource } }>()
);

// -----------------------------------------------------------------------------------------------------
// CRUD Actions
// -----------------------------------------------------------------------------------------------------

export const updateStoreEmployeeRequest = createAction(
    '[Store Employee API] Update Store Employee Request',
    props<{ payload: { body: StoreEmployeeDetail; id: string } }>()
);

export const updateStoreEmployeeFailure = createAction(
    '[Store Employee API] Update Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreEmployeeSuccess = createAction(
    '[Store Employee API] Update Store Employee Success',
    props<{ payload: StoreEmployeeDetail }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

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

export const generateStoresDemo = createAction(
    '[Stores Page] Generate Stores Demo',
    props<{ payload: IMerchantDemo[] }>()
);

export const getStoreDemoDetail = createAction(
    '[Stores Page] Get Store Demo Detail',
    props<{ payload: string }>()
);

export const generateStoreEmployeesDemo = createAction(
    '[Stores Page] Generate Store Employees Demo',
    props<{ payload: IStoreEmployeeDemo[] }>()
);
