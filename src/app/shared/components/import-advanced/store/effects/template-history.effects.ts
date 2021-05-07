import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ExportLogApiService, NoticeService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ExportLog, IExportLog, PayloadTemplateHistory } from '../../models';
import { TemplateHistoryActions } from '../actions';
import { fromImportAdvanced } from '../reducers';

@Injectable()
export class TemplateHistoryEffects {
    templateHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TemplateHistoryActions.templateHistoryRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([{ params, type, page }, userSupplier]) => {
                const supplierId = userSupplier.supplierId;
                const newQuery: IQueryParams = {
                    ...params,
                };
                // Memasukkan ID supplier ke dalam parameter.
                newQuery['supplierId'] = supplierId;
                return this._$exportLogApi
                    .findAll<PaginateResponse<IExportLog>>(params, type, page, supplierId)
                    .pipe(
                        catchOffline(),
                        map(resp => {
                            const newResp = {
                                total: resp.total,
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => new ExportLog(row))
                                        : []
                            };

                            return TemplateHistoryActions.templateHistorySuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                TemplateHistoryActions.templateHistoryFailure({
                                    payload: new ErrorHandler({
                                        id: 'templateHistoryFailure',
                                        errors: err
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    createTemplateHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TemplateHistoryActions.createTemplateHistoryRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserDataState), this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([payload, userAuth, userSupplier]) => {
                if (!userAuth) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [payload, user] : [payload, null, userSupplier]));
                }

                const { id } = userAuth;

                return of([payload, id, userSupplier]);
            }),
            switchMap(([payload, data, userSupplier]: [PayloadTemplateHistory, string | User, UserSupplier]) => {
                if (!data) {
                    return of(
                        TemplateHistoryActions.createTemplateHistoryFailure({
                            payload: new ErrorHandler({
                                id: 'createTemplateHistoryFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let userId;

                if (typeof data === 'string') {
                    userId = data;
                } else {
                    userId = (data as User).id;
                }

                if (!userId) {
                    return of(
                        TemplateHistoryActions.createTemplateHistoryFailure({
                            payload: new ErrorHandler({
                                id: 'createTemplateHistoryFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                const body: PayloadTemplateHistory = {
                    ...payload,
                    userId
                };
                if (payload.page === 'payments') {
                    body['supplierId'] = userSupplier.supplierId;
                }

                return this._$exportLogApi.create(body).pipe(
                    map(resp => {
                        return TemplateHistoryActions.createTemplateHistorySuccess();
                    }),
                    catchError(err =>
                        of(
                            TemplateHistoryActions.createTemplateHistoryFailure({
                                payload: new ErrorHandler({
                                    id: 'createTemplateHistoryFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    createTemplateHistoryFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(TemplateHistoryActions.createTemplateHistoryFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    createTemplateHistorySuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TemplateHistoryActions.createTemplateHistorySuccess),
            map(() => {
                return TemplateHistoryActions.resetDownloadState();
            })
        )
    );

    constructor(
        private actions$: Actions,
        private storage: StorageMap,
        private store: Store<fromImportAdvanced.FeatureState>,
        private _$notice: NoticeService,
        private _$exportLogApi: ExportLogApiService,
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
}
