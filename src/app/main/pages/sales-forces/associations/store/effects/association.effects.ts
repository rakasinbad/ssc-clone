import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
import { FormActions } from 'app/shared/store/actions';
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

import { Association } from '../../models';
import { AssociationApiService } from '../../services';
import { AssociationActions } from '../actions';
import * as fromAssociation from '../reducers';

@Injectable()
export class AssociationEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [ASSOCIATION]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Association
     * @memberof AssociationEffects
     */
    fetchAssociationsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.fetchAssociationsRequest),
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
                        AssociationActions.fetchAssociationsFailure({
                            payload: new ErrorHandler({
                                id: 'fetchAssociationsFailure',
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
                    .findAll<PaginateResponse<Association>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return AssociationActions.fetchAssociationsSuccess({
                                payload: {
                                    ...newResp,
                                    data:
                                        newResp.data && newResp.data.length > 0
                                            ? newResp.data.map(r => new Association(r))
                                            : []
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                AssociationActions.fetchAssociationsFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchAssociationsFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchAssociationsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AssociationActions.fetchAssociationsFailure),
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
        private store: Store<fromAssociation.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$associationApi: AssociationApiService
    ) {}
}
