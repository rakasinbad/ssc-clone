import { Action, createReducer, on } from '@ngrx/store';
import { IBreadcrumbs, IFooterActionConfig } from 'app/shared/models';

import { UiActions } from '../actions';

export const FEAUTURE_KEY = 'ui';

export interface State {
    isShowCustomToolbar: boolean;
    isShowFooterAction: boolean;
    configFooterAction: IFooterActionConfig;
    breadcrumbs: IBreadcrumbs[];
    smallBreadcrumbs: IBreadcrumbs[];
    customToolbarActive?: string;
    selectedRowIndex: string;
    // showCustomToolbar: string;
}

const initialState: State = {
    isShowCustomToolbar: false,
    isShowFooterAction: false,
    configFooterAction: null,
    breadcrumbs: null,
    smallBreadcrumbs: null,
    // customToolbarActive: null,
    selectedRowIndex: '-1'
    // showCustomToolbar: null
};

const uiReducer = createReducer(
    initialState,
    on(UiActions.hideCustomToolbar, state => ({
        ...state,
        isShowCustomToolbar: false
    })),
    on(UiActions.showCustomToolbar, state => ({
        ...state,
        isShowCustomToolbar: true
    })),
    on(UiActions.setCustomToolbarActive, (state, { payload }) => ({
        ...state,
        customToolbarActive: payload
    })),
    on(UiActions.resetCustomToolbarActive, state => ({
        ...state,
        customToolbarActive: undefined
    })),
    on(UiActions.createBreadcrumb, (state, { payload }) => ({
        ...state,
        breadcrumbs: payload
    })),
    on(UiActions.resetBreadcrumb, state => ({
        ...state,
        breadcrumbs: initialState.breadcrumbs
    })),
    on(UiActions.createSmallBreadcrumb, (state, { payload }) => ({
        ...state,
        smallBreadcrumbs: payload
    })),
    on(UiActions.resetSmallBreadcrumb, state => ({
        ...state,
        smallBreadcrumbs: initialState.smallBreadcrumbs
    })),
    on(UiActions.hideFooterAction, state => ({
        ...state,
        isShowFooterAction: false
    })),
    on(UiActions.showFooterAction, state => ({
        ...state,
        isShowFooterAction: true
    })),
    on(UiActions.setFooterActionConfig, (state, { payload }) => ({
        ...state,
        configFooterAction: payload
    })),
    on(UiActions.setHighlightRow, (state, { payload }) => ({
        ...state,
        selectedRowIndex: payload
    })),
    on(UiActions.resetHighlightRow, state => ({
        ...state,
        selectedRowIndex: initialState.selectedRowIndex
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return uiReducer(state, action);
}
