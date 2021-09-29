import { Observable, of } from 'rxjs';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnsEffects } from '../IReturnsEffects';
import { IReturnDetail } from '../../../models';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { catchOffline } from '@ngx-pwa/offline';
import { ReturnActions } from '../../actions';

export function createFetchReturnDetailRequest(props: IReturnsEffects):
    Observable<{ payload: IErrorHandler | { data: IReturnDetail } }>
{
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.fetchReturnDetailRequest),
                map(({ payload }) => payload),
                switchMap(id => {
                    return props.returnApiService.findById(id).pipe(
                        catchOffline(),
                        map((resp: IReturnDetail) => {
                            const payload = {
                                data: resp,
                            };

                            props.$log.generateGroup('[RESPONSE REQUEST FETCH RETURN]', {
                                response: {
                                    type: 'log',
                                    value: payload
                                }
                            });

                            return ReturnActions.fetchReturnDetailSuccess({ payload });
                        }),
                        catchError(err =>
                            of(
                                ReturnActions.fetchReturnDetailFailure({
                                    payload: { id: 'fetchReturnDetailFailure', errors: err }
                                })
                            )
                        )
                    );
                })
        ),
    );
}

export function createFetchReturnDetailFailure(props: IReturnsEffects): Observable<IErrorHandler> {
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.fetchReturnDetailFailure),
                map(action => action.payload),
                tap((resp: any) => {
                    const message =
                        typeof resp.errors === 'string'
                            ? resp.errors
                            : resp.errors.error.message || resp.errors.message;

                    props.router.navigate(['/pages/returns']).finally(() => {
                        props.$notice.open(message, 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right'
                        });
                    });
                })
            ),
        { dispatch: false }
    );
}
