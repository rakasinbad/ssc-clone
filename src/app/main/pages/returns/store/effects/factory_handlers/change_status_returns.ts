import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import { UiActions } from 'app/shared/store/actions';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnsEffects } from '../IReturnsEffects';
import { ReturnActions } from '../../actions';
import { ReturnsSelector } from '../../selectors';


export function createConfirmChangeStatusReturn(props: IReturnsEffects):
    Observable<any>
{
    return createEffect(() =>
        props.actions$.pipe(
            ofType(ReturnActions.confirmChangeStatusReturn),
            map(({ payload }) => payload),
            withLatestFrom(props.store.select(ReturnsSelector.getActiveReturnNumber)),
            exhaustMap(([{id, status, returnNumber}, nReturnNumber]) => {
                let title: string;

                if (!returnNumber) {
                    returnNumber = nReturnNumber;
                }

                switch (status) {
                    case 'approved':
                        title = 'Approved';
                        break;
                    case 'approved_returned':
                        title = 'Approved & Returned';
                        break;
                    case 'rejected':
                        title = 'Rejected';
                        break;
                    default:
                        title = '';
                        break;
                }

                const dialogRef = props.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: string }
                    >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set as ${title}`,
                        message: `Are you sure want to change <strong>${returnNumber}</strong> status to ${title.toLowerCase()}?`,
                        id: id,
                        change: status,
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map(({ id, change }) => {
                if (id && change) {
                    return ReturnActions.updateStatusReturnRequest({
                        payload: { id, status: change }
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
            exhaustMap(({ id, status }) => {
                return props.returnApiService.update(id, { status })
                    .pipe(
                        map((resp) => {
                           props.$log.generateGroup(`[RESPONSE REQUEST UPDATE STATUS RETURN]`, {
                              response: {
                                  type: 'log',
                                  value: resp,
                              }
                           });

                           return ReturnActions.updateStatusReturnSuccess({
                               payload: {
                                   status: status,
                                   id: id,
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