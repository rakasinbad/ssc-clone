import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';
import {
    Catalogue,
    CatalogueUnit,
    // ICatalogue,
    ICatalogueDemo,
    ICatalogueStockResponse,
    CatalogueCategory
} from '../../models';

import { TNullable } from 'app/shared/models';

export const fetchCatalogues = createAction(
    '[Catalogues API] Fetch Orders Request',
    props<{ payload: { status: string } }>()
);

/** Untuk mendefinisikan asal tempat pengubahan data katalog. */
type TSourceEdit = 'list' | 'form';

/**
 * FILTER CATALOGUES
 */

export const filterAllCatalogues = createAction('[Catalogues Page] Filter All Catalogues');
export const filterLiveCatalogues = createAction('[Catalogues Page] Filter Live Catalogues');
export const filterEmptyCatalogues = createAction('[Catalogues Page] Filter Empty Catalogues');
export const filterBlockedCatalogues = createAction('[Catalogues Page] Filter Blocked Catalogues');
export const filterInactiveCatalogues = createAction('[Catalogues Page] Filter Inactive Catalogues');

/**
 * CATALOGUE - SELECTION
 */
export const setSelectedCatalogue = createAction(
    '[Catalogues Page] Set Selected Catalogue',
    props<{ payload: string }>()
);

/**
 * CATALOGUE - ADD
 */
export const startAddNewCatalogue = createAction(
    '[Catalogues API] Start to Add New Catalogue',
    props<{ payload: Partial<Catalogue> }>()
);

export const addNewCatalogueRequest = createAction(
    '[Catalogues API] Add New Catalogue Request',
    props<{ payload: Partial<Catalogue> }>()
);

export const addNewCatalogueFailure = createAction(
    '[Catalogues API] Add New Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const addNewCatalogueSuccess = createAction(
    '[Catalogues API] Add New Catalogue Success',
    props<{ payload: Catalogue }>()
);

/**
 * CATALOGUE - PATCH
 */
export const startPatchCatalogue = createAction(
    '[Catalogues API] Start to Patch Catalogue',
    props<{ payload: { id: string; data: Partial<Catalogue>; source: TSourceEdit } }>()
);

export const patchCatalogueRequest = createAction(
    '[Catalogues API] Patch Catalogue Request',
    props<{ payload: { id: string; data: Partial<Catalogue>; source: TSourceEdit } }>()
);


export const patchCatalogueFailure = createAction(
    '[Catalogues API] Patch Catalogue Failure',
    props<{ payload: IErrorHandler }>()
);

export const patchCatalogueSuccess = createAction(
    '[Catalogues API] Patch Catalogue Success',
    props<{ payload: { data: Partial<Catalogue>; source: TSourceEdit; } }>()
);

/**
 * CATALOGUE - FETCH
 */
export const prepareFetchCatalogue = createAction(
    '[Catalogues API] Prepare to Fetch Catalogue Request',
    props<{ payload: string }>()
);

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

export const fetchCatalogueStockRequest = createAction(
    '[Catalogues API] Fetch Catalogue Stock Request',
    props<{ payload: string }>()
);

export const fetchCatalogueStockFailure = createAction(
    '[Catalogues API] Fetch Catalogue Stock Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueStockSuccess = createAction(
    '[Catalogues API] Fetch Catalogue Stock Success',
    props<{ payload: { catalogueId: string; stock: ICatalogueStockResponse; } }>()
);

/**
 * UPDATE CATALOGUE
 */

export const updateCatalogue = createAction(
    '[Catalogues Page] Update Catalogue',
    props<{ catalogue: Update<Catalogue> }>()
);

/**
 * FETCH CATALOGUE CATEGORY
 */

export const prepareFetchCatalogueCategory = createAction(
    '[Catalogues API] Prepare to Fetch Catalogue Category',
    props<{ payload: string }>()
);

export const fetchCatalogueCategoryRequest = createAction(
    '[Catalogues API] Fetch Catalogue Category Request',
    props<{ payload: string }>()
);

export const fetchCatalogueCategoryFailure = createAction(
    '[Catalogues API] Fetch Catalogue Category Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueCategorySuccess = createAction(
    '[Catalogues API] Fetch Catalogue Category Success',
    props<{ payload: { category?: CatalogueCategory; source: TSource } }>()
);

/**
 * FETCH CATALOGUE CATEGORIES
 */
export const prepareFetchCatalogueCategories = createAction(
    '[Catalogues API] Prepare to Fetch Catalogue Categories',
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueCategoriesRequest = createAction(
    '[Catalogues API] Fetch Catalogue Categories Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueCategoriesFailure = createAction(
    '[Catalogues API] Fetch Catalogue Categories Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueCategoriesSuccess = createAction(
    '[Catalogues API] Fetch Catalogue Categories Success',
    props<{ payload: { categories?: Array<CatalogueCategory>; source: TSource } }>()
);

/**
 * FETCH CATALOGUE UNIT
 */
export const prepareFetchCatalogueUnit = createAction(
    '[Catalogues API] Prepare to Fetch Catalogue Unit',
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueUnitRequest = createAction(
    '[Catalogues API] Fetch Catalogue Unit Request',
    props<{ payload: IQueryParams }>()
);

export const fetchCatalogueUnitFailure = createAction(
    '[Catalogues API] Fetch Catalogue Unit Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCatalogueUnitSuccess = createAction(
    '[Catalogues API] Fetch Catalogue Unit Success',
    props<{ payload: { units: Array<CatalogueUnit>; source: TSource } }>()
);

/**
 * FETCH CATEGORY TREE
 */
export const prepareFetchCategoryTree = createAction(
    '[Catalogues API] Prepare to Fetch Category Tree'
);

export const fetchCategoryTreeRequest = createAction(
    '[Catalogues API] Fetch Category Tree Request'
);

export const fetchCategoryTreeFailure = createAction(
    '[Catalogues API] Fetch Category Tree Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchCategoryTreeSuccess = createAction(
    '[Catalogues API] Fetch Category Tree Success',
    props<{ payload: { categoryTree?: Array<CatalogueCategory>; source: TSource } }>()
);

/**
 * FETCH TOTAL CATALOGUE STATUS
 */
export const prepareFetchTotalCatalogueStatus = createAction(
    '[Catalogues API] Prepare to Fetch Total Catalogue Status'
);

export const fetchTotalCatalogueStatusRequest = createAction(
    '[Catalogues API] Fetch Total Catalogue Status Request'
);

export const fetchTotalCatalogueStatusFailure = createAction(
    '[Catalogues API] Fetch Total Catalogue Status Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchTotalCatalogueStatusSuccess = createAction(
    '[Catalogues API] Fetch Total Catalogue Status Success',
    props<{ payload: { totalAllStatus: string; totalEmptyStock: string; totalActive: string; totalInactive: string; totalBanned: string; } }>()
);

/**
 * FETCH CATALOGUES
 */
export const prepareFetchCatalogues = createAction(
    '[Catalogues API] Prepare to Fetch Catalogues',
    props<{ payload: IQueryParams }>()
);

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
export const prepareSetCatalogueToActive = createAction(
    '[Catalogues API] Prepare to Set Catalogue to Active',
    props<{ payload: string }>()
);

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

export const prepareSetCatalogueToInactive = createAction(
    '[Catalogues API] Prepare to Set Catalogue to Inactive',
    props<{ payload: string }>()
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

export const prepareRemoveCatalogue = createAction(
    '[Catalogues API] Prepare to Remove Catalogue',
    props<{ payload: string }>()
);

export const removeCatalogueRequest = createAction(
    '[Catalogues API] Remove Catalogue Request',
    props<{ payload: string }>()
);

export const removeCatalogueSuccess = createAction(
    '[Catalogues API] Remove Catalogue Success',
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

export const setProductName = createAction(
    '[Catalogues Page] Set Product Name',
    props<{ payload: string }>()
);

export const addSelectedCategory = createAction(
    '[Catalogues Page] Add Selected Category',
    props<{ payload: { id: string, name: string, parent: TNullable<string> } }>()
    );

export const setSelectedCategories = createAction(
    '[Catalogues Page] Set Selected Category',
    props<{ payload: Array<{ id: string, name: string, parent: TNullable<string> }> }>()
    );

export const resetSelectedCategories = createAction('[Catalogues Page] Reset Selected Categories');

/**
 * FOR DEMO PURPOSE ONLY
 */

export const generateCataloguesDemo = createAction(
    '[Catalogues Page] Generate Catalogues Demo',
    props<{ payload: ICatalogueDemo[] }>()
);
