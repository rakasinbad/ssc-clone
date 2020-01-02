import { createFeatureSelector, createSelector } from '@ngrx/store';
import { fromProgress } from 'app/shared/store/reducers';
import { Dictionary } from '@ngrx/entity';
import { Progress } from 'app/shared/models';

export const getProgressState = createFeatureSelector<fromProgress.State>(fromProgress.FEATURE_KEY);

export const getAllProgress = createSelector(getProgressState, fromProgress.selectAllProgress);

export const getProgressEntities = createSelector(
    getProgressState,
    fromProgress.selectProgressEntities
);

export const getTotalProgressEntity = createSelector(
    getProgressState,
    fromProgress.selectProgressTotal
);

export const getSelectedProgressId = createSelector(
    getProgressState,
    state => state.progresses.selectedId
);

export const getSelectedProgress = createSelector(
    getProgressEntities,
    getSelectedProgressId,
    (entities, id) => entities[id]
);

export const getSelectedProgressValue = createSelector(
    getProgressEntities,
    (entities: Dictionary<Progress>, { id }) => {
        if (id) {
            return entities && entities[id] ? entities[id].progress : undefined;
        }

        return 0;
    }
);
