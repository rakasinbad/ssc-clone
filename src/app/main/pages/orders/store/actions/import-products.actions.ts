import { createAction, props } from '@ngrx/store';
import { ErrorHandler, EStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Update } from '@ngrx/entity';
import { ProductList } from '../../models';
import { ImportProducts } from '../../models';

// -----------------------------------------------------------------------------------------------------
// Import Product 
// -----------------------------------------------------------------------------------------------------

export const importProductsRequest = createAction(
    '[IMPORT PRODUCT] Upload Import Product Request',
    props<{ payload: ImportProducts }>()
);

export const importProductsFailure = createAction(
    '[IMPORT PRODUCT] Upload Import Product Failure',
    props<{ payload: ErrorHandler }>()
);

export const importProductsSuccess = createAction(
    '[IMPORT PRODUCT] Upload Import Product Success',
    props<{ payload: { id: string } }>()
);

export const importProductsClearState = createAction('[IMPORT PRODUCT] Clear State Upload Import Product');