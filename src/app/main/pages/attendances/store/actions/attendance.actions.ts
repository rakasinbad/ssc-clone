import { createAction, props } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

import { Attendance } from '../../models';

/**
 * ATTENDANCES
 */

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

/**
 * ATTENDANCE
 */

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

export const patchAttendanceRequest = createAction(
    '[Attendances API] Patch Attendance Request',
    props<{ payload: { id: string; data: Partial<Attendance> } }>()
);

export const patchAttendanceFailure = createAction(
    '[Attendances API] Patch Attendance Failure',
    props<{ payload: IErrorHandler }>()
);

export const patchAttendanceSuccess = createAction(
    '[Attendances API] Patch Attendance Success',
    props<{ payload: Attendance }>()
);

export const setSelectedAttendance = createAction(
    '[Attendances Page] Set Selected Attendance',
    props<{ payload: Attendance }>()
);

export const resetAttendances = createAction('[Attendances Page] Reset Attendances');

export const resetSelectedAttendance = createAction('[Attendances Page] Reset Selected Attendance');
