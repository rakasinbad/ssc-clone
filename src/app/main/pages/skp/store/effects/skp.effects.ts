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
import { IQueryParams, IQueryParamsPromoList, IQueryParamsCustomerList } from 'app/shared/models/query.model';
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

import { CreateSkpDto, SkpModel, UpdateSkpDto, skpPromoList, skpStoreList  } from '../../models';
import { SkpApiService } from '../../services/skp-api.service';
import { SkpActions, SkpFailureActions } from '../actions';

import * as fromSkpCombos from '../reducers';
import { FormActions } from 'app/shared/store/actions';

type AnyAction = TypedAction<any> | ({ payload: any } & TypedAction<any>);

@Injectable()
export class SkpEffects {

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CREATE - SKP]
    // -----------------------------------------------------------------------------------------------------

    createSkpRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.createSkpRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [CreateSkpDto, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, any], Observable<AnyAction>>(
                            this._createSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createSkpFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, CreateSkpDto], Observable<AnyAction>>(
                            this._createSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'createSkpFailure'))
                    );
                }
            }),
             // Me-reset state tombol save.
             finalize(() => {
                this.store.dispatch(
                    FormActions.resetClickSaveButton()
                );
            })
        )
    );

    createSkpFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.createSkpFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.store.dispatch(FormActions.resetClickSaveButton());

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    createSKpSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.createSkpSuccess),
                tap(() => {
                    this.router.navigate(['/pages/skp']).finally(() => {
                        this._$notice.open('Successfully created skp', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [UPDATE - SKP]
    // -----------------------------------------------------------------------------------------------------

    updateSkpRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.updateSkpRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(
                ([payload, authState]: [
                    { body: UpdateSkpDto; id: string },
                    TNullable<Auth>
                ]) => {
                    if (!authState) {
                        return this._$helper.decodeUserToken().pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: UpdateSkpDto; id: string }],
                                Observable<AnyAction>
                            >(this._updateSkpRequest$),
                            catchError((err) =>
                                this._sendErrorToState$(err, 'updateSkpFailure')
                            )
                        );
                    } else {
                        return of(authState.user).pipe(
                            map(this._checkUserSupplier),
                            retry(3),
                            switchMap((userData) => of([userData, payload])),
                            switchMap<
                                [User, { body: UpdateSkpDto; id: string }],
                                Observable<AnyAction>
                            >(this._updateSkpRequest$),
                            catchError((err) =>
                                this._sendErrorToState$(err, 'updateSkpFailure')
                            )
                        );
                    }
                }
            ),
            // Me-reset state tombol save.
            finalize(() => {
                this.store.dispatch(
                    FormActions.resetClickSaveButton()
                );
            })
        )
    );

    updateSkpFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.updateSkpFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.store.dispatch(FormActions.resetClickSaveButton());

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    updateSkpSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.updateSkpSuccess),
                tap(() => {
                    this.router.navigate(['/pages/skp']).finally(() => {
                        this._$notice.open('Successfully updated skp', 'success', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [DELETE - SKP]
    // -----------------------------------------------------------------------------------------------------

    confirmDeleteSkp$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.confirmDeleteSkp),
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
                    return SkpActions.deleteSkpRequest({
                        payload: id,
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );

    deleteSkpRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.deleteSkpRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([payload, authState]: [string, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteSkpFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, payload])),
                        switchMap<[User, string], Observable<AnyAction>>(
                            this._deleteSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'deleteSkpFailure'))
                    );
                }
            }),
            finalize(() => {
                this.store.dispatch(UiActions.resetHighlightRow());
            })
        )
    );

    deleteSkpFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.deleteSkpFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp) || 'Failed to delete Skp';

                    this._$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    deleteSkpSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.deleteSkpSuccess),
                tap(() => {
                    this._$notice.open('Successfully deleted skp', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods [CHANGE STATUS - SKP]
    // -----------------------------------------------------------------------------------------------------

    confirmChangeStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.confirmChangeStatus),
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
                    return SkpActions.changeStatusRequest({
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
            ofType(SkpActions.changeStatusRequest),
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
                ofType(SkpActions.changeStatusFailure),
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
                ofType(SkpActions.changeStatusSuccess),
                tap(() => {
                    this._$notice.open('Successfully changed status SKP', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    // -----------------------------------------------------------------------------------------------------
    // @ FETCH methods [SKP List]
    // -----------------------------------------------------------------------------------------------------

    fetchSkpListRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.fetchSkpListRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([params, authState]: [IQueryParams, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchSkpListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of([userData, params])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this._fetchSkpListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListFailure'))
                    );
                }
            })
        )
    );

    fetchSkpListFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.fetchSkpListFailure),
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
    // @ FETCH methods [SKP Detail Promo List]
    // -----------------------------------------------------------------------------------------------------

    fetchSkpDetailPromoListRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.fetchSkpListDetailPromoRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpPromoListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailPromoFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpPromoListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailPromoFailure'))
                    );
                }
            })
        )
    );

    fetchSkpListDetailPromoFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.fetchSkpListDetailPromoFailure),
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
    // @ FETCH methods [SKP Detail Store List]
    // -----------------------------------------------------------------------------------------------------

    fetchSkpDetailStoreListRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.fetchSkpListDetailStoreRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpStoreListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailStoreFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpStoreListRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailStoreFailure'))
                    );
                }
            })
        )
    );

    fetchSkpListDetailStoreFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.fetchSkpListDetailStoreFailure),
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
    // @ FETCH methods [SKP]
    // -----------------------------------------------------------------------------------------------------

    fetchSkpRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SkpActions.fetchSkpRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserState)),
            switchMap(([{ id, parameter }, authState]: [{ id: string, parameter?: IQueryParams }, TNullable<Auth>]) => {
                if (!authState) {
                    return this._$helper.decodeUserToken().pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this._checkUserSupplier),
                        retry(3),
                        switchMap((userData) => of({ userData, id, parameter })),
                        switchMap<{ userData: User, id: string, parameter: IQueryParams }, Observable<AnyAction>>(
                            this._fetchSkpRequest$
                        ),
                        catchError((err) => this._sendErrorToState$(err, 'fetchSkpFailure'))
                    );
                }
            })
        )
    );

    fetchSkpFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkpActions.fetchSkpFailure),
                map((action) => action.payload),
                tap((resp) => {
                    const message = this._handleErrMessage(resp);

                    this.router.navigateByUrl('/pages/skp').finally(() => {
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
        private store: Store<fromSkpCombos.FeatureState>,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private _$skpComboApi: SkpApiService
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

    _createSkpRequest$ = ([userData, payload]: [User, CreateSkpDto]): Observable<
        AnyAction
    > => {
        const newPayload = new CreateSkpDto({ ...payload });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            // newPayload.supplierId = supplierId;
        }

        return this._$skpComboApi.create<CreateSkpDto>(newPayload).pipe(
            map((resp) => {
                return SkpActions.createSkpSuccess();
            }),
            catchError((err) => this._sendErrorToState$(err, 'createSkpFailure'))
        );
    };

    _updateSkpRequest$ = ([userData, { body, id }]: [
        User,
        { body: UpdateSkpDto; id: string }
    ]): Observable<AnyAction> => {
        if (!id || !Object.keys(body).length) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        const newPayload = new UpdateSkpDto({ ...body });
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            // newPayload.supplierId = supplierId;
        }

        return this._$skpComboApi.patch<UpdateSkpDto>(newPayload, id).pipe(
            map((resp) => {
                return SkpActions.updateSkpSuccess();
            }),
            catchError((err) => this._sendErrorToState$(err, 'updateSkpFailure'))
        );
    };

    _deleteSkpRequest$ = ([userData, id]: [User, string]): Observable<AnyAction> => {
        if (!id) {
            throw new ErrorHandler({
                id: 'ERR_ID_OR_PAYLOAD_NOT_FOUND',
                errors: 'Check id or payload',
            });
        }

        return this._$skpComboApi.delete(id).pipe(
            map((resp) => {
                return SkpActions.deleteSkpSuccess({
                    payload: id,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'deleteSkpFailure'))
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

        return this._$skpComboApi.put<{ status: EStatus }>({ status: body }, id).pipe(
            map((resp) => {
                return SkpActions.changeStatusSuccess({
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

    //list skp
    _fetchSkpListRequest$ = ([userData, params]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        const newParams = {
            ...params,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$skpComboApi.findAll<PaginateResponse<SkpModel>>(newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new SkpModel(v))
                            : []) || [],
                    total: resp.total,
                };

                return SkpActions.fetchSkpListSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchSkpListFailure'))
        );
    };

    //detail
    _fetchSkpRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<AnyAction> => {
        const newParams: IQueryParams = {
            paginate: false,
        };

        const { supplierId } = userData.userSupplier;

        // if (supplierId) {
        //     newParams['supplierId'] = supplierId;
        // }

        //ini untuk split data detail general
        //bagian promo dan customer list terpisah dibawah
        if (parameter['splitRequest']) {
            return forkJoin([
                this._$skpComboApi.findById<SkpModel>(id, ({data: 'promo' } as IQueryParams)).pipe(
                    catchOffline(),
                    retry(3),
                    catchError((err) => this._sendErrorToState$(err, 'fetchSkpFailure'))
                ),
            ]).pipe(
                switchMap(([general]: [SkpModel]) => {
                    return of(SkpActions.fetchSkpSuccess({
                        payload: new SkpModel({
                            ...general,
                        } as SkpModel),
                    }));
                })
            );
        } else {
            return this._$skpComboApi.findById<SkpModel>(id, newParams).pipe(
                catchOffline(),
                map((resp) =>
                   SkpActions.fetchSkpSuccess({
                        payload: new SkpModel(resp),
                    })
                ),
                catchError((err) => this._sendErrorToState$(err, 'fetchSkpFailure'))
            );
        }

    };

    //detail promo list
    _fetchSkpPromoListRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<
    AnyAction
    > => {

        const newParams: IQueryParams = {
            ...parameter,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$skpComboApi.findDetailList<PaginateResponse<SkpModel>>(id, newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new SkpModel(v))
                            : []) || [],
                    total: resp.total,
                };

                return SkpActions.fetchSkpListDetailPromoSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailPromoFailure'))
        );
    };

    //detail store list
    _fetchSkpStoreListRequest$ = ({ userData, id, parameter = {} }: { userData: User, id: string, parameter: IQueryParams }): Observable<
    AnyAction
    > => {
        const newParams: IQueryParams = {
            ...parameter,
        };
        const { supplierId } = userData.userSupplier;

        if (supplierId) {
            newParams['supplierId'] = supplierId;
        }

        return this._$skpComboApi.findDetailList<PaginateResponse<SkpModel>>(id, newParams).pipe(
            catchOffline(),
            map((resp) => {
                const newResp = {
                    data:
                        (resp && resp.data.length > 0
                            ? resp.data.map((v) => new SkpModel(v))
                            : []) || [],
                    total: resp.total,
                };

                return SkpActions.fetchSkpListDetailStoreSuccess({
                    payload: newResp,
                });
            }),
            catchError((err) => this._sendErrorToState$(err, 'fetchSkpListDetailStoreFailure'))
        );
    };

    _sendErrorToState$ = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: SkpFailureActions
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                SkpActions[dispatchTo]({
                    payload: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                })
            );
        }

        if (err instanceof HttpErrorResponse) {
            return of(
                SkpActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                        errors: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
                    },
                })
            );
        }

        return of(
            SkpActions[dispatchTo]({
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