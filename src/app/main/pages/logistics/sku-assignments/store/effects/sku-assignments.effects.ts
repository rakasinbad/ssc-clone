import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog, MatSnackBarConfig } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store as NgRxStore } from '@ngrx/store';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals/delete-confirmation/delete-confirmation.component';
import { AnyAction } from 'app/shared/models/actions.model';
import { ErrorHandler, IPaginatedResponse, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { User } from 'app/shared/models/user.model';
import { Observable, of } from 'rxjs';
import { catchError, exhaustMap, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { SkuAssignments } from '../../models/sku-assignments.model';
import { SkuAssignmentsApiService } from '../../services/sku-assignments-api.service';
import { failureActionNames, SkuAssignmentsActions } from '../actions';
import { fromSkuAssignments } from '../reducers';

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
        private matDialog: MatDialog
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
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.fetchSkuAssignmentsRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
                    );
                } else {
                    return of(authState.user).pipe(
                        map(this.checkUserSupplier),
                        retry(3),
                        switchMap(userData => of([userData, queryParams])),
                        switchMap<[User, IQueryParams], Observable<AnyAction>>(
                            this.fetchSkuAssignmentsRequest
                        ),
                        catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
                    );
                }
            })
        )
    );

    confirmRemoveSkuAssignments$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(SkuAssignmentsActions.confirmRemoveSkuAssignments),
                map(action => action.payload),
                exhaustMap(params => {
                    const dialogRef = this.matDialog.open(DeleteConfirmationComponent, {
                        data: {
                            title: 'Update',
                            message: `Are you sure want to delete SkuAssignments <strong>${params.join(
                                ', '
                            )}</strong>?`,
                            id: params
                        },
                        disableClose: true
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
            ),
        { dispatch: false }
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
                            message: `Are you sure want to update SkuAssignments <strong>${params.id}</strong>?`,
                            id: params.id
                        },
                        disableClose: true
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
            ),
        { dispatch: false }
    );

    failureAction$ = createEffect(
        () =>
            this.actions$.pipe(
                // Hanya untuk action fetch export logs failure.
                ofType(
                    ...[
                        SkuAssignmentsActions.fetchSkuAssignmentsFailure,
                        SkuAssignmentsActions.addSkuAssignmentsFailure,
                        SkuAssignmentsActions.updateSkuAssignmentsFailure,
                        SkuAssignmentsActions.removeSkuAssignmentsFailure
                    ]
                ),
                // Hanya mengambil payload-nya saja.
                map(action => action.payload),
                // Memunculkan notif bahwa request export gagal.
                tap(this.showErrorNotification)
            ),
        { dispatch: false }
    );

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
    };

    fetchSkuAssignmentsRequest = ([userData, queryParams]: [User, IQueryParams]): Observable<
        AnyAction
    > => {
        // Hanya mengambil ID supplier saja.
        const { supplierId } = userData.userSupplier;
        // Membentuk parameter query yang baru.
        const newQuery: IQueryParams = {
            ...queryParams
        };

        // Memasukkan ID supplier ke dalam parameter.
        newQuery['supplierId'] = supplierId;

        return this.SkuAssignmentsApi$.findSkuAssignments(newQuery).pipe(
            catchOffline(),
            switchMap(response => {
                if (newQuery.paginate) {
                    const newResponse: IPaginatedResponse<SkuAssignments> = (response as unknown) as IPaginatedResponse<
                        SkuAssignments
                    >;

                    return of(
                        SkuAssignmentsActions.fetchSkuAssignmentsSuccess({
                            payload: {
                                data: newResponse.data.map(
                                    skuAssignments => new SkuAssignments({ ...skuAssignments })
                                ),
                                total: newResponse.total
                            }
                        })
                    );
                } else {
                    const newResponse = (response as unknown) as Array<SkuAssignments>;

                    return of(
                        SkuAssignmentsActions.fetchSkuAssignmentsSuccess({
                            payload: {
                                data: newResponse.map(
                                    skuAssignments => new SkuAssignments({ ...skuAssignments })
                                ),
                                total: newResponse.length
                            }
                        })
                    );
                }
            }),
            catchError(err => this.sendErrorToState(err, 'fetchSkuAssignmentsFailure'))
        );
    };

    sendErrorToState = (
        err: ErrorHandler | HttpErrorResponse | object,
        dispatchTo: failureActionNames
    ): Observable<AnyAction> => {
        if (err instanceof ErrorHandler) {
            return of(
                SkuAssignmentsActions[dispatchTo]({
                    payload: err
                })
            );
        }

        if ((err as HttpErrorResponse).message) {
            if ((err as HttpErrorResponse).message.startsWith('Http failure response')) {
                return of(
                    SkuAssignmentsActions[dispatchTo]({
                        payload: {
                            id: `ERR_HTTP_${(err as HttpErrorResponse).error.name.toUpperCase()}`,
                            errors: err.toString()
                        }
                    })
                );
            }
        }

        return of(
            SkuAssignmentsActions[dispatchTo]({
                payload: {
                    id: `ERR_UNRECOGNIZED`,
                    errors: err.toString()
                }
            })
        );
    };

    showErrorNotification = (error: any) => {
        const noticeSetting: MatSnackBarConfig = {
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            duration: 5000
        };

        if (!error.id.startsWith('ERR_UNRECOGNIZED')) {
            this.notice$.open(
                `Failed to request export logs. Reason: ${error.errors}`,
                'error',
                noticeSetting
            );
        } else {
            this.notice$.open(
                `Something wrong with our web while processing your request. Please contact Sinbad Team.`,
                'error',
                noticeSetting
            );
        }
    };
}
