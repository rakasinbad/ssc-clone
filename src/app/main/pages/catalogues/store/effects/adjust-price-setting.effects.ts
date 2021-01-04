import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NoticeService } from 'app/shared/helpers';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
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

    readonly adjustPriceSettingFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueDetailPageActions.adjustPriceSettingFailure),
                tap((_) => {
                    this.noticeService.open('Adjust price failed', 'error', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    readonly adjustPriceSettingSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(CatalogueDetailPageActions.adjustPriceSettingSuccess),
                tap((_) => {
                    this.noticeService.open('Adjust price success', 'success', {
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    });
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly priceApi: CataloguePriceSegmentationApiService,
        private readonly noticeService: NoticeService
    ) {}
}
