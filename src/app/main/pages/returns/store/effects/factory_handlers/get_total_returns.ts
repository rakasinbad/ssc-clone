import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, retry, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Auth } from 'app/main/pages/core/auth/models';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnsEffects } from '../IReturnsEffects';
import { ReturnActions } from '../../actions';
import { ITotalReturnModel } from '../../../models';


export function createFetchTotalReturnRequest(props: IReturnsEffects):
    Observable<{ payload: ITotalReturnModel | IErrorHandler }>
{
    return createEffect(() => {
            return props.actions$.pipe(
                ofType(ReturnActions.fetchTotalReturnRequest),
                withLatestFrom(props.store.select(AuthSelectors.getUserSupplier)),
                exhaustMap(([params, userSupplier]) => {
                    if (!userSupplier) {
                        return props.storage
                            .get('user')
                            .toPromise()
                            .then(user => (user ? [params, user] : [params, null]));
                    }

                    return of([params, userSupplier.supplierId]);
                }),
                switchMap(([_, data]: [any, string | Auth]) => {
                    if (!data) {
                        return of(
                            ReturnActions.fetchTotalReturnFailure({
                                payload: {
                                    id: 'fetchTotalReturnFailure',
                                    errors: 'Not Found!'
                                }
                            })
                        );
                    }

                    let supplierId;

                    if (typeof data === 'string') {
                        supplierId = data;
                    } else {
                        supplierId = (data as Auth).user.userSuppliers[0].supplierId;
                    }

                    if (!supplierId) {
                        return of(
                            ReturnActions.fetchTotalReturnFailure({
                                payload: {
                                    id: 'fetchTotalReturnFailure',
                                    errors: 'Not Found!'
                                }
                            })
                        );
                    }

                    return props.returnApiService.getTotal({}, supplierId).pipe(
                        catchOffline(),
                        retry(3),
                        map(resp => {
                            return ReturnActions.fetchTotalReturnSuccess({ payload: resp });
                        }),
                        catchError(err =>
                            of(
                                ReturnActions.fetchTotalReturnFailure({
                                    payload: {
                                        id: 'fetchTotalReturnFailure',
                                        errors: err
                                    }
                                })
                            )
                        )
                    );
                })
            );
        }
    );
}

export function createFetchTotalReturnFailure(props: IReturnsEffects): Observable<IErrorHandler> {
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.fetchTotalReturnFailure),
                map(({ payload }) => payload),
                tap((resp: any) => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    props.$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );
}
