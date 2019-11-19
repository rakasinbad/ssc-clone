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
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import * as fromRoot from 'app/store/app.reducer';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate, CanLoad {
    constructor(private router: Router, private store: Store<fromRoot.State>) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.store.select(AuthSelectors.getUserState).pipe(
            take(1),
            map(user => {
                const isLoggedIn = !!(user && user.token);

                console.log('[canActive] LOGGED IN GUARD', isLoggedIn, user);

                if (!isLoggedIn) {
                    return true;
                }

                // /pages/dashboard
                return this.router.createUrlTree(['/pages/account/stores']);
            })
        );
    }

    canLoad(
        route: Route,
        segments: UrlSegment[]
    ): Observable<boolean> | Promise<boolean> | boolean {
        return this.store.select(AuthSelectors.getUserState).pipe(
            take(1),
            map(user => {
                const isLoggedIn = !!(user && user.token);

                console.log('[canLoad] LOGGED IN GUARD', isLoggedIn, user);

                return !isLoggedIn;
            })
        );
    }
}
