import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService, SupplierApiService } from 'app/shared/helpers';
import { ErrorHandler } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom, exhaustMap } from 'rxjs/operators';

import { AuthSelectors } from '../../../auth/store/selectors';
import { ProfileActions } from '../actions';
import { fromProfile } from '../reducers';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from '../../../auth/models';

@Injectable()
export class ProfileEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [PROFILE]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Profile
     * @memberof ProfileEffects
     */
    fetchProfileRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProfileActions.fetchProfileRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([_, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage.get('user').toPromise();
                }

                const { supplierId } = userSupplier;

                return of(supplierId);
            }),
            switchMap(data => {
                if (!data) {
                    return of(
                        ProfileActions.fetchProfileFailure({
                            payload: new ErrorHandler({
                                id: 'fetchProfileFailure',
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

                return this._$supplierApi.findById(supplierId).pipe(
                    catchOffline(),
                    map(resp => ProfileActions.fetchProfileSuccess({ payload: resp })),
                    catchError(err =>
                        of(
                            ProfileActions.fetchProfileFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchProfileFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE] Profile
     * @memberof ProfileEffects
     */
    fetchProfileFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ProfileActions.fetchProfileFailure),
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

    constructor(
        private actions$: Actions,
        private store: Store<fromProfile.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$supplierApi: SupplierApiService
    ) {}
}
