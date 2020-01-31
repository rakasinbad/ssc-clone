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

    importRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ImportAdvancedActions.importRequest),
                map(action => action.payload),
                withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
                switchMap(([{ file, type, mode }, { supplierId }]) => {
                    if (!supplierId || !file || !type) {
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
                    formData.append('page', mode);

                    return this._$uploadApi.uploadFormData('import-order-parcels', formData).pipe(
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
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private store: Store<fromImportAdvanced.FeatureState>,
        private _$notice: NoticeService,
        private _$exportServiceApi: ExportServiceApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
