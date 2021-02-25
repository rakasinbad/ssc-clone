import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { MatSnackBarConfig } from '@angular/material';
import { map, switchMap, withLatestFrom, catchError, retry, tap } from 'rxjs/operators';

import { PromoHierarchyActions, PromoHierarchyFailureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable, throwError, forkJoin } from 'rxjs';
import { PromoHierarchyApiService } from '../../services/promo-hierarchy-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import {
    PromoHierarchy,
    PromoHierarchyPayload,
    PromoHierarchyDetail,
    IPromoConditionCatalogues,
    IPromoLayerInformation,
} from '../../models/promo-hierarchy.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import  * as fromPromoHierarchy from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { IQueryParamsVoucher, IQueryParams } from 'app/shared/models/query.model';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

@Injectable()
export class PromoHierarchyEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private PromoHierarchyStore: NgRxStore<fromPromoHierarchy.FeatureState>,
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
            switchMap(([queryParams, authState]: [IQueryParams, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParams ], Observable<AnyAction>>(
                            this.processPromoHierarchyRequest
                        ),
                        catchError((err) =>
                            this.sendErrorToState(err, 'fetchPromoHierarchyFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.processPromoHierarchyRequest
                        ),
                        catchError((err) =>
                            this.sendErrorToState(err, 'fetchPromoHierarchyFailure')
                        )
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
                ([payload, authState]: [{ body: PromoHierarchyPayload }, TNullable<Auth>]) => {
                    // Jika tidak ada data supplier-nya user dari state.
                    if (!authState) {
                        return this.helper$.decodeUserToken().pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: PromoHierarchyPayload }],
                                Observable<AnyAction>
                            >(this.updatePromoHierarchyRequest),
                            catchError((err) =>
                                this.sendErrorToState(err, 'updatePromoHierarchyFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this.checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: PromoHierarchyPayload }],
                                Observable<AnyAction>
                            >(this.updatePromoHierarchyRequest),
                            catchError((err) =>
                                this.sendErrorToState(err, 'updatePromoHierarchyFailure')
                            )
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

    updatePromoHierarchySuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.updatePromoHierarchySuccess),
                tap(() => {
                    this.notice$.open('Successfully set promo Hierarchy', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    fetchPromoHierarchyDetailRequest$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action penambahan Promo Hierarchy.
                ofType(PromoHierarchyActions.fetchPromoHierarchyDetailRequest),
                // Hanya mengambil payload-nya saja dari action.
                map((action) => action.payload),
                // Mengambil data dari store-nya auth.
                withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
                // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
                switchMap(
                    ([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                        // Jika tidak ada data supplier-nya user dari state.
                        if (!authState) {
                            return this.helper$.decodeUserToken().pipe(
                                map(this.checkUserSupplier),
                                retry(3),
                                switchMap((userData) =>  of({ userData, id, parameter })),
                                switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                                    this._fetchPromoHierarchyDetailRequest),
                                catchError((err) =>
                                    this.sendErrorToState(err, 'fetchPromoHierarchyDetailFailure')
                                )
                            );
                        } else {
                            return of(authState.user).pipe(
                                map(this.checkUserSupplier),
                                retry(3),
                                switchMap((userData) => of({ userData, id, parameter })),
                                switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                                    this._fetchPromoHierarchyDetailRequest),
                                catchError((err) =>
                                    this.sendErrorToState(err, 'fetchPromoHierarchyDetailFailure')
                                )
                            );
                        }
                    }
                )
            )
    );

    fetchPromoHierarchyDetailFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(PromoHierarchyActions.fetchPromoHierarchyDetailFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/promos/cross-selling-promo').finally(() => {
                        this.notice$.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
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
                    this.PromoHierarchyStore.dispatch(
                        PromoHierarchyActions.setRefreshStatus({ payload: true })
                    );
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

    processPromoHierarchyRequest = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }
        return this.PromoHierarchyApi$.find<IPaginatedResponse<PromoHierarchy>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new PromoHierarchy(v))
                            : []) || [],
                    total: resp.total,
                };

                return PromoHierarchyActions.fetchPromoHierarchySuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyFailure'))
        );
    };

    // processPromoHierarchyRequest = ([userData, queryParams]: [
    //     User,
    //     IQueryParams | string
    // ]): Observable<AnyAction> => {
    //     let newQuery: IQueryParams = {};

    //     if (typeof queryParams === 'string') {
    //         newQuery['id'] = queryParams;
    //     } else {
    //         // Membentuk parameter query yang baru.
    //         newQuery = {
    //             ...queryParams,
    //         };
    //     }

    //     // Hanya mengambil ID supplier saja.
    //     const { supplierId } = userData.userSupplier;

    //     // Memasukkan ID supplier ke dalam parameter.
    //     newQuery['supplierId'] = supplierId;

    //     return this.PromoHierarchyApi$.find<IPaginatedResponse<PromoHierarchy>>(newQuery).pipe(
    //         catchOffline(),
    //         switchMap((response) => {
    //             if (typeof queryParams === 'string') {
    //                 return of(
    //                     PromoHierarchyActions.fetchPromoHierarchySuccess({
    //                         payload: {
    //                             data: new PromoHierarchy((response as unknown) as PromoHierarchy),
    //                         },
    //                     })
    //                 );
    //             } else if (newQuery.paginate) {
    //                 return of(
    //                     PromoHierarchyActions.fetchPromoHierarchySuccess({
    //                         payload: {
    //                             data: (response as IPaginatedResponse<PromoHierarchy>).data.map(
    //                                 (p) => new PromoHierarchy(p)
    //                             ),
    //                             total: response.total,
    //                         },
    //                     })
    //                 );
    //             } else {
    //                 return of(
    //                     PromoHierarchyActions.fetchPromoHierarchySuccess({
    //                         payload: {
    //                             data: ((response as unknown) as Array<PromoHierarchy>).map(
    //                                 (p) => new PromoHierarchy(p)
    //                             ),
    //                             total: ((response as unknown) as Array<PromoHierarchy>).length,
    //                         },
    //                     })
    //                 );
    //             }
    //         }),
    //         catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyFailure'))
    //     );
    // };

    updatePromoHierarchyRequest = ([userData, { body }]: [
        User,
        { body: PromoHierarchyPayload }
    ]): Observable<AnyAction> => {
        const newBody: PromoHierarchyPayload = { ...body, ...{ userId: userData.id } };

        return this.PromoHierarchyApi$.updatePromoHierarchy<PromoHierarchyPayload>(newBody).pipe(
            catchOffline(),
            switchMap((response) => {
                return of(
                    PromoHierarchyActions.updatePromoHierarchySuccess({
                        payload: {
                            id: body.id,
                            changes: {
                                layer: response.layer,
                                promoGroup: response.promoGroup,
                            },
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

    _fetchPromoHierarchyDetailRequest = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<AnyAction> => {
        const newParams = {
            ...parameter,
        };
        const { supplierId } = userData.userSupplier;
        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        let promoTypes;
        if (newParams['type'] == 'cross_selling') {
            promoTypes = 'cross';
        } else {
            promoTypes = newParams['type'];
        }
        newParams['type'] = promoTypes;
        
        if (newParams['splitRequest']) {
            return forkJoin([
                this.PromoHierarchyApi$.findById<PromoHierarchy>(id, newParams).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) =>
                        this.sendErrorToState(err, 'fetchPromoHierarchyDetailFailure')
                    )
                ),
            ]).pipe(
                switchMap(([general]: [PromoHierarchy]) => {
                    let promoCatalogues: Array<IPromoConditionCatalogues> = [];
                    let promoLayer: Array<IPromoLayerInformation> = [];

                    // promoCatalogues = general['promoConditionCatalogues'] as unknown as Array<IPromoConditionCatalogues>;
                    // promoLayer = general['layerInformation'] as unknown as Array<IPromoLayerInformation>;

                    console.log('isi general1->', general)
                    console.log('isi promoCatalogues->', promoCatalogues)
                    console.log('isi promoLayer->', promoLayer)
                    return of(
                        PromoHierarchyActions.fetchPromoHierarchyDetailSuccess({
                            // payload: new PromoHierarchyDetail(general),
                            payload: new PromoHierarchy({
                                ...general,
                                // promoCatalogues,
                                // promoLayer,
                            } as PromoHierarchy),
                        })
                    );
                })
            );
        } else {
            return this.PromoHierarchyApi$.findById<PromoHierarchyDetail>(id, newParams).pipe(
                catchOffline(),
                map((resp) =>
                    PromoHierarchyActions.fetchPromoHierarchyDetailSuccess({
                        payload: new PromoHierarchyDetail(resp['data']),
                    })
                ),
                catchError((err) => this.sendErrorToState(err, 'fetchPromoHierarchyDetailFailure'))
            );
        }
    };

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
