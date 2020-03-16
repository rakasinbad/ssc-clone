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

import { SkuAssignmentsSku } from '../../models';
import { SkuAssignmentsApiService } from '../../services';
import { SkuAssignmentsSkuActions } from '../actions';
import * as fromSkuAssignmentsSku from '../reducers';
import { MatDialog } from '@angular/material';
import { ChangeConfirmationComponent } from 'app/shared/modals/change-confirmation/change-confirmation.component';
import { Update } from '@ngrx/entity';
import { UpdateStr } from '@ngrx/entity/src/models';
import { ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { SkuAssignmentsSkuApiService } from '../../services/sku-assignments-sku-api.service';

@Injectable()
export class SkuAssignmentsSkuEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SKU Assignments Effect]
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [REQUEST] SKU Assignments Effect
     * @memberof SkuAssignmentsSkuEffects
     */
    fetchSkuAssignmentsSkuRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuRequest),
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
                        SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuFailure({
                            payload: new ErrorHandler({
                                id: 'fetchSkuAssignmentsSkuFailure',
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

                return this._$skuAssigmentsSkuApi.findSkuAssignments(newParams).pipe(
                    catchOffline(),
                    map((resp: IPaginatedResponse<SkuAssignmentsSku>) => {
                        const newResp = {
                            data: resp.data || [],
                            total: resp.total
                        };

                        return SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuSuccess({
                            payload: {
                                ...newResp,
                                data:
                                    newResp.data && newResp.data.length > 0
                                        ? newResp.data.map(r => new SkuAssignmentsSku(r))
                                        : []
                            }
                        });
                    }),
                    catchError(err =>
                        of(
                            SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuFailure({
                                payload: new ErrorHandler({
                                    id: 'fetchSkuAssignmentsSkuFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    fetchSkuAssigmentsSkuFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkuAssignmentsSkuActions.fetchSkuAssignmentsSkuFailure),
                map(action => action.payload),
                tap(resp => {
                    this.helper$.showErrorNotification(resp);
                    // const message =
                    //     typeof resp.errors === 'string'
                    //         ? resp.errors
                    //         : resp.errors.error.message || resp.errors.message;

                    // this._$notice.open(message, 'error', {
                    //     verticalPosition: 'bottom',
                    //     horizontalPosition: 'right'
                    // });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private helper$: HelperService,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<fromSkuAssignmentsSku.FeatureState>,
        private storage: StorageMap,
        private _$notice: NoticeService,
        private _$skuAssigmentsSkuApi: SkuAssignmentsSkuApiService
    ) {}
}
