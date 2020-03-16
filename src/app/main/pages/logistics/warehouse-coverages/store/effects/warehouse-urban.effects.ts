import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { map, switchMap, catchError, retry, withLatestFrom } from 'rxjs/operators';

import {
    WarehouseFailureActionNames
} from '../actions';
import { of, Observable, throwError, forkJoin } from 'rxjs';
// import { PortfoliosApiService } from '../../services/portfolios-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { NoticeService, HelperService } from 'app/shared/helpers';
import { WarehouseCoverageApiService } from '../../services/warehouse-coverage-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TypedAction } from '@ngrx/store/src/models';
import { FeatureState as WarehouseCoverageCoreState } from '../reducers';
import { Router } from '@angular/router';
import { WarehouseUrbanActions } from '../actions';
import { User } from 'app/shared/models/user.model';
import { ErrorHandler, TNullable, IPaginatedResponse } from 'app/shared/models/global.model';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IQueryParams } from 'app/shared/models/query.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { WarehouseCoverage } from '../../models/warehouse-coverage.model';

type AnyAction = { payload: any; } & TypedAction<any>;

@Injectable()
export class WarehouseUrbanEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private locationStore: NgRxStore<WarehouseCoverageCoreState>,
        private whApi$: WarehouseCoverageApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        // private matDialog: MatDialog,
    ) {}

    fetchPortfoliosRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request warehouse urban.
            ofType(WarehouseUrbanActions.fetchWarehouseUrbansRequest),
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processWarehouseUrbansRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchWarehouseUrbansFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processWarehouseUrbansRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchWarehouseUrbansFailure'))
                    );
                }
            })
        )
    );

    checkUserSupplier = (userData: User): User | Observable<never> => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            return throwError(new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            }));
        }

        return userData;
    }

    processWarehouseUrbansRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        // const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        // Memasukkan ID supplier ke dalam parameter.
        // newQuery['supplierId'] = supplierId;

        return this.whApi$.findCoverage<IPaginatedResponse<WarehouseCoverage>>(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    return of(WarehouseUrbanActions.fetchWarehouseUrbansSuccess({
                        payload: {
                            data: (response as IPaginatedResponse<WarehouseCoverage>).data.map(wh => new WarehouseCoverage(wh)),
                            total: response.total,
                        }
                    }));
                } else {
                    return of(WarehouseUrbanActions.fetchWarehouseUrbansSuccess({
                        payload: {
                            data: (response as unknown as Array<WarehouseCoverage>).map(wh => new WarehouseCoverage(wh)),
                            total: (response as unknown as Array<WarehouseCoverage>).length,
                        }
                    }));
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchWarehouseUrbansFailure'))
        );
    };

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: WarehouseFailureActionNames): Observable<AnyAction> => {
        // Memunculkan error di console.
        // console.error(err);

        this.helper$.showErrorNotification(err);

        if (err instanceof ErrorHandler) {
            return of(WarehouseUrbanActions[dispatchTo]({
                payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(WarehouseUrbanActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                }
            }));
        }

        return of(WarehouseUrbanActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                // Referensi: https://stackoverflow.com/a/26199752
                errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }
        }));
    }
}
