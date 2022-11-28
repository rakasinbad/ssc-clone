import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NoticeService } from 'app/shared/helpers';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { MaxOrderQtySegmentationDto } from '../../models';
import { CataloguePriceSegmentationApiService } from '../../services';
import {
    CatalogueMaxOrderQtySegmentationActions,
    CatalogueMaxOrderQtySegmentationFailureActions,
} from '../actions';

@Injectable()
export class UpdateMaxOrderQtySegmentationEffects {
    readonly updateMaxOrderQtyRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMaxOrderQtySegmentationActions.updateRequest),
            map((action) => ({ payload: action.payload, formIndex: action.formIndex })),
            map(({ payload, formIndex }) => ({
                isMaximum: payload.isMaximum,
                maxQty: payload.maxQty,
                id: payload.id,
                formIndex,
            })),
            mergeMap(({ isMaximum, maxQty, id, formIndex }) =>
                this.priceApi
                    .update<Omit<MaxOrderQtySegmentationDto, 'id'>>({ isMaximum, maxQty }, id)
                    .pipe(
                        map((_) =>
                            CatalogueMaxOrderQtySegmentationActions.updateSuccess({
                                data: {
                                    id,
                                    changes: {
                                        isMaximum,
                                        maxQty,
                                    },
                                },
                                formIndex,
                            })
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'updateFailure'))
                    )
            )
        )
    );

    readonly updateMaxOrderQtyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueMaxOrderQtySegmentationActions.updateFailure),
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

    readonly updateMaxOrderQtySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueMaxOrderQtySegmentationActions.updateSuccess),
                map((action) => ({ data: action.data, formIndex: action.formIndex })),
                tap((payload) => {
                    this.noticeService.open('Max quantity applied.', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly priceApi: CataloguePriceSegmentationApiService,
        private readonly noticeService: NoticeService
    ) {}

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
        dispatchTo: CatalogueMaxOrderQtySegmentationFailureActions
    ): Observable<AnyAction> {
        if (err instanceof ErrorHandler) {
            return of(
                CatalogueMaxOrderQtySegmentationActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CatalogueMaxOrderQtySegmentationActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CatalogueMaxOrderQtySegmentationActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    }
}
