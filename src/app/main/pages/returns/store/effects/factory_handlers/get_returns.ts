import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { IErrorHandler } from 'app/shared/models/global.model';
import { ReturnActions } from '../../actions';
import { IReturnsEffects } from '../IReturnsEffects';
import { IReturnLine } from '../../../models';

export function createFetchReturnRequest(props: IReturnsEffects):
    Observable<{ payload: {total: number, data: Array<IReturnLine>} | IErrorHandler }>
{
    return createEffect(() => {
            return props.actions$.pipe(
                ofType(ReturnActions.fetchReturnRequest),
                map(({ payload }) => payload),
                withLatestFrom(props.store.select(AuthSelectors.getUserSupplier)),
                switchMap(([payload, { supplierId }]) => {
                    if (!supplierId) {
                        return of(
                            ReturnActions.fetchReturnFailure({
                                payload: { id: 'fetchReturnFailure', errors: 'Not Found!' }
                            })
                        );
                    }

                    return props.returnApiService.findAll(payload, supplierId).pipe(
                        catchOffline(),
                        map(resp => {
                            props.$log.generateGroup('[RESPONSE REQUEST FETCH RETURNS]', {
                                payload: {
                                    type: 'log',
                                    value: payload
                                },
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });

                            return ReturnActions.fetchReturnSuccess({
                                payload: {
                                    total: resp.total,
                                    data: resp.data
                                }
                            });
                        }),
                        catchError(err =>
                            of(
                                ReturnActions.fetchReturnFailure({
                                    payload: { id: 'fetchReturnFailure', errors: err }
                                })
                            )
                        )
                    );
                })
            );
        }
    );
}

export function createFetchReturnFailure(props: IReturnsEffects): Observable<IErrorHandler> {
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.fetchReturnFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = resp.errors.error.message || resp.errors.message;

                    props.$log.generateGroup('[REQUEST FETCH RETURNS FAILURE]', {
                        response: {
                            type: 'log',
                            value: resp
                        },
                        message: {
                            type: 'log',
                            value: message
                        }
                    });

                    props.$notice.open(message, 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right'
                    });
                })
            ),
        { dispatch: false }
    );
}
