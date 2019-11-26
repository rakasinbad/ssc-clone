import { FuseNavigation } from '@fuse/types';
import { createAction, props } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Custom Toolbar
// -----------------------------------------------------------------------------------------------------

export const showCustomToolbar = createAction('[UI] Show Custom Toolbar');

export const hideCustomToolbar = createAction('[UI] Hide Custom Toolbar');

// -----------------------------------------------------------------------------------------------------
// Custom Toolbar Active
// -----------------------------------------------------------------------------------------------------

export const setCustomToolbarActive = createAction(
    '[UI] Set Custom Toolbar Active',
    props<{ payload: string }>()
);

export const resetCustomToolbarActive = createAction('[UI] Reset Custom Toolbar Active State');

// -----------------------------------------------------------------------------------------------------
// Register Navigation
// -----------------------------------------------------------------------------------------------------

export const registerNavigation = createAction(
    '[UI] Register Navigation',
    props<{ payload: { key: string; navigation: FuseNavigation[] } }>()
);

export const unregisterNavigation = createAction(
    '[UI] Unregister Navigation',
    props<{ payload: string }>()
);

// -----------------------------------------------------------------------------------------------------
// Create Breadcrumb
// -----------------------------------------------------------------------------------------------------

export const createBreadcrumb = createAction(
    '[UI] Create Breadcrumb',
    props<{ payload: IBreadcrumbs[] }>()
);

export const resetBreadcrumb = createAction('[UI] Reset Breadcrumb State');

// -----------------------------------------------------------------------------------------------------
// Create Small Breadcrumb
// -----------------------------------------------------------------------------------------------------

export const createSmallBreadcrumb = createAction(
    '[UI] Create Small Breadcrumb',
    props<{ payload: IBreadcrumbs[] }>()
);

export const resetSmallBreadcrumb = createAction('[UI] Reset Small Breadcrumb State');

// -----------------------------------------------------------------------------------------------------
// Show Footer Action
// -----------------------------------------------------------------------------------------------------

export const showFooterAction = createAction('[UI] Show Footer Action');
export const hideFooterAction = createAction('[UI] Hide Footer Action');

// -----------------------------------------------------------------------------------------------------
// Set Footer Action Config
// -----------------------------------------------------------------------------------------------------

export const setFooterActionConfig = createAction(
    '[UI] Set Footer Action Config',
    props<{ payload: IFooterActionConfig }>()
);

// -----------------------------------------------------------------------------------------------------
// Highlight Row
// -----------------------------------------------------------------------------------------------------

export const setHighlightRow = createAction('[UI] Set Highlight Row', props<{ payload: string }>());

export const resetHighlightRow = createAction('[UI] Reset Highlight Row State');
