import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { ErrorHandler, IPaginatedResponse, TNullable } from 'app/shared/models/global.model';
import { Observable, of } from 'rxjs';
import { catchError, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { Auth } from 'app/main/pages/core/auth/models';
import { User } from 'app/shared/models/user.model';

import { ExportHistory } from '../../models';
import { ExportHistoryActions, exportHistoryFailureActionNames } from '../actions';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { fromExportHistory } from '../reducers';
import { IQueryParams } from 'app/shared/models/query.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ExportHistorySelector } from '../selectors';
import { MatSnackBarConfig } from '@angular/material';
import { ExportAdvanceApiService } from '../../services';
import { IExportHistoryPage, IExportHistoryRequest } from '../../models/export-history.model';
import { ExportConfigurationPage } from '../../models/export-filter.model';

@Injectable()
export class ExportHistoryEffects {
    constructor(
        private actions$: Actions, 
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private exportHistoryStore: NgRxStore<fromExportHistory.State>,
        private exportsApiService: ExportAdvanceApiService,
        private notice$: NoticeService,
        private helper$: HelperService,
    ) { }

    fetchExportHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action me-request history export.
            ofType(ExportHistoryActions.fetchExportHistoryRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(
                this.exportHistoryStore.select(ExportHistorySelector.getExportPage),
                this.authStore.select(AuthSelectors.getUserState)
            ),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, exportPage, authState]: [IQueryParams, IExportHistoryPage, TNullable<Auth>]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, exportPage, queryParams])),
                            switchMap<[User, IExportHistoryPage, IQueryParams], Observable<AnyAction>>(
                                this.processFetchExportHistoryRequest
                            ),
                            catchError((err) =>
                                this.sendErrorToState(err, 'fetchExportHistoryFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, exportPage, queryParams])),
                            switchMap<[User, IExportHistoryPage, IQueryParams], Observable<AnyAction>>(
                                this.processFetchExportHistoryRequest
                            ),
                            catchError((err) =>
                                this.sendErrorToState(err, 'fetchExportHistoryFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    fetchExportHistoryFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action fetch export logs failure.
                ofType(ExportHistoryActions.fetchExportHistoryFailure),
                // Hanya mengambil payload-nya saja.
                map((action) => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap((error) => {
                    const noticeSetting: MatSnackBarConfig = {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        duration: 5000,
                    };

                    if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
                        this.notice$.open(
                            `Failed to request export logs. Reason: ${error.errors}`,
                            'error',
                            noticeSetting
                        );
                    } else {
                        this.notice$.open(
                            `Something wrong with our web while requesting export logs. Please contact Sinbad Team.`,
                            'error',
                            noticeSetting
                        );
                    }
                })
            ),
        { dispatch: false }
    );

    processFetchExportHistoryRequest = ([userData, exportPage, queryParams]: [
        User,
        IExportHistoryPage,
        IExportHistoryRequest
    ]): Observable<AnyAction> => {
        console.log('useMedeaGO => ', queryParams)
        // Hanya mengambil ID user saja.
        const { userId } = userData.userSupplier;

        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams,
        };

        // Memasukkan ID user ke dalam parameter.
        newQuery['userId'] = userId;

        let page: ExportConfigurationPage;
        if (exportPage.page !== '') {
            page = exportPage.page;
        } else {
            page = queryParams.page;
        }

        switch (page) {
            case 'stores': {
                newQuery['page'] = 'stores';
                break;
            }

            case 'catalogues': {
                newQuery['page'] = 'catalogues';
                break;
            }

            case 'payments':
            case 'invoices': {
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

            case 'sales-rep': {
                newQuery['page'] = 'sales-rep';
                break;
            }

            case 'returns': {
                newQuery['aPage'] = 'return_parcels';
                break;
            }

            default: {
                newQuery['page'] = page;
            }
        }

        return this.exportsApiService.getExportHistory<IPaginatedResponse<ExportHistory>>(newQuery).pipe(
            catchOffline(),
            switchMap((response) => {
                if (newQuery.paginate) {
                    return of(
                        ExportHistoryActions.fetchExportHistorySuccess({
                            payload: {
                                data: response.data.map(
                                    (xport) =>
                                        new ExportHistory({
                                            ...xport,
                                        })
                                ),
                                total: response.total,
                            },
                        })
                    );
                } else {
                    const newResponse = (response as unknown) as Array<ExportHistory>;

                    return of(
                        ExportHistoryActions.fetchExportHistorySuccess({
                            payload: {
                                data: newResponse.map(
                                    (xport) =>
                                        new ExportHistory({
                                            ...xport,
                                        })
                                ),
                                total: newResponse.length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchExportHistoryFailure'))
        );
    };

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

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | any,
        dispatchTo: exportHistoryFailureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                ExportHistoryActions[dispatchTo]({
                    payload: err,
                })
            );
        }

        if (err.message) {
            if (err.message.startsWith('Http failure response')) {
                return of(
                    ExportHistoryActions[dispatchTo]({
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
                ExportHistoryActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: err.toString(),
                    },
                })
            );
        }

        return of(
            ExportHistoryActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString(),
                },
            })
        );
    };
}
