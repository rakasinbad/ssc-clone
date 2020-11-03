import { TypedAction } from '@ngrx/store/src/models';

export type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);
