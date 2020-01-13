import { createAction, props } from '@ngrx/store';
import { ErrorHandler, IQueryParams, InvoiceGroup } from 'app/shared/models';
import { Association, IAssociationForm } from '../../models';
import { Portfolio } from '../../../portfolios/models';
import { SalesRep } from '../../../sales-reps/models';

export type failureActionNames =
    'createAssociationFailure' |
    'fetchAssociationFailure' |
    'fetchAssociationsFailure'
;

/**
 * ASSOCIATIONS
 */

export const fetchAssociationRequest = createAction(
    '[Associations API] Fetch Association Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationFailure = createAction(
    '[Associations API] Fetch Association Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationSuccess = createAction(
    '[Associations API] Fetch Association Success',
    props<{ payload: { data: Array<Association>; total: number } }>()
);

export const fetchAssociationsRequest = createAction(
    '[Associations Portfolios API] Fetch Associations Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAssociationsFailure = createAction(
    '[Associations API] Fetch Association sFailure',
    props<{ payload: ErrorHandler }>()
);

export const fetchAssociationsSuccess = createAction(
    '[Associations API] Fetch Associations Success',
    props<{ payload: { data: Array<Portfolio>; total: number } }>()
);

export const createAssociationRequest = createAction(
    '[Associations API] Create Association Request',
    props<{ payload: IAssociationForm }>()
);

export const createAssociationFailure = createAction(
    '[Associations API] Create Association Failure',
    props<{ payload: ErrorHandler }>()
);

export const createAssociationSuccess = createAction(
    '[Associations API] Create Association Success',
    props<{ payload: { message: string } }>()
);

// Used in Association's Form.

export const setSelectedSalesRep = createAction(
    '[Associations] Set Selected Sales Rep.',
    props<{ payload: SalesRep }>()
);

export const setSelectedInvoiceGroup = createAction(
    '[Associations] Set Selected Invoice Group',
    props<{ payload: InvoiceGroup }>()
);

export const setPortfolioEntityType = createAction(
    '[Associations] Set Portfolio Entity Type',
    props<{ payload: string }>()
);

export const setSearchValue = createAction(
    '[Associations PAGE] Set Search Value',
    props<{ payload: string }>()
);

// ----------------------------

export const clearState = createAction('[Association Page] Reset Core State');
