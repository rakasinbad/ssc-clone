import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { FormActions } from 'app/shared/store/actions';
import { Observable, of } from 'rxjs';
import {
    catchError,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { AssociationApiService, AssociationService } from '../../services';
import { AssociationActions } from '../actions';
import * as fromAssociation from '../reducers';
import { Association } from '../../models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService } from 'app/shared/helpers';

@Injectable()
export class AssociationEffects {
    constructor(
        private actions$: Actions,
        private router: Router,
        private store: Store<fromAssociation.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private associationService: AssociationService,
        private _$associationApi: AssociationApiService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [ASSOCIATION]
    // -----------------------------------------------------------------------------------------------------

    createAssociationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.createAssociationRequest),
            map(action => action.payload),
            switchMap(payload =>
                this._$associationApi.createAssociation(payload).pipe(
                    catchOffline(),
                    map(({ message }) =>
                        AssociationActions.createAssociationSuccess({ payload: { message } })
                    ),
                    catchError(err => this.sendErrorToState(err, 'createAssociationFailure')),
                    finalize(() => this.store.dispatch(FormActions.resetClickSaveButton()))
                )
            )
        )
    );

    createAssociationFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AssociationActions.createAssociationFailure),
                tap(() => {
                    // Menghilangkan state loading
                    this.associationService.setLoadingState(false);
                })
            ),
        { dispatch: false }
    );
    
    createAssociationSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AssociationActions.createAssociationSuccess),
                tap(() => {
                    // Memunculkan notifikasi
                    this._$notice.open('Berhasil menambah portfolio ke Sales Rep.', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    // Menghilangkan state loading
                    this.associationService.setLoadingState(false);

                    // Kembali ke halaman association.
                    this.router.navigate(['/pages/sales-force/associations']);
                })
            ),
        { dispatch: false }
    );

    fetchAssociationsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AssociationActions.fetchAssociationsRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, { supplierId = null }]) =>
                this._$associationApi.findAll<PaginateResponse<Association>>(payload, supplierId).pipe(
                    catchOffline(),
                    map(response =>
                        AssociationActions.fetchAssociationsSuccess({
                            payload: {
                                data: response.data.map(
                                    resp =>
                                        new Association({ ...resp })
                                ),
                                total: response.total
                            }
                        })
                    ),
                    catchError(err => this.sendErrorToState(err, 'fetchAssociationsFailure'))
                )
            )
        )
    );

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: AssociationActions.failureActionNames
    ): Observable<AnyAction> => {
        this._$helper.showErrorNotification(new ErrorHandler(err as ErrorHandler));

        if (err instanceof ErrorHandler) {
            return of(
                AssociationActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                AssociationActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err.toString()
                    }
                })
            );
        }

        return of(
            AssociationActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString()
                }
            })
        );
    };
}
