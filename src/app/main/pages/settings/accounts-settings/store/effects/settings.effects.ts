import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { User } from '../../models';
import { AccountsSettingsApiService } from '../../services';
import { SettingsActions } from '../actions';
import { fromSettings } from '../reducers';
import { SettingsSelectors } from '../selectors';

@Injectable()
export class AccountsSettingsEffects {
    fetchUserRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SettingsActions.fetchUserRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getAuthState)),
            switchMap(([userId, userState]) => {
                if (!userState) {
                    return of(
                        SettingsActions.fetchUserFailure({
                            payload: {
                                id: 'fetchUserFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                return this._$accountsSettingsApi.getUser(userId).pipe(
                    catchOffline(),
                    map(user =>
                        SettingsActions.fetchUserSuccess({
                            payload: {
                                user: new User(user),
                                source: 'fetch'
                            }
                        })
                    ),
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
                    return of(
                        SettingsActions.patchUserFailure({
                            payload: {
                                id: 'patchUserFailure',
                                errors: 'Not authenticated'
                            }
                        })
                    );
                }

                if (payload.update === 'information') {
                    return this._$accountsSettingsApi.updateUser(payload.id, payload.data).pipe(
                        catchOffline(),
                        map(user =>
                            SettingsActions.patchUserSuccess({
                                payload: {
                                    user: new User(user)
                                }
                            })
                        ),
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
                } else if (payload.update === 'password') {
                    return this._$accountsSettingsApi.updatePassword(payload.id, payload.data).pipe(
                        catchOffline(),
                        map(response =>
                            SettingsActions.patchUserSuccess({
                                payload: {
                                    response
                                }
                            })
                        ),
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
                }
            })
        )
    );

    patchUserSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.patchUserSuccess),
                tap(_ => {
                    this.matDialog.closeAll();
                    this._$notice.open('Berhasil meng-update informasi diri.', 'success', {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom'
                    });
                })
            ),
        { dispatch: false }
    );

    patchUserFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SettingsActions.patchUserFailure),
                map(action => action.payload),
                tap(_ =>
                    this._$notice.open(`Gagal meng-update informasi diri.`, 'error', {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom'
                    })
                )
            ),
        { dispatch: false }
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
