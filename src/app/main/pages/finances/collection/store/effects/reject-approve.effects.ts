import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    CalculateOrderApiService,
    DownloadApiService,
    LogService,
    NoticeService,
    UploadApiService,
} from 'app/shared/helpers';
import { UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { CollectionApiService, ApproveRejectApiService } from '../../services';
import { BillingActions, CollectionActions, RejectReasonActions } from '../actions';
import { BillingStatus, CalculateCollectionStatusPayment, CollectionStatus, FinanceDetailBillingV1 } from '../../models';
import * as collectionStatus from '../reducers';
import * as fromBilling from '../reducers/billing.reducer';
import * as fromCollectionDetail from '../reducers/collection-detail.reducer';
import { OrderActions } from '../../../../orders/store/actions';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';

@Injectable()
export class RejectApproveEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods
    // -----------------------------------------------------------------------------------------------------

      /**
     *
     * [REQUEST] Reject Reason List Statuses
     * @memberof Reject Approve Effects
     */
    fetchRejectReasonRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RejectReasonActions.fetchRejectReasonRequest),
            map((action) => action.payload),
            switchMap((payload) => {
                console.log('payload->', payload)
                return this._$rejectApproveApi.getRejectReasonList(payload.type).pipe(
                    catchOffline(),
                    map((resp) => {
                        return RejectReasonActions.fetchRejectReasonSuccess({
                            payload: resp
                        });
                    }),
                    catchError((err) =>
                        of(
                            RejectReasonActions.fetchRejectReasonFailure({
                                payload: {
                                    id: 'fetchRejectReasonFailure',
                                    errors: err,
                                },
                            })
                        )
                    )
                );
            })
        )
    );

    fetchRejectReasonFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(RejectReasonActions.fetchRejectReasonFailure),
                map((action) => action.payload),
                tap((resp) => {
                    let message;

                    if (resp.errors.code === 406) {
                        message = resp.errors.error.errors
                            .map((r) => {
                                return `${r.errCode}<br>${r.solve}`;
                            })
                            .join('<br><br>');
                    } else {
                        if (typeof resp.errors === 'string') {
                            message = resp.errors;
                        } else {
                            message =
                                resp.errors.error && resp.errors.error.message
                                    ? resp.errors.error.message
                                    : resp.errors.message;
                        }
                    }

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
        private store: Store<collectionStatus.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$collectionStatusApi: CollectionApiService,
        private _$rejectApproveApi: ApproveRejectApiService
    ) {}
}
