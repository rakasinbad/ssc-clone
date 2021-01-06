import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { CataloguePriceSegmentationApiService, CataloguesService } from '../../services';
import {
    CataloguePriceSegmentationActions,
    CataloguePriceSegmentationFailureActions,
} from '../actions';

@Injectable()
export class DeletePriceSegmentationEffects {
    deleteCataloguePriceSegmentationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CataloguePriceSegmentationActions.deleteRequest),
            map((action) => ({ id: action.id, formIndex: action.formIndex })),
            withLatestFrom(this.authFacade.getUser$, ({ id, formIndex }, auth) => ({
                id,
                formIndex,
                auth,
            })),
            switchMap(({ id, formIndex, auth }) =>
                this._processDeleteCataloguePriceSegmentation$(id, formIndex, auth)
            )
        )
    );

    deleteCataloguePriceSegmentationFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CataloguePriceSegmentationActions.deleteFailure),
                map((action) => action.payload),
                map((err) => this._handleErrMessage(err)),
                tap((message) => {
                    this.noticeService.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    deleteCataloguePriceSegmentationSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CataloguePriceSegmentationActions.deleteSuccess),
                map((action) => action.formIndex),
                tap((formIndex) => {
                    this.calagoueService.broadcastUpdateForm(formIndex);
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private authFacade: AuthFacadeService,
        private cataloguePriceSegmentationApi: CataloguePriceSegmentationApiService,
        private calagoueService: CataloguesService,
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
        dispatchTo: CataloguePriceSegmentationFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CataloguePriceSegmentationActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CataloguePriceSegmentationActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CataloguePriceSegmentationActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _deleteCataloguePriceSegmentationRequest$(
        user: User,
        id: string,
        formIndex: number
    ): Observable<AnyAction> {
        return this.cataloguePriceSegmentationApi.delete<{ message: string }>(id).pipe(
            tap((resp) => HelperService.debug('DELETE CATALOGUE PRICE', resp)),
            map(({ message = null }) =>
                CataloguePriceSegmentationActions.deleteSuccess({ id, formIndex })
            ),
            catchError((err) => this._sendErrorToState$(err, 'deleteFailure'))
        );
    }

    private _processDeleteCataloguePriceSegmentation$(
        id: string,
        formIndex: number,
        auth: Auth
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) =>
                    this._deleteCataloguePriceSegmentationRequest$(user, id, formIndex)
                )
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => this._deleteCataloguePriceSegmentationRequest$(user, id, formIndex))
        );
    }
}
