import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { NoticeService } from 'app/shared/helpers';
import { HelperService } from 'app/shared/helpers/helper.service';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CatalogueSegmentation } from '../../models';
import {
    CatalogueSegmentationApiService,
    CatalogueSegmentationFacadeService,
} from '../../services';
import { CatalogueSegmentationActions, CatalogueSegmentationFailureActions } from '../actions';

@Injectable()
export class FetchCatalogueSegmentationsEffects {
    fetchCatalogueSegmentationsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueSegmentationActions.fetchCatalogueSegmentationsRequest),
            map((action) => action.payload),
            withLatestFrom(this.authFacade.getUser$, (queryParams, auth) => ({
                queryParams,
                auth,
            })),
            switchMap(({ queryParams, auth }) =>
                this._processFetchCatalogueSegmentations$(queryParams, auth)
            )
        )
    );

    fetchCatalogueSegmentationsFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationActions.fetchCatalogueSegmentationsFailure),
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
        private actions$: Actions,
        private authFacade: AuthFacadeService,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private catalogueSegmentationApi: CatalogueSegmentationApiService,
        private helperService: HelperService,
        private noticeService: NoticeService
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
        dispatchTo: CatalogueSegmentationFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueSegmentationActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueSegmentationActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueSegmentationActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _fetchCatalogueSegmentationsRequest$(
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

        return this.catalogueSegmentationApi
            .getWithQuery<PaginateResponse<CatalogueSegmentation>>(newParams)
            .pipe(
                catchOffline(),
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data.length
                                ? resp.data.map((item) => new CatalogueSegmentation(item))
                                : [],
                        total: resp.total,
                    };

                    return CatalogueSegmentationActions.fetchCatalogueSegmentationsSuccess(newResp);
                }),
                catchError((err) =>
                    this._sendErrorToState$(err, 'fetchCatalogueSegmentationsFailure')
                )
            );
    }

    private _processFetchCatalogueSegmentations$(
        params: IQueryParams,
        auth: Auth
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) => this._fetchCatalogueSegmentationsRequest$(user, params))
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => this._fetchCatalogueSegmentationsRequest$(user, params))
        );
    }
}
