import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { CatalogueDetailPageActions } from '../actions';
import { CataloguePriceSegmentationApiService } from './../../services';

@Injectable()
export class AdjustPriceSettingEffects {
    readonly adjustPriceSettingRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueDetailPageActions.adjustPriceSettingRequest),
            map((action) => action.payload),
            mergeMap((payload) =>
                this.priceApi.create(payload).pipe(
                    map((_) => CatalogueDetailPageActions.adjustPriceSettingSuccess()),
                    catchError((_) => of(CatalogueDetailPageActions.adjustPriceSettingFailure()))
                )
            )
        )
    );

    constructor(
        private readonly actions$: Actions,
        private readonly priceApi: CataloguePriceSegmentationApiService
    ) {}
}
