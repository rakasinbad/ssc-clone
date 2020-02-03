import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ImportLogApiService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { IImportLog, ImportLog } from '../../models';
import { ImportHistroyActions } from '../actions';
import { catchOffline } from '@ngx-pwa/offline';

@Injectable()
export class ImportHistoryEffects {
    importHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportHistroyActions.importHistoryRequest),
            map(action => action.payload),
            switchMap(({ params, type }) => {
                return this._$importLogApi.findAll<PaginateResponse<IImportLog>>(params, type).pipe(
                    catchOffline(),
                    map(resp => {
                        const newResp = {
                            total: resp.total,
                            data:
                                resp && resp.data && resp.data.length > 0
                                    ? resp.data.map(row => new ImportLog(row))
                                    : []
                        };

                        return ImportHistroyActions.importHistorySuccess({
                            payload: newResp
                        });
                    }),
                    catchError(err =>
                        of(
                            ImportHistroyActions.importHistoryFailure({
                                payload: new ErrorHandler({ id: '', errors: err })
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(private actions$: Actions, private _$importLogApi: ImportLogApiService) {}
}
