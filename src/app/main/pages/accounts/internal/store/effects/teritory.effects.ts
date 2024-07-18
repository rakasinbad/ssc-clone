import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { PaginateResponseV2 } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, map, retry, switchMap, withLatestFrom } from 'rxjs/operators';

import { TeritoryActions } from '../actions';

import { BranchApiService } from 'app/shared/helpers/branch-api.service';
import { Branch, BranchWarehouse } from 'app/shared/models/branch.model';
import { WarehouseRegionApiService } from 'app/shared/helpers/warehouse-region-api.service';
import { RegionApiService } from 'app/shared/helpers';
import { Region } from 'app/shared/models';

@Injectable()
export class TeritoryEffects {
    fetchRegionsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TeritoryActions.fetchTeritoryRegionRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        TeritoryActions.fetchTeritoryRegionFailure({
                            payload: {
                                id: 'fetchTeritoryRegionsFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                let search = [];
                if (payload.search) {
                    search = payload.search;
                }

                return this._$regionApi
                    .findAll({
                        search,
                        paginate: true,
                        page: payload.page,
                        perPage: payload.perPage,
                    })
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map((resp) => {
                            return TeritoryActions.fetchTeritoryRegionSuccess({
                                payload: resp as PaginateResponseV2<Region>,
                            });
                        }),
                        catchError((err) =>
                            of(
                                TeritoryActions.fetchTeritoryRegionFailure({
                                    payload: { id: 'fetchTeritoryRegionsFailure', errors: err },
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchBranchesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TeritoryActions.fetchTeritoryBranchesRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        TeritoryActions.fetchTeritoryBranchesFailure({
                            payload: {
                                id: 'fetchTeritoryBranchesFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                let search = [];
                if (payload.search) {
                    search = payload.search;
                }

                return this._$branchApi
                    .findByIds(
                        { search, paginate: true, page: payload.page, perPage: payload.perPage },
                        payload.regionIds
                    )
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map((resp) => {
                            return TeritoryActions.fetchTeritoryBranchesSuccess({
                                payload: resp as PaginateResponseV2<Branch>,
                            });
                        }),
                        catchError((err) =>
                            of(
                                TeritoryActions.fetchTeritoryBranchesFailure({
                                    payload: { id: 'fetchTeritoryBranchesFailure', errors: err },
                                })
                            )
                        )
                    );
            })
        )
    );

    fetchWarehouseRegionRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TeritoryActions.fetchTeritoryWarehousesRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        TeritoryActions.fetchTeritoryWarehousesFailure({
                            payload: {
                                id: 'fetchTeritoryWarehousesFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                let search = [];
                if (payload.search) {
                    search = payload.search;
                }

                return this._$warehouseRegionApi
                    .findByIds(
                        { search, paginate: true, page: payload.page, perPage: payload.perPage },
                        payload.branchIds
                    )
                    .pipe(
                        catchOffline(),
                        retry(3),
                        map((resp) => {
                            return TeritoryActions.fetchTeritoryWarehousesSuccess({
                                payload: resp as PaginateResponseV2<BranchWarehouse>,
                            });
                        }),
                        catchError((err) =>
                            of(
                                TeritoryActions.fetchTeritoryWarehousesFailure({
                                    payload: { id: 'fetchTeritoryWarehousesFailure', errors: err },
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
        protected network: Network,
        private _$regionApi: RegionApiService,
        private _$branchApi: BranchApiService,
        private _$warehouseRegionApi: WarehouseRegionApiService
    ) {}
}
