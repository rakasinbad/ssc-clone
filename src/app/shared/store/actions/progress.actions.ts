import { createAction, props } from '@ngrx/store';
import { Progress } from 'app/shared/models/progress.model';

export const downloadRequest = createAction(
    '[File Download] Download Request',
    props<{ payload: Pick<Progress, 'id'> }>()
);

export const downloadCancel = createAction(
    '[File Download] Download Cancel',
    props<{ payload: Pick<Progress, 'id'> }>()
);

export const downloadReset = createAction('[File Download] Download Reset');

export const downloadStarted = createAction(
    '[File Download] Download Started',
    props<{ payload: Pick<Progress, 'id'> }>()
);

export const downloadProgress = createAction(
    '[File Download] Download Progress',
    props<{ payload: Pick<Progress, 'id' | 'progress'> }>()
);

export const downloadFailure = createAction(
    '[File Download] Download Failure',
    props<{ payload: Pick<Progress, 'id' | 'error'> }>()
);

export const downloadSuccess = createAction(
    '[File Download] Download Success',
    props<{ payload: Pick<Progress, 'id' | 'progress'> }>()
);
