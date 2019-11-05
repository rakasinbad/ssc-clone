import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';
import { Catalogue, ICatalogue, ICatalogueDemo } from '../../models';

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
    props<{ payload: string }>()
);

export const fetchCatalogueFailure = createAction(
    '[Catalogues API] Fetch Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueSuccess = createAction(
    '[Catalogues API] Fetch Catalogue Success',
    props<{ payload: { catalogue?: Catalogue; source: TSource } }>()
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
    props<{ payload: { catalogues: Array<Catalogue>; total: number } }>()
);

/**
 * CONFIRMATION
 */

export const confirmSetCatalogueToActive = createAction(
    '[Catalogues Page] Confirm Set Catalogue to Active',
    props<{ payload: Catalogue }>()
);

export const confirmSetCatalogueToInactive = createAction(
    '[Catalogues Page] Confirm Set Catalogue to Inactive',
    props<{ payload: Catalogue }>()
);

export const confirmRemoveCatalogue = createAction(
    '[Catalogues Page] Confirm Remove Catalogue',
    props<{ payload: Catalogue }>()
);

/**
 * SET STATUS
 */

export const setCatalogueToActiveRequest = createAction(
    '[Catalogues API] Set Catalogue to Active Request',
    props<{ payload: string }>()
);

export const setCatalogueToActiveSuccess = createAction(
    '[Catalogues API] Set Catalogue to Active Success',
    props<{ payload: Update<Catalogue> }>()
);

export const setCatalogueToActiveFailure = createAction(
    '[Catalogues API] Set Catalogue to Active Failure',
    props<{ payload: IErrorHandler }>()
);

export const setCatalogueToInactiveRequest = createAction(
    '[Catalogues API] Set Catalogue to Inactive Request',
    props<{ payload: string }>()
);

export const setCatalogueToInactiveSuccess = createAction(
    '[Catalogues API] Set Catalogue to Inactive Success',
    props<{ payload: Update<Catalogue> }>()
);

export const setCatalogueToInactiveFailure = createAction(
    '[Catalogues API] Set Catalogue to Inactive Failure',
    props<{ payload: IErrorHandler }>()
);

export const removeCatalogueRequest = createAction(
    '[Catalogues API Remove Catalogue Request',
    props<{ payload: string }>()
);

export const removeCatalogueSuccess = createAction(
    '[Catalogues API Remove Catalogue Success',
    props<{ payload: Catalogue }>()
);

export const removeCatalogueFailure = createAction(
    '[Catalogues API] Remove Catalogue Failure',
    props<{ payload: IErrorHandler }>()
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
