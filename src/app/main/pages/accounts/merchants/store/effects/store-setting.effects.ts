import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { StoreSettingActions, merchantFailureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IQueryParams, TNullable, User, ErrorHandler, AnyAction, IPaginatedResponse } from 'app/shared/models';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { throwError, Observable, of } from 'rxjs';
import { map, retry, switchMap, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreSettingApiService } from '../../services';
import { StoreSetting } from '../../models';
import { catchOffline } from '@ngx-pwa/offline';
import { Router } from '@angular/router';
import { MatSnackBarConfig } from '@angular/material';

interface PayloadUpdateStoreSetting {
    id: string;
    body: Partial<StoreSetting>;
}

@Injectable()
export class StoreSettingEffects {

    fetchStoreSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan store setting.
            ofType(StoreSettingActions.fetchStoreSettingsRequest),
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchStoreSettingsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.processStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchStoreSettingsFailure'))
                    );
                }
            })
        )
    );

    createStoreSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pembuatan store setting.
            ofType(StoreSettingActions.createStoreSettingRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload.body),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([storeSetting, authState]: [Partial<StoreSetting>, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, storeSetting])),
                        switchMap<[User, Partial<StoreSetting>], Observable<AnyAction>>(this.processCreateStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'createStoreSettingFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, storeSetting])),
                        switchMap<[User, Partial<StoreSetting>], Observable<AnyAction>>(this.processCreateStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'createStoreSettingFailure'))
                    );
                }
            })
        )
    );

    createStoreSettingSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action create store setting success.
            ofType(StoreSettingActions.createStoreSettingSuccess),
            // Memunculkan notif bahwa pembuatan store setting berhasil.
            tap(() => {
                this.notice$.open('A store setting has been created successfully.', 'success', {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                });

                this.router$.navigate(['/pages/account/stores']);
            })
        )
    , { dispatch: false });

    createStoreSettingFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action create store setting failure.
            ofType(StoreSettingActions.createStoreSettingFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa pembuatan store setting berhasil.
            tap(error => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };

                if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
                    this.notice$.open(`Failed to create a new store setting. Reason: ${error.errors}`, 'error', noticeSetting);
                } else {
                    this.notice$.open(`Something wrong with our web while creating a new store setting. Please contact Sinbad Team.`, 'error', noticeSetting);
                }

            })
        )
    , { dispatch: false });

    updateStoreSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action update store setting.
            ofType(StoreSettingActions.updateStoreSettingRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([payload, authState]: [PayloadUpdateStoreSetting, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadUpdateStoreSetting], Observable<AnyAction>>(this.processUpdateStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'updateStoreSettingFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, payload])),
                        switchMap<[User, PayloadUpdateStoreSetting], Observable<AnyAction>>(this.processUpdateStoreSettingsRequest),
                        catchError(err => this.sendErrorToState(err, 'updateStoreSettingFailure'))
                    );
                }
            })
        )
    );

    updateStoreSettingSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action update store setting success.
            ofType(StoreSettingActions.updateStoreSettingSuccess),
            // Memunculkan notif bahwa pembuatan store setting berhasil.
            tap(() => {
                this.notice$.open('A store setting has been updated successfully.', 'success', {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                });

                this.router$.navigate(['/pages/account/stores']);
            })
        )
    , { dispatch: false });

    updateStoreSettingFailure$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action update store setting failure.
            ofType(StoreSettingActions.updateStoreSettingFailure),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa pembuatan store setting berhasil.
            tap(error => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };

                if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
                    this.notice$.open(`Failed to update a store setting. Reason: ${error.errors}`, 'error', noticeSetting);
                } else {
                    this.notice$.open(`Something wrong with our web while updating a store setting. Please contact Sinbad Team.`, 'error', noticeSetting);
                }

            })
        )
    , { dispatch: false });

    checkUserSupplier = (userData: User): User => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throwError(new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            }));
        }
    
        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    }

    processCreateStoreSettingsRequest = ([_, storeSetting]: [User, Partial<StoreSetting>]): Observable<AnyAction> => {
        return this.storeSettingApi
            .create(storeSetting)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(StoreSettingActions.createStoreSettingSuccess({
                        payload: response
                    }));
                }),
                catchError(err => this.sendErrorToState(err, 'createStoreSettingFailure'))
            );
    }

    processUpdateStoreSettingsRequest = ([_, payload]: [User, PayloadUpdateStoreSetting]): Observable<AnyAction> => {
        return this.storeSettingApi
            .patch<StoreSetting>(payload.body, payload.id)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    return of(StoreSettingActions.updateStoreSettingSuccess({
                        payload: response
                    }));
                }),
                catchError(err => this.sendErrorToState(err, 'updateStoreSettingFailure'))
            );
    }

    processStoreSettingsRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        // const newQuery: IQueryParams = {
        //     ...queryParams
        // };
    
        // Memasukkan ID supplier ke dalam parameter.
        // newQuery['supplierId'] = supplierId;

        const newQuery = { ...queryParams };

        return this.storeSettingApi
            .findAll<IPaginatedResponse<StoreSetting>>(({ ...queryParams, supplierId }) as IQueryParams)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    if (newQuery.paginate) {
                        return of(StoreSettingActions.fetchStoreSettingsSuccess({
                            payload: {
                                data: response.data.map(setting => new StoreSetting({
                                    ... setting
                                })),
                                total: response.total,
                            }
                        }));
                    } else {
                        const newResponse = (response as unknown as Array<StoreSetting>);

                        return of(StoreSettingActions.fetchStoreSettingsSuccess({
                            payload: {
                                data: newResponse.map(setting => new StoreSetting({
                                    ... setting,
                                })),
                                total: newResponse.length,
                            }
                        }));
                    }
                }),
                catchError(err => this.sendErrorToState(err, 'fetchStoreSettingsFailure'))
            );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: merchantFailureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(StoreSettingActions[dispatchTo]({
                payload: err
            }));
        }
        
        if (err instanceof HttpErrorResponse) {
            return of(StoreSettingActions[dispatchTo]({
                payload: {
                    id: `ERR_HTTP_${err.statusText.toUpperCase()}`,
                    errors: err.toString()
                }
            }));
        }

        return of(StoreSettingActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }

    constructor(
        private actions$: Actions,
        private helper$: HelperService,
        private notice$: NoticeService,
        private router$: Router,
        private storeSettingApi: StoreSettingApiService,
        private authStore: NgRxStore<fromAuth.FeatureState>,
    ) {}

}
