import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthFacadeService } from 'app/main/pages/core/auth/services';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { PatchCatalogueSegmentationInfoDto } from '../../models';
import { CatalogueSegmentationApiService, CatalogueSegmentationFacadeService } from '../../services';
import { CatalogueSegmentationFormActions, CatalogueSegmentationFormFailureActions } from '../actions';

@Injectable()
export class UpdateCatalogueSegmentationEffects {
    readonly updateCatalogueSegmentationInfoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoRequest),
            map((action) => action.payload),
            withLatestFrom(this.authFacade.getUser$, ({ body, id }, auth) => ({
                body,
                id,
                auth,
            })),
            switchMap(({ body, id, auth }) =>
                this._processUpdateCatalogueSegmentationInfo$(body, auth, id)
            )
        )
    );

    readonly updateCatalogueSegmentationInfoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoFailure),
                map((action) => action.payload),
                map((err) => this._handleErrMessage(err)),
                tap((message) => {
                    // Reset save btn
                    this.catalogueSegmentationFacade.resetSaveBtn();
                    this.noticeService.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    readonly updateCatalogueSegmentationInfoSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueSegmentationFormActions.updateCatalogueSegmentationInfoSuccess),
                map((action) => action.message),
                tap((message) => {
                    // Reset save btn
                    this.catalogueSegmentationFacade.resetSaveBtn();
                    this.noticeService.open(message, 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly router: Router,
        private readonly authFacade: AuthFacadeService,
        private readonly catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
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

    private _updateCatalogueSegmentationInfoRequest$(
        user: User,
        body: PatchCatalogueSegmentationInfoDto,
        id: string
    ): Observable<AnyAction> {
        return this.catalogueSegmentationApi
            .patchInfo<{ message: string }, PatchCatalogueSegmentationInfoDto>(
                body,
                id,
                'segmentation'
            )
            .pipe(
                map(({ message = null }) =>
                    CatalogueSegmentationFormActions.updateCatalogueSegmentationSuccess({ message })
                ),
                catchError((err) =>
                    this._sendErrorToState$(err, 'updateCatalogueSegmentationInfoFailure')
                )
            );
    }

    private _processUpdateCatalogueSegmentationInfo$(
        body: PatchCatalogueSegmentationInfoDto,
        auth: Auth,
        id: string
    ): Observable<AnyAction> {
        if (!auth) {
            return this.helperService.decodeUserToken().pipe(
                map((user) => this._checkUserSupplier(user)),
                retry(3),
                switchMap((user) => this._updateCatalogueSegmentationInfoRequest$(user, body, id))
            );
        }

        return of(auth.user).pipe(
            map((user) => this._checkUserSupplier(user)),
            retry(3),
            switchMap((user) => this._updateCatalogueSegmentationInfoRequest$(user, body, id))
        );
    }
}
