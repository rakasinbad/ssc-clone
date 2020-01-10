import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse, AnyAction } from 'app/shared/models';
import { FormActions } from 'app/shared/store/actions';
import { of, Observable } from 'rxjs';
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
import { AssociationActions, associationFailureActionNames } from '../actions';
import * as fromAssociation from '../reducers';
import { HttpErrorResponse } from '@angular/common/http';
import { Portfolio } from '../../../portfolios/models';

@Injectable()
export class AssociationEffects {
    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromAssociation.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$associationApi: AssociationApiService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [ASSOCIATION]
    // -----------------------------------------------------------------------------------------------------

    createAssociationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.createAssociationRequest),
            map(action => action.payload),
            switchMap(payload =>
                this._$associationApi.createAssociation(payload)
                .pipe(
                    catchOffline(),
                    map(({ message }) => AssociationActions.createAssociationSuccess({ payload: { message } })),
                    catchError(err => this.sendErrorToState(err, 'createAssociationFailure'))
                )
            )
        )
    );

    createAssociationSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.createAssociationSuccess),
            tap(() => {
                // Memunculkan notifikasi
                this._$notice.open('Berhasil menambah portfolio ke Sales Rep.', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });

                // Kembali ke halaman association.
                this.router.navigate(['/pages/sales-force/associations']);
            })
        )
    , { dispatch: false });

    fetchAssocitionsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.fetchAssociationsRequest),
            map(action => action.payload),
            switchMap(payload =>
                this._$associationApi
                    .findAssociations<PaginateResponse<Portfolio>>(payload)
                    .pipe(
                        catchOffline(),
                        map(response =>
                            AssociationActions.fetchAssociationsSuccess({
                                payload: {
                                    data: response.data.map(resp => new Portfolio({... resp, storeQty: resp['storeAmount'] })),
                                    total: response.total
                                },
                            })
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchAssociationsFailure'))
                    )
            )
        )
    );

    /**
     *
     * [REQUEST] Association
     * @memberof AssociationEffects
     */
    fetchAssociationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.fetchAssociationRequest),
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
                        AssociationActions.fetchAssociationFailure({
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
                    .findAll<PaginateResponse<Association>>(params, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                data: resp.data || [],
                                total: resp.total
                            };

                            return AssociationActions.fetchAssociationSuccess({
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
                                AssociationActions.fetchAssociationFailure({
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
                ofType(AssociationActions.fetchAssociationFailure),
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

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: associationFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(AssociationActions[dispatchTo]({
                payload: err
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(AssociationActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: err.toString()
                }
            }));
        }

        return of(AssociationActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }
}
