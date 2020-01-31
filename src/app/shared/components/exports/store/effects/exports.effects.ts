import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, withLatestFrom, catchError, retry, tap, exhaustMap, filter } from 'rxjs/operators';

import {
    exportFailureActionNames, ExportActions,
} from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError, forkJoin } from 'rxjs';
// import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { Export } from '../../models';
import { IQueryParams, TNullable, ErrorHandler, IPaginatedResponse, User } from 'app/shared/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { TypedAction } from '@ngrx/store/src/models';
import { Store } from 'app/main/pages/attendances/models';
import { fromExport } from '../reducers';
// import { Router } from '@angular/router';
import { MatDialog, MatSnackBarConfig } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { ExportsComponent } from '../../exports.component';
import { ExportsApiService } from '../../services';
import { ExportModuleNames } from '../actions/exports.actions';
// import { PortfoliosApiService } from '../../../portfolios/services';

type AnyAction = { payload: any; } & TypedAction<any>;

@Injectable()
export class ExportsEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private exportStore: NgRxStore<fromExport.State>,
        private exportsApiService: ExportsApiService,
        private notice$: NoticeService,
        // private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog,
    ) {}

    startExportRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action me-request untuk export.
            ofType(ExportActions.startExportRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams & { exportType: ExportModuleNames }, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams & { exportType: ExportModuleNames }], Observable<AnyAction>>(this.processStartExportRequest),
                        catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams & { exportType: ExportModuleNames }], Observable<AnyAction>>(this.processStartExportRequest),
                        catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                    );
                }
            })
        )
    );

    startExportSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action start export success.
            ofType(ExportActions.startExportSuccess),
            // Memunculkan notif bahwa request export berhasil.
            tap(() => {
                this.notice$.open('An export request sent.', 'success', {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                });

                // Kemudian, memunculkan dialog log export-nya.
                this.matDialog.open(ExportsComponent, {
                    disableClose: true,
                    width: '70vw'
                });
            })
        )
    , { dispatch: false });

    startExportFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action start export failure.
            ofType(ExportActions.startExportFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(error => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };

                if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
                    this.notice$.open(`Failed to request export. Reason: ${error.errors}`, 'error', noticeSetting);
                } else {
                    this.notice$.open(`Something wrong with our web while exporting. Please contact Sinbad Team.`, 'error', noticeSetting);
                }

            })
        )
    , { dispatch: false });

    fetchExportLogsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action me-request log export.
            ofType(ExportActions.fetchExportLogsRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processFetchExportLogsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchExportLogsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processFetchExportLogsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchExportLogsFailure'))
                    );
                }
            })
        )
    );

    // fetchExportLogsSuccess$ = createEffect(() =>
    //     this.actions$.pipe(
    //         // Hanya untuk action start export success.
    //         ofType(ExportActions.fetchExportLogsSuccess),
    //         // Memunculkan notif bahwa request export berhasil.
    //         tap(() => {
    //             this.notice$.open('Export logs fetched successfully.', 'success', {
    //                 horizontalPosition: 'right',
    //                 verticalPosition: 'bottom',
    //                 duration: 5000,
    //             });

    //             // Kemudian, memunculkan dialog log export-nya.
    //             // this.matDialog.open(ExportsComponent, {
    //             //     disableClose: true,
    //             //     width: '70vw'
    //             // });
    //         })
    //     )
    // , { dispatch: false });

    fetchExportLogsFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action fetch export logs failure.
            ofType(ExportActions.fetchExportLogsFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(error => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };

                if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
                    this.notice$.open(`Failed to request export logs. Reason: ${error.errors}`, 'error', noticeSetting);
                } else {
                    this.notice$.open(`Something wrong with our web while requesting export logs. Please contact Sinbad Team.`, 'error', noticeSetting);
                }

            })
        )
    , { dispatch: false });

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throwError(new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            }));
        }
    
        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    }

    processFetchExportLogsRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID user saja.
        const { userId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };
    
        // Memasukkan ID user ke dalam parameter.
        newQuery['userId'] = userId;

        return this.exportsApiService
            .findExportLogs<IPaginatedResponse<Export>>(newQuery)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    if (newQuery.paginate) {
                        return of(ExportActions.fetchExportLogsSuccess({
                            payload: {
                                data: response.data.map(xport => new Export({
                                    ... xport,
                                })),
                                total: response.total,
                            }
                        }));
                    } else {
                        const newResponse = (response as unknown as Array<Export>);

                        return of(ExportActions.fetchExportLogsSuccess({
                            payload: {
                                data: newResponse.map(xport => new Export({
                                    ... xport,
                                })),
                                total: newResponse.length,
                            }
                        }));
                    }
                }),
                catchError(err => this.sendErrorToState(err, 'fetchExportLogsFailure'))
            );
    }

    processStartExportRequest = ([userData, queryParams]: [User, IQueryParams & { exportType: ExportModuleNames }]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams & { exportType: ExportModuleNames } = {
            ...queryParams
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.exportsApiService
            .requestExport(newQuery)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(ExportActions.startExportSuccess({
                        payload: {
                            message: response.message
                        }
                    }));
                }),
                catchError(err => this.sendErrorToState(err, 'startExportFailure'))
            );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: exportFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(ExportActions[dispatchTo]({
                payload: err
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(ExportActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: err.toString()
                }
            }));
        }

        return of(ExportActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }
}
