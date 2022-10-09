import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of, throwError } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { OrderAddApiService } from '../../services';
import { ProductListActions } from '../actions';
import { ProductList } from '../../models';
import * as fromAddProduct from '../reducers/add-product.reducer';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class ProductListEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] Product List
     * @memberof ProductListEffects
     */
    fetchProductListRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductListActions.fetchProductListRequest),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            exhaustMap(([params, userSupplier]) => {
                if (!userSupplier) {
                    return this.storage
                        .get('user')
                        .toPromise()
                        .then((user) => (user ? [params, user] : [params, null]));
                }

                const { supplierId } = userSupplier;
                return of([params, supplierId]);
            }),
            switchMap(([params, data]: [any, string | Auth]) => {
                if (!data) {
                    return of(
                        ProductListActions.fetchProductListFailure({
                            payload: {
                                id: 'fetchProductListFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                let supplierId;

                if (typeof data === 'string') {
                    supplierId = data;
                } else {
                    supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                }

                if (!supplierId) {
                    return of(
                        ProductListActions.fetchProductListFailure({
                            payload: {
                                id: 'fetchProductListFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                const newParams = {};

                if (supplierId) {
                    newParams['supplierId'] = supplierId;
                    newParams['storeId'] = params.payload.storeId;
                    newParams['orderDate'] = params.payload.orderDate;
                    newParams['skip'] = params.payload.skip;
                    newParams['limit'] = params.payload.limit;
                    newParams['keyword'] = params.payload.keyword;
                    newParams['storeChannelId'] = params.payload.storeChannelId;
                    newParams['storeClusterId'] = params.payload.storeClusterId;
                    newParams['storeGroupId'] = params.payload.storeGroupId;
                    newParams['storeTypeId'] = params.payload.storeTypeId;
                }

                return this._$orderAddApiService
                    .supplierStoreProductList<IPaginatedResponse<ProductList>>(
                        newParams,
                        supplierId
                    )
                    .pipe(
                        catchOffline(),
                        map((resp) => {
                            const newResp = {
                                data:
                                    (resp && resp.data.length > 0
                                        ? resp.data.map((v) => new ProductList(v))
                                        : []) || [],
                                total: resp['total'],
                            };

                            return ProductListActions.fetchProductListSuccess({
                                payload: newResp,
                            });
                        }),
                        catchError((err) =>
                            of(
                                ProductListActions.fetchProductListFailure({
                                    payload: {
                                        id: 'fetchProductListFailure',
                                        errors: err,
                                    },
                                })
                            )
                        )
                    );
            })
        )
    );

    /**
     *
     * [REQUEST - FAILURE]  Product List
     * @memberof ProductListEffects
     */
    fetchProductListFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ProductListActions.fetchProductListFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message =
                        resp.errors.error && resp.errors.error.message
                            ? resp.errors.error.message
                            : resp.errors.message;

                    this._$log.generateGroup(
                        '[REQUEST FETCH PRODUCT LIST FAILURE]',
                        {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                            message: {
                                type: 'log',
                                value: message,
                            },
                        },
                        'groupCollapsed'
                    );

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private storage: StorageMap,
        private store: Store<fromAddProduct.FeatureStateAddProduct>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$orderAddApiService: OrderAddApiService
    ) {}
}
