import { createAction, props } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models';

export const showCustomToolbar = createAction('[UI] Show Custom Toolbar');
export const hideCustomToolbar = createAction('[UI] Hide Custom Toolbar');

export const setCustomToolbarActive = createAction(
    '[UI] Set Custom Toolbar Active',
    props<{ payload: string }>()
);
export const resetCustomToolbarActive = createAction('[UI] Reset Custom Toolbar Active State');

export const createBreadcrumb = createAction(
    '[UI] Create Breadcrumb',
    props<{ payload: IBreadcrumbs[] }>()
);
export const resetBreadcrumb = createAction('[UI] Reset Breadcrumb State');

export const createSmallBreadcrumb = createAction(
    '[UI] Create Small Breadcrumb',
    props<{ payload: IBreadcrumbs[] }>()
);
export const resetSmallBreadcrumb = createAction('[UI] Reset Small Breadcrumb State');

export const showFooterAction = createAction('[UI] Show Footer Action');
export const hideFooterAction = createAction('[UI] Hide Footer Action');

export const setFooterActionConfig = createAction(
    '[UI] Set Footer Action Config',
    props<{ payload: IFooterActionConfig }>()
);

export const setHighlightRow = createAction('[UI] Set Highlight Row', props<{ payload: string }>());
export const resetHighlightRow = createAction('[UI] Reset Highlight Row State');
