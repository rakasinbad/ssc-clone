import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import { IPaginatedResponse } from 'app/shared/models/global.model';
import { FormActions, NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { getParams } from 'app/store/app.reducer';
import { of } from 'rxjs';
import {
    catchError,
    concatMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { Attendance } from '../../models';
import { AttendanceApiService } from '../../services';
import { AttendanceActions } from '../actions';
import { fromAttendance } from '../reducers';

@Injectable()
export class AttendanceEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    createAttendanceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.createAttendanceRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
            switchMap(([body, isOnline]) => {
                if (isOnline) {
                    this.logSvc.generateGroup('[CREATE ATTENDANCE REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: body
                        }
                    });

                    return this.attendanceApiSvc.create(body).pipe(
                        map(resp => {
                            this.logSvc.generateGroup('[CREATE RESPONSE ATTENDANCE]', {
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return AttendanceActions.createAttendanceSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                AttendanceActions.createAttendanceFailure({
                                    payload: {
                                        id: 'createAttendanceFailure',
                                        errors: err
                                    }
                                })
                            )
                        ),
                        finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                    );
                }

                this.logSvc.generateGroup('[CREATE ATTENDANCE REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: body
                    }
                });

                return of(
                    AttendanceActions.createAttendanceFailure({
                        payload: {
                            id: 'createAttendanceFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    createAccountSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AttendanceActions.createAttendanceSuccess),
                map(action => action.payload),
                tap(() => this.router.navigate(['/pages/attendances']))
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    fetchAttendanceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.fetchAttendanceRequest),
            map(action => action.payload),
            switchMap(id => {
                /** WITHOUT PAGINATION */
                return this.attendanceApiSvc.findById(id).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = new Attendance(
                            resp.id,
                            resp.date,
                            resp.longitudeCheckIn,
                            resp.latitudeCheckIn,
                            resp.longitudeCheckOut,
                            resp.latitudeCheckOut,
                            resp.checkIn,
                            resp.checkOut,
                            resp.locationType,
                            resp.attendanceType,
                            resp.userId,
                            resp.user,
                            resp.createdAt,
                            resp.updatedAt,
                            resp.deletedAt
                        );

                        // newResp.user.setUserStores = resp.user.userStores;

                        return AttendanceActions.fetchAttendanceSuccess({
                            payload: {
                                attendance: newResp,
                                source: 'fetch'
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            AttendanceActions.fetchAttendanceFailure({
                                payload: {
                                    id: 'fetchAttendanceFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    fetchAttendancesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.fetchAttendancesRequest),
            map(action => action.payload),
            switchMap(queryParams => {
                /** WITH PAGINATION */
                if (queryParams.paginate) {
                    return this.attendanceApiSvc
                        .find<IPaginatedResponse<Attendance>>(queryParams)
                        .pipe(
                            catchOffline(),
                            map(resp => {
                                let newResp = {
                                    total: 0,
                                    data: []
                                };

                                newResp = {
                                    total: resp.total,
                                    data: resp.data.map(attendance => {
                                        const newAttendance = new Attendance(
                                            attendance.id,
                                            attendance.date,
                                            attendance.longitudeCheckIn,
                                            attendance.latitudeCheckIn,
                                            attendance.longitudeCheckOut,
                                            attendance.latitudeCheckOut,
                                            attendance.checkIn,
                                            attendance.checkOut,
                                            attendance.locationType,
                                            attendance.attendanceType,
                                            attendance.userId,
                                            attendance.user,
                                            attendance.createdAt,
                                            attendance.updatedAt,
                                            attendance.deletedAt
                                        );

                                        newAttendance.user.setUserStores =
                                            attendance.user.userStores;

                                        return newAttendance;
                                    })
                                };

                                this.logSvc.generateGroup(
                                    '[FETCH RESPONSE ATTENDANCES REQUEST] ONLINE',
                                    {
                                        payload: {
                                            type: 'log',
                                            value: resp
                                        }
                                    }
                                );

                                return AttendanceActions.fetchAttendancesSuccess({
                                    payload: {
                                        attendances: newResp.data,
                                        total: newResp.total
                                    }
                                });
                            }),
                            catchError(err =>
                                of(
                                    AttendanceActions.fetchAttendancesFailure({
                                        payload: {
                                            id: 'fetchAttendancesFailure',
                                            errors: err
                                        }
                                    })
                                )
                            )
                        );
                }

                /** WITHOUT PAGINATION */
                return this.attendanceApiSvc.find<Array<Attendance>>(queryParams).pipe(
                    catchOffline(),
                    map(resp => {
                        let newResp = {
                            total: 0,
                            data: []
                        };

                        newResp = {
                            total: resp.length,
                            data: resp.map(attendance => {
                                const newAttendance = new Attendance(
                                    attendance.id,
                                    attendance.date,
                                    attendance.longitudeCheckIn,
                                    attendance.latitudeCheckIn,
                                    attendance.longitudeCheckOut,
                                    attendance.latitudeCheckOut,
                                    attendance.checkIn,
                                    attendance.checkOut,
                                    attendance.locationType,
                                    attendance.attendanceType,
                                    attendance.userId,
                                    attendance.user,
                                    attendance.createdAt,
                                    attendance.updatedAt,
                                    attendance.deletedAt
                                );

                                newAttendance.user.setUserStores = attendance.user.userStores;

                                return newAttendance;
                            })
                        };

                        this.logSvc.generateGroup('[FETCH RESPONSE ATTENDANCES REQUEST] ONLINE', {
                            payload: {
                                type: 'log',
                                value: resp
                            }
                        });

                        return AttendanceActions.fetchAttendancesSuccess({
                            payload: {
                                attendances: newResp.data,
                                total: newResp.total
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            AttendanceActions.fetchAttendancesFailure({
                                payload: {
                                    id: 'fetchAttendancesFailure',
                                    errors: err
                                }
                            })
                        )
                    )
                );
            })
        )
    );

    patchAttendanceSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AttendanceActions.patchAttendanceSuccess),
                withLatestFrom(this.store.select(getParams)),
                tap(([_, params]) => {
                    const { storeId, employeeId } = params;

                    this._$notice.open('Sukses merubah data attendance', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    this.router.navigate([
                        `/pages/attendances/${storeId}/employee/${employeeId}/detail`
                    ]);
                })
            ),
        { dispatch: false }
    );

    patchAttendanceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.patchAttendanceRequest),
            map(action => action.payload),
            switchMap(({ id, data }) => {
                /** WITHOUT PAGINATION */
                return this.attendanceApiSvc.patch(id, data).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = new Attendance(
                            resp.id,
                            resp.date,
                            resp.longitudeCheckIn,
                            resp.latitudeCheckIn,
                            resp.longitudeCheckOut,
                            resp.latitudeCheckOut,
                            resp.checkIn,
                            resp.checkOut,
                            resp.locationType,
                            resp.attendanceType,
                            resp.userId,
                            resp.user,
                            resp.createdAt,
                            resp.updatedAt,
                            resp.deletedAt
                        );

                        // newResp.user.setUserStores = resp.user.userStores;

                        return AttendanceActions.patchAttendanceSuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            AttendanceActions.patchAttendanceFailure({
                                payload: {
                                    id: 'patchAttendanceFailure',
                                    errors: err
                                }
                            })
                        )
                    ),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromAttendance.FeatureState>,
        private attendanceApiSvc: AttendanceApiService,
        private logSvc: LogService,
        private _$notice: NoticeService
    ) {}
}
