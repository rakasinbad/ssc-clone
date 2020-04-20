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
    finalize,
} from 'rxjs/operators';

import { VoucherActions, VoucherFailureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError } from 'rxjs';
import { VoucherApiService } from '../../services/voucher-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import {
    Voucher,
    VoucherPayload,
    // VoucherCreationPayload
} from '../../models/voucher.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { fromVoucher } from '../reducers';
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
export class VoucherEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private VoucherStore: NgRxStore<fromVoucher.VoucherState>,
        private VoucherApi$: VoucherApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}

    fetchVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request period target promo.
            ofType(VoucherActions.fetchVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [IQueryParams | string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParams | string], Observable<AnyAction>>(
                            this.processVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParams | string], Observable<AnyAction>>(
                            this.processVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchVoucherFailure'))
                    );
                }
            })
        )
    );

    addVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(VoucherActions.addVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [VoucherPayload, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, VoucherPayload], Observable<AnyAction>>(
                            this.addVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'addVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, VoucherPayload], Observable<AnyAction>>(
                            this.addVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'addVoucherFailure'))
                    );
                }
            })
        )
    );

    updateVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(VoucherActions.updateVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, authState]: [EntityPayload<Partial<Voucher>>, TNullable<Auth>]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<Voucher>>],
                                Observable<AnyAction>
                            >(this.updateVoucherRequest),
                            catchError((err) => this.sendErrorToState(err, 'updateVoucherFailure'))
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<Voucher>>],
                                Observable<AnyAction>
                            >(this.updateVoucherRequest),
                            catchError((err) => this.sendErrorToState(err, 'updateVoucherFailure'))
                        );
                    }
                }
            )
        )
    );

    removeVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Period Target Promo.
            ofType(VoucherActions.removeVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([VoucherId, authState]: [string, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, VoucherId])),
                        switchMap<[User, string], Observable<AnyAction>>(this.removeVoucherRequest),
                        catchError((err) => this.sendErrorToState(err, 'removeVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, VoucherId])),
                        switchMap<[User, string], Observable<AnyAction>>(this.removeVoucherRequest),
                        catchError((err) => this.sendErrorToState(err, 'removeVoucherFailure'))
                    );
                }
            })
        )
    );

    addVoucherSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action penambahan Period Target Promo.
                ofType(VoucherActions.addVoucherSuccess),
                // Hanya mengambil payload-nya saja dari action.
                map((action) => action.payload),
                tap((payload) => {
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
            ),
        { dispatch: false }
    );

    confirmRemoveCatalogue$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(VoucherActions.confirmRemoveVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    if (!Array.isArray(params)) {
                        const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                            data: {
                                title: 'Delete',
                                message: `Are you sure want to delete Period Target Promo <strong>${params.name}</strong>?`,
                                id: params.id,
                            },
                            disableClose: true,
                        });

                        return dialogRef.afterClosed();
                    }
                }),
                map((response) => {
                    if (response) {
                        this.VoucherStore.dispatch(
                            VoucherActions.removeVoucherRequest({ payload: response })
                        );
                    } else {
                        this.VoucherStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    confirmSetCatalogueToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(VoucherActions.confirmSetActiveVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Product to Active',
                            message: `Are you sure want to set Period Target Promo <strong>${params.name}</strong> to <strong>Active</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.VoucherStore.dispatch(
                            VoucherActions.updateVoucherRequest({
                                payload: {
                                    id: response,
                                    data: {
                                        status: 'active',
                                    },
                                },
                            })
                        );
                    } else {
                        this.VoucherStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    confirmSetCatalogueToInactive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(VoucherActions.confirmSetInactiveVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Product to Inactive',
                            message: `Are you sure want to set Period Target Promo <strong>${params.name}</strong> to <strong>Inactive</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.VoucherStore.dispatch(
                            VoucherActions.updateVoucherRequest({
                                payload: {
                                    id: response,
                                    data: {
                                        status: 'inactive',
                                    },
                                },
                            })
                        );
                    } else {
                        this.VoucherStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    fetchFailureAction$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action fetch export logs failure.
                ofType(...[VoucherActions.addVoucherFailure]),
                // Hanya mengambil payload-nya saja.
                map((action) => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap(this.showErrorNotification)
            ),
        { dispatch: false }
    );

    updateFailureAction$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action fetch export logs failure.
                ofType(VoucherActions.updateVoucherFailure),
                // Hanya mengambil payload-nya saja.
                map((action) => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap((err) => this.showErrorNotification(err))
            ),
        { dispatch: false }
    );

    setRefreshStatusToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(VoucherActions.updateVoucherSuccess),
                map((action) => action.payload),
                tap(() => {
                    this.VoucherStore.dispatch(VoucherActions.setRefreshStatus({ payload: true }));
                })
            ),
        { dispatch: false }
    );

    checkUserSupplier = (userData: User): User | Observable<never> => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            return throwError(
                new ErrorHandler({
                    id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                    errors: `User Data: ${userData}`,
                })
            );
        }

        return userData;
    };

    processVoucherRequest = ([userData, queryParams]: [User, IQueryParams | string]): Observable<
        AnyAction
    > => {
        let newQuery: IQueryParams = {};

        if (typeof queryParams === 'string') {
            newQuery['id'] = queryParams;
        } else {
            // Membentuk parameter query yang baru.
            newQuery = {
                ...queryParams,
            };
        }

        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;

        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.VoucherApi$.find<IPaginatedResponse<Voucher>>(newQuery).pipe(
            catchOffline(),
            switchMap((response) => {
                if (typeof queryParams === 'string') {
                    return of(
                        VoucherActions.fetchVoucherSuccess({
                            payload: {
                                data: new Voucher((response as unknown) as Voucher),
                            },
                        })
                    );
                } else if (newQuery.paginate) {
                    return of(
                        VoucherActions.fetchVoucherSuccess({
                            payload: {
                                data: (response as IPaginatedResponse<Voucher>).data.map(
                                    (p) => new Voucher(p)
                                ),
                                total: response.total,
                            },
                        })
                    );
                } else {
                    return of(
                        VoucherActions.fetchVoucherSuccess({
                            payload: {
                                data: ((response as unknown) as Array<Voucher>).map(
                                    (p) => new Voucher(p)
                                ),
                                total: ((response as unknown) as Array<Voucher>).length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchVoucherFailure'))
        );
    };

    updateVoucherRequest = ([_, payload]: [User, EntityPayload<Partial<Voucher>>]): Observable<
        AnyAction
    > => {
        return this.VoucherApi$.updateVoucher<EntityPayload<Partial<Voucher>>, Voucher>(
            payload
        ).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.updateVoucherSuccess({
                        payload: {
                            id: response.id,
                            data: response,
                        },
                    })
                );
            }),
            catchError((err) => {
                if (payload.source === 'detail-edit') {
                    this.VoucherStore.dispatch(UiActions.showFooterAction());
                    this.VoucherStore.dispatch(FormActions.enableSaveButton());
                    this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
                    this.VoucherStore.dispatch(FormActions.resetClickCancelButton());
                }

                return this.sendErrorToState(err, 'updateVoucherFailure');
            })
        );
    };

    removeVoucherRequest = ([_, payload]: [User, string]): Observable<AnyAction> => {
        return this.VoucherApi$.removeVoucher<string, any>(payload).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.removeVoucherSuccess({
                        payload: response,
                    })
                );
            }),
            catchError((err) => {
                return this.sendErrorToState(err, 'removeVoucherFailure');
            })
        );
    };

    addVoucherRequest = ([_, payload]: [User, VoucherPayload]): Observable<AnyAction> => {
        return this.VoucherApi$.addVoucher<VoucherPayload, Voucher>(payload).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.addVoucherSuccess({
                        payload: response,
                    })
                );
            }),
            catchError((err) => {
                this.VoucherStore.dispatch(UiActions.showFooterAction());
                this.VoucherStore.dispatch(FormActions.enableSaveButton());
                this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
                this.VoucherStore.dispatch(FormActions.resetClickCancelButton());

                return this.sendErrorToState(err, 'addVoucherFailure');
            })
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: VoucherFailureActionNames
    ): Observable<AnyAction> => {
        // Memunculkan error di console.
        // console.error(err);

        if (err instanceof ErrorHandler) {
            return of(
                VoucherActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                VoucherActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            VoucherActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    // Referensi: https://stackoverflow.com/a/26199752
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
    };

    showErrorNotification = (error: any) => {
        const noticeSetting: MatSnackBarConfig = {
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            duration: 5000,
        };

        if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
            this.notice$.open(`An error occured. Reason: ${error.errors}`, 'error', noticeSetting);
        } else {
            this.notice$.open(
                `Something wrong with our web while processing your request. Please contact Sinbad Team.`,
                'error',
                noticeSetting
            );
        }

        // Me-reset state tombol save.
        this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
    };
}
