import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Region } from 'app/shared/models/region.model';
import { RegionApiService } from 'app/shared/helpers';
import { PaginateResponseV2 } from 'app/shared/models/global.model';
import * as fromRoot from 'app/store/app.reducer';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { catchOffline } from '@ngx-pwa/offline';
import { retry } from 'rxjs/operators';
import { sortBy } from 'lodash';
import { RegionActions } from '../actions';

@Injectable()
export class RegionEffects {
    fetchRegionRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(RegionActions.fetchRegionRequest),
            map((action) => action.payload),
            withLatestFrom(this.store.select(AuthSelectors.getUserSupplier)),
            switchMap(([payload, userSupplier]) => {
                if (!userSupplier || !userSupplier.supplierId) {
                    return of(
                        RegionActions.fetchRegionFailure({
                            payload: {
                                id: 'fetchRegionFailure',
                                errors: 'Not Found!',
                            },
                        })
                    );
                }

                const { supplierId } = userSupplier;
                let search = [];
                if (payload.search) {
                    search = payload.search;
                }

                return this._$regionApi.findAll({ paginate: false, search }, supplierId).pipe(
                    catchOffline(),
                    retry(3),
                    map((resp) => {
                        const sources = (resp as PaginateResponseV2<Region>).data.map((row) => {
                            const newRegion = new Region(row);

                            return newRegion;
                        });
                        return RegionActions.fetchRegionSuccess({
                            payload: sortBy(sources, ['name'], ['asc']),
                            total: sources.length,
                        });
                    }),
                    catchError((err) =>
                        of(
                            RegionActions.fetchRegionFailure({
                                payload: { id: 'fetchRegionFailure', errors: err },
                            })
                        )
                    )
                );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private store: Store<fromRoot.State>,
        private _$regionApi: RegionApiService
    ) {}
}
