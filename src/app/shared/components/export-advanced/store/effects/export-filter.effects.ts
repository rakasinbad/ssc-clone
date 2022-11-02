import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBarConfig } from '@angular/material';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import {
    ErrorHandler,
    TNullable,
} from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import {
    catchError,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import {
    defaultExportFilterConfiguration,
    ExportConfiguration,
    ExportFilterConfiguration,
    ExportFormData,
} from '../../models';
import { ExportConfigurationPage } from '../../models/export-filter.model';
import { ExportAdvanceApiService } from '../../services';
import { ExportFilterActions, exportFailureActionNames } from '../actions';

type AnyAction = { payload: any } & TypedAction<any>;

// Konfigurasi export untuk halaman
const EXPORT_CONFIGURATION: ExportFilterConfiguration = defaultExportFilterConfiguration;

@Injectable()
export class ExportFilterEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private exportsApiService: ExportAdvanceApiService,
        private notice$: NoticeService,
        private helper$: HelperService,
    ) { }

    startExportRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action me-request untuk export.
            ofType(ExportFilterActions.startExportRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, authState]: [
                    IQueryParams & ExportConfiguration & { formData: ExportFormData },
                    TNullable<Auth>
                ]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [
                                    User,
                                    IQueryParams &
                                    ExportConfiguration & { formData: ExportFormData }
                                ],
                                Observable<AnyAction>
                            >(this.processStartExportRequest),
                            catchError((err) => this.sendErrorToState(err, 'startExportFailure'))
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [
                                    User,
                                    IQueryParams &
                                    ExportConfiguration & { formData: ExportFormData }
                                ],
                                Observable<AnyAction>
                            >(this.processStartExportRequest),
                            catchError((err) => this.sendErrorToState(err, 'startExportFailure'))
                        );
                    }
                }
            ),
            catchError((err) => this.sendErrorToState(err, 'startExportFailure'))
        )
    );

    startExportSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action start export success.
                ofType(ExportFilterActions.startExportSuccess),
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
                    // this.matDialog.open(ExportsComponent, {
                    //     disableClose: true,
                    //     width: '70vw',
                    //     height: '85vh',
                    //     panelClass: ['sinbad-export-dialog-container'],
                    // });
                })
            ),
        { dispatch: false }
    );

    startExportFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action start export failure.
                ofType(ExportFilterActions.startExportFailure),
                // Hanya mengambil payload-nya saja.
                map((action) => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap((error) => {
                    const noticeSetting: MatSnackBarConfig = {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        duration: 5000,
                    };

                    this.notice$.open(
                        `Something wrong with our web while exporting. Please contact Sinbad Team. Error code: ${error.id}`,
                        'error',
                        noticeSetting
                    );
                })
            ),
        { dispatch: false }
    );

    // Fungsi ini untuk memeriksa apakah nilainya terisi atau tidak.
    isFilterRequirementOverriden(
        pageType: ExportConfigurationPage,
        value: ExportFilterConfiguration
    ): boolean {
        const isSupplied = (arg: any) => arg !== null || arg !== undefined;

        return (
            isSupplied(value[pageType].requireFilter) &&
            value[pageType].requireFilter !== EXPORT_CONFIGURATION[pageType].requireFilter
        );
    }

    checkUserSupplier = (userData: User): User | Observable<never> => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`,
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };
    
    processStartExportRequest = ([userData, queryParams]: [
        User,
        IQueryParams & ExportConfiguration & { formData: ExportFormData }
    ]): Observable<AnyAction> => {
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

        return this.exportsApiService.requestExport(newQuery).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    ExportFilterActions.startExportSuccess({
                        payload: {
                            message: response.message,
                        },
                    })
                );
            }),
            catchError((err) => this.sendErrorToState(err, 'startExportFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | any,
        dispatchTo: exportFailureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                ExportFilterActions[dispatchTo]({
                    payload: err,
                })
            );
        }

        if (err.message) {
            if (err.message.startsWith('Http failure response')) {
                return of(
                    ExportFilterActions[dispatchTo]({
                        payload: {
                            id: `ERR_HTTP_${err.error.name.toUpperCase()}`,
                            errors: err.toString(),
                        },
                    })
                );
            }
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                ExportFilterActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err.toString(),
                    },
                })
            );
        }

        return of(
            ExportFilterActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString(),
                },
            })
        );
    };
}
