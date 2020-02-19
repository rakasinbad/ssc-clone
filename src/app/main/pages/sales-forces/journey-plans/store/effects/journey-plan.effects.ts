import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { DownloadApiService, NoticeService, UploadApiService, WINDOW } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
import { ProgressActions, UiActions } from 'app/shared/store/actions';
import * as fromRoot from 'app/store/app.reducer';
import * as moment from 'moment';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { JourneyPlan } from '../../models';
import { JourneyPlanApiService } from '../../services';
import { JourneyPlanActions } from '../actions';

@Injectable()
export class JourneyPlanEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [DELETE - JOURNEY PLAN]
    // -----------------------------------------------------------------------------------------------------

    confirmDeleteJourneyPlan$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.confirmDeleteJourneyPlan),
            map(action => action.payload),
            exhaustMap(params => {
                const visitDate = params.date
                    ? moment(params.date, 'YYYY-MM-DD').format('DD/MM/YYYY')
                    : null;

                const formatMessage = visitDate
                    ? `Are you sure want to delete <strong>${params.user.fullName} (${visitDate})</strong> ?`
                    : `Are you sure want to delete <strong>${params.user.fullName}</strong> ?`;

                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                    DeleteConfirmationComponent,
                    {
                        data: {
                            title: 'Delete',
                            message: formatMessage,
                            id: params.id
                        },
                        disableClose: true
                    }
                );

                return dialogRef.afterClosed();
            }),
            map(id => {
                if (id) {
                    return JourneyPlanActions.deleteJourneyPlanRequest({ payload: id });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    deleteJourneyPlanRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.deleteJourneyPlanRequest),
            map(action => action.payload),
            switchMap(id => {
                return this._$journeyPlanApi.delete(id).pipe(
                    map(resp => {
                        return JourneyPlanActions.deleteJourneyPlanSuccess({ payload: id });
                    }),
                    catchError(err =>
                        of(
                            JourneyPlanActions.deleteJourneyPlanFailure({
                                payload: new ErrorHandler({
                                    id: 'deleteJourneyPlanFailure',
                                    errors: err
                                })
                            })
                        )
                    ),
                    finalize(() => {
                        this.store.dispatch(UiActions.resetHighlightRow());
                    })
                );
            })
        )
    );

    deleteJourneyPlanFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.deleteJourneyPlanFailure),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Failed to delete journey plan', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    deleteJourneyPlanSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.deleteJourneyPlanSuccess),
                map(action => action.payload),
                tap(resp => {
                    this._$notice.open('Successfully deleted journey plan', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [JOURNEY PLANS]
    // -----------------------------------------------------------------------------------------------------

    fetchJourneyPlansRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.fetchJourneyPlansRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [IQueryParams, string | Auth]) => {
                if (!data) {
                    return of(
                        JourneyPlanActions.fetchJourneyPlansFailure({
                            payload: new ErrorHandler({
                                id: 'fetchJourneyPlansFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                if (!supplierId) {
                    return of(
                        JourneyPlanActions.fetchJourneyPlansFailure({
                            payload: new ErrorHandler({
                                id: 'fetchJourneyPlansFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                return this._$journeyPlanApi
                    .findAll<PaginateResponse<JourneyPlan>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return JourneyPlanActions.fetchJourneyPlansSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? newResp.data.map(r => new JourneyPlan(r))
                                            : []
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                JourneyPlanActions.fetchJourneyPlansFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchJourneyPlansFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchJourneyPlansFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.fetchJourneyPlansFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ EXPORT methods
    // -----------------------------------------------------------------------------------------------------

    exportRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.exportRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(([filter, data]: [{ dateGte?: string; dateLte?: string }, string | Auth]) => {
                if (!data) {
                    return of(
                        JourneyPlanActions.exportFailure({
                            payload: new ErrorHandler({
                                id: 'exportFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                return this._$downloadApi.download('export-journey-plans', supplierId, filter).pipe(
                    map(resp => {
                        return JourneyPlanActions.exportSuccess({
                            payload: resp.url
                        });
                    }),
                    catchError(err =>
                        of(
                            JourneyPlanActions.exportFailure({
                                payload: new ErrorHandler({
                                    id: 'exportFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    exportFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.exportFailure),
                map(action => action.payload),
                tap(resp => {
                    this.store.dispatch(
                        ProgressActions.downloadFailure({
                            payload: { id: 'export-journey-plans', error: new ErrorHandler(resp) }
                        })
                    );

                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map(r => {
                                return `${r.errCode}<br>${r.solve}`;
                            })
                            .join('<br><br>');
                    } else {
                        if (typeof resp.errors === 'string') {
                            message = resp.errors;
                        } else {
                            message =
                                resp.errors.error && resp.errors.error.message
                                    ? resp.errors.error.message
                                    : resp.errors.message;
                        }
                    }

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    exportSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.exportSuccess),
                map(action => action.payload),
                tap(url => {
                    if (url) {
                        this.$window.open(url, '_blank');

                        this._$notice.open('Export berhasil', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    }
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ IMPORT methods
    // -----------------------------------------------------------------------------------------------------

    importRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(JourneyPlanActions.importRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(([{ file, type }, data]: [{ file: File; type: string }, string | Auth]) => {
                if (!data || !file || !type) {
                    return of(
                        JourneyPlanActions.importFailure({
                            payload: new ErrorHandler({
                                id: 'importFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                if (!supplierId) {
                    return of(
                        JourneyPlanActions.importFailure({
                            payload: new ErrorHandler({
                                id: 'importFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('supplierId', supplierId);
                formData.append('type', type);

                return this._$uploadApi.uploadFormData('import-journey-plans', formData).pipe(
                    map(resp => {
                        return JourneyPlanActions.importSuccess();
                    }),
                    catchError(err =>
                        of(
                            JourneyPlanActions.importFailure({
                                payload: new ErrorHandler({ id: 'importFailure', errors: err })
                            })
                        )
                    )
                );
            })
        )
    );

    importFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.importFailure),
                map(action => action.payload),
                tap(resp => {
                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map(r => {
                                return `${r.errCode}<br>${r.solve}`;
                            })
                            .join('<br><br>');
                    } else {
                        if (typeof resp.errors === 'string') {
                            message = resp.errors;
                        } else {
                            message =
                                resp.errors.error && resp.errors.error.message
                                    ? resp.errors.error.message
                                    : resp.errors.message;
                        }
                    }

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    importSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JourneyPlanActions.importSuccess),
                tap(resp => {
                    this._$notice.open('Import berhasil', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        @Inject(WINDOW) private $window: Window,
        private actions$: Actions,
        private matDialog: MatDialog,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$downloadApi: DownloadApiService,
        private _$journeyPlanApi: JourneyPlanApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
