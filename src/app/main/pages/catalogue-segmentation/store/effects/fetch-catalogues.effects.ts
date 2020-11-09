import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { FormMode } from 'app/shared/models';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Catalogue, CatalogueOfSegmentationProps } from '../../models';
import { CatalogueApiService, CatalogueSegmentationApiService } from '../../services';
import { CatalogueActions, CatalogueFailureActions } from '../actions';

@Injectable()
export class FetchCataloguesEffects {
    fetchCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueActions.fetchCataloguesRequest),
            map((action) => action.payload),
            withLatestFrom(this.authFacade.getUser$, ({ params, formMode, id }, auth) => ({
                params,
                formMode: !formMode ? 'add' : formMode,
                id,
                auth,
            })),
            switchMap(({ params, formMode, id, auth }) =>
                this._processFetchCatalogueSegmentations$(params, auth, formMode, id)
            )
        )
    );

    fetchCataloguesFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueActions.fetchCataloguesFailure),
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
        private catalogueApi: CatalogueApiService,
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
        dispatchTo: CatalogueFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _fetchCataloguesOfSegmentationRequest$(
        id: string,
        user: User,
        params: IQueryParams
    ): Observable<AnyAction> {
        const newParams: IQueryParams = {
            ...params,
        };

        return this.catalogueSegmentationApi
            .getById<PaginateResponse<CatalogueOfSegmentationProps>>(id, 'catalogue', newParams)
            .pipe(
                catchOffline(),
                map((resp) => {
                    const newResp = {
                        data:
                            resp && resp.data.length
                                ? resp.data
                                      .map((item) => ({
                                          segmentationId: item.segmentationId,
                                          ...item.catalogue,
                                      }))
                                      .map((item) => new Catalogue(item))
                                : [],
                        total: resp.total,
                    };

                    return CatalogueActions.fetchCataloguesSuccess(newResp);
                }),
                catchError((err) => this._sendErrorToState$(err, 'fetchCataloguesFailure'))
            );
    }

    private _fetchCataloguesRequest$(user: User, params: IQueryParams): Observable<AnyAction> {
        const newParams: IQueryParams = {
            ...params,
        };

        const { supplierId } = user.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this.catalogueApi.getWithQuery<PaginateResponse<Catalogue>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        resp && resp.data.length
                            ? resp.data.map((item) => new Catalogue(item))
                            : [],
                    total: resp.total,
                };

                return CatalogueActions.fetchCataloguesSuccess(newResp);
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchCataloguesFailure'))
        );
    }

    private _processFetchCatalogueSegmentations$(
        params: IQueryParams,
        auth: Auth,
        formMode: FormMode = 'add',
        id?: string
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) => {
                    if (formMode !== 'add') {
                        return this._fetchCataloguesOfSegmentationRequest$(id, user, params);
                    } else {
                        return this._fetchCataloguesRequest$(user, params);
                    }
                })
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => {
                if (formMode !== 'add') {
                    return this._fetchCataloguesOfSegmentationRequest$(id, user, params);
                } else {
                    return this._fetchCataloguesRequest$(user, params);
                }
            })
        );
    }
}
