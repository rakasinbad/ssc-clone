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

import { PromoHierarchyActions, PromoHierarchyFailureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError } from 'rxjs';
import { PromoHierarchyApiService } from '../../services/promo-hierarchy-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import {
    PromoHierarchy,
    // SupplierVoucherPayload,
    // VoucherCreationPayload
} from '../../models/promo-hierarchy.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { fromPromoHierarchy } from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { IQueryParamsVoucher, IQueryParams } from 'app/shared/models/query.model';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
import { EntityPayload } from 'app/shared/models/entity-payload.model';
import { PromoHierarchyComponent } from '../../promo-hierarchy.component';

@Injectable()
export class PromoHierarchyEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private PromoHierarchyStore: NgRxStore<fromPromoHierarchy.PromoHierarchyState>,
        private PromoHierarchyApi$: PromoHierarchyApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog
    ) {}

    fetchPromoHierarchyRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action request Promo Hierarchy.
            ofType(PromoHierarchyActions.fetchPromoHierarchyRequest),
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
                            this.processPromoHierarchyRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParamsVoucher | string], Observable<AnyAction>>(
                            this.processPromoHierarchyRequest
                        ),
                        catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyFailure'))
                    );
                }
            })
        )
    );

    fetchPromoHierarchyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.fetchPromoHierarchyFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.notice$.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    
    updatePromoHierarchyRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan Promo Hierarchy.
            ofType(PromoHierarchyActions.updatePromoHierarchyRequest),
            // Hanya mengambil payload-nya saja dari action.
            map((action) => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(
                ([queryParams, authState]: [EntityPayload<Partial<PromoHierarchy>>, TNullable<Auth>]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<PromoHierarchy>>],
                                Observable<AnyAction>
                            >(this.updatePromoHierarchyRequest),
                            catchError((err) => this.sendErrorToState(err, 'updatePromoHierarchyFailure'))
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, queryParams])),
                            switchMap<
                                [User, EntityPayload<Partial<PromoHierarchy>>],
                                Observable<AnyAction>
                            >(this.updatePromoHierarchyRequest),
                            catchError((err) => this.sendErrorToState(err, 'updatePromoHierarchyFailure'))
                        );
                    }
                }
            )
        )
    );

    updatePromoHierarchyFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.updatePromoHierarchyFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.PromoHierarchyStore.dispatch(FormActions.resetClickSaveButton());

                    this.notice$.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // addVoucherSuccess$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             // Hanya untuk action penambahan Supplier Voucher.
    //             ofType(PromoHierarchyActions.addPromoHierarchySuccess),
    //             // Hanya mengambil payload-nya saja dari action.
    //             map((action) => action.payload),
    //             tap(() => {
    //                 const noticeSetting: MatSnackBarConfig = {
    //                     horizontalPosition: 'right',
    //                     verticalPosition: 'bottom',
    //                     duration: 5000,
    //                 };
    //                 this.notice$.open(`Add Promo Hierarchy success.`, 'success', noticeSetting);

    //                 this.router.navigate(['/pages/promos/promo-hierarchy']);
    //             })
    //         ),
    //     { dispatch: false }
    // );

    confirmRemoveCatalogue$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.confirmRemovePromoHierarchy),
                map((action) => action.payload),
                exhaustMap((params) => {
                    if (!Array.isArray(params)) {
                        const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                            data: {
                                title: 'Delete',
                                message: `Are you sure want to delete Promo Hierarchy <strong>${params.name}</strong>?`,
                                id: params.id,
                            },
                            disableClose: true,
                        });

                        return dialogRef.afterClosed();
                    }
                }),
                map((response) => {
                    if (response) {
                        // this.PromoHierarchyStore.dispatch(
                        //     PromoHierarchyActions.removePromoHierarchyRequest({ payload: response })
                        // );
                    } else {
                        this.PromoHierarchyStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    confirmSetCatalogueToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.confirmSetActivePromoHierarchy),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Promo Hierarchy to Active',
                            message: `Are you sure want to set Promo Hierarchy <strong>${params.name}</strong> to <strong>Active</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.PromoHierarchyStore.dispatch(
                            PromoHierarchyActions.updatePromoHierarchyRequest({
                                payload: {
                                    id: response,
                                    data: {
                                        // status: 'active',
                                    },
                                },
                            })
                        );
                    } else {
                        this.PromoHierarchyStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    confirmSetCatalogueToInactive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.confirmSetInactivePromoHierarchy),
                map((action) => action.payload),
                exhaustMap((params) => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Set Promo Hierarchy to Inactive',
                            message: `Are you sure want to set Promo Hierarchy <strong>${params.name}</strong> to <strong>Inactive</strong>?`,
                            id: params.id,
                        },
                        disableClose: true,
                    });

                    return dialogRef.afterClosed();
                }),
                map((response) => {
                    if (response) {
                        this.PromoHierarchyStore.dispatch(
                            PromoHierarchyActions.updatePromoHierarchyRequest({
                                payload: {
                                    id: response,
                                    data: {
                                        // status: 'inactive',
                                    },
                                },
                            })
                        );
                    } else {
                        this.PromoHierarchyStore.dispatch(UiActions.resetHighlightRow());
                    }
                })
            ),
        { dispatch: false }
    );

    setRefreshStatusToActive$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(
                    // PromoHierarchyActions.removeSupplierVoucherSuccess,
                    PromoHierarchyActions.updatePromoHierarchySuccess
                ),
                map((action) => action.payload),
                tap(() => {
                    this.PromoHierarchyStore.dispatch(PromoHierarchyActions.setRefreshStatus({ payload: true }));
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

    processPromoHierarchyRequest = ([userData, queryParams]: [User, IQueryParams | string]): Observable<AnyAction> => {
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

        return this.PromoHierarchyApi$.find<IPaginatedResponse<PromoHierarchy>>(newQuery).pipe(
            catchOffline(),
            switchMap((response) => {
                if (typeof queryParams === 'string') {
                    return of(
                        PromoHierarchyActions.fetchPromoHierarchySuccess({
                            payload: {
                                data: new PromoHierarchy((response as unknown) as PromoHierarchy),
                            },
                        })
                    );
                } else if (newQuery.paginate) {
                    return of(
                        PromoHierarchyActions.fetchPromoHierarchySuccess({
                            payload: {
                                data: (response as IPaginatedResponse<PromoHierarchy>).data.map(
                                    (p) => new PromoHierarchy(p)
                                ),
                                total: response.total,
                            },
                        })
                    );
                } else {
                    return of(
                        PromoHierarchyActions.fetchPromoHierarchySuccess({
                            payload: {
                                data: ((response as unknown) as Array<PromoHierarchy>).map(
                                    (p) => new PromoHierarchy(p)
                                ),
                                total: ((response as unknown) as Array<PromoHierarchy>).length,
                            },
                        })
                    );
                }
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyFailure'))
        );
    };

    updatePromoHierarchyRequest = ([_, payload]: [User, EntityPayload<Partial<PromoHierarchy>>]): Observable<AnyAction> => {
        return this.PromoHierarchyApi$.updatePromoHierarchy<EntityPayload<Partial<PromoHierarchy>>, PromoHierarchy>(
            payload
        ).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    PromoHierarchyActions.updatePromoHierarchySuccess({
                        payload: {
                            id: response.id,
                            data: response,
                        },
                    })
                );
            }),
            catchError((err) => {
                    this.PromoHierarchyStore.dispatch(UiActions.showFooterAction());
                    this.PromoHierarchyStore.dispatch(FormActions.enableSaveButton());
                    this.PromoHierarchyStore.dispatch(FormActions.resetClickSaveButton());
                    this.PromoHierarchyStore.dispatch(FormActions.resetClickCancelButton());

                return this.sendErrorToState(err, 'updatePromoHierarchyFailure');
            })
        );
    };

    // removePromoHierarchyRequest = ([_, payload]: [User, string]): Observable<AnyAction> => {
    //     return this.PromoHierarchyApi$.removeVoucher<string, any>(payload).pipe(
    //         catchOffline(),
    //         switchMap((response) => {
    //             return of(
    //                 PromoHierarchyActions.removePromoHierarchySuccess({
    //                     payload: response,
    //                 })
    //             );
    //         }),
    //         catchError((err) => {
    //             return this.sendErrorToState(err, 'removePromoHierarchyFailure');
    //         })
    //     );
    // };

    // addVoucherRequest = ([_, payload]: [User, SupplierVoucherPayload]): Observable<AnyAction> => {
    //     return this.PromoHierarchyApi$.addVoucher<SupplierVoucherPayload, SupplierVoucher>(payload).pipe(
    //         catchOffline(),
    //         switchMap((response) => {
    //             return of(
    //                 VoucherActions.addSupplierVoucherSuccess({
    //                     payload: response,
    //                 })
    //             );
    //         }),
    //         catchError((err) => {
    //             this.PromoHierarchyStore.dispatch(UiActions.showFooterAction());
    //             this.PromoHierarchyStore.dispatch(FormActions.enableSaveButton());
    //             this.PromoHierarchyStore.dispatch(FormActions.resetClickSaveButton());
    //             this.PromoHierarchyStore.dispatch(FormActions.resetClickCancelButton());

    //             return this.sendErrorToState(err, 'addSupplierVoucherFailure');
    //         })
    //     );
    // };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: PromoHierarchyFailureActionNames
    ): Observable<AnyAction> => {
        // Memunculkan error di console.
        if (err instanceof ErrorHandler) {
            return of(
                PromoHierarchyActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                PromoHierarchyActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            PromoHierarchyActions[dispatchTo]({
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
        this.PromoHierarchyStore.dispatch(FormActions.resetClickSaveButton());
    };

    
    private _handleErrMessage(resp: ErrorHandler): string {
        if (typeof resp.errors === 'string') {
            return resp.errors;
        } else if (resp.errors.error && resp.errors.error.message) {
            return resp.errors.error.message;
        } else {
            return resp.errors.message;
        }
    }
}
