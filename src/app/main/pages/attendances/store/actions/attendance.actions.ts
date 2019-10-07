import { createAction, props } from '@ngrx/store';
import { IErrorHandler, IQueryParams, TSource } from 'app/shared/models';

import { Attendance } from '../../models';

export const fetchAttendancesRequest = createAction(
    '[Attendances API] Fetch Attendances Request',
    props<{ payload: IQueryParams }>()
);

export const fetchAttendancesFailure = createAction(
    '[Attendances API] Fetch Attendances Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchAttendancesSuccess = createAction(
    '[Attendances API] Fetch Attendances Success',
    props<{ payload: { attendances: Attendance[]; total: number } }>()
);

export const fetchAttendanceRequest = createAction(
    '[Attendances API] Fetch Attendance Request',
    props<{ payload: string }>()
);

export const fetchAttendanceFailure = createAction(
    '[Attendances API] Fetch Attendance Failure',
    props<{ payload: IErrorHandler }>()
);

export const fetchAttendanceSuccess = createAction(
    '[Attendances API] Fetch Attendance Success',
    props<{ payload: { attendance?: Attendance; source: TSource } }>()
);

export const createAttendanceRequest = createAction(
    '[Attendances API] Create Attendance Request',
    props<{ payload: Attendance }>()
);

export const createAttendanceFailure = createAction(
    '[Attendances API] Create Attendance Failure',
    props<{ payload: IErrorHandler }>()
);

export const createAttendanceSuccess = createAction(
    '[Attendances API] Create Attendance Success',
    props<{ payload: Attendance }>()
);
