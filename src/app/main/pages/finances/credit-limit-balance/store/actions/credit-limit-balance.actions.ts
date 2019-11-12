import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams } from 'app/shared/models';

import { CreditLimitGroup, ICreditLimitBalanceDemo } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Fetch Credit Limit Groups
// -----------------------------------------------------------------------------------------------------

export const fetchCreditLimitGroupsRequest = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCreditLimitGroupsFailure = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCreditLimitGroupsSuccess = createAction(
    '[Credit Limit Groups API] Fetch Credit Limit Groups Success',
    props<{ payload: CreditLimitGroup[] }>()
);

// -----------------------------------------------------------------------------------------------------
// For Demo
// -----------------------------------------------------------------------------------------------------

export const generateCreditLimitBalanceDemo = createAction(
    '[Credit Limit Balance Page] Generate Credit Limit Balance Demo',
    props<{ payload: ICreditLimitBalanceDemo[] }>()
);

export const getCreditLimitBalanceDemoDetail = createAction(
    '[Credit Limit Balance Page] Get Credit Limit Balance Demo Detail',
    props<{ payload: string }>()
);
