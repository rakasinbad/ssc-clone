import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent, DeleteConfirmationComponent } from 'app/shared/modals';
import { ErrorHandler, EStatus, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { UiActions } from 'app/shared/store/actions';
import { Observable, of, forkJoin } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { CreateCrossSellingDto, CrossSelling, PatchCrossSellingDto, 
    IPromoCatalogue, IPromoBrand, IPromoInvoiceGroup, IPromoStore, 
    IPromoWarehouse, IPromoType, IPromoGroup, IPromoChannel, 
    IPromoCluster, ICrossSellingPromoBenefit } from '../../models';
import { CrossSellingPromoApiService } from '../../services/cross-selling-promo-api.service';
import { CrossSellingPromoActions, CrossSellingPromoFailureActions } from '../actions';
import * as crossSellingPromo from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class CrossSellingPromoEffects {

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    createCrossSellingPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.createCrossSellingPromoRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [CreateCrossSellingDto, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createCrossSellingPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createCrossSellingPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, CreateCrossSellingDto], Observable<AnyAction>>(
                            this._createCrossSellingPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createCrossSellingPromoFailure'))
                    );
                }
            })
        )
    );

    createCrossSellingPromoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.createCrossSellingPromoFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    createCrossSellingPromoSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.createCrossSellingPromoSuccess),
                tap(() => {
                    this.router.navigate(['/pages/promos/cross-selling-promo']).finally(() => {
                        this._$notice.open('Successfully created cross selling promo', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private store: Store<crossSellingPromo.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$crossSellingPromoApi: CrossSellingPromoApiService
    ) {}

    _checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`,
            });
        }

        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    };

    _createCrossSellingPromoRequest$ = ([userData, payload]: [User, CreateCrossSellingDto]): Observable<
        AnyAction
    > => {
        const newPayload = new CreateCrossSellingDto({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$crossSellingPromoApi.create<CreateCrossSellingDto>(newPayload).pipe(
            map((resp) => {
                return CrossSellingPromoActions.createCrossSellingPromoSuccess();
            }),
            catchError((err) => this._sendErrorToState$(err, 'createCrossSellingPromoFailure'))
        );
    };

    _deleteCrossSellingPromoRequest$ = ([userData, id]: [User, string]): Observable<AnyAction> => {
        if (!id) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        return this._$crossSellingPromoApi.delete(id).pipe(
            map((resp) => {
                return CrossSellingPromoActions.deleteCrossSellingPromoSuccess({
                    payload: id,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'deleteCrossSellingPromoFailure'))
        );
    };

    _changeStatusRequest$ = ([userData, { body, id }]: [
        User,
        { body: EStatus; id: string }
    ]): Observable<AnyAction> => {
        if (!id || !Object.keys(body).length) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        return this._$crossSellingPromoApi.put<{ status: EStatus }>({ status: body }, id).pipe(
            map((resp) => {
                return CrossSellingPromoActions.changeStatusSuccess({
                    payload: {
                        id,
                        changes: {
                            ...resp,
                            status: body,
                            updatedAt: resp.updatedAt,
                        },
                    },
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'changeStatusFailure'))
        );
    };

    _fetchCrossSellingPromosRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$crossSellingPromoApi.findAll<PaginateResponse<CrossSelling>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new CrossSelling(v))
                            : []) || [],
                    total: resp.total,
                };

                return CrossSellingPromoActions.fetchCrossSellingPromosSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
        );
    };

    _fetchCrossSellingPromoRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<AnyAction> => {
        const newParams: IQueryParams = {
            paginate: false,
        };

        if (parameter['splitRequest']) {
            return forkJoin([
                this._$crossSellingPromoApi.findById<CrossSelling>(id, newParams).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'base' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'condition' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'target' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
                )
            ]).pipe(
                switchMap(([general, base, benefit, target]: [CrossSelling, CrossSelling, CrossSelling, CrossSelling]) => {
                    let promoCatalogues: Array<IPromoCatalogue> = [];
                    let promoBrands: Array<IPromoBrand> = [];
                    let promoInvoiceGroups: Array<IPromoInvoiceGroup> = [];
                    let promoStores: Array<IPromoStore> = [];
                    let promoWarehouses: Array<IPromoWarehouse> = [];
                    let promoTypes: Array<IPromoType> = [];
                    let promoGroups: Array<IPromoGroup> = [];
                    let promoChannels: Array<IPromoChannel> = [];
                    let promoClusters: Array<IPromoCluster> = [];
                    let promoBenefit: Array<ICrossSellingPromoBenefit> = [];
                    
                    const {
                        base: dataBase,
                        target: dataTarget
                    } = general;

                    if (dataBase === 'sku') {
                        promoCatalogues = base as unknown as Array<IPromoCatalogue>;
                    } else if (dataBase === 'brand') {
                        promoBrands = base as unknown as Array<IPromoBrand>;
                    } else if (dataBase === 'invoice_group') {
                        promoInvoiceGroups = base as unknown as Array<IPromoInvoiceGroup>;
                    }

                    if (Array.isArray(benefit)) {
                        if ((benefit as Array<ICrossSellingPromoBenefit>).length > 0) {
                            promoBenefit = benefit;
                        }
                    }

                    if (dataTarget === 'store') {
                        promoStores = target as unknown as Array<IPromoStore>;
                    } else if (dataTarget === 'segmentation') {
                        promoWarehouses = target['promoWarehouses'] as unknown as Array<IPromoWarehouse>;
                        promoTypes = target['promoTypes'] as unknown as Array<IPromoType>;
                        promoGroups = target['promoGroups'] as unknown as Array<IPromoGroup>;
                        promoChannels = target['promoChannels'] as unknown as Array<IPromoChannel>;
                        promoClusters = target['promoClusters'] as unknown as Array<IPromoCluster>;
                    }

                    return of(CrossSellingPromoActions.fetchCrossSellingPromoSuccess({
                        payload: new CrossSelling({
                            ...general,
                            promoCatalogues,
                            promoBrands,
                            promoInvoiceGroups,
                            promoBenefit,
                            promoStores,
                            promoWarehouses,
                            promoTypes,
                            promoGroups,
                            promoChannels,
                            promoClusters,
                        } as CrossSelling),
                    }));
                })
            );
        } else {
            return this._$crossSellingPromoApi.findById<CrossSelling>(id, newParams).pipe(
                catchOffline(),
                map((resp) =>
                    CrossSellingPromoActions.fetchCrossSellingPromoSuccess({
                        payload: new CrossSelling(resp),
                    })
                ),
                catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoFailure'))
            );
        }

    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: CrossSellingPromoFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                CrossSellingPromoActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                CrossSellingPromoActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            CrossSellingPromoActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                },
            })
        );
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
