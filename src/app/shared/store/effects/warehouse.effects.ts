import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { WarehouseApiService } from 'app/shared/helpers';
import { ErrorHandler, IQueryParams, PaginateResponse } from 'app/shared/models';
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

@Injectable()
export class WarehouseEffects {
    fetchWarehousesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WarehouseActions.fetchWarehousesRequest),
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
                        WarehouseActions.fetchWarehousesFailure({
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

                return this._$warehouseApi
                    .findAll<PaginateResponse<IWarehouse>>(params, supplierId)
                    .pipe(
                        map(resp => {
                            const newResp = {
                                data:
                                    resp && resp.data && resp.data.length > 0
                                        ? resp.data.map(row => new Warehouse(row))
                                        : [],
                                total: resp.total
                            };

                            return WarehouseActions.fetchWarehousesSuccess({
                                payload: newResp
                            });
                        }),
                        catchError(err =>
                            of(
                                WarehouseActions.fetchWarehousesFailure({
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
