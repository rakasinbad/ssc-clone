import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import { UiActions } from 'app/shared/store/actions';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnsEffects } from '../IReturnsEffects';
import { ReturnActions } from '../../actions';
import { ReturnsSelector } from '../../selectors';
import { getReturnStatusTitle } from '../../../models/returnline.model';


export function createConfirmChangeStatusReturn(props: IReturnsEffects):
    Observable<any>
{
    return createEffect(() =>
        props.actions$.pipe(
            ofType(ReturnActions.confirmChangeStatusReturn),
            map(({ payload }) => payload),
            withLatestFrom(props.store.select(ReturnsSelector.getActiveReturnDetail)),
            exhaustMap(([{id, status, returnNumber}, nReturnDetail]) => {
                let title: string;
                const returned: boolean = nReturnDetail.returned;

                if (!returnNumber) {
                    returnNumber = nReturnDetail.returnNumber;
                }

                title = getReturnStatusTitle(status);

                const dialogRef = props.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: string, returned: boolean, }
                    >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set as ${title}`,
                        message: `Are you sure want to change <strong>${returnNumber}</strong> status to ${title.toLowerCase()}?`,
                        id: id,
                        change: status,
                        returned: returned,
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map((data) => {
                if (data.id && data.change) {
                    return ReturnActions.updateStatusReturnRequest({
                        payload: { id: data.id, status: data.change, returned: data.returned }
                    });
                } else {
                    return UiActions.resetHighlightRow();
                }
            })
        )
    );
}

export function createUpdateStatusReturnRequest(props: IReturnsEffects):
    Observable<any>
{
    return createEffect(() =>
        props.actions$.pipe(
            ofType(ReturnActions.updateStatusReturnRequest),
            map(({ payload }) => payload),
            withLatestFrom(props.store.select(ReturnsSelector.getActiveReturnLogs)),
            exhaustMap(([{ id, status, returned }, lastReturnParcelLogs]) => {
                return props.returnApiService.update(id, { status })
                    .pipe(
                        map((resp) => {
                           props.$log.generateGroup(`[RESPONSE REQUEST UPDATE STATUS RETURN]`, {
                              response: {
                                  type: 'log',
                                  value: resp,
                              }
                           });

                           const logs = Array.isArray(resp.returnParcelLogs) ? resp.returnParcelLogs : [];

                           let latestReturned = resp.returned;
                           if (latestReturned === null || latestReturned === undefined) {
                               latestReturned = resp.status === 'approved_returned' ? true : returned;
                           }

                           return ReturnActions.updateStatusReturnSuccess({
                               payload: {
                                   returned: latestReturned,
                                   status: resp.status,
                                   id: id,
                                   returnParcelLogs: logs.concat(lastReturnParcelLogs || []),
                               }
                           });
                        }),
                        catchError((err) =>
                            of(
                                ReturnActions.updateStatusReturnFailure({
                                    payload: { id: 'updateStatusReturnFailure', errors: err }
                                })
                            )
                        )
                    );
            })
        )
    );
}

export function createUpdateStatusReturnFailure(props: IReturnsEffects): Observable<IErrorHandler> {
    return createEffect(
        () =>
            props.actions$.pipe(
                ofType(ReturnActions.updateStatusReturnFailure),
                map(({ payload }) => payload),
                tap((resp: any) => {
                    const message = resp && resp.errors && resp.errors.error && resp.errors.error.message ?
                        resp.errors.error.message : (resp && resp.errors ? resp.errors.message : null);

                    props.$log.generateGroup('[REQUEST UPDATE STATUS RETURN FAILURE]', {
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
