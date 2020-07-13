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

import { CreateFlexiComboDto, FlexiCombo, PatchFlexiComboDto, IPromoCatalogue, IPromoBrand, IPromoInvoiceGroup, IPromoStore, IPromoWarehouse, IPromoType, IPromoGroup, IPromoChannel, IPromoCluster, IPromoCondition } from '../../models';
import { FlexiComboApiService } from '../../services/flexi-combo-api.service';
import { FlexiComboActions, FlexiComboFailureActions } from '../actions';
import * as fromFlexiCombos from '../reducers';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);
@Injectable()
export class FlexiComboEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    createFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.createFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [CreateFlexiComboDto, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createFlexiComboFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, CreateFlexiComboDto], Observable<AnyAction>>(
                            this._createFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createFlexiComboFailure'))
                    );
                }
            })
        )
    );

    createFlexiComboFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.createFlexiComboFailure),
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

    createFlexiComboSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.createFlexiComboSuccess),
                tap(() => {
                    this.router.navigate(['/pages/promos/flexi-combo']).finally(() => {
                        this._$notice.open('Successfully created flexi promo', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    updateFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.updateFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [
                    { body: PatchFlexiComboDto; id: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: PatchFlexiComboDto; id: string }],
                                Observable<AnyAction>
                            >(this._updateFlexiComboRequest$),
                            catchError((err) =>
                                this._sendErrorToState$(err, 'updateFlexiComboFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: PatchFlexiComboDto; id: string }],
                                Observable<AnyAction>
                            >(this._updateFlexiComboRequest$),
                            catchError((err) =>
                                this._sendErrorToState$(err, 'updateFlexiComboFailure')
                            )
                        );
                    }
                }
            )
        )
    );

    updateFlexiComboFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.updateFlexiComboFailure),
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

    updateFlexiComboSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.updateFlexiComboSuccess),
                tap(() => {
                    this.router.navigate(['/pages/promos/flexi-combo']).finally(() => {
                        this._$notice.open('Successfully updated flexi promo', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [DELETE - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    confirmDeleteFlexiCombo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.confirmDeleteFlexiCombo),
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
                    return FlexiComboActions.deleteFlexiComboRequest({
                        payload: id,
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    deleteFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.deleteFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteFlexiComboFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteFlexiComboFailure'))
                    );
                }
            }),
            finalize(() => {
                this.store.dispatch(UiActions.resetHighlightRow());
            })
        )
    );

    deleteFlexiComboFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.deleteFlexiComboFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp) || 'Failed to delete Flexi Combo';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    deleteFlexiComboSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.deleteFlexiComboSuccess),
                tap(() => {
                    this._$notice.open('Successfully deleted flexi promo', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CHANGE STATUS - FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    confirmChangeStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.confirmChangeStatus),
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
                    return FlexiComboActions.changeStatusRequest({
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
            ofType(FlexiComboActions.changeStatusRequest),
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
                ofType(FlexiComboActions.changeStatusFailure),
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
                ofType(FlexiComboActions.changeStatusSuccess),
                tap(() => {
                    this._$notice.open('Successfully changed status flexi promo', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [FLEXI COMBOS]
    // -----------------------------------------------------------------------------------------------------

    fetchFlexiCombosRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.fetchFlexiCombosRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchFlexiCombosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchFlexiCombosRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
                    );
                }
            })
        )
    );

    fetchFlexiCombosFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.fetchFlexiCombosFailure),
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

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [FLEXI COMBO]
    // -----------------------------------------------------------------------------------------------------

    fetchFlexiComboRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(FlexiComboActions.fetchFlexiComboRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchFlexiComboRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                    );
                }
            })
        )
    );

    fetchFlexiComboFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(FlexiComboActions.fetchFlexiComboFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/promos/flexi-combo').finally(() => {
                        this._$notice.open(message, 'error', {
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
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$flexiComboApi: FlexiComboApiService
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

    _createFlexiComboRequest$ = ([userData, payload]: [User, CreateFlexiComboDto]): Observable<
        AnyAction
    > => {
        const newPayload = new CreateFlexiComboDto({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        // console.log('[REQ] Create 1', payload);
        // console.log('[REQ] Create 2', newPayload);

        // return of({ type: 'SUCCESS' });

        return this._$flexiComboApi.create<CreateFlexiComboDto>(newPayload).pipe(
            map((resp) => {
                return FlexiComboActions.createFlexiComboSuccess();
            }),
            catchError((err) => this._sendErrorToState$(err, 'createFlexiComboFailure'))
        );
    };

    _updateFlexiComboRequest$ = ([userData, { body, id }]: [
        User,
        { body: PatchFlexiComboDto; id: string }
    ]): Observable<AnyAction> => {
        if (!id || !Object.keys(body).length) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        const newPayload = new PatchFlexiComboDto({ ...body });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newPayload.supplierId = supplierId;
        }

        // console.log(`[REQ ${id}] Update 1`, body);
        // console.log(`[REQ ${id}] Update 2`, newPayload);

        // return of({ type: 'SUCCESS_UPDATE' });

        return this._$flexiComboApi.patch<PatchFlexiComboDto>(newPayload, id).pipe(
            map((resp) => {
                return FlexiComboActions.updateFlexiComboSuccess();
            }),
            catchError((err) => this._sendErrorToState$(err, 'updateFlexiComboFailure'))
        );
    };

    _deleteFlexiComboRequest$ = ([userData, id]: [User, string]): Observable<AnyAction> => {
        if (!id) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        return this._$flexiComboApi.delete(id).pipe(
            map((resp) => {
                return FlexiComboActions.deleteFlexiComboSuccess({
                    payload: id,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'deleteFlexiComboFailure'))
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

        return this._$flexiComboApi.put<{ status: EStatus }>({ status: body }, id).pipe(
            map((resp) => {
                return FlexiComboActions.changeStatusSuccess({
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

    _fetchFlexiCombosRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$flexiComboApi.findAll<PaginateResponse<FlexiCombo>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new FlexiCombo(v))
                            : []) || [],
                    total: resp.total,
                };

                return FlexiComboActions.fetchFlexiCombosSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchFlexiCombosFailure'))
        );
    };

    _fetchFlexiComboRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<AnyAction> => {
        const newParams: IQueryParams = {
            paginate: false,
        };

        // const { supplierId } = userData.userSupplier;

        // if (supplierId) {
        //     newParams['supplierId'] = supplierId;
        // }

        if (parameter['splitRequest']) {
            return forkJoin([
                this._$flexiComboApi.findById<FlexiCombo>(id, newParams).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                ),
                this._$flexiComboApi.findById<FlexiCombo>(id, ({ ...newParams, data: 'base' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                ),
                this._$flexiComboApi.findById<FlexiCombo>(id, ({ ...newParams, data: 'condition' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                ),
                this._$flexiComboApi.findById<FlexiCombo>(id, ({ ...newParams, data: 'target' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    // map((resp) =>
                    //     FlexiComboActions.fetchFlexiComboSuccess({
                    //         payload: new FlexiCombo(resp),
                    //     })
                    // ),
                    catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
                )
            ]).pipe(
                switchMap(([general, base, condition, target]: [FlexiCombo, FlexiCombo, FlexiCombo, FlexiCombo]) => {
                    let promoCatalogues: Array<IPromoCatalogue> = [];
                    let promoBrands: Array<IPromoBrand> = [];
                    let promoInvoiceGroups: Array<IPromoInvoiceGroup> = [];
                    let promoStores: Array<IPromoStore> = [];
                    let promoWarehouses: Array<IPromoWarehouse> = [];
                    let promoTypes: Array<IPromoType> = [];
                    let promoGroups: Array<IPromoGroup> = [];
                    let promoChannels: Array<IPromoChannel> = [];
                    let promoClusters: Array<IPromoCluster> = [];
                    let promoConditions: Array<IPromoCondition> = [];
                    
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

                    if (Array.isArray(condition)) {
                        if ((condition as Array<IPromoCondition>).length > 0) {
                            promoConditions = condition;
                        }
                    }

                    if (dataTarget === 'store') {
                        promoStores = target as unknown as Array<IPromoStore>;
                    } else if (dataTarget === 'segmentation') {
                        promoWarehouses = target as unknown as Array<IPromoWarehouse>;
                        promoTypes = target as unknown as Array<IPromoType>;
                        promoGroups = target as unknown as Array<IPromoGroup>;
                        promoChannels = target as unknown as Array<IPromoChannel>;
                        promoClusters = target as unknown as Array<IPromoCluster>;
                    }

                    return of(FlexiComboActions.fetchFlexiComboSuccess({
                        payload: new FlexiCombo({
                            ...general,
                            promoCatalogues,
                            promoBrands,
                            promoInvoiceGroups,
                            promoConditions,
                            promoStores,
                            promoWarehouses,
                            promoTypes,
                            promoGroups,
                            promoChannels,
                            promoClusters,
                        } as FlexiCombo),
                    }));
                })
            );
        } else {
            return this._$flexiComboApi.findById<FlexiCombo>(id, newParams).pipe(
                catchOffline(),
                map((resp) =>
                    FlexiComboActions.fetchFlexiComboSuccess({
                        payload: new FlexiCombo(resp),
                    })
                ),
                catchError((err) => this._sendErrorToState$(err, 'fetchFlexiComboFailure'))
            );
        }

    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: FlexiComboFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                FlexiComboActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                FlexiComboActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            FlexiComboActions[dispatchTo]({
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
