import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
    LogService,
} from 'app/shared/helpers';
import { of } from 'rxjs';
import {
    catchError,
    map,
    switchMap,
} from 'rxjs/operators';

import { ImportProductsProgressService } from '../../services';
import { ImportProductsProgressActions } from '../actions';

/**
 *
 *
 * @export
 * @class ImportProductsProgressEffects
 */
@Injectable()
export class ImportProductsProgressEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [IMPORT PRODUCTS - REQUEST]
     * @memberof ImportProductsProgressEffects
     */
    importProductsProgressRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportProductsProgressActions.importProductsProgressRequest),
            map((action) => action.payload),
            switchMap(id => {

                return this._$importProductsProgressApi.importProductsProgress(id).pipe(
                    map((resp) => {
                        this._$log.generateGroup(`[RESPONSE REQUEST IMPORT PRODUCT PROGRESS]`, {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                        });

                        return ImportProductsProgressActions.importProductsProgressSuccess({
                            payload: resp
                        });
                    }),
                    catchError((err) =>
                        of(
                            ImportProductsProgressActions.importProductsProgressFailure({
                                payload: { id: 'importProductsProgressFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private _$log: LogService,
        private _$importProductsProgressApi: ImportProductsProgressService
    ) {}
}
