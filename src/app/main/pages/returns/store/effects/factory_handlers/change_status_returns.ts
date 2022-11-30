import { Observable, of } from 'rxjs';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import { ChangeConfirmationTableComponent } from '../../../component/change_confirmation_table/change-confirmation-table.component';
import { UiActions } from 'app/shared/store/actions';
import { IErrorHandler } from 'app/shared/models/global.model';
import { IReturnsEffects } from '../IReturnsEffects';
import { ReturnActions } from '../../actions';
import { ReturnsSelector } from '../../selectors';
import { getReturnStatusDescription, getReturnStatusTitle } from '../../../models/returnline.model';
import { IReturnCatalogue, IChangeStatusReturn } from '../../../models/returndetail.model';

export function createConfirmChangeQuantityReturn(props: IReturnsEffects):
    Observable<any>
{
    return createEffect(() =>
        props.actions$.pipe(
            ofType(ReturnActions.confirmChangeQuantityReturn),
            map(({ payload }) => payload),
            withLatestFrom(props.store.select(ReturnsSelector.getActiveReturnDetail)),
            exhaustMap(([{id, status, returnNumber, returned, tableData}, nReturnDetail]) => {
                let title: string;
                let description: string;
                if (returnNumber === null || returnNumber === undefined) {
                    returnNumber = nReturnDetail.returnNumber;
                }

                title = getReturnStatusTitle(status);
                description = getReturnStatusDescription(status);

                const dialogRef = props.matDialog.open<
                    ChangeConfirmationTableComponent,
                    any,
                    { id: string; status: string, returned: boolean, dataSource: IReturnCatalogue[], originalDataSource: IReturnCatalogue[], formData: any }
                    >(ChangeConfirmationTableComponent, {
                    data: {
                        title: `${title} Items`,
                        message: `Are you sure want to ${description} these following items?`,
                        id: id,
                        status,
                        returned: returned,
                        dataSource: tableData,
                        originalDataSource: [...tableData],
                        returnNumber
                    },
                    disableClose: true,
                    width: '80%'
                });

                return dialogRef.afterClosed();
            }),
            map((_) => {
                return UiActions.resetHighlightRow();
            })
        )
    );
}

export function createConfirmChangeStatusReturn(props: IReturnsEffects):
    Observable<any>
{
    return createEffect(() =>
        props.actions$.pipe(
            ofType(ReturnActions.confirmChangeStatusReturn),
            map(({ payload }) => payload),
            withLatestFrom(props.store.select(ReturnsSelector.getActiveReturnDetail)),
            exhaustMap(([{id, change, returnNumber, returned}, nReturnDetail]) => {
                let title: string;
                       
                if (returned === null || returned === undefined) returned = nReturnDetail.returned;

                if (returnNumber === null || returnNumber === undefined) {
                    returnNumber = nReturnDetail.returnNumber;
                }

                title = getReturnStatusTitle(change.status);

                const dialogRef = props.matDialog.open<
                    ChangeConfirmationComponent,
                    any,
                    { id: string; change: IChangeStatusReturn, returned: boolean, }
                    >(ChangeConfirmationComponent, {
                    data: {
                        title: `Set as ${title}`,
                        message: `Are you sure want to change <strong>${returnNumber}</strong> status to ${title.toLowerCase()}?`,
                        id: id,
                        change,
                        returned: returned,
                        withIconX: true
                    },
                    disableClose: true
                });

                return dialogRef.afterClosed();
            }),
            map((data) => {
                if (data.id && data.change) {
                    return ReturnActions.updateStatusReturnRequest({
                        payload: { id: data.id, change: data.change, returned: data.returned }
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
            exhaustMap(([{ id, change, returned }, lastReturnParcelLogs]) => {
                let updatePayload: IChangeStatusReturn = { status: change.status };
                if (change.status !== 'closed' && change.status !== 'rejected') {
                    updatePayload.returnItems = change.returnItems;
                }
            
                return props.returnApiService.update(id, updatePayload)
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

                            props.$notice.open(`Return status success changed to ${getReturnStatusTitle(resp.status)}`, 'success', {
                                verticalPosition: 'bottom',
                                horizontalPosition: 'right'
                            });

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
