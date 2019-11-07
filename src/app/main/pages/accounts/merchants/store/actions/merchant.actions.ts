import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import {
    BrandStore,
    FormStore,
    FormStoreEdit,
    IMerchantDemo,
    IStoreCreateResponse,
    IStoreEditResponse,
    IStoreEmployeeDemo,
    StoreEdit,
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
// Fetch Brand Store Edit
// -----------------------------------------------------------------------------------------------------

export const fetchBrandStoreEditRequest = createAction(
    '[Brand Store API] Fetch Brand Store Edit Request',
    props<{ payload: string }>()
);

export const fetchBrandStoreEditFailure = createAction(
    '[Brand Store API] Fetch Brand Store Edit Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchBrandStoreEditSuccess = createAction(
    '[Brand Store API] Fetch Brand Store Edit Success',
    props<{ payload: { brandStore?: StoreEdit; source: TSource } }>()
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
// CRUD Store Actions
// -----------------------------------------------------------------------------------------------------

export const createStoreRequest = createAction(
    '[Brand Stores API] Create Store Request',
    props<{ payload: FormStore }>()
);

export const createStoreFailure = createAction(
    '[Brand Stores API] Create Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const createStoreSuccess = createAction(
    '[Brand Stores API] Create Store Success',
    props<{ payload: IStoreCreateResponse }>()
);

export const updateStoreRequest = createAction(
    '[Brand Stores API] Update Store Request',
    props<{ payload: { body: FormStoreEdit; id: string } }>()
);

export const updateStoreFailure = createAction(
    '[Brand Stores API] Update Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreSuccess = createAction(
    '[Brand Stores API] Update Store Success',
    props<{ payload: IStoreEditResponse }>()
);

export const confirmDeleteStore = createAction(
    '[Brand Stores Page] Confirm Delete Store',
    props<{ payload: BrandStore }>()
);

export const deleteStoreRequest = createAction(
    '[Brand Stores API] Delete Store Request',
    props<{ payload: string }>()
);

export const deleteStoreFailure = createAction(
    '[Brand Stores API] Delete Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteStoreSuccess = createAction(
    '[Brand Stores API] Delete Store Success',
    props<{ payload: string }>()
);

export const confirmChangeStatusStore = createAction(
    '[Brand Stores Page] Confirm Change Status Store',
    props<{ payload: BrandStore }>()
);

export const updateStatusStoreRequest = createAction(
    '[Brand Stores API] Update Status Store Request',
    props<{ payload: { body: string; id: string } }>()
);

export const updateStatusStoreFailure = createAction(
    '[Brand Stores API] Update Status Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusStoreSuccess = createAction(
    '[Brand Stores API] Update Status Store Success',
    props<{ payload: FormStore }>()
);

// -----------------------------------------------------------------------------------------------------
// CRUD Store Employee Actions
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

export const confirmDeleteStoreEmployee = createAction(
    '[Store Employees Page] Confirm Delete Store Employee',
    props<{ payload: StoreEmployee }>()
);

export const deleteStoreEmployeeRequest = createAction(
    '[Store Employee API] Delete Store Employee Request',
    props<{ payload: string }>()
);

export const deleteStoreEmployeeFailure = createAction(
    '[Store Employee API] Delete Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteStoreEmployeeSuccess = createAction(
    '[Store Employee API] Delete Store Employee Success',
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
