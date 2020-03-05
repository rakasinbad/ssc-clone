import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchOffline, Network } from '@ngx-pwa/offline';
import { LogService, NoticeService } from 'app/shared/helpers';
import { Brand } from 'app/shared/models/brand.model';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { BrandService } from '../../services/brand.service';
import { BrandActions } from '../actions';
import { fromBrand } from '../reducers';

@Injectable()
export class BrandEffects {
    fetchBrandsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BrandActions.fetchBrandsRequest),
            map(action => action.payload),
            switchMap(payload => {
                return this._$brandApi.find<Array<Brand>>(payload).pipe(
                    catchOffline(),
                    map(response => {
                        const newResp = {
                            total: response.length,
                            data: response.map(
                                res =>
                                    new Brand(
                                        res.id,
                                        res.name,
                                        res.address,
                                        res.longitude,
                                        res.latitude,
                                        res.phoneNo,
                                        res.imageUrl,
                                        res.official,
                                        res.status,
                                        res.urbanId,
                                        res.createdAt,
                                        res.updatedAt,
                                        res.deletedAt
                                    )
                            )
                        };

                        return BrandActions.fetchBrandsSuccess({
                            payload: { brands: newResp.data, total: newResp.total }
                        });
                    }),
                    catchError(err =>
                        of(
                            BrandActions.fetchBrandsFailure({
                                payload: { id: 'fetchBrandsFailure', errors: err }
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
        private store: Store<fromBrand.FeatureState>,
        protected network: Network,
        private _$log: LogService,
        private _$brandApi: BrandService,
        private _$notice: NoticeService
    ) {}
}
