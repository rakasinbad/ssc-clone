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
    SupplierVoucher,
    SupplierVoucherPayload,
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
        private VoucherStore: NgRxStore<fromVoucher.SupplierVoucherState>,
        private VoucherApi$: VoucherApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}

    fetchVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request Supplier Voucher.
            ofType(VoucherActions.fetchSupplierVoucherRequest),
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
                        catchError((err) => this.sendErrorToState(err, 'fetchSupplierVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParams | string], Observable<AnyAction>>(
                            this.processVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchSupplierVoucherFailure'))
                    );
                }
            })
        )
    );

    addVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Supplier Voucher.
            ofType(VoucherActions.addSupplierVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [SupplierVoucherPayload, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, SupplierVoucherPayload], Observable<AnyAction>>(
                            this.addVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'addSupplierVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, SupplierVoucherPayload], Observable<AnyAction>>(
                            this.addVoucherRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'addSupplierVoucherFailure'))
                    );
                }
            })
        )
    );

    updateVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Supplier Voucher.
            ofType(VoucherActions.updateSupplierVoucherRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, authState]: [EntityPayload<Partial<SupplierVoucher>>, TNullable<Auth>]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<SupplierVoucher>>],
                                Observable<AnyAction>
                            >(this.updateVoucherRequest),
                            catchError((err) => this.sendErrorToState(err, 'updateSupplierVoucherFailure'))
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<SupplierVoucher>>],
                                Observable<AnyAction>
                            >(this.updateVoucherRequest),
                            catchError((err) => this.sendErrorToState(err, 'updateSupplierVoucherFailure'))
                        );
                    }
                }
            )
        )
    );

    removeVoucherRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Supplier Voucher.
            ofType(VoucherActions.removeSupplierVoucherRequest),
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
                        catchError((err) => this.sendErrorToState(err, 'removeSupplierVoucherFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, VoucherId])),
                        switchMap<[User, string], Observable<AnyAction>>(this.removeVoucherRequest),
                        catchError((err) => this.sendErrorToState(err, 'removeSupplierVoucherFailure'))
                    );
                }
            })
        )
    );

    addVoucherSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action penambahan Supplier Voucher.
                ofType(VoucherActions.addSupplierVoucherSuccess),
                // Hanya mengambil payload-nya saja dari action.
                map((action) => action.payload),
                tap(() => {
                    const noticeSetting: MatSnackBarConfig = {
                        horizontalPosition: 'right',
                        verticalPosition: 'bottom',
                        duration: 5000,
                    };
                    this.notice$.open(`Add Supplier Voucher success.`, 'success', noticeSetting);

                    this.router.navigate(['/pages/promos/voucher']);
                })
            ),
        { dispatch: false }
    );

    confirmRemoveCatalogue$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(VoucherActions.confirmRemoveSupplierVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    if (!Array.isArray(params)) {
                        const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                            data: {
                                title: 'Delete',
                                message: `Are you sure want to delete Supplier Voucher <strong>${params.name}</strong>?`,
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
                            VoucherActions.removeSupplierVoucherRequest({ payload: response })
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
                ofType(VoucherActions.confirmSetActiveSupplierVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Voucher to Active',
                            message: `Are you sure want to set Supplier Voucher <strong>${params.name}</strong> to <strong>Active</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.VoucherStore.dispatch(
                            VoucherActions.updateSupplierVoucherRequest({
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
                ofType(VoucherActions.confirmSetInactiveSupplierVoucher),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Voucher to Inactive',
                            message: `Are you sure want to set Supplier Voucher <strong>${params.name}</strong> to <strong>Inactive</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.VoucherStore.dispatch(
                            VoucherActions.updateSupplierVoucherRequest({
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
                ofType(...[VoucherActions.addSupplierVoucherFailure]),
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
                ofType(VoucherActions.updateSupplierVoucherFailure),
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
                ofType(VoucherActions.updateSupplierVoucherSuccess),
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

    processVoucherRequest = ([userData, queryParams]: [User, IQueryParams | string]): Observable<AnyAction> => {
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

        return this.VoucherApi$.find<IPaginatedResponse<SupplierVoucher>>(newQuery).pipe(
            catchOffline(),
            switchMap((response) => {
                if (typeof queryParams === 'string') {
                    return of(
                        VoucherActions.fetchSupplierVoucherSuccess({
                            payload: {
                                data: new SupplierVoucher((response as unknown) as SupplierVoucher),
                            },
                        })
                    );
                } else if (newQuery.paginate) {
                    return of(
                        VoucherActions.fetchSupplierVoucherSuccess({
                            payload: {
                                data: (response as IPaginatedResponse<SupplierVoucher>).data.map(
                                    (p) => new SupplierVoucher(p)
                                ),
                                total: response.total,
                            },
                        })
                    );
                } else {
                    return of(
                        VoucherActions.fetchSupplierVoucherSuccess({
                            payload: {
                                data: ((response as unknown) as Array<SupplierVoucher>).map(
                                    (p) => new SupplierVoucher(p)
                                ),
                                total: ((response as unknown) as Array<SupplierVoucher>).length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchSupplierVoucherFailure'))
        );
    };

    updateVoucherRequest = ([_, payload]: [User, EntityPayload<Partial<SupplierVoucher>>]): Observable<AnyAction> => {
        return this.VoucherApi$.updateVoucher<EntityPayload<Partial<SupplierVoucher>>, SupplierVoucher>(
            payload
        ).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.updateSupplierVoucherSuccess({
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

                return this.sendErrorToState(err, 'updateSupplierVoucherFailure');
            })
        );
    };

    removeVoucherRequest = ([_, payload]: [User, string]): Observable<AnyAction> => {
        return this.VoucherApi$.removeVoucher<string, any>(payload).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.removeSupplierVoucherSuccess({
                        payload: response,
                    })
                );
            }),
            catchError((err) => {
                return this.sendErrorToState(err, 'removeSupplierVoucherFailure');
            })
        );
    };

    addVoucherRequest = ([_, payload]: [User, SupplierVoucherPayload]): Observable<AnyAction> => {
        return this.VoucherApi$.addVoucher<SupplierVoucherPayload, SupplierVoucher>(payload).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    VoucherActions.addSupplierVoucherSuccess({
                        payload: response,
                    })
                );
            }),
            catchError((err) => {
                this.VoucherStore.dispatch(UiActions.showFooterAction());
                this.VoucherStore.dispatch(FormActions.enableSaveButton());
                this.VoucherStore.dispatch(FormActions.resetClickSaveButton());
                this.VoucherStore.dispatch(FormActions.resetClickCancelButton());

                return this.sendErrorToState(err, 'addSupplierVoucherFailure');
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
