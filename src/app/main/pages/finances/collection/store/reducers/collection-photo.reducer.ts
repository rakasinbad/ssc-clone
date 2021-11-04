import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { IErrorHandler } from 'app/shared/models/global.model';

import { CollectionPhoto } from '../../models';
import { CollectionActions } from '../actions';

// Keyname for reducer
export const featureKey = 'collectionPhoto';

export interface State extends EntityState<CollectionPhoto> {
    isLoading: boolean;
    image: string;
}

// Adapter for Collection Photo state
export const adapter = createEntityAdapter<CollectionPhoto>({
    // selectId: (row) => row.id,
});

// Initialize state
export const initialState: State = adapter.getInitialState<Omit<State, 'ids' | 'entities'>>({
    isLoading: false,
    image: '',
});

// Create the reducer.
export const reducer = createReducer(
    initialState,
    on(CollectionActions.fetchCollectionPhotoRequest, (state) => ({
        ...state,
        isLoading: true,
    })),
    on(CollectionActions.fetchCollectionPhotoFailure, (state) => ({
        ...state,
        isLoading: false,
    })),
    on(CollectionActions.fetchCollectionPhotoRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        id: payload.id,
    })),
    on(CollectionActions.fetchCollectionPhotoSuccess, (state, { payload }) =>
        adapter.addOne(payload.data, { ...state, isLoading: false, image: payload.data.image })
    ),
    on(CollectionActions.clearState, CollectionActions.clearCollectionPhoto, () => initialState)
);
