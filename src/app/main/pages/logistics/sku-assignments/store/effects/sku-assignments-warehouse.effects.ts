import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { NoticeService } from 'app/shared/helpers';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom
} from 'rxjs/operators';

import { SkuAssignmentsWarehouse } from '../../models';
import {SkuAssignmentsWarehouseApiService  } from '../../services/sku-assignments-warehouse-api.service';
import { SkuAssignmentsWarehouseActions } from '../actions';
import * as fromSkuAssignmentsWarehouse from '../reducers';
import { MatDialog } from '@angular/material';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Update } from '@ngrx/entity';
import { UpdateStr } from '@ngrx/entity/src/models';
import { IQueryParams } from 'app/shared/models/query.model';
import { ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class SkuAssignmentsWarehouseEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SKU Assignments Effect]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] SKU Assignments Effect
     * @memberof SkuAssignmentsWarehouseEffects
     */
    fetchSkuAssignmentsWarehouseRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseRequest),
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
                const newParams: IQueryParams = {
                    ...params
                };
                if (!data) {
                    return of(
                        SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSkuAssignmentsWarehouseFailure',
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
                newParams['supplierId'] = supplierId;

                return this._$skuAssigmentsWarehouseApi.findSkuAssignments(newParams).pipe(
                    catchOffline(),
                    map((resp: IPaginatedResponse<SkuAssignmentsWarehouse>) => {
                        const newResp = {
                            data: resp.data || [],
                            total: resp.total
                        };

                        return SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseSuccess({
                            payload: {
                                ...newResp,
                                data:
                                    newResp.data && newResp.data.length > 0
                                        ? newResp.data.map(r => new SkuAssignmentsWarehouse(r))
                                        : []
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchSkuAssignmentsWarehouseFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    fetchSkuAssigmentsWarehouseFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkuAssignmentsWarehouseActions.fetchSkuAssignmentsWarehouseFailure),
                map(action => action.payload),
                tap(resp => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromSkuAssignmentsWarehouse.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$skuAssigmentsWarehouseApi: SkuAssignmentsWarehouseApiService
    ) {}
}
