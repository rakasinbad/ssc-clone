import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';

import { Store as Merchant, UserStore, IResendStoreResponse } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Re-send Stores
// -----------------------------------------------------------------------------------------------------

export const resendStoresRequest = createAction(
    '[Stores API] Re-send Stores Request',
    props<{ payload: SupplierStore | Array<SupplierStore> }>()
);

export const resendStoresFailure = createAction(
    '[Stores API] Re-send Stores Failure',
    props<{ payload: IErrorHandler }>()
);

export const resendStoresSuccess = createAction(
    '[Stores API] Re-send Stores Success',
    props<{ payload: Array<IResendStoreResponse> }>()
);

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
    props<{ payload: { data: SupplierStore[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store
// -----------------------------------------------------------------------------------------------------

export const fetchStoreRequest = createAction(
    '[Store API] Fetch Store Request',
    props<{ payload: string }>()
);

export const fetchStoreFailure = createAction(
    '[Store API] Fetch Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreSuccess = createAction(
    '[Store API] Fetch Store Success',
    props<{ payload: SupplierStore }>()
);

// export const fetchStoreSuccess = createAction(
//     '[Store API] Fetch Store Success',
//     props<{ payload: Update<SupplierStore> }>()
// );

// -----------------------------------------------------------------------------------------------------
// Fetch Store Edit
// -----------------------------------------------------------------------------------------------------

export const fetchStoreEditRequest = createAction(
    '[Store API] Fetch Store Edit Request',
    props<{ payload: string }>()
);

export const fetchStoreEditFailure = createAction(
    '[Store API] Fetch Store Edit Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreEditSuccess = createAction(
    '[Store API] Fetch Store Edit Success',
    props<{ payload: Merchant }>()
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
    props<{ payload: { data: UserStore[]; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Store Employee Edit
// -----------------------------------------------------------------------------------------------------

export const fetchStoreEmployeeEditRequest = createAction(
    '[Store Employee API] Fetch Store Employee Edit Request',
    props<{ payload: string }>()
);

export const fetchStoreEmployeeEditFailure = createAction(
    '[Store Employee API] Fetch Store Employee Edit Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchStoreEmployeeEditSuccess = createAction(
    '[Store Employee API] Fetch Store Employee Edit Success',
    props<{ payload: User }>()
);

// -----------------------------------------------------------------------------------------------------
// EXPORT Order
// -----------------------------------------------------------------------------------------------------

export const exportRequest = createAction(
    '[Store Page] Export Request',
    props<{ payload: { status?: any; dateGte?: string; dateLte?: string } }>()
);

export const exportFailure = createAction(
    '[Store Page] Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const exportSuccess = createAction(
    '[Store Page] Export Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CREATE STORE] Stores
// -----------------------------------------------------------------------------------------------------

export const createStoreRequest = createAction(
    '[Stores API] Create Store Request',
    props<{ payload: any }>()
);

export const createStoreFailure = createAction(
    '[Stores API] Create Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const createStoreSuccess = createAction(
    '[Stores API] Create Store Success',
    props<{ payload: Merchant }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE STORE] Stores
// -----------------------------------------------------------------------------------------------------

export const confirmUpdateStore = createAction(
    '[Stores API] Confirm Update Store',
    props<{ payload: { body: any; id: string } }>()
);

export const updateStoreRequest = createAction(
    '[Stores API] Update Store Request',
    props<{ payload: { body: any; id: string } }>()
);

export const updateStoreFailure = createAction(
    '[Stores API] Update Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreSuccess = createAction(
    '[Stores API] Update Store Success',
    props<{ payload: Merchant }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE STORE] Stores
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteStore = createAction(
    '[Stores Page] Confirm Delete Store',
    props<{ payload: SupplierStore }>()
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
// [CRUD - CHANGE STATUS STORE] Stores
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusStore = createAction(
    '[Stores Page] Confirm Change Status Store',
    props<{ payload: SupplierStore }>()
);

export const updateStatusStoreRequest = createAction(
    '[Stores API] Update Status Store Request',
    props<{ payload: { body: TStatus; id: string } }>()
);

export const updateStatusStoreFailure = createAction(
    '[Stores API] Update Status Store Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusStoreSuccess = createAction(
    '[Stores API] Update Status Store Success',
    props<{ payload: Update<SupplierStore> }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE EMPLOYEE] Store Employees
// -----------------------------------------------------------------------------------------------------

export const updateStoreEmployeeRequest = createAction(
    '[Store Employee API] Update Store Employee Request',
    props<{
        payload: {
            body: { fullName?: string; roles?: number[]; mobilePhoneNo?: string };
            id: string;
        };
    }>()
);

export const updateStoreEmployeeFailure = createAction(
    '[Store Employee API] Update Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStoreEmployeeSuccess = createAction(
    '[Store Employee API] Update Store Employee Success',
    props<{ payload: User }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - DELETE EMPLOYEE] Store Employees
// -----------------------------------------------------------------------------------------------------

export const confirmDeleteStoreEmployee = createAction(
    '[Store Employees Page] Confirm Delete Store Employee',
    props<{ payload: UserStore }>()
);

export const deleteStoreEmployeeRequest = createAction(
    '[Store Employees API] Delete Store Employee Request',
    props<{ payload: string }>()
);

export const deleteStoreEmployeeFailure = createAction(
    '[Store Employees API] Delete Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const deleteStoreEmployeeSuccess = createAction(
    '[Store Employees API] Delete Store Employee Success',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS EMPLOYEE] Store Employees
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusStoreEmployee = createAction(
    '[Store Employees Page] Confirm Change Status Store Employee',
    props<{ payload: UserStore }>()
);

export const updateStatusStoreEmployeeRequest = createAction(
    '[Store Employee API] Update Status Store Employee Request',
    props<{ payload: { body: TStatus; id: string } }>()
);

export const updateStatusStoreEmployeeFailure = createAction(
    '[Store Employee API] Update Status Store Employee Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusStoreEmployeeSuccess = createAction(
    '[Store Employee API] Update Status Store Employee Success',
    props<{ payload: Update<UserStore> }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Brand Stores
// -----------------------------------------------------------------------------------------------------

// export const fetchBrandStoresRequest = createAction(
//     '[Brand Stores API] Fetch Brand Stores Request',
//     props<{ payload: IQueryParams }>()
// );

// export const fetchBrandStoresFailure = createAction(
//     '[Brand Stores API] Fetch Brand Stores Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const fetchBrandStoresSuccess = createAction(
//     '[Brand Stores API] Fetch Brand Stores Success',
//     props<{ payload: { brandStores: BrandStore[]; total: number } }>()
// );

// -----------------------------------------------------------------------------------------------------
// Fetch Brand Store Edit
// -----------------------------------------------------------------------------------------------------

// export const fetchBrandStoreEditRequest = createAction(
//     '[Brand Store API] Fetch Brand Store Edit Request',
//     props<{ payload: string }>()
// );

// export const fetchBrandStoreEditFailure = createAction(
//     '[Brand Store API] Fetch Brand Store Edit Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const fetchBrandStoreEditSuccess = createAction(
//     '[Brand Store API] Fetch Brand Store Edit Success',
//     props<{ payload: { brandStore?: StoreEdit; source: TSource } }>()
// );

// -----------------------------------------------------------------------------------------------------
// Fetch Brand Store
// -----------------------------------------------------------------------------------------------------

// export const fetchBrandStoreRequest = createAction(
//     '[Brand Store API] Fetch Brand Store Request',
//     props<{ payload: string }>()
// );

// export const fetchBrandStoreFailure = createAction(
//     '[Brand Store API] Fetch Brand Store Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const fetchBrandStoreSuccess = createAction(
//     '[Brand Store API] Fetch Brand Store Success',
//     props<{ payload: { brandStore?: BrandStore; source: TSource } }>()
// );

// -----------------------------------------------------------------------------------------------------
// Fetch Store Employees
// -----------------------------------------------------------------------------------------------------

// export const fetchStoreEmployeesRequest = createAction(
//     '[Store Employees API] Fetch Store Employees Request',
//     props<{ payload: { params: IQueryParams; storeId: string } }>()
// );

// export const fetchStoreEmployeesFailure = createAction(
//     '[Store Employees API] Fetch Store Employees Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const fetchStoreEmployeesSuccess = createAction(
//     '[Store Employees API] Fetch Store Employees Success',
//     props<{ payload: { employees: StoreEmployee[]; total: number } }>()
// );

// -----------------------------------------------------------------------------------------------------
// Fetch Store Employee
// -----------------------------------------------------------------------------------------------------

// export const fetchStoreEmployeeRequest = createAction(
//     '[Store Employee API] Fetch Store Employee Request',
//     props<{ payload: string }>()
// );

// export const fetchStoreEmployeeFailure = createAction(
//     '[Store Employee API] Fetch Store Employee Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const fetchStoreEmployeeSuccess = createAction(
//     '[Store Employee API] Fetch Store Employee Success',
//     props<{ payload: { employee?: StoreEmployeeDetail; source: TSource } }>()
// );

// -----------------------------------------------------------------------------------------------------
// CRUD Store Actions
// -----------------------------------------------------------------------------------------------------

// export const createStoreRequest = createAction(
//     '[Brand Stores API] Create Store Request',
//     props<{ payload: FormStore }>()
// );

// export const createStoreFailure = createAction(
//     '[Brand Stores API] Create Store Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const createStoreSuccess = createAction(
//     '[Brand Stores API] Create Store Success',
//     props<{ payload: IStoreCreateResponse }>()
// );

// export const updateStoreRequest = createAction(
//     '[Brand Stores API] Update Store Request',
//     props<{ payload: { body: FormStoreEdit; id: string } }>()
// );

// export const updateStoreFailure = createAction(
//     '[Brand Stores API] Update Store Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const updateStoreSuccess = createAction(
//     '[Brand Stores API] Update Store Success',
//     props<{ payload: IStoreEditResponse }>()
// );

// export const confirmDeleteStore = createAction(
//     '[Brand Stores Page] Confirm Delete Store',
//     props<{ payload: BrandStore }>()
// );

// export const deleteStoreRequest = createAction(
//     '[Brand Stores API] Delete Store Request',
//     props<{ payload: string }>()
// );

// export const deleteStoreFailure = createAction(
//     '[Brand Stores API] Delete Store Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const deleteStoreSuccess = createAction(
//     '[Brand Stores API] Delete Store Success',
//     props<{ payload: string }>()
// );

// export const confirmChangeStatusStore = createAction(
//     '[Brand Stores Page] Confirm Change Status Store',
//     props<{ payload: BrandStore }>()
// );

// export const updateStatusStoreRequest = createAction(
//     '[Brand Stores API] Update Status Store Request',
//     props<{ payload: { body: string; id: string } }>()
// );

// export const updateStatusStoreFailure = createAction(
//     '[Brand Stores API] Update Status Store Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const updateStatusStoreSuccess = createAction(
//     '[Brand Stores API] Update Status Store Success',
//     props<{ payload: FormStore }>()
// );

// -----------------------------------------------------------------------------------------------------
// CRUD Store Employee Actions
// -----------------------------------------------------------------------------------------------------

// export const updateStoreEmployeeRequest = createAction(
//     '[Store Employee API] Update Store Employee Request',
//     props<{ payload: { body: StoreEmployeeDetail; id: string } }>()
// );

// export const updateStoreEmployeeFailure = createAction(
//     '[Store Employee API] Update Store Employee Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const updateStoreEmployeeSuccess = createAction(
//     '[Store Employee API] Update Store Employee Success',
//     props<{ payload: StoreEmployeeDetail }>()
// );

// export const confirmDeleteStoreEmployee = createAction(
//     '[Store Employees Page] Confirm Delete Store Employee',
//     props<{ payload: StoreEmployee }>()
// );

// export const deleteStoreEmployeeRequest = createAction(
//     '[Store Employee API] Delete Store Employee Request',
//     props<{ payload: string }>()
// );

// export const deleteStoreEmployeeFailure = createAction(
//     '[Store Employee API] Delete Store Employee Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const deleteStoreEmployeeSuccess = createAction(
//     '[Store Employee API] Delete Store Employee Success',
//     props<{ payload: string }>()
// );

// export const confirmChangeStatusStoreEmployee = createAction(
//     '[Store Employees Page] Confirm Change Status Store Employee',
//     props<{ payload: any }>()
// );

// export const updateStatusStoreEmployeeRequest = createAction(
//     '[Store Employee API] Update Status Store Employee Request',
//     props<{ payload: { body: string; id: string } }>()
// );

// export const updateStatusStoreEmployeeFailure = createAction(
//     '[Store Employee API] Update Status Store Employee Failure',
//     props<{ payload: IErrorHandler }>()
// );

// export const updateStatusStoreEmployeeSuccess = createAction(
//     '[Store Employee API] Update Status Store Employee Success',
//     props<{ payload: any }>()
// );

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetStores = createAction('[Stores Page] Reset Stores State');

export const resetStore = createAction('[Stores Page] Reset Store State');

export const resetStoreEmployees = createAction(
    '[Store Employees Page] Reset Store Employees State'
);

export const resetStoreEmployee = createAction('[Store Employee Page] Reset Store Employee State');

export const resetGoPage = createAction('[Accounts Page] Reset Go Page State');

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const selectSupplierStore = createAction('[Stores Page] Select Supplier Store',
    props<{ payload: SupplierStore }>()
);

export const deselectSupplierStore = createAction('[Stores Page] Deselect Supplier Store');

export const setEditLocation = createAction('[Edit Location] Set Edit Location');

export const unsetEditLocation = createAction('[Edit Location] Unset Edit Location');

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
