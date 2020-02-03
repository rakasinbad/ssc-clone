import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { ExportServiceApiService, NoticeService, UploadApiService } from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { ErrorHandler } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { IImportAdvanced } from '../../models';
import { ImportAdvancedActions } from '../actions';
import { fromImportAdvanced } from '../reducers';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';

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

                    return of(
                        ImportAdvancedActions.importConfigFailure({
                            payload: new ErrorHandler({
                                id: 'importConfigFailure',
                                errors: 'Not set page type'
                            })
                        })
                    );
                }

                return this._$exportServiceApi.getConfig(params).pipe(
                    map(resp => {
                        return ImportAdvancedActions.importConfigSuccess({
                            payload: resp
                        });
                    }),
                    catchError(err =>
                        of(
                            ImportAdvancedActions.importConfigFailure({
                                payload: new ErrorHandler({
                                    id: 'importConfigFailure',
                                    errors: err
                                })
                            })
                        )
                    )
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
                ([{ file, type, page, endpoint }, data]: [IImportAdvanced, string | Auth]) => {
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

                    return this._$uploadApi.uploadFormData(endpoint, formData).pipe(
                        map(resp => {
                            return ImportAdvancedActions.importSuccess();
                        }),
                        catchError(err =>
                            of(
                                ImportAdvancedActions.importFailure({
                                    payload: { id: 'importFailure', errors: err }
                                })
                            )
                        )
                    );
                }
            )
        )
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private storage: StorageMap,
        private store: Store<fromImportAdvanced.FeatureState>,
        private _$notice: NoticeService,
        private _$exportServiceApi: ExportServiceApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
