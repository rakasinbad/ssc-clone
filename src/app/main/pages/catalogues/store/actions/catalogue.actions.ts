import { createAction, props } from '@ngrx/store';
// import { IQueryParams } from 'app/shared/models';
import { ICatalogueDemo } from '../../models';

export const fetchCatalogues = createAction(
    '[Catalogues API] Fetch Orders Request',
    props<{ payload: { status: string } }>()
);

export const filterAllCatalogues = createAction('[Catalogues Page] Filter All Catalogues');
export const filterLiveCatalogues = createAction('[Catalogues Page] Filter Live Catalogues');
export const filterEmptyCatalogues = createAction('[Catalogues Page] Filter Empty Catalogues');
export const filterBlockedCatalogues = ('[Catalogues Page] Filter Blocked Catalogues');
export const filterArchivedCatalogues = createAction('[Catalogues Page] Filter Archived Catalogues');

export const generateCataloguesDemo = createAction(
    '[Catalogues Page] Generate Catalogues Demo',
    props<{ payload: ICatalogueDemo[] }>()
);
