import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AvailableCatalogue } from '../../models';
import { AvailableCatalogueApiService } from '../../services';
import { AvailableCatalogueActions, AvailableCatalogueFailureActions } from './../actions';

@Injectable()
export class FetchAvailableCataloguesEffects {
    readonly fetchAvailableCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AvailableCatalogueActions.fetchAvailableCataloguesRequest),
            map((action) => action.payload),
            withLatestFrom(this.authFacade.getUser$, ({ params, id }, auth) => ({
                params,
                id,
                auth,
            })),
            switchMap(({ params, id, auth }) =>
                this._processFetchAvailableCatalogues$(params, auth, id)
            )
        )
    );

    readonly fetchAvailableCataloguesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AvailableCatalogueActions.fetchAvailableCataloguesFailure),
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

    constructor(
        private readonly actions$: Actions,
        private readonly authFacade: AuthFacadeService,
        private readonly availableCatalogueApi: AvailableCatalogueApiService,
        private readonly helperService: HelperService,
        private readonly noticeService: NoticeService
    ) {}

    private _checkUserSupplier(user: User): User {
        // Jika user tidak ada data supplier.
        if (!user.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${user}`,
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return user;
    }

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
        dispatchTo: AvailableCatalogueFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                AvailableCatalogueActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                AvailableCatalogueActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            AvailableCatalogueActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _fetchAvailableCataloguesRequest$(
        id: string,
        user: User,
        params: IQueryParams
    ): Observable<AnyAction> {
        const newParams: IQueryParams = {
            ...params,
        };

        const { supplierId } = user.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this.availableCatalogueApi
            .getById<PaginateResponse<AvailableCatalogue>>(id, newParams)
            .pipe(
                catchOffline(),
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data.length
                                ? resp.data.map((item) => new AvailableCatalogue(item))
                                : [],
                        total: resp.total,
                    };

                    return AvailableCatalogueActions.fetchAvailableCataloguesSuccess(newResp);
                }),
                catchError((err) => this._sendErrorToState$(err, 'fetchAvailableCataloguesFailure'))
            );
    }

    private _processFetchAvailableCatalogues$(
        params: IQueryParams,
        auth: Auth,
        id?: string
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) => {
                    return this._fetchAvailableCataloguesRequest$(id, user, params);
                })
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => {
                return this._fetchAvailableCataloguesRequest$(id, user, params);
            })
        );
    }
}
