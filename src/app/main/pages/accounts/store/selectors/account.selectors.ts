// import { createFeatureSelector, createSelector } from '@ngrx/store';

// import * as fromAccount from '../reducers/account.reducer';

// export const getAccountState = createFeatureSelector<fromAccount.State>(fromAccount.FEATURE_KEY);

// export const getAllAccount = createSelector(
//     getAccountState,
//     fromAccount.selectAllAccounts
// );

// export const getAccountEntities = createSelector(
//     getAccountState,
//     fromAccount.selectAccountEntities
// );

// export const getTotalAccount = createSelector(
//     getAccountState,
//     state => state.accounts.total
// );

// export const getSelectedAccountId = createSelector(
//     getAccountState,
//     state => state.selectedAccountId
// );

// export const getSourceType = createSelector(
//     getAccountState,
//     state => state.source
// );

// export const getAccount = createSelector(
//     getAccountState,
//     state => state.account
// );

// export const getSelectedAccount = createSelector(
//     getAccountEntities,
//     getSelectedAccountId,
//     getSourceType,
//     getAccount,
//     (accountEntities, accountId, sourceType, account) =>
//         sourceType === 'fetch' ? account : accountEntities[accountId]
// );

// export const getAllAccountSource = createSelector(
//     getAllAccount,
//     getTotalAccount,
//     (allAccount, totalAccount) => {
//         return {
//             data: allAccount,
//             total: totalAccount
//         };
//     }
// );

// export const getIsDeleting = createSelector(
//     getAccountState,
//     state => state.isDeleting
// );

// export const getIsLoading = createSelector(
//     getAccountState,
//     state => state.isLoading
// );
