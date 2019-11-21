import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromUser } from '../reducers';

export const getUserState = createFeatureSelector<fromUser.State>(
    fromUser.FEATURE_KEY
);

export const getAllUser = createSelector(
    getUserState,
    fromUser.selectAllUsers
);

export const getUserEntities = createSelector(
    getUserState,
    fromUser.selectUserEntities
);

export const getTotalUser = createSelector(
    getUserState,
    state => state.users.total
);

export const getSelectedUserId = createSelector(
    getUserState,
    state => state.selectedUserId
);

export const getSourceType = createSelector(
    getUserState,
    state => state.source
);

export const getUser = createSelector(
    getUserState,
    state => state.user
);

export const getSelectedUser = createSelector(
    getUserEntities,
    getSelectedUserId,
    getSourceType,
    getUser,
    (userEntities, userId, sourceType, user) =>
        sourceType === 'fetch' ? user : userEntities[userId]
);

export const getAllUserSource = createSelector(
    getAllUser,
    getTotalUser,
    (allUser, totalUser) => {
        return {
            data: allUser,
            total: totalUser
        };
    }
);

export const getIsDeleting = createSelector(
    getUserState,
    state => state.isDeleting
);

export const getIsLoading = createSelector(
    getUserState,
    state => state.isLoading
);
