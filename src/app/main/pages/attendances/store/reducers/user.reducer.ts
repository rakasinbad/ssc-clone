import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { User } from '../../models';
import { UserActions } from '../actions';

export const FEATURE_KEY = 'users';

interface UserState extends EntityState<User> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedUserId: string | number;
    source: TSource;
    user: User | undefined;
    users: UserState;
    errors: ErrorState;
}

const adapterUser = createEntityAdapter<User>({
    selectId: user => user.id
});
const initialUserState = adapterUser.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedUserId: null,
    source: 'fetch',
    user: undefined,
    users: initialUserState,
    errors: initialErrorState
};

const userReducer = createReducer(
    initialState,
    on(
        UserActions.fetchUserRequest,
        UserActions.fetchUsersRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(UserActions.fetchUsersFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(UserActions.fetchUsersSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        merchants: adapterUser.addAll(payload.users, {
            ...state.users,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchUsersFailure', state.errors)
    })),
    on(UserActions.fetchUserFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(UserActions.fetchUserSuccess, (state, { payload }) => {
        let newState = {
            ...state,
            source: payload.source
        };

        if (newState.source === 'fetch') {
            newState = {
                ...newState,
                isLoading: false,
                user: payload.user,
                errors: adapterError.removeOne('fetchUserFailure', state.errors)
            };
        } else {
            newState = {
                ...newState,
                isLoading: false,
                user: undefined,
                errors: adapterError.removeOne('fetchUserFailure', state.errors)
            };
        }

        return newState;
    }),
    on(
        UserActions.setSelectedUser,
        (state, { payload }) => ({
            ...state,
            user: payload
        })
    ),
    on(
        UserActions.resetSelectedUser,
        (state) => ({
            ...state,
            user: null
        })
    )
);

export function reducer(state: State | undefined, action: Action): State {
    return userReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListUserState = (state: State) => state.users;

export const {
    selectAll: selectAllUsers,
    selectEntities: selectUserEntities,
    selectIds: selectUserIds,
    selectTotal: selectUserTotal
} = adapterUser.getSelectors(getListUserState);
