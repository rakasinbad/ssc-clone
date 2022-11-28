import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap } from 'rxjs/operators';
import { CatalogueTaxActions } from '../actions';
import { CatalogueTaxService } from './../../services';

@Injectable()
export class FetchCatalogueTaxesEffects {
    readonly fetchCatalogueTaxesRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CatalogueTaxActions.fetchRequest),
            map((action) => action.queryParams),
            mergeMap((queryParams) =>
                this.catalogueTaxService.fetchCatalogueTaxesRequest$(queryParams)
            )
        )
    );

    constructor(
        private readonly actions$: Actions,
        private readonly catalogueTaxService: CatalogueTaxService
    ) {}
}
