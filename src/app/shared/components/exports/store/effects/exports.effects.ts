import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, withLatestFrom, catchError, retry, tap, exhaustMap, filter, exhaust } from 'rxjs/operators';

import {
    exportFailureActionNames, ExportActions,
} from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError, forkJoin, iif } from 'rxjs';
// import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { Export, ExportConfiguration, ExportFilterConfiguration, ExportFormData, defaultExportFilterConfiguration } from '../../models';
import { IQueryParams, TNullable, ErrorHandler, IPaginatedResponse, User, IErrorHandler } from 'app/shared/models';
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
import { ExportFilterComponent } from '../../components/export-filter/export-filter.component';
import { ExportSelector } from '../selectors';

type AnyAction = { payload: any; } & TypedAction<any>;

// Konfigurasi export untuk halaman
const EXPORT_CONFIGURATION: ExportFilterConfiguration = defaultExportFilterConfiguration;

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

    prepareExport$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pemeriksaan konfigurasi export.
            ofType(ExportActions.prepareExportCheck),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams & ExportConfiguration, TNullable<Auth>]) => {
                return of([queryParams, authState] as [IQueryParams & ExportConfiguration, TNullable<Auth>])
                .pipe(
                    // Pemeriksaan error.
                    tap(([_, __]) => this.checkExportConfiguration(queryParams)),
                    // Memeriksa penekanan tombol pada dialog filter export.
                    exhaustMap(([_, __]: [IQueryParams & ExportConfiguration, TNullable<Auth>]) => {
                        // Memeriksa konfigurasi kebutuhan filter dari export global.
                        const isFilterRequired = this.isNeedFilter(queryParams.page);

                        if (!isFilterRequired) {
                            // Jika tidak dibutuhkan, maka akan diteruskan ke pipe selanjutnya.
                            return of([queryParams, authState]);
                        } else {
                            // Membuka dialog.
                            const dialogRef = this.matDialog.open<ExportFilterComponent, ExportConfiguration>(ExportFilterComponent, {
                                data: {
                                    page: queryParams.page,
                                    configuration: queryParams.configuration
                                },
                                maxWidth: '60vw',
                                maxHeight: '70vh',
                                panelClass: 'event-form-export-dialog',
                            });

                            // Mengembalikan nilai ketika sudah menutup dialog filter export.
                            return dialogRef.afterClosed().pipe(
                                map((val: undefined | { page: string; payload: ExportFormData; }) => {
                                    if (!val) {
                                        return val;
                                    } else {
                                        return [{
                                            ...queryParams,
                                            formData: val.payload
                                        }, authState];
                                    }
                                }),
                                filter(val => !!val),
                            );
                        }
                    }),
                    // Memulai pemeriksaan auth user dan memulai permintaan export.
                    switchMap(([query, __]: [IQueryParams & ExportConfiguration & { formData: ExportFormData }, TNullable<Auth>]) => {
                        // Jika tidak ada data supplier-nya user dari state.
                        if (!authState) {
                            return this.helper$.decodeUserToken().pipe(
                                map(this.checkUserSupplier),
                                retry(3),
                                switchMap(userData => of([userData, query])),
                                switchMap<[User, IQueryParams & ExportConfiguration & { formData: ExportFormData }], Observable<AnyAction>>(this.continueToStartExport),
                                catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                            );
                        } else {
                            return of(authState.user).pipe(
                                map(this.checkUserSupplier),
                                retry(3),
                                switchMap(userData => of([userData, query])),
                                switchMap<[User, IQueryParams & ExportConfiguration & { formData: ExportFormData }], Observable<AnyAction>>(this.continueToStartExport),
                                catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                            );
                        }
                    }),
                    catchError(err => this.sendErrorToState(err, 'prepareExportFailure')),
                );
            }),
        )
    );

    startExportRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action me-request untuk export.
            ofType(ExportActions.startExportRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams & ExportConfiguration & { formData: ExportFormData }, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams & ExportConfiguration & { formData: ExportFormData }], Observable<AnyAction>>(this.processStartExportRequest),
                        catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams & ExportConfiguration & { formData: ExportFormData }], Observable<AnyAction>>(this.processStartExportRequest),
                        catchError(err => this.sendErrorToState(err, 'startExportFailure'))
                    );
                }
            }),
            catchError(err => this.sendErrorToState(err, 'startExportFailure'))
        )
    );

    startExportSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action start export success.
            ofType(ExportActions.startExportSuccess),
            tap(() => {
                setTimeout(() => {
                    // Memunculkan notif bahwa request export berhasil.
                    this.notice$.open('An export request sent.', 'success', {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        duration: 5000,
                    });
                }, 300);

                // Kemudian, memunculkan dialog log export-nya.
                this.matDialog.open(ExportsComponent, {
                    disableClose: true,
                    width: '70vw',
                    height: '85vh',
                    panelClass: ['sinbad-export-dialog-container']
                });
            })
        )
    , { dispatch: false });

    prepareExportFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action start export failure.
            ofType(ExportActions.prepareExportFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(error => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };

                this.notice$.open(`Something wrong with our web while preparing export dialog. Please contact Sinbad Team. Error code: ${error.id}`, 'error', noticeSetting);
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

                this.notice$.open(`Something wrong with our web while exporting. Please contact Sinbad Team. Error code: ${error.id}`, 'error', noticeSetting);
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
            withLatestFrom(
                this.exportStore.select(ExportSelector.getExportPage),
                this.authStore.select(AuthSelectors.getUserState),
            ),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, exportPage, authState]: [IQueryParams, string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, exportPage, queryParams])),
                        switchMap<[User, string, IQueryParams], Observable<AnyAction>>(this.processFetchExportLogsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchExportLogsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, exportPage, queryParams])),
                        switchMap<[User, string, IQueryParams], Observable<AnyAction>>(this.processFetchExportLogsRequest),
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

    isNeedFilter(pageType: ExportConfiguration['page']): boolean {
        switch (pageType) {
            case 'stores':
            case 'catalogues':
            case 'payments':
            case 'portfolios':
            case 'journey-plans':
            case 'orders': { 
                return (EXPORT_CONFIGURATION[pageType].requireFilter);
            }
        }

        return false;
    }

    // Fungsi ini untuk memeriksa apakah nilainya terisi atau tidak.
    isFilterRequirementOverriden(pageType: ExportConfiguration['page'], value: ExportFilterConfiguration): boolean {
        const isSupplied = (arg: any) => (arg !== null || arg !== undefined);

        return (isSupplied(value[pageType].requireFilter) && value[pageType].requireFilter !== EXPORT_CONFIGURATION[pageType].requireFilter);
    }

    checkExportConfiguration(payload: IQueryParams & ExportConfiguration): void {
        const err: IErrorHandler = {
            errors: payload,
            id: 'NO_ERROR'
        };

        if (!payload.page) {
            // Error terlempar jika tidak memberikan halaman apa yang ingin di-export.
            err.id = 'ERR_MISCONFIGURED_EXPORT_PAGE_TYPE';
            throw new ErrorHandler(err);
        } else {
            // Mengambil konfigurasi export dari payload.
            const { configuration = {} } = payload;
    
            switch (payload.page) {
                case 'catalogues':
                case 'orders':
                case 'payments':
                case 'journey-plans':
                case 'stores': {
                    // Memeriksa konfigurasi OMS.
                    if (configuration[payload.page]) {
                        // Memeriksa apakah requirement filter telah tertimpa oleh payload-nya action atau tidak.
                        if (this.isFilterRequirementOverriden(payload.page, configuration)) {
                            if (payload.page === 'catalogues') {
                                err.id = 'ERR_CATALOGUE_FILTER_REQUIRED';
                            } else if (payload.page === 'orders') {
                                err.id = 'ERR_OMS_FILTER_REQUIRED';
                            } else if (payload.page === 'payments') {
                                err.id = 'ERR_PAYMENT_FILTER_REQUIRED';
                            } else if (payload.page === 'stores') {
                                err.id = 'ERR_STORE_LIST_FILTER_REQUIRED';
                            }

                            // Melempar error jika filter dibutuhkan, namun konfigurasi dari payload 'ngomong' bahwa filter tidak dibutuhkan.
                            throw new ErrorHandler(err);
                        } else {
                            throw new ErrorHandler(err);
                        }
                    }

                    break;
                }
                case 'portfolios': break;
                default: {
                    // Error terlempar jika tipe halaman tidak dikenal.
                    err.id = 'ERR_EXPORT_PAGE_TYPE_UNRECOGNIZED';
                    throw new ErrorHandler(err);
                }
            }
        }
    }

    checkUserSupplier = (userData: User): User | Observable<never> => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            });
        }
    
        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    }

    processFetchExportLogsRequest = ([userData, exportPage, queryParams]: [User, ExportConfiguration['page'], IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID user saja.
        const { userId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };
    
        // Memasukkan ID user ke dalam parameter.
        newQuery['userId'] = userId;

        switch (exportPage) {
            case 'stores': {
                newQuery['page'] = 'stores';
                break;
            }
            case 'catalogues': {
                newQuery['page'] = 'catalogues';
                break;
            }
            case 'payments': {
                newQuery['page'] = 'fms';
                break;
            }
            case 'orders': {
                newQuery['page'] = 'oms';
                break;
            }
            case 'portfolios': {
                newQuery['page'] = 'portfolios';
                break;
            }
            case 'journey-plans': {
                newQuery['page'] = 'journey_plans';
                break;
            }
            default: {
                newQuery['page'] = exportPage;
            }
        }

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

    continueToStartExport = ([_, queryParams]: [User, IQueryParams & ExportConfiguration & { formData: ExportFormData }]): Observable<AnyAction> => {
        return of(ExportActions.startExportRequest({
            payload: queryParams
        }));
    }

    processStartExportRequest = ([userData, queryParams]: [User, IQueryParams & ExportConfiguration & { formData: ExportFormData }]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            // limit: queryParams.limit,
            // paginate: queryParams.paginate,
            // search: queryParams.search,
            skip: queryParams.skip,
            // sort: queryParams.sort,
            // sortBy: queryParams.sortBy,
            ...queryParams.formData,
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        // Memasukkan tipe halaman yang ingin di-export.
        newQuery['page'] = queryParams.page;

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

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | any), dispatchTo: exportFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(ExportActions[dispatchTo]({
                payload: err
            }));
        }

        if (err.message) {
            if (err.message.startsWith('Http failure response')) {
                return of(ExportActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.error.name.toUpperCase()}`,
                        errors: err.toString()
                    }
                }));
            }
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
