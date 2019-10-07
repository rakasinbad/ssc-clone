import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree
} from '@angular/router';
import { Store } from '@ngrx/store';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { exhaustMap, map, take } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { fromAuth } from './store/reducers';
import { AuthSelectors } from './store/selectors';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
    constructor(
        private router: Router,
        private store: Store<fromAuth.FeatureState>,
        private storage: StorageMap,
        private _$auth: AuthService
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        this._$auth.redirectUrl = state.url;

        return this.store.select(AuthSelectors.getUserState).pipe(
            take(1),
            map(user => {
                const isLoggedIn = !!(user && user.token);

                console.log('[canActivate] AUTH GUARD 1', state.url, isLoggedIn, user);

                if (isLoggedIn) {
                    return true;
                }

                return this.router.createUrlTree(['/auth']);
            })
        );
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean> | Promise<boolean> | boolean {
        this._$auth.redirectUrl = route.path;

        /* return this.store.select(AuthSelectors.getUserState).pipe(
            take(1),
            map(user => {
                const isLoggedIn = !!(user && user.token);

                console.log('[canLoad] AUTH GUARD 1', route.path, isLoggedIn, user);

                if (!isLoggedIn) {
                    return false;
                }

                return true;
            })
        ); */

        return this.store.select(AuthSelectors.getUserState).pipe(
            take(1),
            exhaustMap(user => {
                const isLoggedIn = !!(user && user.token);

                console.log('[canLoad] AUTH GUARD 1', route.path, isLoggedIn, user);

                return this.storage
                    .get('user')
                    .toPromise()
                    .then(session => {
                        console.log('[canLoad] AUTH GUARD 2', route.path, isLoggedIn, session);

                        return session ? [isLoggedIn, true] : [isLoggedIn, false];
                    });
            }),
            map(([isLoggedIn, session]) => {
                console.log('[canLoad] AUTH GUARD 3', route.path, isLoggedIn, session);

                if (!isLoggedIn) {
                    console.log('[canLoad] AUTH GUARD 4', route.path, isLoggedIn, session);
                    return session;
                }

                console.log('[canLoad] AUTH GUARD 5', route.path, isLoggedIn, session);
                return isLoggedIn;
            })
        );
    }
}
