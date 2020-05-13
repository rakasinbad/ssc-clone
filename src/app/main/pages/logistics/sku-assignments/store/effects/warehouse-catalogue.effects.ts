import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService, HelperService } from 'app/shared/helpers';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { of, Observable } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
    retry
} from 'rxjs/operators';

import { SkuAssignmentsWarehouse } from '../../models';
import {SkuAssignmentsWarehouseApiService  } from '../../services/sku-assignments-warehouse-api.service';
import { SkuAssignmentsWarehouseActions, WarehouseCatalogueActions, failureActionNames } from '../actions';
import * as fromSkuAssignmentsWarehouse from '../reducers';
import { MatDialog } from '@angular/material';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Update } from '@ngrx/entity';
import { UpdateStr } from '@ngrx/entity/src/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler, IPaginatedResponse, TNullable } from 'app/shared/models/global.model';
import {
    FeatureState as SkuAssignmentsCoreFeatureState
} from '../reducers';
import { User } from 'app/shared/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { AnyAction } from 'app/shared/models/actions.model';
import { WarehouseCatalogue } from '../../models/warehouse-catalogue.model';
import { WarehouseCatalogueApiService } from '../../services/warehouse-catalogue-api.service';

@Injectable()
export class WarehouseCatalogueEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [Warehouse Catalogue Effect]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Warehouse Catalogue Effect
     * @memberof WarehouseCatalogueEffects
     */
    fetchWarehouseCataloguesRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan warehouse catalogue.
            ofType(WarehouseCatalogueActions.fetchWarehouseCataloguesRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processWarehouseCoveragesRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchWarehouseCataloguesFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processWarehouseCoveragesRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchWarehouseCataloguesFailure'))
                    );
                }
            })
        )
    );

    fetchSkuAssigmentsWarehouseFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseFailure),
                map(action => action.payload),
                tap(resp => this.helper$.showErrorNotification(resp))
            ),
        { dispatch: false }
    );

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

    processWarehouseCoveragesRequest = ([_, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        // const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        // Memasukkan ID supplier ke dalam parameter.
        // newQuery['supplierId'] = supplierId;

        return this.whApi$.find<IPaginatedResponse<WarehouseCatalogue>>(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    return of(WarehouseCatalogueActions.fetchWarehouseCataloguesSuccess({
                        payload: {
                            data: (response).data.map(wh => new WarehouseCatalogue(wh)),
                            total: response.total,
                        }
                    }));
                } else {
                    return of(WarehouseCatalogueActions.fetchWarehouseCataloguesSuccess({
                        payload: {
                            data: (response as unknown as Array<WarehouseCatalogue>).map(wh => new WarehouseCatalogue(wh)),
                            total: (response as unknown as Array<WarehouseCatalogue>).length,
                        }
                    }));
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchWarehouseCataloguesFailure'))
        );
    };

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: failureActionNames): Observable<AnyAction> => {
        // Memunculkan error di console.
        console.error(err);
        
        if (err instanceof ErrorHandler) {
            return of(WarehouseCatalogueActions[dispatchTo]({
                payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(WarehouseCatalogueActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                }
            }));
        }

        return of(WarehouseCatalogueActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                // Referensi: https://stackoverflow.com/a/26199752
                errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }
        }));
    }

    constructor(
        private actions$: Actions,
        private helper$: HelperService,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<SkuAssignmentsCoreFeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private whApi$: WarehouseCatalogueApiService,
        private _$skuAssigmentsWarehouseApi: SkuAssignmentsWarehouseApiService
    ) {}
}
