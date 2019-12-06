import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
// import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
// import { getParams } from 'app/store/app.reducer';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { of } from 'rxjs';
import {
    catchError,
    concatMap,
    exhaustMap,
    finalize,
    map,
    mergeMap,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { User } from '../../models';
import { AccountsSettingsApiService } from '../../services';
import { SettingsActions } from '../actions';
import { fromSettings } from '../reducers';
import { SettingsSelectors } from '../selectors';
import { state } from '@angular/animations';
import { Update } from '@ngrx/entity';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IQueryParams } from 'app/shared/models';

@Injectable()
export class AccountsSettingsEffects {

    fetchUserRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(SettingsActions.fetchUserRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([userId, userState]) => {
                if (!userState) {
                    return of(SettingsActions.fetchUserFailure({
                        payload: {
                            id: 'fetchUserFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                return this._$accountsSettingsApi.getUser(userId)
                    .pipe(
                        catchOffline(),
                        map(user => SettingsActions.fetchUserSuccess({
                            payload: {
                                user: new User(user),
                                source: 'fetch'
                            }
                        })),
                        catchError(err =>
                            of(
                                SettingsActions.fetchUserFailure({
                                    payload: {
                                        id: 'fetchUserFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    patchUserRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(SettingsActions.patchUserRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([payload, userState]) => {
                if (!userState) {
                    return of(SettingsActions.patchUserFailure({
                        payload: {
                            id: 'patchUserFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                return this._$accountsSettingsApi.updateUser(payload.id, payload.data)
                    .pipe(
                        catchOffline(),
                        map(user => SettingsActions.patchUserSuccess({
                            payload: {
                                user: new User(user)
                            }
                        })),
                        catchError(err =>
                            of(
                                SettingsActions.patchUserFailure({
                                    payload: {
                                        id: 'patchUserFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
            })
        )
    );

    patchUserSuccess$ = createEffect(() => 
        this.actions$.pipe(
            ofType(SettingsActions.patchUserSuccess),
            tap(_ => {
                this.matDialog.closeAll();
                this._$notice.open('Berhasil meng-update informasi diri.', 'success', { horizontalPosition: 'center', verticalPosition: 'bottom' });
            })
        ), { dispatch: false }
    );

    patchUserFailure$ = createEffect(() => 
        this.actions$.pipe(
            ofType(SettingsActions.patchUserFailure),
            map(action => action.payload),
            tap(_ => this._$notice.open(`Gagal meng-update informasi diri.`, 'error', { horizontalPosition: 'center', verticalPosition: 'bottom' }))
        ), { dispatch: false }
    );

    changeUserPasswordRequest$ = createEffect(() => 
        this.actions$.pipe(
            ofType(SettingsActions.patchUserRequest),
            map(action => action.payload),
            withLatestFrom(
                this.store.select(AuthSelectors.getAuthState),
                this.store.select(SettingsSelectors.getUser),
                (payload, authState, userState) => ({ payload, authState, userState })
            ),
            switchMap(({ payload, authState, userState }) => {
                if (!authState) {
                    return of(SettingsActions.patchUserFailure({
                        payload: {
                            id: 'patchUserFailure',
                            errors: 'Not authenticated'
                        }
                    }));
                }

                if (payload.update === 'information') {
                    return this._$accountsSettingsApi.updateUser(payload.id, payload.data)
                        .pipe(
                            catchOffline(),
                            map(user => SettingsActions.patchUserSuccess({
                                payload: {
                                    user: new User(user)
                                }
                            })),
                            catchError(err =>
                                of(
                                    SettingsActions.patchUserFailure({
                                        payload: {
                                            id: 'patchUserFailure',
                                            errors: err.code === '401' ? 'Wrong Password' : err
                                        }
                                    })
                                )
                            )
                        );
                } else if (payload.update === 'password') {
                    return this._$accountsSettingsApi.updatePassword(payload.id, payload.data)
                        .pipe(
                            catchOffline(),
                            map(_ => SettingsActions.patchUserSuccess({
                                payload: {
                                    user: new User(userState.data)
                                }
                            })),
                            catchError(err =>
                                of(
                                    SettingsActions.patchUserFailure({
                                        payload: {
                                            id: 'patchUserFailure',
                                            errors: err.code === '401' ? 'Wrong Password' : err
                                        }
                                    })
                                )
                            )
                        );
                }
            })
        )
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromSettings.FeatureState>,
        protected network: Network,
        // private _$log: LogService,
        private _$accountsSettingsApi: AccountsSettingsApiService,
        private _$notice: NoticeService
    ) {}
}
