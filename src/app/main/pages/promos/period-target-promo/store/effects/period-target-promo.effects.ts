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
    PeriodTargetPromo, PeriodTargetPromoPayload,
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
import { EntityPayload } from 'app/shared/models/entity-payload.model';

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
            switchMap(([queryParams, authState]: [IQueryParams | string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams | string], Observable<AnyAction>>(
                            this.processPeriodTargetPromoRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams | string], Observable<AnyAction>>(
                            this.processPeriodTargetPromoRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
                    );
                }
            })
        )
    );

    addPeriodTargetPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(PeriodTargetPromoActions.addPeriodTargetPromoRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [PeriodTargetPromoPayload, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, PeriodTargetPromoPayload], Observable<AnyAction>>(this.addPeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'addPeriodTargetPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, PeriodTargetPromoPayload], Observable<AnyAction>>(this.addPeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'addPeriodTargetPromoFailure'))
                    );
                }
            })
        )
    );

    updatePeriodTargetPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(PeriodTargetPromoActions.updatePeriodTargetPromoRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [EntityPayload<Partial<PeriodTargetPromo>>, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, EntityPayload<Partial<PeriodTargetPromo>>], Observable<AnyAction>>(this.updatePeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'updatePeriodTargetPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, EntityPayload<Partial<PeriodTargetPromo>>], Observable<AnyAction>>(this.updatePeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'updatePeriodTargetPromoFailure'))
                    );
                }
            })
        )
    );

    removePeriodTargetPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(PeriodTargetPromoActions.removePeriodTargetPromoRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([periodTargetPromoId, authState]: [string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, periodTargetPromoId])),
                        switchMap<[User, string], Observable<AnyAction>>(this.removePeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'removePeriodTargetPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, periodTargetPromoId])),
                        switchMap<[User, string], Observable<AnyAction>>(this.removePeriodTargetPromoRequest),
                        catchError(err => this.sendErrorToState(err, 'removePeriodTargetPromoFailure'))
                    );
                }
            })
        )
    );

    addPeriodTargetPromoSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(PeriodTargetPromoActions.addPeriodTargetPromoSuccess),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            tap(payload => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };
                this.notice$.open(`Add Period Target Promo success.`, 'success', noticeSetting);
                
                if (!payload) {
                    this.router.navigate(['/pages/promos/period-target-promo']);
                }
            })
        )
    , { dispatch: false });

    confirmUpdatePeriodTargetPromo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PeriodTargetPromoActions.confirmUpdatePeriodTargetPromo),
            map(action => action.payload),
            exhaustMap(params => {
                if (!Array.isArray(params)) {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Alert',
                            message: `The promo you are trying to update is currently active.<br/>Updating its details may cause issues.<br/>Do you wish to continue?`,
                            id: params
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed().pipe(
                        tap(value => {
                            if (!value && params.source === 'detail-edit') {
                                this.PeriodTargetPromoStore.dispatch(UiActions.showFooterAction());
                                this.PeriodTargetPromoStore.dispatch(FormActions.resetClickSaveButton());
                            }
                        })
                    );
                }
            }),
            map(response => {
                if (response) {
                    this.PeriodTargetPromoStore.dispatch(
                        PeriodTargetPromoActions.updatePeriodTargetPromoRequest({ payload: response })
                    );
                }
                
                this.PeriodTargetPromoStore.dispatch(UiActions.resetHighlightRow());
            })
        ), { dispatch: false }
    );

    confirmRemovePeriodTargetPromo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PeriodTargetPromoActions.confirmRemovePeriodTargetPromo),
            map(action => action.payload),
            exhaustMap(params => {
                if (!Array.isArray(params)) {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete Period Target Promo <strong>${params.name}</strong>?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }
            }),
            map(response => {
                if (response) {
                    this.PeriodTargetPromoStore.dispatch(
                        PeriodTargetPromoActions.removePeriodTargetPromoRequest({ payload: response })
                    );
                } else {
                    this.PeriodTargetPromoStore.dispatch(UiActions.resetHighlightRow());
                }
            })
        ), { dispatch: false }
    );

    confirmSetCatalogueToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PeriodTargetPromoActions.confirmSetActivePeriodTargetPromo),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Product to Active',
                            message: `Are you sure want to set Period Target Promo <strong>${params.name}</strong> to <strong>Active</strong>?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(response => {
                    if (response) {
                        this.PeriodTargetPromoStore.dispatch(
                            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({ payload: {
                                id: response,
                                data: {
                                    status: 'active'
                                }
                            }})
                        );
                    } else {
                        this.PeriodTargetPromoStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    confirmSetCatalogueToInactive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PeriodTargetPromoActions.confirmSetInactivePeriodTargetPromo),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Product to Inactive',
                            message: `Are you sure want to set Period Target Promo <strong>${params.name}</strong> to <strong>Inactive</strong>?`,
                            id: params.id
                        },
                        disableClose: true
                    });

                    return dialogRef.afterClosed();
                }),
                map(response => {
                    if (response) {
                        this.PeriodTargetPromoStore.dispatch(
                            PeriodTargetPromoActions.updatePeriodTargetPromoRequest({ payload: {
                                id: response,
                                data: {
                                    status: 'inactive'
                                }
                            }})
                        );
                    } else {
                        this.PeriodTargetPromoStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    fetchFailureAction$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action fetch export logs failure.
            ofType(...[
                PeriodTargetPromoActions.addPeriodTargetPromoFailure,
            ]),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(this.showErrorNotification),
        ) , { dispatch: false });

    updateFailureAction$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action fetch export logs failure.
            ofType(PeriodTargetPromoActions.updatePeriodTargetPromoFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(err => this.showErrorNotification(err)),
        ), { dispatch: false });

    setRefreshStatusToActive$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                PeriodTargetPromoActions.updatePeriodTargetPromoSuccess
            ),
            map(action => action.payload),
            tap(() => {
                this.PeriodTargetPromoStore.dispatch(PeriodTargetPromoActions.setRefreshStatus({ payload: true }));
            })
        ), { dispatch: false }
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

    processPeriodTargetPromoRequest = ([userData, queryParams]: [User, IQueryParams | string]): Observable<AnyAction> => {
        let newQuery: IQueryParams = {};

        if (typeof(queryParams) === 'string') {
            newQuery['id'] = queryParams;
        } else {
            // Membentuk parameter query yang baru.
            newQuery = {
                ...queryParams
            };
        }

        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;

        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.PeriodTargetPromoApi$.find<IPaginatedResponse<PeriodTargetPromo>>(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (typeof(queryParams) === 'string') {
                    return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                        payload: {
                            data: new PeriodTargetPromo(response as unknown as PeriodTargetPromo)
                        }
                    }));
                } else if (newQuery.paginate) {
                    return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                        payload: {
                            data: (response as IPaginatedResponse<PeriodTargetPromo>).data.map(p => new PeriodTargetPromo(p)),
                            total: response.total,
                        }
                    }));
                } else {
                    return of(PeriodTargetPromoActions.fetchPeriodTargetPromoSuccess({
                        payload: {
                            data: (response as unknown as Array<PeriodTargetPromo>).map(p => new PeriodTargetPromo(p)),
                            total: (response as unknown as Array<PeriodTargetPromo>).length,
                        }
                    }));
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchPeriodTargetPromoFailure'))
        );
    }

    updatePeriodTargetPromoRequest = ([_, payload]: [User, EntityPayload<Partial<PeriodTargetPromo>>]): Observable<AnyAction> => {
        return this.PeriodTargetPromoApi$
            .updatePeriodTargetPromo<EntityPayload<Partial<PeriodTargetPromo>>, PeriodTargetPromo>(payload)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(PeriodTargetPromoActions.updatePeriodTargetPromoSuccess({
                        payload: {
                            id: response.id,
                            data: response
                        }
                    }));
                }),
                catchError(err => {
                    if (payload.source === 'detail-edit') {
                        this.PeriodTargetPromoStore.dispatch(UiActions.showFooterAction());
                        this.PeriodTargetPromoStore.dispatch(FormActions.enableSaveButton());
                        this.PeriodTargetPromoStore.dispatch(FormActions.resetClickSaveButton());
                        this.PeriodTargetPromoStore.dispatch(FormActions.resetClickCancelButton());
                    }

                    return this.sendErrorToState(err, 'updatePeriodTargetPromoFailure');
                })
            );
    }

    removePeriodTargetPromoRequest = ([_, payload]: [User, string]): Observable<AnyAction> => {
        return this.PeriodTargetPromoApi$
            .removePeriodTargetPromo<string, any>(payload)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(PeriodTargetPromoActions.removePeriodTargetPromoSuccess({
                        payload: response
                    }));
                }),
                catchError(err => {
                    return this.sendErrorToState(err, 'removePeriodTargetPromoFailure');
                })
            );
    }

    addPeriodTargetPromoRequest = ([_, payload]: [User, PeriodTargetPromoPayload]): Observable<AnyAction> => {
        return this.PeriodTargetPromoApi$
            .addPeriodTargetPromo<PeriodTargetPromoPayload, PeriodTargetPromo>(payload)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(PeriodTargetPromoActions.addPeriodTargetPromoSuccess({
                        payload: response
                    }));
                }),
                catchError(err => {
                    this.PeriodTargetPromoStore.dispatch(UiActions.showFooterAction());
                    this.PeriodTargetPromoStore.dispatch(FormActions.enableSaveButton());
                    this.PeriodTargetPromoStore.dispatch(FormActions.resetClickSaveButton());
                    this.PeriodTargetPromoStore.dispatch(FormActions.resetClickCancelButton());

                    return this.sendErrorToState(err, 'addPeriodTargetPromoFailure');
                })
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

    showErrorNotification = (error: any) => {
        const noticeSetting: MatSnackBarConfig = {
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            duration: 5000,
        };

        if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
            this.notice$.open(`An error occured. Reason: ${error.errors}`, 'error', noticeSetting);
        } else {
            this.notice$.open(`Something wrong with our web while processing your request. Please contact Sinbad Team.`, 'error', noticeSetting);
        }

        // Me-reset state tombol save.
        this.PeriodTargetPromoStore.dispatch(
            FormActions.resetClickSaveButton()
        );
    }
}
