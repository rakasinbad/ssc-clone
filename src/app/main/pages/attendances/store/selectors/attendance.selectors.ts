import { createFeatureSelector, createSelector } from '@ngrx/store';

import { fromAttendance } from '../reducers';

export const getAttendanceState = createFeatureSelector<fromAttendance.State>(
    fromAttendance.FEATURE_KEY
);

export const getAllAttendance = createSelector(
    getAttendanceState,
    fromAttendance.selectAllAttendances
);

export const getAttendanceEntities = createSelector(
    getAttendanceState,
    fromAttendance.selectAttendanceEntities
);

export const getTotalAttendance = createSelector(
    getAttendanceState,
    state => state.attendances.total
);

export const getSelectedAttendanceId = createSelector(
    getAttendanceState,
    state => state.selectedAttendanceId
);

export const getSourceType = createSelector(
    getAttendanceState,
    state => state.source
);

export const getAttendance = createSelector(
    getAttendanceState,
    state => state.attendance
);

export const getSelectedAttendance = createSelector(
    getAttendanceEntities,
    getSelectedAttendanceId,
    getSourceType,
    getAttendance,
    (attendanceEntities, attendanceId, sourceType, attendance) =>
        sourceType === 'fetch' ? attendance : attendanceEntities[attendanceId]
);

export const getAllAttendanceSource = createSelector(
    getAllAttendance,
    getTotalAttendance,
    (allAttendance, totalAttendance) => {
        return {
            data: allAttendance,
            total: totalAttendance
        };
    }
);

export const getIsDeleting = createSelector(
    getAttendanceState,
    state => state.isDeleting
);

export const getIsLoading = createSelector(
    getAttendanceState,
    state => state.isLoading
);
