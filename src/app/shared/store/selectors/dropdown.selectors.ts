import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';
import * as fromDropdown from '../reducers/dropdown.reducer';

export const getDropdownState = createFeatureSelector<fromDropdown.State>(fromDropdown.FEATURE_KEY);

export const getSearchState = createSelector(
    getDropdownState,
    state => state.search
);

export const getSearchAccountState = createSelector(
    getSearchState,
    state => state.accounts
);

export const getAllSearchAccount = createSelector(
    getDropdownState,
    fromDropdown.selectAllSearchAccounts
);

export const getRoleDropdownState = createSelector(
    getDropdownState,
    state => {
        console.log('DROPDOWN SELECTORS', state);
        return state.roles.length ? _.sortBy(state.roles, ['role'], ['asc']) : state.roles;
    }
);
