import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { OrderActions, ImportProductsActions } from '../actions';

export const FEATURE_KEY = 'import_products';

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
  isLoadingImport: boolean;
  idImportedFile: string | null;
  errorImport: ErrorState;
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
  isLoadingImport: false,
  idImportedFile: null,
  errorImport: initialErrorState,
};

const importProductsReducer = createReducer(
    initialState,

    on(ImportProductsActions.importProductsRequest, state => ({
      ...state,
      isLoadingImport: true,
      idImportedFile: null,
      errorImport: initialErrorState,
    })),

    on(ImportProductsActions.importProductsSuccess, (state, { payload }) => ({
      ...state,
      isLoadingImport: false,
      idImportedFile: payload.id
    })),

    on(ImportProductsActions.importProductsFailure, (state, { payload }) => ({
      ...state,
      isLoadingImport: false,
      errorImport: adapterError.upsertOne(payload, state.errorImport)
    })),

    on(ImportProductsActions.importProductsClearState, () => initialState)
);

export function reducer(state: State | undefined, action: Action): State {
    return importProductsReducer(state, action);
}