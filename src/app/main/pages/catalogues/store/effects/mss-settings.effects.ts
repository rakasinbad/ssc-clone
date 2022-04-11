import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import { CatalogueMssSettingsActions } from '../actions';
import { CatalogueMssSettingsService } from './../../services';

@Injectable()
export class MssSettingsEffects {
    readonly fetchCatalogueMssSettingsRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMssSettingsActions.fetchRequest),
            map((action) => action.queryParams),
            mergeMap((queryParams) => 
                this.catalogueMssSettingsService.fetchCatalogueMssSettingsRequest$(queryParams) 
            )
        )
    );
    
    readonly fetchCatalogueMssSettingsSegmentationRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueMssSettingsActions.fetchSegmentationsRequest),
            map((action) => action.queryParams),
            mergeMap((queryParams) => 
                this.catalogueMssSettingsService.fetchCatalogueMssSettingsSegmentationRequest$(queryParams) 
            )
        )
    );

    constructor(
        private readonly actions$: Actions,
        private readonly catalogueMssSettingsService: CatalogueMssSettingsService
    ) {}
}
