import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { MatSnackBarConfig } from '@angular/material';
import {
    exhaustMap,
    map,
    switchMap,
    withLatestFrom,
    catchError,
    retry,
    tap,
    finalize
} from 'rxjs/operators';

import { PeriodTargetPromoActions, PeriodTargetPromoFailureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError } from 'rxjs';
import { PeriodTargetPromoApiService } from '../../services/period-target-promo-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import {
    PeriodTargetPromo,
    // PeriodTargetPromoCreationPayload
} from '../../models/period-target-promo.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { fromPeriodTargetPromo } from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

@Injectable()
export class PeriodTargetPromoEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private PeriodTargetPromoStore: NgRxStore<fromPeriodTargetPromo.PeriodTargetPromoState>,
        private PeriodTargetPromoApi$: PeriodTargetPromoApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}

    fetchPeriodTargetPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request period target promo.
            ofType(PeriodTargetPromoActions.fetchPeriodTargetPromoRequest),
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
                            this.processPeriodTargetPromoRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processPeriodTargetPromoRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
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

    processPeriodTargetPromoRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.PeriodTargetPromoApi$.find(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                    payload: {
                        data: response.map(p => new PeriodTargetPromo(p)),
                        total: response.length,
                    }
                }));
                // if (newQuery.paginate) {
                //     return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                //         payload: {
                //             data: (response as IPaginatedResponse<PeriodTargetPromo>).data.map(p => new PeriodTargetPromo(p)),
                //             total: response.total,
                //         }
                //     }));
                // } else {
                //     return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                //         payload: {
                //             data: (response as unknown as Array<PeriodTargetPromo>).map(p => new PeriodTargetPromo(p)),
                //             total: (response as unknown as Array<PeriodTargetPromo>).length,
                //         }
                //     }));
                // }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
        );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: PeriodTargetPromoFailureActionNames): Observable<AnyAction> => {
        // Memunculkan error di console.
        // console.error(err);
        
        if (err instanceof ErrorHandler) {
            return of(PeriodTargetPromoActions[dispatchTo]({
                payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(PeriodTargetPromoActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
                }
            }));
        }

        return of(PeriodTargetPromoActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                // Referensi: https://stackoverflow.com/a/26199752
                errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
            }
        }));
    }
}
