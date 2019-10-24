import { createAction, props } from '@ngrx/store';

import { IPaymentStatusDemo } from './../../models';

export const generatePaymentsDemo = createAction(
    '[Payment Page] Generate Payments Demo',
    props<{ payload: IPaymentStatusDemo[] }>()
);

export const getPaymentDemoDetail = createAction(
    '[Payment Page] Get Payment Demo Detail',
    props<{ payload: string }>()
);
