import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models';
import { IOrderDemo } from '../../models';

export const fetchOrdersRequest = createAction(
    '[Orders API] Fetch Orders Request',
    props<{ payload: IQueryParams }>()
);

export const fetchOrdersSuccess = createAction(
    '[Orders API] Fetch Orders Success',
    props<{ payload: { orders: any; total: number } }>()
);

export const filterAllOrder = createAction('[Orders Page] Filter All Order');
export const filterNewOrder = createAction('[Orders Page] Filter New Order');
export const filterPackingOrder = createAction('[Orders Page] Filter Packing Order');
export const filterToBeShippedOrder = createAction('[Orders Page] Filter To be Shipped Order');
export const filterShippedOrder = createAction('[Orders Page] Filter Shipped Order');
export const filterReceivedOrder = createAction('[Orders Page] Filter Received Order');
export const filterCompletedOrder = createAction('[Orders Page] Filter Completed Order');

export const generateOrdersDemo = createAction(
    '[Orders Page] Generate Orders Demo',
    props<{ payload: IOrderDemo[] }>()
);

export const getOrderDemoDetail = createAction(
    '[Orders Page] Get Order Demo Detail',
    props<{ payload: string }>()
);
