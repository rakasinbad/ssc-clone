import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap } from 'rxjs/operators';
import { AvailableSupplierStore } from '../../models';
import { AvailableSupplierStoreApiService } from '../../services';
import { AvailableSupplierStoreActions, AvailableSupplierStoreFailureActions } from '../actions';

@Injectable()
export class FetchAvailableSupplierStoresEffects {
    constructor(
        private readonly actions$: Actions,
        private readonly availableSupplierStoreApi: AvailableSupplierStoreApiService,
        private readonly helperService: HelperService,
        private readonly noticeService: NoticeService,
    ) {}

    readonly fetchAvailableSupplierStoresRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AvailableSupplierStoreActions.fetchAvailableSupplierStoresRequest),
            map((action) => action.payload),
            switchMap((params) =>
                this._processFetchAvailableSupplierStores$(params)
            )
        )
    );

    readonly fetchAvailableSupplierStoresFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AvailableSupplierStoreActions.fetchAvailableSupplierStoresFailure),
                map((action) => action.payload),
                map((err) => this._handleErrMessage(err)),
                tap((message) =>
                    this.noticeService.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    })
                )
            ),
        { dispatch: false }
    );

    private _handleErrMessage(resp: ErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }

    private _sendErrorToState$(
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: AvailableSupplierStoreFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                AvailableSupplierStoreActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                AvailableSupplierStoreActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            AvailableSupplierStoreActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _fetchAvailableSupplierStoresRequest$(
        params: IQueryParams
    ): Observable<AnyAction> {
        const newParams: IQueryParams = {
            ...params,
        };

        return this.availableSupplierStoreApi
            .findAll<PaginateResponse<AvailableSupplierStore>>(newParams)
            .pipe(
                catchOffline(),
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data.length
                                ? resp.data.map((item) => new AvailableSupplierStore(item))
                                : [],
                        total: resp.total,
                    };
                    return AvailableSupplierStoreActions.fetchAvailableSupplierStoresSuccess(newResp);
                }),
                catchError((err) => this._sendErrorToState$(err, 'fetchAvailableSupplierStoresFailure'))
            );
    }

    private _processFetchAvailableSupplierStores$(
        params: IQueryParams
    ): Observable<AnyAction> {
        return this.helperService.decodeUserToken().pipe(
            retry(3),
            switchMap(() => {
                return this._fetchAvailableSupplierStoresRequest$(params);
            })
        );
    }
}
