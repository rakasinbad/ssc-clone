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
import { SupplierStoresApiService } from '../../services';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler } from 'app/shared/models/global.model';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { IMassUpload } from '../../models';
import { ImportMassUpload } from '../actions';
import * as fromImportMassUpload from '../reducers';

@Injectable()
export class ImportMassUploadEffects {
    importMassConfirmRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportMassUpload.importMassConfirmRequest),
            map(action => {
                let params = action.payload;
                if (params) {
                    return ImportMassUpload.importMassRequest({
                        payload: params
                    });
                }
                return { type: 'NO_ACTION' };
            }),
        )
    );

    importMassRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportMassUpload.importMassRequest),
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
                ([{ file, type, catalogueId, fakturId, brandId, catalogueSegmentationId }, data]: [IMassUpload, string | Auth]) => {
                    if (!file) {
                        return of(
                            ImportMassUpload.importMassFailure({
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
                            ImportMassUpload.importMassFailure({
                                payload: { id: 'importFailure', errors: 'Not Found!' }
                            })
                        );
                    }

                    let formData1 = new FormData();
                    formData1.append('file', file, file.name);
                    formData1.append('supplierId', supplierId);
                    formData1.append('type', type);
                    if (catalogueId !== null) {
                        formData1.append('catalogueId', catalogueId);
                    } else if (brandId !== null) {
                        formData1.append('brandId', brandId);
                    } else if (fakturId !== null) {
                        formData1.append('fakturId', fakturId);
                    } else if (catalogueSegmentationId !== null) {
                        formData1.append('catalogueSegmentationId', catalogueSegmentationId);
                    }
                    
                    return this._$massUploadServiceApi.uploadFormData(formData1).pipe(
                        map(resp => {
                            console.log('isi resp->', resp)
                            if (resp.total > 0) {
                                return ImportMassUpload.importMassSuccess(resp);
                            }
                        }),
                        catchError(err => this.sendErrorToState(err, 'importFailure'))
                    );

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
                        ImportMassUpload.importMassFailure,
                        ImportMassUpload.importConfigFailure
                    ]
                ),
                // Hanya mengambil payload-nya saja.
                map(action => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap(this._$helper.showErrorNotification)
            ),
        { dispatch: false }
    );

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: 'importFailure' | 'importConfigFailure'
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                ImportMassUpload[dispatchTo]({
                    payload: err
                })
            );
        }

        if ((err as HttpErrorResponse).message) {
            if ((err as HttpErrorResponse).message.startsWith('Http failure response')) {
                return of(
                    ImportMassUpload[dispatchTo]({
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
            ImportMassUpload[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err
                }
            })
        );
    };

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private storage: StorageMap,
        private store: Store<fromImportMassUpload.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$exportServiceApi: ExportServiceApiService,
        private _$massUploadServiceApi: SupplierStoresApiService,
        private _$uploadApi: UploadApiService
    ) {}
}
