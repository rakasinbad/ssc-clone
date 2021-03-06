import { createAction, props } from '@ngrx/store';
import { ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Team } from 'app/shared/models/team.model';

// -----------------------------------------------------------------------------------------------------
// Fetch Autocomplete [Teams]
// -----------------------------------------------------------------------------------------------------

export const searchTeamRequest = createAction(
    '[Helper Sources - Team] Search Team Request',
    props<{ payload: IQueryParams }>()
);

export const fetchTeamRequest = createAction(
    '[Helper Sources - Team API] Fetch Team Request',
    props<{ payload: IQueryParams }>()
);

export const fetchTeamFailure = createAction(
    '[Helper Sources - Team API] Fetch Team Failure',
    props<{ payload: ErrorHandler }>()
);

export const fetchTeamSuccess = createAction(
    '[Helper Sources - Team API] Fetch Team Success',
    props<{ payload: { data: Array<Team>; total: number } }>()
);

// -----------------------------------------------------------------------------------------------------
// Helper Actions
// -----------------------------------------------------------------------------------------------------

export const clearTeamState = createAction('[Helper Sources - Team] Clear Team State');
