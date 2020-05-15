import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { MatSnackBarConfig } from '@angular/material';
import { exhaustMap, map, switchMap, withLatestFrom, catchError, retry, tap, finalize } from 'rxjs/operators';

import { SkuAssignmentsActions, failureActionNames } from '../actions';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { of, Observable } from 'rxjs';
import { SkuAssignmentsApiService } from '../../services/sku-assignments-api.service';
import { catchOffline } from '@ngx-pwa/offline';
import { SkuAssignments, SkuAssignmentsCreationPayload } from '../../models/sku-assignments.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { HttpErrorResponse } from '@angular/common/http';
import { fromSkuAssignments } from '../reducers';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, ErrorHandler, IPaginatedResponse } from 'app/shared/models/global.model';
import { User } from 'app/shared/models/user.model';
import { AnyAction } from 'app/shared/models/actions.model';
import { FormActions, UiActions } from 'app/shared/store/actions';

@Injectable()
export class SkuAssignmentsEffects {
    constructor(
        private actions$: Actions,
        private authStore: NgRxStore<fromAuth.FeatureState>,
        private SkuAssignmentsStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>,
        private SkuAssignmentsApi$: SkuAssignmentsApiService,
        private notice$: NoticeService,
        private router: Router,
        private helper$: HelperService,
        private matDialog: MatDialog,
    ) {}

    fetchSkuAssignmentsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action pengambilan SkuAssignments massal.
            ofType(SkuAssignmentsActions.fetchSkuAssignmentsRequest),
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.fetchSkuAssignmentsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(this.fetchSkuAssignmentsRequest),
                        catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
                    );
                }
            }),
        )
    );

    addSkuAssignmentsRequest$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan SkuAssignments.
            ofType(SkuAssignmentsActions.addSkuAssignmentsRequest),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            // Mengambil data dari store-nya auth.
            withLatestFrom(this.authStore.select(AuthSelectors.getUserState)),
            // Mengubah jenis Observable yang menjadi nilai baliknya. (Harus berbentuk Action-nya NgRx)
            switchMap(([queryParams, authState]: [SkuAssignmentsCreationPayload, TNullable<Auth>]) => {
                // Jika tidak ada data supplier-nya user dari state.
                if (!authState) {
                    return this.helper$.decodeUserToken().pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, SkuAssignmentsCreationPayload], Observable<AnyAction>>(this.addSkuAssignmentRequest),
                        catchError(err => this.sendErrorToState(err, 'addSkuAssignmentsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, SkuAssignmentsCreationPayload], Observable<AnyAction>>(this.addSkuAssignmentRequest),
                        catchError(err => this.sendErrorToState(err, 'addSkuAssignmentsFailure'))
                    );
                }
            })
        )
    );

    addSkuAssignmentsSuccess$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action penambahan SkuAssignments.
            ofType(SkuAssignmentsActions.addSkuAssignmentsSuccess),
            // Hanya mengambil payload-nya saja dari action.
            map(action => action.payload),
            tap(payload => {
                const noticeSetting: MatSnackBarConfig = {
                    horizontalPosition: 'right',
                    verticalPosition: 'bottom',
                    duration: 5000,
                };
                this.notice$.open(`Assign SKU success.`, 'success', noticeSetting);
                
                if (!payload) {
                    this.router.navigate(['/pages/logistics/sku-assignments']);
                }
            })
        )
    , { dispatch: false });

    confirmRemoveSkuAssignments$ = createEffect(
        () =>
        this.actions$.pipe(
            ofType(SkuAssignmentsActions.confirmRemoveSkuAssignments),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: 'Update',
                        message: `Are you sure want to delete SkuAssignments <strong>${ params.join(', ') }</strong>?`,
                        id: params
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(response => {
                if (response) {
                    this.SkuAssignmentsStore.dispatch(                
                        SkuAssignmentsActions.removeSkuAssignmentsRequest({ payload: response })
                    );
                }
            })
        ), { dispatch: false }
    );

    confirmUpdateSkuAssignments$ = createEffect(
        () =>
        this.actions$.pipe(
            ofType(SkuAssignmentsActions.confirmUpdateSkuAssignments),
            map(action => action.payload),
            exhaustMap(params => {
                const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                    data: {
                        title: 'Update',
                        message: `Are you sure want to update SkuAssignments <strong>${ params.id }</strong>?`,
                        id: params.id
                    }, disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(response => {
                if (response) {
                    this.SkuAssignmentsStore.dispatch(                
                        SkuAssignmentsActions.updateSkuAssignmentsRequest({ payload: response })
                    );
                }
            })
        ), { dispatch: false }
    );

    fetchFailureAction$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action fetch export logs failure.
            ofType(...[
                SkuAssignmentsActions.fetchSkuAssignmentsFailure,
            ]),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(err => this.helper$.showErrorNotification(err)),
        )
    , { dispatch: false });

    idempotentFailureAction$ = createEffect(() =>
        this.actions$.pipe(
            // Hanya untuk action fetch export logs failure.
            ofType(...[
                SkuAssignmentsActions.addSkuAssignmentsFailure,
                SkuAssignmentsActions.updateSkuAssignmentsFailure,
                SkuAssignmentsActions.removeSkuAssignmentsFailure,
            ]),
            // Hanya mengambil payload-nya saja.
            map(action => action.payload),
            // Memunculkan notif bahwa request export gagal.
            tap(payload => {
                this.helper$.showErrorNotification(payload);

                this.SkuAssignmentsStore.dispatch(
                    UiActions.showFooterAction()
                );
            }),
        )
    , { dispatch: false });

    checkUserSupplier = (userData: User): User | Observable<never> => {
        // Jika user tidak ada data supplier.
        if (!userData.userSupplier) {
            throw new ErrorHandler({
                id: 'ERR_USER_SUPPLIER_NOT_FOUND',
                errors: `User Data: ${userData}`
            });
        }
    
        // Mengembalikan data user jika tidak ada masalah.
        return userData;
    }

    fetchSkuAssignmentsRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.SkuAssignmentsApi$
            .findSkuAssignments(newQuery)
            .pipe(
                catchOffline(),
                switchMap(response => {
                    if (newQuery.paginate) {
                        const newResponse: IPaginatedResponse<SkuAssignments> = response as unknown as IPaginatedResponse<SkuAssignments>;

                        return of(SkuAssignmentsActions.fetchSkuAssignmentsSuccess({
                            payload: {
                                data: newResponse.data.map(skuAssignments =>
                                    new SkuAssignments({ ... skuAssignments })
                                ),
                                total: newResponse.total,
                            }
                        }));
                    } else {
                        const newResponse = (response as unknown as Array<SkuAssignments>);

                        return of(SkuAssignmentsActions.fetchSkuAssignmentsSuccess({
                            payload: {
                                data: newResponse.map(skuAssignments => new SkuAssignments({ ... skuAssignments })),
                                total: newResponse.length,
                            }
                        }));
                    }
                }),
                catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
            );
    }

    addSkuAssignmentRequest = ([userData, payload]: [User, SkuAssignmentsCreationPayload]): Observable<AnyAction> => {
        // Hanya mengambil ID supplier saja.
        // const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: SkuAssignmentsCreationPayload = {
            ...payload
        };
    
        // Memasukkan ID supplier ke dalam parameter.
        // newQuery['supplierId'] = supplierId;

        return this.SkuAssignmentsApi$
            .addSkuAssignments<SkuAssignmentsCreationPayload, { message: string }>(newQuery)
            .pipe(
                catchOffline(),
                switchMap(() => {
                    return of(SkuAssignmentsActions.addSkuAssignmentsSuccess({
                        payload: null
                    }));
                }),
                catchError(err => this.sendErrorToState(err, 'addSkuAssignmentsFailure'))
            );
    }

    sendErrorToState = (err: (ErrorHandler | HttpErrorResponse | object), dispatchTo: failureActionNames): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(SkuAssignmentsActions[dispatchTo]({
                payload: err
            }));
        }

        if ((err as HttpErrorResponse).message) {
            if ((err as HttpErrorResponse).message.startsWith('Http failure response')) {
                return of(SkuAssignmentsActions[dispatchTo]({
                    payload: {
                        id: `ERR_HTTP_${(err as HttpErrorResponse).error.name.toUpperCase()}`,
                        errors: err.toString()
                    }
                }));
            }
        }

        return of(SkuAssignmentsActions[dispatchTo]({
            payload: {
                id: `ERR_UNRECOGNIZED`,
                errors: err.toString()
            }
        }));
    }

    // showErrorNotification = (error: any) => {
    //     const noticeSetting: MatSnackBarConfig = {
    //         horizontalPosition: 'right',
    //         verticalPosition: 'bottom',
    //         duration: 5000,
    //     };

    //     if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
    //         this.notice$.open(`Failed to request export logs. Reason: ${error.errors}`, 'error', noticeSetting);
    //     } else {
    //         this.notice$.open(`Something wrong with our web while processing your request. Please contact Sinbad Team.`, 'error', noticeSetting);
    //     }

    //     // Me-reset state tombol save.
    //     this.SkuAssignmentsStore.dispatch(
    //         FormActions.resetClickSaveButton()
    //     );
    // }
}
