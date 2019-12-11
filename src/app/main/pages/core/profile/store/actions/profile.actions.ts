import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models';

// -----------------------------------------------------------------------------------------------------
// Fetch Profile
// -----------------------------------------------------------------------------------------------------

export const fetchProfileRequest = createAction('[Profile API] Fetch Profile Request');

export const fetchProfileFailure = createAction(
    '[Proflie API] Fetch Profile Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchProfileSuccess = createAction(
    '[Profile API] Fetch Profile Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// [CRUD - UPDATE] Profile
// -----------------------------------------------------------------------------------------------------

export const updateProfileRequest = createAction(
    '[Profile API] Update Profile Request',
    props<{ payload: { body: any; id: string } }>()
);

export const updateProfileFailure = createAction(
    '[Profile API] Update Profile Failure',
    props<{ payload: ErrorHandler }>()
);

export const updateProfileSuccess = createAction(
    '[Profile API] Update Profile Success',
    props<{ payload: any }>()
);

// -----------------------------------------------------------------------------------------------------
// Reset Actions
// -----------------------------------------------------------------------------------------------------

export const resetProfile = createAction('[Profile Page] Reset Profile State');
