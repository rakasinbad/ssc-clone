import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { BrandStore, IMerchantDemo, IStoreEmployeeDemo } from '../../models';

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
