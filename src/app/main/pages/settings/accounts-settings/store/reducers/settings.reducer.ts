import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TNullable, TSource } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';

import { User } from '../../models';
import { SettingsActions } from '../actions';

/** FEATURE KEY */
export const FEATURE_KEY = 'settings';

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

// interface CatalogueState extends EntityState<Catalogue> {
//     total: number;
// }

interface ErrorState extends EntityState<IErrorHandler> {}

interface IUserState {
    data: TNullable<User>;
    source: 'cache' | 'fetch';
    lastFetch: Date;
}

export interface State {
    isRequesting: boolean;
    user: IUserState;
    errors: ErrorState;
}

/**
 * CATALOGUE STATE
 */
// const adapterCatalogue: EntityAdapter<Catalogue> = createEntityAdapter<Catalogue>({
//     selectId: catalogue => catalogue.id
// });
// const initialCatalogueState = adapterCatalogue.getInitialState({ total: 0, limit: 10, skip: 0, data: [] });

/**
 * ERROR STATE
 */
const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

const initialState: State = {
    isRequesting: false,
    user: {
        data: null,
        source: 'cache',
        lastFetch: new Date()
    },
    errors: initialErrorState
};

const settingsReducer = createReducer(
    /**
     *  ===================================================================
     *  INITIAL STATE
     *  ===================================================================
     */

    initialState,
    /**
     *  ===================================================================
     *  GETTERS & SETTERS
     *  ===================================================================
     */
    // on(
    //     CatalogueActions.addSelectedCategory,
    //     (state, { payload }) => ({
    //         ...state,
    //         selectedCategories: [...state.selectedCategories, {
    //             id: payload.id, name: payload.name, parent: payload.parent
    //         }]
    //     })
    // ),
    // on(
    //     CatalogueActions.setSelectedCategories,
    //     (state, { payload }) => ({
    //         ...state,
    //         selectedCategories: payload
    //     })
    // ),
    // on(
    //     CatalogueActions.setProductName,
    //     (state, { payload }) => ({
    //         ...state,
    //         productName: payload
    //     })
    // ),
    /**
     *  ===================================================================
     *  REQUESTS
     *  ===================================================================
     */

    on(SettingsActions.fetchUserRequest, SettingsActions.patchUserRequest, state => ({
        ...state,
        isRequesting: true
    })),
    /**
     *  ===================================================================
     *  FAILURES
     *  ===================================================================
     */
    on(
        SettingsActions.fetchUserFailure,
        SettingsActions.patchUserFailure,
        (state, { payload }) => ({
            ...state,
            isRequesting: false,
            errors: adapterError.upsertOne(payload, state.errors)
        })
    ),
    /**
     *  ===================================================================
     *  SUCCESSES
     *  ===================================================================
     */

    on(SettingsActions.fetchUserSuccess, (state, { payload }) => ({
        ...state,
        isRequesting: false,
        user: {
            data: payload.user,
            source: payload.source as TSource,
            lastFetch: new Date()
        },
        errors: adapterError.removeOne('fetchUserFailure', state.errors)
    })),
    on(SettingsActions.patchUserSuccess, (state, { payload }) => ({
        ...state,
        isRequesting: false,
        user: {
            // ...state.user,
            data: payload.user,
            source: 'fetch' as TSource,
            lastFetch: new Date()
        },
        errors: adapterError.removeOne('fetchUserFailure', state.errors)
    })),
    /**
     *  ===================================================================
     *  UPDATE
     *  ===================================================================
     */

    // on(
    //     SettingsActions.updateUser,
    //     (state, { user }) => ({
    //         ...state,
    //         user: adapterCatalogue.updateOne(catalogue, state.catalogues)
    //     })
    // ),
    /**
     *  ===================================================================
     *  RESETS
     *  ===================================================================
     */

    on(SettingsActions.resetUser, state => ({
        ...state,
        user: {
            data: null,
            source: 'fetch' as TSource,
            lastFetch: state.user.lastFetch
        }
    }))
);

export function reducer(state: State | undefined, action: Action): State {
    return settingsReducer(state, action);
}

// const getListUserState = (state: State) => state.catalogues;

// export const {
//     selectAll: selectAllCatalogues,
//     selectEntities: selectCatalogueEntities,
//     selectIds: selectCatalogueIds,
//     selectTotal: selectCataloguesTotal
// } = adapterCatalogue.getSelectors(getListCatalogueState);
