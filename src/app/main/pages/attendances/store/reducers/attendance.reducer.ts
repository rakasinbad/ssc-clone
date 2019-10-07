import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Action, createReducer, on } from '@ngrx/store';
import { IErrorHandler, TSource } from 'app/shared/models';
import * as fromRoot from 'app/store/app.reducer';

import { Attendance } from '../../models';
import { AttendanceActions } from '../actions';

export const FEATURE_KEY = 'attendances';

interface AttendanceState extends EntityState<Attendance> {
    total: number;
}

interface ErrorState extends EntityState<IErrorHandler> {}

export interface State {
    isDeleting: boolean | undefined;
    isLoading: boolean;
    selectedAttendanceId: string | number;
    source: TSource;
    attendance: Attendance | undefined;
    attendances: AttendanceState;
    errors: ErrorState;
}

const adapterAttendance = createEntityAdapter<Attendance>({
    selectId: attendance => attendance.id
});
const initialAttendanceState = adapterAttendance.getInitialState({ total: 0 });

const adapterError = createEntityAdapter<IErrorHandler>();
const initialErrorState = adapterError.getInitialState();

export const initialState: State = {
    isDeleting: undefined,
    isLoading: false,
    selectedAttendanceId: null,
    source: 'fetch',
    attendance: undefined,
    attendances: initialAttendanceState,
    errors: initialErrorState
};

const attendanceReducer = createReducer(
    initialState,
    on(
        AttendanceActions.createAttendanceRequest,
        AttendanceActions.fetchAttendancesRequest,
        state => ({
            ...state,
            isLoading: true
        })
    ),
    on(AttendanceActions.createAttendanceFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(AttendanceActions.createAttendanceSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        attendances: adapterAttendance.addOne(payload, {
            ...state.attendances,
            total: state.attendances.total + 1
        }),
        errors: adapterError.removeOne('createAttendanceFailure', state.errors)
    })),
    on(AttendanceActions.fetchAttendancesFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(AttendanceActions.fetchAttendancesSuccess, (state, { payload }) => ({
        ...state,
        isLoading: false,
        isDeleting: undefined,
        attendances: adapterAttendance.addAll(payload.attendances, {
            ...state.attendances,
            total: payload.total
        }),
        errors: adapterError.removeOne('fetchAttendancesFailure', state.errors)
    })),
    on(AttendanceActions.fetchAttendanceRequest, (state, { payload }) => ({
        ...state,
        isLoading: true,
        selectedAttendanceId: payload
    })),
    on(AttendanceActions.fetchAttendanceFailure, (state, { payload }) => ({
        ...state,
        isLoading: false,
        errors: adapterError.upsertOne(payload, state.errors)
    })),
    on(AttendanceActions.fetchAttendanceSuccess, (state, { payload }) => {
        let newState = {
            ...state,
            source: payload.source
        };

        if (newState.source === 'fetch') {
            newState = {
                ...newState,
                isLoading: false,
                attendance: payload.attendance,
                errors: adapterError.removeOne('fetchAttendanceFailure', state.errors)
            };
        } else {
            newState = {
                ...newState,
                isLoading: false,
                attendance: undefined,
                errors: adapterError.removeOne('fetchAttendanceFailure', state.errors)
            };
        }

        return newState;
    })
);

export function reducer(state: State | undefined, action: Action): State {
    return attendanceReducer(state, action);
}

export interface FeatureState extends fromRoot.State {
    [FEATURE_KEY]: State | undefined;
}

const getListAttendanceState = (state: State) => state.attendances;

export const {
    selectAll: selectAllAttendances,
    selectEntities: selectAttendanceEntities,
    selectIds: selectAttendanceIds,
    selectTotal: selectAttendanceTotal
} = adapterAttendance.getSelectors(getListAttendanceState);
