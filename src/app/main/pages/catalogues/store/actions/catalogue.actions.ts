import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';
import { ICatalogue as Catalogues, ICatalogueDemo } from '../../models';

export const fetchCatalogues = createAction(
    '[Catalogues API] Fetch Orders Request',
    props<{ payload: { status: string } }>()
);

/**
 * FILTER CATALOGUES
 */

export const filterAllCatalogues = createAction('[Catalogues Page] Filter All Catalogues');
export const filterLiveCatalogues = createAction('[Catalogues Page] Filter Live Catalogues');
export const filterEmptyCatalogues = createAction('[Catalogues Page] Filter Empty Catalogues');
export const filterBlockedCatalogues = createAction('[Catalogues Page] Filter Blocked Catalogues');
export const filterArchivedCatalogues = createAction('[Catalogues Page] Filter Archived Catalogues');

/**
 * FETCH CATALOGUE
 */

export const fetchCatalogueRequest = createAction(
    '[Catalogues API] Fetch Catalogue Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueFailure = createAction(
    '[Catalogues API] Fetch Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueSuccess = createAction(
    '[Catalogues API] Fetch Catalogue Success',
    props<{ payload: { catalogue?: Catalogues; total: number } }>()
);

/**
 * FETCH CATALOGUES
 */

export const fetchCataloguesRequest = createAction(
    '[Catalogues API] Fetch Catalogues Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCataloguesFailure = createAction(
    '[Catalogues API] Fetch Catalogues Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCataloguesSuccess = createAction(
    '[Catalogues API] Fetch Catalogues Success',
    props<{ payload: { catalogues: Catalogues[]; total: number } }>()
);

/**
 * RESET
 */

export const resetCatalogue = createAction('[Catalogues Page] Reset Catalogue State');

export const resetCatalogues = createAction('[Catalogues Page] Reset Catalogues State');

/**
 * HELPERS
 */

export const startLoading = createAction('[Catalogues Page] Start Loading');

export const endLoading = createAction('[Catalogues Page] End Loading');

/**
 * FOR DEMO PURPOSE ONLY
 */

export const generateCataloguesDemo = createAction(
    '[Catalogues Page] Generate Catalogues Demo',
    props<{ payload: ICatalogueDemo[] }>()
);
