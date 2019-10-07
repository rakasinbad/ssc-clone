import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { LogService } from 'app/shared/helpers';
import { NetworkActions } from 'app/shared/store/actions';
import { NetworkSelectors } from 'app/shared/store/selectors';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

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
                        )
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

    fetchAttendancesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.fetchAttendancesRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
            switchMap(([payload, isOnline]) => {
                console.log(payload);
                if (isOnline) {
                    this.logSvc.generateGroup('[FETCH ATTENDANCES REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        }
                    });

                    return this.attendanceApiSvc.findAll(payload).pipe(
                        catchOffline(),
                        map(resp => {
                            let newResp = {
                                total: 0,
                                data: []
                            };

                            if (resp.total > 0) {
                                newResp = {
                                    total: resp.total,
                                    data: [
                                        ...resp.data.map(attendance => {
                                            return {
                                                ...new Attendance(
                                                    attendance.id,
                                                    attendance.checkDate,
                                                    attendance.longitude,
                                                    attendance.latitude,
                                                    attendance.checkIn,
                                                    attendance.checkOut,
                                                    attendance.userId,
                                                    attendance.user,
                                                    attendance.createdAt,
                                                    attendance.updatedAt,
                                                    attendance.deletedAt
                                                )
                                            };
                                        })
                                    ]
                                };
                            }

                            this.logSvc.generateGroup(
                                '[FETCH RESPONSE ATTENDANCES REQUEST] ONLINE',
                                {
                                    online: {
                                        type: 'log',
                                        value: isOnline
                                    },
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

                this.logSvc.generateGroup('[FETCH ATTENDANCES REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    }
                });

                return of(
                    AttendanceActions.fetchAttendancesFailure({
                        payload: {
                            id: 'fetchAttendancesFailure',
                            errors: 'Offline'
                        }
                    })
                );
            })
        )
    );

    fetchAttendanceRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AttendanceActions.fetchAttendanceRequest),
            map(action => action.payload),
            concatMap(payload =>
                of(payload).pipe(
                    tap(() => this.store.dispatch(NetworkActions.networkStatusRequest()))
                )
            ),
            withLatestFrom(this.store.pipe(select(NetworkSelectors.isNetworkConnected))),
            switchMap(([id, isOnline]) => {
                if (isOnline) {
                    this.logSvc.generateGroup('[FETCH ATTENDANCE REQUEST] ONLINE', {
                        online: {
                            type: 'log',
                            value: isOnline
                        },
                        payload: {
                            type: 'log',
                            value: id
                        }
                    });

                    return this.attendanceApiSvc.findById(id).pipe(
                        catchOffline(),
                        map(resp => {
                            this.logSvc.generateGroup(
                                '[FETCH RESPONSE ATTENDANCE REQUEST] ONLINE',
                                {
                                    online: {
                                        type: 'log',
                                        value: isOnline
                                    },
                                    response: {
                                        type: 'log',
                                        value: resp
                                    }
                                }
                            );

                            return AttendanceActions.fetchAttendanceSuccess({
                                payload: {
                                    attendance: {
                                        ...new Attendance(
                                            resp.id,
                                            resp.checkDate,
                                            resp.longitude,
                                            resp.latitude,
                                            resp.checkIn,
                                            resp.checkOut,
                                            resp.userId,
                                            resp.user,
                                            resp.createdAt,
                                            resp.updatedAt,
                                            resp.deletedAt
                                        )
                                    },
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
                }

                this.logSvc.generateGroup('[FETCH ATTENDANCE REQUEST] OFFLINE', {
                    online: {
                        type: 'log',
                        value: isOnline
                    },
                    payload: {
                        type: 'log',
                        value: id
                    }
                });

                return of(
                    AttendanceActions.fetchAttendanceSuccess({
                        payload: {
                            source: 'cache'
                        }
                    })
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromAttendance.FeatureState>,
        private attendanceApiSvc: AttendanceApiService,
        private logSvc: LogService
    ) {}
}
