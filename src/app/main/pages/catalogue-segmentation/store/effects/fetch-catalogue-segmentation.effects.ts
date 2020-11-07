import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CatalogueSegmentation } from '../../models';
import { CatalogueSegmentationApiService } from '../../services';
import {
    CatalogueSegmentationDetailActions,
    CatalogueSegmentationDetailFailureActions,
} from '../actions';

@Injectable()
export class FetchCatalogueSegmentationEffects {
    fetchCatalogueSegmentationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueSegmentationDetailActions.fetchCatalogueSegmentationRequest),
            map((action) => action.id),
            withLatestFrom(this.authFacade.getUser$, (id, auth) => ({
                id,
                auth,
            })),
            switchMap(({ id, auth }) => this._processFetchCatalogueSegmentation$(id, auth))
        )
    );

    fetchCatalogueSegmentationFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationDetailActions.fetchCatalogueSegmentationFailure),
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
        dispatchTo: CatalogueSegmentationDetailFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueSegmentationDetailActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueSegmentationDetailActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueSegmentationDetailActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _fetchCatalogueSegmentationRequest$(id: string): Observable<AnyAction> {
        return this.catalogueSegmentationApi.getById<CatalogueSegmentation>(id).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data: resp ? new CatalogueSegmentation(resp) : resp,
                };

                return CatalogueSegmentationDetailActions.fetchCatalogueSegmentationSuccess(
                    newResp
                );
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchCatalogueSegmentationFailure'))
        );
    }

    private _processFetchCatalogueSegmentation$(id: string, auth: Auth): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((_) => this._fetchCatalogueSegmentationRequest$(id))
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((_) => this._fetchCatalogueSegmentationRequest$(id))
        );
    }
}
