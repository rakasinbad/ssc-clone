import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { CatalogueTax } from './../../models/classes/catalogue-tax.class';

enum Actions {
    FetchFailure = '[Catalogue] Fetch Catalogue Taxes Failure',
    FetchRequest = '[Catalogue] Fetch Catalogue Taxes Request',
    FetchSuccess = '[Catalogue] Fetch Catalogue Taxes Success',
    ResetState = '[Catalogue] Reset Catalogue Taxes',
}

export const fetchRequest = createAction(
    Actions.FetchRequest,
    props<{ queryParams: IQueryParams }>()
);

export const fetchSuccess = createAction(
    Actions.FetchSuccess,
    props<{ data: CatalogueTax[]; total: number }>()
);

export const fetchFailure = createAction(Actions.FetchFailure, props<{ payload: ErrorHandler }>());

export type FailureActions = 'fetchFailure';
