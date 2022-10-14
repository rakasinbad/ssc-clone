import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { IStatusOMS, ICancelReason } from '../../models';

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
// Fetch Calculate Orders
// -----------------------------------------------------------------------------------------------------

export const fetchCalculateOrdersRequest = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Request'
);

export const fetchCalculateOrdersFailure = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCalculateOrdersSuccess = createAction(
    '[Calculate Orders API] Fetch Calculate Orders Success',
    props<{ payload: IStatusOMS }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch CAncel Order Reason
// -----------------------------------------------------------------------------------------------------

export const fetchCancelOrderReasonRequest = createAction(
    '[Orders API] Fetch Cancel Order Reason Request',
    props<{ payload: any }>()
);

export const fetchCancelOrderReasonFailure = createAction(
    '[Orders API] Fetch Cancel Order Reason Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCancelOrderReasonSuccess = createAction(
    '[Orders API] Fetch Cancel Order Reason Success',
    props<{ payload: { data: ICancelReason[]; total?: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// EXPORT Order
// -----------------------------------------------------------------------------------------------------

export const exportRequest = createAction(
    '[Order Page] Export Request',
    props<{ payload: { status?: any; dateGte?: string; dateLte?: string } }>()
);

export const exportFailure = createAction(
    '[Order Page] Export Failure',
    props<{ payload: IErrorHandler }>()
);

export const exportSuccess = createAction(
    '[Order Page] Export Success',
    props<{ payload: string }>()
);

// export const exportSuccess = createAction(
//     '[Order Page] Export Success',
//     props<{ payload: { file: Blob; name: string } }>()
// );

// -----------------------------------------------------------------------------------------------------
// IMPORT Order
// -----------------------------------------------------------------------------------------------------

export const importRequest = createAction(
    '[Order Page] Import Request',
    props<{ payload: { file: File; type: string } }>()
);

export const importFailure = createAction(
    '[Order Page] Import Failure',
    props<{ payload: IErrorHandler }>()
);

export const importSuccess = createAction('[Order Page] Import Success');

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE DELIVERED QTY] Order Detail
// -----------------------------------------------------------------------------------------------------

export const updateDeliveredQtyRequest = createAction(
    '[Order Details API] Update Delivered Qty Request',
    props<{ payload: { body: number; id: string } }>()
);

export const updateDeliveredQtyFailure = createAction(
    '[Order Details API] Update Delivered Qty Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateDeliveredQtySuccess = createAction(
    '[Order Details API] Update Delivered Qty Success'
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE INVOICED QTY] Order Detail
// -----------------------------------------------------------------------------------------------------

export const updateInvoicedQtyRequest = createAction(
    '[Order Details API] Update Invoiced Qty Request',
    props<{ payload: { body: number; id: string } }>()
);

export const updateInvoicedQtyFailure = createAction(
    '[Order Details API] Update Invoiced Qty Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateInvoicedQtySuccess = createAction(
    '[Order Details API] Update Invoiced Qty Success'
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - CHANGE CANCEL STATUS ORDER] Orders
// -----------------------------------------------------------------------------------------------------

export const confirmChangeCancelStatusOrder = createAction(
    '[Orders Page] Confirm Change Cancel Status Order',
    props<{ payload: any }>()
);

export const updateCancelStatusRequest = createAction(
    '[Orders API] Update Cancel Status Order Request',
    props<{ payload: { body: string; id: string } }>()
);

export const updateCancelStatusFailure = createAction(
    '[Orders API] Update Cancel Status Order Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateCancelStatusSuccess = createAction(
    '[Orders API] Update Cancel Status Order Success',
    props<{ payload: Update<any> }>()
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

export const confirmChangeStatusOrderWithReason = createAction(
    '[Orders Page] Confirm Change Status Order With Reason',
    props<{ payload: any }>()
);

export const updateStatusOrderWithReasonRequest = createAction(
    '[Orders API] Update Status Order With Reason Request',
    props<{ payload: { body: string; id: string } }>()
);

export const updateStatusOrderWithReasonFailure = createAction(
    '[Orders API] Update Status Order With Reason Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateStatusOrderWithReasonSuccess = createAction(
    '[Orders API] Update Status Order With Reason Success',
    props<{ payload: Update<any> }>()
);

export const confirmChangeOrder = createAction(
    '[Orders Page] Confirm Change Order Result',
    props<{ payload: { body: any; id: string } }>()
);

export const updateOrderRequest = createAction(
    '[Orders API] Update Order Result Request',
    props<{ payload: { body: any; id: string } }>()
);

export const updateOrderFailure = createAction(
    '[Orders API] Update Order Result Failure',
    props<{ payload: IErrorHandler }>()
);

export const updateOrderSuccess = createAction(
    '[Orders API] Update Order Result Success',
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
export const filterPendingPartialOrder = createAction('[Orders Page] Filter Pending Partial Order');

export const onEdit = createAction('[Orders Page] On Edit Value');
export const onEditFinished = createAction('[Orders Page] On Finished Edit Value');

