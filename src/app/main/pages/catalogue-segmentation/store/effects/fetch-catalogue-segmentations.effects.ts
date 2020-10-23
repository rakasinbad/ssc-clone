import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class FetchCatalogueSegmentationsEffects {
    constructor(private actions$: Actions) {}
}
