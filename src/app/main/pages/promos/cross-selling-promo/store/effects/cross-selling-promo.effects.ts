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
import { ExtendPromoComponent } from 'app/shared/components/dropdowns/extend-promo/extend-promo.component';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ChangeConfirmationComponent, DeleteConfirmationComponent } from 'app/shared/modals';
import { ErrorHandler, EStatus, PaginateResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { FormActions, UiActions } from 'app/shared/store/actions';
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

import { CreateFormDto, CreateCrossSellingDto, CrossSelling, PatchCrossSellingDto, CrossSellingPromoDetail,
    IPromoCatalogue, IPromoBrand, IPromoInvoiceGroup, IPromoStore, 
    IPromoWarehouse, IPromoType, IPromoGroup, IPromoChannel, 
    IPromoCluster, ICrossSellingPromoBenefit, ExtendCrossSellingDto } from '../../models';
import { CrossSellingPromoApiService } from '../../services/cross-selling-promo-api.service';
import { CrossSellingPromoActions, CrossSellingPromoFailureActions } from '../actions';
import * as crossSellingPromo from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class CrossSellingPromoEffects {

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - Cross Selling Promo]
    // -----------------------------------------------------------------------------------------------------

    createCrossSellingPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.createCrossSellingPromoRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [CreateFormDto, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createCrossSellingPromoRequest$
                        ),
                        catchError((err) =>
                            this._sendErrorToState$(err, 'createCrossSellingPromoFailure')
                        )
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, CreateFormDto], Observable<AnyAction>>(
                            this._createCrossSellingPromoRequest$
                        ),
                        catchError((err) =>
                            this._sendErrorToState$(err, 'createCrossSellingPromoFailure')
                        )
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

                    // Reset save btn
                    this.store.dispatch(FormActions.resetClickSaveButton());
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

     // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [Cross Selling Promo] list
    // -----------------------------------------------------------------------------------------------------

    fetchCrossSellingPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.fetchCrossSellingPromoListRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchCrossSellingPromosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoListFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchCrossSellingPromosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoListFailure'))
                    );
                }
            })
        )
    );

    fetchCrossSellingPromoListFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.fetchCrossSellingPromoListFailure),
                map((action) => action.payload, 
                ),
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

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [Cross Selling Promo] detail
    // -----------------------------------------------------------------------------------------------------

    fetchCrossSellingPromoDetailRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.fetchCrossSellingPromoDetailRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchCrossSellingPromoDetailRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchCrossSellingPromoDetailRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
                    );
                }
            })
        )
    );

    fetchCrossSellingPromoDetailFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.fetchCrossSellingPromoDetailFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/promos/cross-selling-promo').finally(() => {
                        this._$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [DELETE - Cross Selling Promo]
    // -----------------------------------------------------------------------------------------------------

    confirmDeleteCrossSellingPromo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.confirmDeleteCrossSellingPromo),
            map((action) => action.payload),
            exhaustMap((params) => {
                const title = params.status === EStatus.ACTIVE ? 'Inactive' : 'Active';
                const body = params.status === EStatus.ACTIVE ? EStatus.INACTIVE : EStatus.ACTIVE;
                const dialogRef = this.matDialog.open<DeleteConfirmationComponent, any, string>(
                    DeleteConfirmationComponent,
                    {
                        data: {
                            title: 'Delete',
                            message: `Are you sure want to delete <strong>${params.name}</strong> ?`,
                            id: params.id,
                        },
                        disableClose: true,
                    }
                );

                return dialogRef.afterClosed();
            }),
            map((id) => {
                if (id) {
                    return CrossSellingPromoActions.deleteCrossSellingPromoRequest({
                        payload: id,
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    deleteCrossSellingPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.deleteCrossSellingPromoRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteCrossSellingPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteCrossSellingPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteCrossSellingPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteCrossSellingPromoFailure'))
                    );
                }
            }),
            finalize(() => {
                this.store.dispatch(UiActions.resetHighlightRow());
            })
        )
    );

    deleteCrossSellingPromoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.deleteCrossSellingPromoFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp) || 'Failed to delete Cross Selling Promo';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    deleteCrossSellingPromoSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.deleteCrossSellingPromoSuccess),
                tap(() => {
                    this._$notice.open('Successfully deleted cross selling promo', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CHANGE STATUS - Cross Selling Promo]
    // -----------------------------------------------------------------------------------------------------

    confirmChangeStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.confirmChangeStatus),
            map((action) => action.payload),
            exhaustMap((params) => {
                const title = params.status === EStatus.ACTIVE ? 'Inactive' : 'Active';
                const body = params.status === EStatus.ACTIVE ? EStatus.INACTIVE : EStatus.ACTIVE;
                const dialogRef = this.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: EStatus }
                >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set ${title}`,
                        message: `Are you sure want to change <strong>${params.name}</strong> status to <strong>${body}</strong> ?`,
                        id: params.id,
                        change: body,
                    },
                    disableClose: true,
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return CrossSellingPromoActions.changeStatusRequest({
                        payload: { id, body: change },
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    changeStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.changeStatusRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [{ body: EStatus; id: string }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, { body: EStatus; id: string }], Observable<AnyAction>>(
                            this._changeStatusRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'changeStatusFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, { body: EStatus; id: string }], Observable<AnyAction>>(
                            this._changeStatusRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'changeStatusFailure'))
                    );
                }
            }),
            finalize(() => {
                this.store.dispatch(UiActions.resetHighlightRow());
            })
        )
    );

    changeStatusFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.changeStatusFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp) || 'Failed to change status';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    changeStatusSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.changeStatusSuccess),
                tap(() => {
                    this._$notice.open('Successfully changed status cross selling promo', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [EXTEND PROMO - Cross Selling Promo]
    // -----------------------------------------------------------------------------------------------------

    extendPromoShow$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.extendPromoShow),
            map((action) => action.payload),
            exhaustMap((params) => {
                const dialogRef = this.matDialog.open(ExtendPromoComponent, {
                    data: {
                        id: params.id,
                        start_date: params.startDate,
                        end_date: params.endDate,
                        status: params.status
                    },
                    panelClass: 'extend-promo-dialog',
                    disableClose: true
                });
        

                return dialogRef.afterClosed();
            }),
            map((data) => {
                if (data) {
                    const { promoId, startDate, endDate, newStartDate, newEndDate } = data
                    return CrossSellingPromoActions.extendPromoRequest({
                        payload: {
                            body: {
                                promoId: promoId,
                                startDateBeforeExtended: startDate,
                                endDateBeforeExtended: endDate,
                                startDateAfterExtended: newStartDate,
                                endDateAfterExtended: newEndDate
                            }
                        }
                    })
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    extendPromoRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CrossSellingPromoActions.extendPromoRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [{ body: ExtendCrossSellingDto; id: string }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, { body: ExtendCrossSellingDto; id: string }], Observable<AnyAction>>(
                            this._extendPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'extendPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, { body: ExtendCrossSellingDto; id: string }], Observable<AnyAction>>(
                            this._extendPromoRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'extendPromoFailure'))
                    );
                }
            }),
            finalize(() => {
                this.store.dispatch(UiActions.resetHighlightRow());
            })
        )
    );

    extendPromoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.extendPromoFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp) || 'Failed to extend promo';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    extendPromoSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CrossSellingPromoActions.extendPromoSuccess),
                tap(() => {
                    this._$notice.open('Successfully extending cross selling promo', 'success', {
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

    _createCrossSellingPromoRequest$ = ([userData, payload]: [User, CreateFormDto]): Observable<
        AnyAction
    > => {
        const newPayload = { ...payload };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        return this._$crossSellingPromoApi.create<CreateFormDto>(newPayload).pipe(
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

    _extendPromoRequest$ = ([userData, { body }]: [
        User,
        { body: ExtendCrossSellingDto }
    ]): Observable<AnyAction> => {
        if (!Object.keys(body).length) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check payload',
            });
        }

        const newBody: ExtendCrossSellingDto = { ...body, ...{userId: userData.id}}

        return this._$crossSellingPromoApi.extend<ExtendCrossSellingDto>(newBody).pipe(
            map((resp) => {
                return CrossSellingPromoActions.extendPromoSuccess({
                    payload: {
                        id: body.promoId,
                        changes: {
                            startDate: body.startDateAfterExtended,
                            endDate: body.endDateAfterExtended,
                            updatedAt: resp.updatedAt,
                        },
                    },
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'extendPromoFailure'))
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

                return CrossSellingPromoActions.fetchCrossSellingPromoListSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoListFailure'))
        );
    };

    _fetchCrossSellingPromoDetailRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<AnyAction> => {
        const newParams: IQueryParams = {
            paginate: false,
        };
        if (parameter['splitRequest']) {
            return forkJoin([
                this._$crossSellingPromoApi.findById<CrossSelling>(id, newParams).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'base' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'cross-selling-group' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
                ),
                this._$crossSellingPromoApi.findById<CrossSelling>(id, ({ ...newParams, data: 'target' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
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
                    
                    promoBenefit = benefit as unknown as Array<ICrossSellingPromoBenefit>;

                    if (dataTarget === 'store') {
                        promoStores = target as unknown as Array<IPromoStore>;
                    }
                     else if (dataTarget === 'segmentation') {
                        promoWarehouses = target['promoWarehouses'] as unknown as Array<IPromoWarehouse>;
                        promoTypes = target['promoTypes'] as unknown as Array<IPromoType>;
                        promoGroups = target['promoGroups'] as unknown as Array<IPromoGroup>;
                        promoChannels = target['promoChannels'] as unknown as Array<IPromoChannel>;
                        promoClusters = target['promoClusters'] as unknown as Array<IPromoCluster>;
                    }

                    return of(CrossSellingPromoActions.fetchCrossSellingPromoDetailSuccess({
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
                    CrossSellingPromoActions.fetchCrossSellingPromoDetailSuccess({
                        payload: new CrossSelling(resp),
                    })
                ),
                catchError((err) => this._sendErrorToState$(err, 'fetchCrossSellingPromoDetailFailure'))
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
