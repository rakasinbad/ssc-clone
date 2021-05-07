import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchOffline } from '@ngx-pwa/offline';
import { ImportLogApiService } from 'app/shared/helpers';
import { ErrorHandler, PaginateResponse } from 'app/shared/models/global.model';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { IImportLog, ImportLog } from '../../models';
import { ImportHistroyActions } from '../actions';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { fromImportAdvanced } from '../reducers';
import { IQueryParams } from 'app/shared/models/query.model';

@Injectable()
export class ImportHistoryEffects {
    importHistoryRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportHistroyActions.importHistoryRequest),
            map(action => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            
            switchMap(([{ params, page }, userSupplier]) => {
                const supplierId = userSupplier.supplierId;
                const newQuery: IQueryParams = {
                    ...params,
                };
                // Memasukkan ID supplier ke dalam parameter.
                newQuery['supplierId'] = supplierId;
                return this._$importLogApi.findAll<PaginateResponse<IImportLog>>(newQuery, page).pipe(
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

    constructor(
        private actions$: Actions, private _$importLogApi: ImportLogApiService,
        private storage: StorageMap,
        private store: Store<fromImportAdvanced.FeatureState>,
        ) {}
}
