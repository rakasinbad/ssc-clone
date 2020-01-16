import { Injectable } from '@angular/core';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';

import { UiActions } from '../actions';

/**
 *
 *
 * @export
 * @class UiEffects
 */
@Injectable()
export class UiEffects {
    /**
     *
     * [REGISTER] Navigation
     * @memberof UiEffects
     */
    registerNavigation$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UiActions.registerNavigation),
                map(action => action.payload),
                tap(({ key, navigation }) => {
                    if (key) {
                        this._fuseNavigationService.register(key, navigation);
                    }
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UNREGISTER] Navigation
     * @memberof UiEffects
     */
    unregisterNavigation$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UiActions.unregisterNavigation),
                map(action => action.payload),
                tap(key => {
                    if (key) {
                        this._fuseNavigationService.unregister(key);
                    }
                })
            ),
        { dispatch: false }
    );

    /**
     *
     * [UPDATE ITEM] Navigation
     * @memberof UiEffects
     */
    updateItemNavigation$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(UiActions.updateItemNavigation),
                map(action => action.payload),
                tap(({ id, properties, key }) => {
                    if (id) {
                        if (key) {
                            this._fuseNavigationService.updateNavigationItem(id, properties, key);
                        } else {
                            this._fuseNavigationService.updateNavigationItem(id, properties);
                        }
                    }
                })
            ),
        { dispatch: false }
    );

    constructor(private actions$: Actions, private _fuseNavigationService: FuseNavigationService) {}
}
