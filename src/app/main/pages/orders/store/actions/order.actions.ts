import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { IOrderDemo } from '../../models';
import { Update } from '@ngrx/entity';

// -----------------------------------------------------------------------------------------------------
// Fetch Orders
// -----------------------------------------------------------------------------------------------------

export const fetchOrdersRequest = createAction(
    '[Orders API] Fetch Orders Request',
    props<{ payload: IQueryParams }>()
);

export const fetchOrdersFailure = createAction(
    '[Orders API] Fetch Orders Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchOrdersSuccess = createAction(
    '[Orders API] Fetch Orders Success',
    props<{ payload: { data: any; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Order
// -----------------------------------------------------------------------------------------------------

export const fetchOrderRequest = createAction(
    '[Order API] Fetch Order Request',
    props<{ payload: string }>()
);

export const fetchOrderFailure = createAction(
    '[Order API] Fetch Order Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchOrderSuccess = createAction(
    '[Order API] Fetch Order Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE STATUS ORDER] Orders
// -----------------------------------------------------------------------------------------------------

export const confirmChangeStatusOrder = createAction(
    '[Orders Page] Confirm Change Status Order',
    props<{ payload: any }>()
);

export const updateStatusOrderRequest = createAction(
    '[Orders API] Update Status Order Request',
    props<{ payload: { body: string; id: string } }>()
);

export const updateStatusOrderFailure = createAction(
    '[Orders API] Update Status Order Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusOrderSuccess = createAction(
    '[Orders API] Update Status Order Success',
    props<{ payload: Update<any> }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetOrders = createAction('[Orders Page] Reset Orders State');

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const filterOrder = createAction(
    '[Orders Page] Filter Orders',
    props<{ payload: string }>()
);

export const filterAllOrder = createAction('[Orders Page] Filter All Order');
export const filterNewOrder = createAction('[Orders Page] Filter New Order');
export const filterPackingOrder = createAction('[Orders Page] Filter Packing Order');
export const filterToBeShippedOrder = createAction('[Orders Page] Filter To be Shipped Order');
export const filterShippedOrder = createAction('[Orders Page] Filter Shipped Order');
export const filterReceivedOrder = createAction('[Orders Page] Filter Received Order');
export const filterCompletedOrder = createAction('[Orders Page] Filter Completed Order');

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export const generateOrdersDemo = createAction(
    '[Orders Page] Generate Orders Demo',
    props<{ payload: IOrderDemo[] }>()
);

export const getOrderDemoDetail = createAction(
    '[Orders Page] Get Order Demo Detail',
    props<{ payload: string }>()
);
