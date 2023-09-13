import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    ExportServiceApiService,
    HelperService,
    NoticeService,
    UploadApiService
} from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { IImportAdvanced } from '../../models';
import { ImportAdvancedActions } from '../actions';
import { fromImportAdvanced } from '../reducers';

@Injectable()
export class ImportAdvancedEffects {
    importConfigRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportAdvancedActions.importConfigRequest),
            map(action => action.payload),
            switchMap(params => {
                if (!params) {
                    this._$notice.open('Please set page type first!', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });

                    throw new ErrorHandler({
                        id: 'importConfigFailure',
                        errors: 'Not set page type'
                    });
                }

                return this._$exportServiceApi.getConfig(params).pipe(
                    map(resp => {
                        return ImportAdvancedActions.importConfigSuccess({
                            payload: resp
                        });
                    }),
                    catchError(err => this.sendErrorToState(err, 'importConfigFailure'))
                );
            })
        )
    );

    importConfirmRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportAdvancedActions.importConfirmRequest),
            map(action => action.payload),
            exhaustMap(params => {
                const { file } = params;
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: IImportAdvanced }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: 'Import',
                        message: `Are you sure want to import <strong>${file.name}</strong> ?`,
                        id: 'import',
                        change: params
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return ImportAdvancedActions.importRequest({
                        payload: change
                    });
                }

                return { type: 'NO_ACTION' };
            })
        )
    );

    importRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportAdvancedActions.importRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then(user => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;

                return of([params, supplierId]);
            }),
            switchMap(
                ([{ file, type, page, endpoint, fileType }, data]: [IImportAdvanced, string | Auth]) => {
                    if (!data || !file || !type || !page || !endpoint) {
                        return of(
                            ImportAdvancedActions.importFailure({
                                payload: { id: 'importFailure', errors: 'Not Found!' }
                            })
                        );
                    }

                    let supplierId;

                    if (typeof data === 'string') {
                        supplierId = data;
                    } else {
                        supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                    }

                    if (!supplierId) {
                        return of(
                            ImportAdvancedActions.importFailure({
                                payload: { id: 'importFailure', errors: 'Not Found!' }
                            })
                        );
                    }

                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('supplierId', supplierId);
                    formData.append('type', type);
                    formData.append('page', page);
                    if (fileType) formData.append('fileType', fileType);

                    if (type === 'create_catalogues' || type === 'update_catalogues') {
                        return this._$uploadApi.uploadCatalogueFormData(endpoint, formData, type).pipe(
                            map(resp => {
                                const message = "Import produk berhasil, Anda dapat melihat hasilnya di Tab Import History";
                                this._$notice.open(message, 'success', {
                                    verticalPosition: 'bottom',
                                    horizontalPosition: 'right'
                                });

                                return ImportAdvancedActions.importSuccess();
                            }),
                            catchError(err => this.sendErrorToState(err, 'importFailure'))
                        );
                    } else {
                        return this._$uploadApi.uploadFormData(endpoint, formData).pipe(
                            map(resp => {
                                const message = "Import produk berhasil, Anda dapat melihat hasilnya di Tab Import History";
                                this._$notice.open(message, 'success', {
                                    verticalPosition: 'bottom',
                                    horizontalPosition: 'right'
                                });
                                return ImportAdvancedActions.importSuccess();
                            }),
                            catchError(err => this.sendErrorToState(err, 'importFailure'))
                        );
                    }
                }
            )
        )
    );

    failureAction$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action fetch export logs failure.
                ofType(
                    ...[
                        ImportAdvancedActions.importFailure,
                        ImportAdvancedActions.importConfigFailure
                    ]
                ),
                // Hanya mengambil payload-nya saja.
                map(action => action.payload),
                // Memunculkan notif bahwa request import gagal.
                // tap(this._$helper.showErrorNotification)
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

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: 'importFailure' | 'importConfigFailure'
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                ImportAdvancedActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if ((err as HttpErrorResponse).message) {
            if ((err as HttpErrorResponse).message.startsWith('Http failure response')) {
                return of(
                    ImportAdvancedActions[dispatchTo]({
                        payload: {
                            id: `ERR_HTTP_${
                                (err as HttpErrorResponse).error.name
                                    ? (err as HttpErrorResponse).error.name.toUpperCase()
                                    : 'UNKNOWN_ERROR'
                            }`,
                            errors: err
                        }
                    })
                );
            }
        }

        return of(
            ImportAdvancedActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err
                }
            })
        );
    };

    private _handleErrMessage(resp: ErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private storage: StorageMap,
        private store: Store<fromImportAdvanced.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$exportServiceApi: ExportServiceApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
