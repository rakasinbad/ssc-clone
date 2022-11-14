import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LogService, NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ConfirmOrderPaymentService } from '../../services';
import { ConfirmOrderPaymentActions } from '../actions';

@Injectable()
export class ConfirmOrderPaymentEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [CONFIRM - REQUEST] Confirm Order Payment
     * @memberof ConfirmOrderPaymentEffects
     */
    readonly postConfirmRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ConfirmOrderPaymentActions.postConfirmRequest),
            map((action) => action.payload),
            switchMap((payload) => {
                return this.confirmOrderPaymentApi.post(payload).pipe(
                    map((resp) => {
                        this.log.generateGroup(`[RESPONSE REQUEST CONFIRM ORDER PAYMENT EFFECT]`, {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                        });

                        return ConfirmOrderPaymentActions.postConfirmSuccess({
                            payload: resp,
                        });
                    }),
                    catchError((err) =>
                        of(
                            ConfirmOrderPaymentActions.postConfirmFailure({
                                payload: err.error.data,
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     *
     * [CONFIRM - FAILURE] Confirm Order Payment
     * @memberof ConfirmOrderPaymentEffects
     */
     readonly postConfirmFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ConfirmOrderPaymentActions.postConfirmFailure),
                map((action) => action.payload),
                tap((resp: any) => {
                    return ConfirmOrderPaymentActions.postConfirmFailure(resp);
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [CONFIRM - SUCCESS] Confirm Order Payment
     * @memberof ConfirmOrderPaymentEffects
     */
    readonly postConfirmSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ConfirmOrderPaymentActions.postConfirmSuccess),
                map((action) => action.payload),
                tap((resp) => {
                    this.noticeService.open('Data berhasil disubmit', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });

                    return resp;
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly confirmOrderPaymentApi: ConfirmOrderPaymentService,
        private readonly noticeService: NoticeService,
        private readonly log: LogService,
        private readonly router: Router
    ) {}
}
