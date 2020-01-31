import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { ExportLogApiService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ExportLog, IExportLog } from '../../models';
import { TemplateHistroyActions } from '../actions';

@Injectable()
export class TemplateHistoryEffects {
    templateHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TemplateHistroyActions.templateHistoryRequest),
            map(action => action.payload),
            switchMap(({ params, type }) => {
                return this._$exportLogApi.findAll<PaginateResponse<IExportLog>>(params, type).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = {
                            total: resp.total,
                            data:
                                resp && resp.data && resp.data.length > 0
                                    ? resp.data.map(row => new ExportLog(row))
                                    : []
                        };

                        return TemplateHistroyActions.templateHistorySuccess({ payload: newResp });
                    }),
                    catchError(err =>
                        of(
                            TemplateHistroyActions.templateHistoryFailure({
                                payload: new ErrorHandler({
                                    id: 'templateHistoryFailure',
                                    errors: err
                                })
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(private actions$: Actions, private _$exportLogApi: ExportLogApiService) {}
}
