import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { IImportProductsProgress } from '../../models';

import { ImportProductsProgressActions } from '../actions';

export const FEATURE_KEY = 'import_products_progress';

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
  isLoading: boolean;
  payload: IImportProductsProgress | null;
  error: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialPayloadState: IImportProductsProgress = {
  progress: 0,
  results: [],
  status: 'progress'
}

const initialState: State = {
  isLoading: false,
  payload: initialPayloadState,
  error: initialErrorState,
};

const importProductsProgressReducer = createReducer(
    initialState,

    on(ImportProductsProgressActions.importProductsProgressRequest, state => ({
      ...state,
      isLoading: true,
      error: initialErrorState,
    })),

    on(ImportProductsProgressActions.importProductsProgressSuccess, (state, { payload }) => ({
      ...state,
      isLoading: false,
      payload
    })),

    on(ImportProductsProgressActions.importProductsProgressFailure, (state, { payload }) => ({
      ...state,
      isLoading: false,
      error: adapterError.upsertOne(payload, state.error)
    })),

    on(ImportProductsProgressActions.importProductsProgressClearState, () => initialState)
);

export function reducer(state: State | undefined, action: Action): State {
    return importProductsProgressReducer(state, action);
}