import { createEntityAdapter, EntityState, Update } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { Progress, ProgressStatus } from 'app/shared/models/progress.model';

import { ProgressActions } from '../actions';

export const FEATURE_KEY = 'progress';

interface ProgressState extends EntityState<Progress> {
    selectedId: string;
}

export interface State {
    progresses: ProgressState;
}

const adapterProgress = createEntityAdapter<Progress>({ selectId: row => row.id });
const initialProgressState = adapterProgress.getInitialState({ selectedId: null });

export const initialState: State = {
    progresses: initialProgressState
};

const progressReducer = createReducer(
    initialState,
    on(ProgressActions.downloadRequest, (state, { payload }) => {
        const item: Progress = {
            id: payload.id,
            status: ProgressStatus.REQUEST,
            progress: null,
            error: null
        };

        return {
            ...state,
            progresses: adapterProgress.addOne(item, state.progresses)
        };
    }),
    on(ProgressActions.downloadCancel, (state, { payload }) => {
        const item: Update<Progress> = {
            id: payload.id,
            changes: {
                status: ProgressStatus.READY,
                progress: null,
                error: null
            }
        };

        return {
            ...state,
            progresses: adapterProgress.updateOne(item, state.progresses)
        };
    }),
    on(ProgressActions.downloadFailure, (state, { payload }) => {
        const item: Update<Progress> = {
            id: payload.id,
            changes: {
                status: ProgressStatus.FAILED,
                progress: null,
                error: payload.error
            }
        };

        return {
            ...state,
            progresses: adapterProgress.updateOne(item, state.progresses)
        };
    }),
    on(ProgressActions.downloadStarted, (state, { payload }) => {
        const item: Update<Progress> = {
            id: payload.id,
            changes: {
                status: ProgressStatus.STARTED,
                progress: 0
            }
        };

        return {
            ...state,
            progresses: adapterProgress.updateOne(item, state.progresses)
        };
    }),
    on(ProgressActions.downloadProgress, (state, { payload }) => {
        const item: Update<Progress> = {
            id: payload.id,
            changes: {
                progress: payload.progress
            }
        };

        return {
            ...state,
            progresses: adapterProgress.updateOne(item, state.progresses)
        };
    }),
    on(ProgressActions.downloadSuccess, (state, { payload }) => {
        const item: Update<Progress> = {
            id: payload.id,
            changes: {
                status: ProgressStatus.SUCCESS,
                progress: payload.progress,
                error: null
            }
        };

        return {
            ...state,
            progresses: adapterProgress.updateOne(item, state.progresses)
        };
    })
);

export function reducer(state: State | undefined, action: Action): State {
    return progressReducer(state, action);
}

const getProgressesState = (state: State) => state.progresses;

export const {
    selectAll: selectAllProgress,
    selectEntities: selectProgressEntities,
    selectIds: selectProgressIds,
    selectTotal: selectProgressTotal
} = adapterProgress.getSelectors(getProgressesState);
