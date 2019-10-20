import { createAction, props } from '@ngrx/store';

import { IMerchantDemo, IStoreEmployeeDemo } from '../../models';

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
