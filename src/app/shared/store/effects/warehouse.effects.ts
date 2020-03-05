import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { WarehouseApiService } from 'app/shared/helpers';
import { Warehouse, IWarehouse } from 'app/main/pages/logistics/warehouses/models/warehouse.model';
import * as fromRoot from 'app/store/app.reducer';
import { asyncScheduler, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    exhaustMap,
    map,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import { WarehouseActions } from '../actions';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';

@Injectable()
export class WarehouseEffects {
    fetchWarehousesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.fetchWarehouseRequest),
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
            switchMap(([params, data]: [IQueryParams, string | Auth]) => {
                if (!data) {
                    return of(
                        WarehouseActions.fetchWarehouseFailure({
                            payload: new ErrorHandler({
                                id: 'fetchWarehouseFailure',
                                errors: 'Not Found!'
                            })
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                const newParams: IQueryParams = {
                    ...params
                };

                newParams['supplierId'] = supplierId;

                return this._$warehouseApi
                    .findAll<Array<IWarehouse> | PaginateResponse<IWarehouse>>(newParams)
                    .pipe(
                        map(resp => {
                            if (params.paginate) {
                                const res: PaginateResponse<IWarehouse> = resp as PaginateResponse<IWarehouse>;

                                const newResp = {
                                    data:
                                        res && res.data && res.data.length > 0
                                            ? res.data.map(row => new Warehouse(row))
                                            : [],
                                    total: res.total
                                };
    
                                return WarehouseActions.fetchWarehouseSuccess({
                                    payload: res.data.map(row => new Warehouse(row))
                                });
                            } else {
                                const res: Array<IWarehouse> = resp as Array<IWarehouse>;

                                const newResp = {
                                    data:
                                        res && res.length > 0
                                            ? res.map(row => new Warehouse(row))
                                            : [],
                                    total: res.length
                                };
    
                                return WarehouseActions.fetchWarehouseSuccess({
                                    payload: res.map(row => new Warehouse(row))
                                });
                            }

                        }),
                        catchError(err =>
                            of(
                                WarehouseActions.fetchWarehouseFailure({
                                    payload: new ErrorHandler({
                                        id: 'fetchWarehousesFailure',
                                        errors: 'Not Found!'
                                    })
                                })
                            )
                        )
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        private storage: StorageMap,
        private _$warehouseApi: WarehouseApiService
    ) {}
}
