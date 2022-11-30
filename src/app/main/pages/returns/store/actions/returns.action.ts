import { createAction, props } from '@ngrx/store';
import { IQueryParams } from 'app/shared/models/query.model';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnDetail, IReturnLine, ITotalReturnModel, IReturnAmount } from '../../models';
import { IChangeStatusReturn, IConfirmChangeStatusReturn, IReturnDetailLog } from '../../models/returndetail.model';
import { IConfirmChangeQuantityReturn } from '../../models/returndetail.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Returns
// -----------------------------------------------------------------------------------------------------

export const fetchReturnRequest = createAction(
    '[Returns API] Fetch Returns Request',
    props<{ payload: IQueryParams }>()
);

export const fetchReturnFailure = createAction(
    '[Returns API] Fetch Returns Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchReturnSuccess = createAction(
    '[Returns API] Fetch Returns Success',
    props<{ payload: { data: Array<IReturnLine>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Return Details
// -----------------------------------------------------------------------------------------------------

export const fetchReturnDetailRequest = createAction(
    '[Returns API] Fetch Return Details Request',
    props<{ payload: string }>()
);

export const fetchReturnDetailFailure = createAction(
    '[Returns API] Fetch Return Details Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchReturnDetailSuccess = createAction(
    '[Returns API] Fetch Return Detail Success',
    props<{ payload: { data: IReturnDetail } }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Total Returns
// -----------------------------------------------------------------------------------------------------

export const fetchTotalReturnRequest = createAction(
    '[Calculate Returns API] Fetch Calculate Returns Request'
);

export const fetchTotalReturnFailure = createAction(
    '[Calculate Returns API] Fetch Calculate Returns Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchTotalReturnSuccess = createAction(
    '[Calculate Returns API] Fetch Calculate Returns Success',
    props<{ payload: ITotalReturnModel }>()
);

// -----------------------------------------------------------------------------------------------------
// Fetch Amount Returns
// -----------------------------------------------------------------------------------------------------

export const fetchReturnAmountRequest = createAction(
    '[Amount Returns API] Fetch Return Amount Request',
    props<{ payload: string | number }>()
);

export const fetchReturnAmountFailure = createAction(
    '[Amount Returns API] Fetch Return Amount Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchReturnAmountSuccess = createAction(
    '[Amount Returns API] Fetch Return Amount Success',
    props<{ payload: IReturnAmount }>()
);


// -----------------------------------------------------------------------------------------------------
// Update Status Return
// -----------------------------------------------------------------------------------------------------

export const confirmChangeQuantityReturn = createAction(
    '[Returns Page] Confirm Change Quantity Return',
    props<{ payload: IConfirmChangeQuantityReturn }>()
);

export const confirmChangeStatusReturn = createAction(
    '[Returns Page] Confirm Change Status Return',
    props<{ payload: IConfirmChangeStatusReturn }>()
);

export const updateStatusReturnRequest = createAction(
    '[Returns API] Update Status Return Request',
    props<{ payload: { change: IChangeStatusReturn; id: string, returned: boolean } }>()
);

export const updateStatusReturnSuccess = createAction(
    '[Returns API] Update Status Return Succeeded',
    props<{
        payload: {
            returned: boolean;
            status: string;
            id: string,
            returnParcelLogs: Array<IReturnDetailLog>
        }
    }>()
);

export const updateStatusReturnFailure = createAction(
    '[Returns API] Update Status Return Failure',
    props<{ payload: IErrorHandler }>()
);


// -----------------------------------------------------------------------------------------------------
// Reset Return
// -----------------------------------------------------------------------------------------------------

export const resetReturn = createAction(
    '[Reset Return]'
);
