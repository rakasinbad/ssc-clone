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
import { AssignCatalogueDto } from '../../models';
import { CatalogueSegmentationApiService } from '../../services';
import {
    CatalogueSegmentationFormActions,
    CatalogueSegmentationFormFailureActions,
} from '../actions';

@Injectable()
export class AssignCatalogueEffects {
    private readonly successMessageDefault = 'Successfully assign catalogue';
    private downloadUrl: string = null;

    readonly assignCatalogueRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueSegmentationFormActions.assignCatalogueRequest),
            map((action) => action.payload),
            withLatestFrom(this.authFacade.getUser$, ({ body, id }, auth) => ({
                body,
                id,
                auth,
            })),
            switchMap(({ body, id, auth }) => this._processAssignCatalogue$(body, auth, id))
        )
    );

    readonly assignCatalogueFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationFormActions.assignCatalogueFailure),
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

    readonly assignCatalogueSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationFormActions.assignCatalogueSuccess),
                map((action) => action.message),
                tap((message) => {
                    this.noticeService.open(message || this.successMessageDefault, 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly authFacade: AuthFacadeService,
        private readonly catalogueSegmentationApi: CatalogueSegmentationApiService,
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
        console.log('ASSIGN_SKU ERR HANDLER', { resp });
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
        dispatchTo: CatalogueSegmentationFormFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueSegmentationFormActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueSegmentationFormActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueSegmentationFormActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }

    private _patchCatalogueSegmentationRequest$(
        user: User,
        body: AssignCatalogueDto,
        id: string
    ): Observable<AnyAction> {
        return this.catalogueSegmentationApi
            .patch<{ message: string }, AssignCatalogueDto>(body, id)
            .pipe(
                map(({ message = null }) =>
                    CatalogueSegmentationFormActions.assignCatalogueSuccess({ message })
                ),
                catchError((err) => this._sendErrorToState$(err, 'assignCatalogueFailure'))
            );
    }

    private _processAssignCatalogue$(
        body: AssignCatalogueDto,
        auth: Auth,
        id: string
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) => this._patchCatalogueSegmentationRequest$(user, body, id))
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => this._patchCatalogueSegmentationRequest$(user, body, id))
        );
    }
}
