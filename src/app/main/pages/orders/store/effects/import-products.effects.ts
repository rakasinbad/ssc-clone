import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { catchOffline } from '@ngx-pwa/offline';
import { Auth } from 'app/main/pages/core/auth/models';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import {
    CalculateOrderApiService,
    DownloadApiService,
    LogService,
    NoticeService,
    OrderBrandCatalogueApiService,
    UploadApiService,
} from 'app/shared/helpers';
import { ChangeConfirmationComponent } from 'app/shared/modals';
import { ErrorHandler } from 'app/shared/models/global.model';
import { ProgressActions, UiActions } from 'app/shared/store/actions';
import { of } from 'rxjs';
import {
    catchError,
    exhaustMap,
    finalize,
    map,
    retry,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { IStatusOMS } from '../../models';
import { ImportProductsService, OrderApiService } from '../../services';
import { ImportProductsActions, OrderActions } from '../actions';
import { fromImportProducts, fromOrder } from '../reducers';

/**
 *
 *
 * @export
 * @class ImportProductsEffects
 */
@Injectable()
export class ImportProductsEffects {
    // -----------------------------------------------------------------------------------------------------
    // @ CRUD methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * [IMPORT PRODUCTS - REQUEST]
     * @memberof ImportProductsEffects
     */
    importProductRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ImportProductsActions.importProductsRequest),
            map((action) => action.payload),
            switchMap((payload) => {
                let formData = new FormData();
                formData.append('file', new Blob([payload.file], {type: 'text/csv'}), payload.file.name);
                formData.append('storeId', payload.storeId);
                formData.append('orderDate', payload.orderDate);
                formData.append('storeChannelId', payload.storeChannelId);
                formData.append('storeClusterId', payload.storeClusterId);
                formData.append('storeGroupId', payload.storeGroupId);
                formData.append('storeTypeId', payload.storeTypeId);

                return this._$importProductsApi.importProducts(formData).pipe(
                    map((resp) => {
                        this._$log.generateGroup(`[RESPONSE REQUEST IMPORT PRODUCT]`, {
                            response: {
                                type: 'log',
                                value: resp,
                            },
                        });

                        return ImportProductsActions.importProductsSuccess({
                            payload: {
                                id: resp.id,
                            },
                        });
                    }),
                    catchError((err) =>
                        of(
                            ImportProductsActions.importProductsFailure({
                                payload: { id: 'importProductsFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private matDialog: MatDialog,
        private router: Router,
        private storage: StorageMap,
        private store: Store<fromImportProducts.FeatureState>,
        private _$log: LogService,
        private _$notice: NoticeService,
        private _$calculateOrderApi: CalculateOrderApiService,
        private _$downloadApi: DownloadApiService,
        private _$orderApi: OrderApiService,
        private _$orderBrandCatalogueApi: OrderBrandCatalogueApiService,
        private _$uploadApi: UploadApiService,
        private _$importProductsApi: ImportProductsService
    ) {}
}
