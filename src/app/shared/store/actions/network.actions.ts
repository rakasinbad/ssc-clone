import { createAction, props } from '@ngrx/store';

export const networkStatusRequest = createAction('[Networks Helper] Network Status Request');

export const setNetworkStatus = createAction(
    '[Networks Helper] Set Network Status',
    props<{ payload: boolean }>()
);
