import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { AssociationStore } from '../../models';
import { AssociationStoreApiService } from '../../services';
import { AssociationStoresActions } from '../actions';
import * as fromAssociationStores from '../reducers';

@Injectable()
export class AssociationStoreEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [ASSOCIATION]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Association
     * @memberof AssociationStoreEffects
     */
    fetchAssociationStoreRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationStoresActions.fetchAssociationStoresRequest),
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
                        AssociationStoresActions.fetchAssociationStoresFailure({
                            payload: new ErrorHandler({
                                id: 'fetchAssociationFailure',
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

                return this._$associationApi
                    .findAll<PaginateResponse<AssociationStore>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return AssociationStoresActions.fetchAssociationStoresSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? newResp.data.map(r => new AssociationStore(r))
                                            : []
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                AssociationStoresActions.fetchAssociationStoresFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchAssociationsStoresFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchAssociationStoresFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AssociationStoresActions.fetchAssociationStoresFailure),
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
        private router: Router,
        private store: Store<fromAssociationStores.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$associationApi: AssociationStoreApiService
    ) {}
}
