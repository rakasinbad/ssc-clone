import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HelperService } from 'app/shared/helpers';
import { fromEvent, merge, of } from 'rxjs';
import { map, mapTo, switchMap } from 'rxjs/operators';

import { NetworkActions } from '../actions';

//  ({ debounce = 5000, scheduler = asyncScheduler } = {}) =>
@Injectable()
export class NetworkEffects {
    networkStatusRequest$ = createEffect(() =>
        this.actions$.pipe(
            ofType(NetworkActions.networkStatusRequest),
            switchMap(() => {
                return merge(
                    of(navigator.onLine),
                    fromEvent(window, 'online').pipe(mapTo(true)),
                    fromEvent(window, 'offline').pipe(mapTo(false))
                );
            }),
            switchMap(isOnline => {
                if (isOnline) {
                    return this.helperSvc.isReachable();
                }

                return of(isOnline);
            }),
            map(isOnline => NetworkActions.setNetworkStatus({ payload: isOnline }))
            // debounceTime(debounce, scheduler),
            // switchMap(() =>
            //     interval(10000).pipe(
            //         switchMap(() => {
            //             return merge(
            //                 of(navigator.onLine),
            //                 fromEvent(window, 'online').pipe(mapTo(true)),
            //                 fromEvent(window, 'offline').pipe(mapTo(false))
            //             );
            //         }),
            //         switchMap(isOnline => {
            //             if (isOnline) {
            //                 return this.helperSvc.isReachable();
            //             }

            //             return of(isOnline);
            //         }),
            //         map(isOnline => {
            //             console.log('RES', isOnline);
            //             return NetworkActions.setNetworkStatus({ payload: isOnline });
            //         })
            //     )
            // )
        )
    );

    constructor(private actions$: Actions, private helperSvc: HelperService) {}
}
