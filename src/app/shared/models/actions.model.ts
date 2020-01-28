import { TypedAction } from '@ngrx/store/src/models';

export type AnyAction = { payload: any; } & TypedAction<any>;