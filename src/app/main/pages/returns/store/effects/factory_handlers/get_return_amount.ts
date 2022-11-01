import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { IErrorHandler } from 'app/shared/models/global.model';
import { ReturnActions } from '../../actions';
import { IReturnsEffects } from '../IReturnsEffects';
import { IReturnAmount } from '../../../models';

export function createFetchReturnAmountRequest(props: IReturnsEffects):
    Observable<{ payload: IReturnAmount | IErrorHandler }>
{
    return createEffect(() => {
            return props.actions$.pipe(
                ofType(ReturnActions.fetchReturnAmountRequest),
                map(({ payload }) => payload),
                switchMap((id) => {
                    return props.returnApiService.getReturnAmount(id).pipe(
                        catchOffline(),
                        map(resp => {
                            props.$log.generateGroup('[RESPONSE REQUEST FETCH RETURN AMOUNT]', {
                                payload: {
                                    type: 'log',
                                    value: id
                                },
                                response: {
                                    type: 'log',
                                    value: resp
                                }
                            });
                        
                            return ReturnActions.fetchReturnAmountSuccess({
                                payload: resp
                            });
                        }),
                        catchError(err =>
                            of(
                                ReturnActions.fetchReturnAmountFailure({
                                    payload: { id: 'fetchReturnAmountFailure', errors: err }
                                })
                            )
                        )
                    );
                })
            );
        }
    );
}

export function createFetchReturnAmountFailure(props: IReturnsEffects): Observable<IErrorHandler> {
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.fetchReturnAmountFailure),
                map(action => action.payload),
                tap(resp => {
                    const message = resp.errors.error.message || resp.errors.message;

                    props.$log.generateGroup('[REQUEST FETCH RETURN AMOUNT FAILURE]', {
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
