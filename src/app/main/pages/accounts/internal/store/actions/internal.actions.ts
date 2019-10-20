import { createAction, props } from '@ngrx/store';
import { IInternalDemo } from '../../models';

export const generateInternalDemo = createAction(
    '[Internal Page] Generate Internal Demo',
    props<{ payload: IInternalDemo[] }>()
);

export const getInternalDemoDetail = createAction(
    '[Internal Page] Get Internal Demo Detail',
    props<{ payload: string }>()
);
