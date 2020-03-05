import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, catchError, tap, finalize } from 'rxjs/operators';

import {
    WarehouseFailureActionNames
} from '../actions';
import { of, Observable, throwError, forkJoin } from 'rxjs';
// import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService } from 'app/shared/helpers';
import { WarehouseCoverageApiService } from '../../services/warehouse-coverage-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TypedAction } from '@ngrx/store/src/models';
import { FeatureState as WarehouseCoverageCoreState } from '../reducers';
import { Router } from '@angular/router';
import { WarehouseCoverageActions } from '../actions';
import { FormActions } from 'app/shared/store/actions';
import { User } from 'app/shared/models/user.model';
import { ErrorHandler } from 'app/shared/models/global.model';

type AnyAction = { payload: any; } & TypedAction<any>;

@Injectable()
export class WarehouseCoverageEffects {
    constructor(
        private actions$: Actions,
        // private authStore: NgRxStore<fromAuth.FeatureState>,
        private locationStore: NgRxStore<WarehouseCoverageCoreState>,
        private whApi$: WarehouseCoverageApiService,
        private notice$: NoticeService,
        private router: Router,
        // private helper$: HelperService,
        // private matDialog: MatDialog,
    ) {}

    // fetchWarehouseCoveragesRequest$ = createEffect(() =>
    //     this.actions$.pipe(
    //         // Hanya untuk action request warehouse coverage.
    //         ofType(WarehouseCoverageActions.fetchWarehouseCoveragesRequest),
    //         // Hanya mengambil payload-nya saja dari action.
    //         map(action => action.payload),
    //         // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
    //         switchMap((queryParams: IQueryParams) => {
    //             return of(queryParams).pipe(
    //                 switchMap<IQueryParams, Observable<AnyAction>>(this.fetchWarehouseCoveragesRequest),
    //                 catchError(err => this.sendErrorToState(err, 'fetchWarehouseCoveragesFailure'))
    //             );
    //         })
    //     )
    // );

    createWarehouseCoverageRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request create warehouse coverage.
            ofType(WarehouseCoverageActions.createWarehouseCoverageRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(payload => {
                return of(payload).pipe(
                    switchMap(this.createWarehouseCoverageRequest),
                    catchError(err => this.sendErrorToState(err, 'createWarehouseCoverageFailure'))
                );
            }),
            // Me-reset state tombol save.
            finalize(() => {
                this.locationStore.dispatch(
                    FormActions.resetClickSaveButton()
                );
            })
        )
    );

    createWarehouseCoverageFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action create warehouse coverage success.
            ofType(WarehouseCoverageActions.createWarehouseCoverageFailure),
            // Memunculkan notifikasi dan pindah halaman.
            tap(({ payload }) => {
                this.notice$.open('Failed to create warehouse coverage. Reason: ' + payload.errors, 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                    duration: 5000,
                });

                this.locationStore.dispatch(FormActions.resetClickSaveButton());
            }),
            // Me-reset state tombol save.
            finalize(() => {
                this.locationStore.dispatch(
                    FormActions.resetClickSaveButton()
                );
            })
        )
    , { dispatch: false });

    createWarehouseCoverageSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action create warehouse coverage success.
            ofType(WarehouseCoverageActions.createWarehouseCoverageSuccess),
            // Memunculkan notifikasi dan pindah halaman.
            tap(() => {
                this.notice$.open('Create warehouse coverage success.', 'success', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                    duration: 5000,
                });

                this.router.navigate(['/pages/logistics/warehouse-coverages']);
            }),
            // Me-reset state tombol save.
            finalize(() => {
                this.locationStore.dispatch(
                    FormActions.resetClickSaveButton()
                );
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

    createWarehouseCoverageRequest = (payload): Observable<AnyAction> => {
        return this.whApi$.createWarehouseCoverage<{ message: string }>(payload)
            .pipe(
                catchOffline(),
                switchMap(({ message }) => {
                    return of(WarehouseCoverageActions.createWarehouseCoverageSuccess({
                        payload: {
                            message
                        }
                    }));
                })
            );
    }

    // fetchWarehouseCoveragesRequest = (queryParams: IQueryParams): Observable<AnyAction> => {
    //     const newQuery: IQueryParams = {
    //         ...queryParams
    //     };

    //     return this.whApi$.findAll<Array<Province>>(newQuery)
    //         .pipe(
    //             catchOffline(),
    //             switchMap((response: IPaginatedResponse<Province> | Array<Province>) => {
    //                 if (queryParams.paginate) {
    //                     const newResponse = response as IPaginatedResponse<Province>;

    //                     return of(LocationActions.fetchProvincesSuccess({
    //                         payload: {
    //                             data: newResponse.data.map(province => new Province(province)),
    //                             total: newResponse.total
    //                         }
    //                     }));
    //                 } else {
    //                     const newResponse = response as Array<Province>;

    //                     return of(LocationActions.fetchProvincesSuccess({
    //                         payload: {
    //                             data: newResponse.map(province => new Province(province)),
    //                             total: newResponse.length
    //                         }
    //                     }));
    //                 }
    //             }),
    //             catchError(err => this.sendErrorToState(err, 'fetchCitiesFailure'))
    //         );
    // }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: WarehouseFailureActionNames): Observable<AnyAction> => {
        // Memunculkan error di console.
        console.error(err);
        
        if (err instanceof ErrorHandler) {
            return of(WarehouseCoverageActions[dispatchTo]({
                payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(WarehouseCoverageActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                }
            }));
        }

        return of(WarehouseCoverageActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                // Referensi: https://stackoverflow.com/a/26199752
                errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }
        }));
    }
}
