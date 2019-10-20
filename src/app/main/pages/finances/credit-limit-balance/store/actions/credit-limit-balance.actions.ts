import { createAction, props } from '@ngrx/store';

import { ICreditLimitBalanceDemo } from '../../models';

export const generateCreditLimitBalanceDemo = createAction(
    '[Credit Limit Balance Page] Generate Credit Limit Balance Demo',
    props<{ payload: ICreditLimitBalanceDemo[] }>()
);

export const getCreditLimitBalanceDemoDetail = createAction(
    '[Credit Limit Balance Page] Get Credit Limit Balance Demo Detail',
    props<{ payload: string }>()
);
