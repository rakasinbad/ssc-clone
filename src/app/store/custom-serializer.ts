import { isDevMode } from '@angular/core';
import { Params, RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';

export interface RouterStateUrl {
    url: string;
    params: Params;
    queryParams: Params;
}

// interface State {
//     router: RouterReducerState<RouterStateUrl>;
// }

export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
    serialize(routerState: RouterStateSnapshot): RouterStateUrl {
        if (isDevMode()) {
            console.groupCollapsed('CUSTOM SERIALIZER');
            console.log(routerState);
            console.groupEnd();
        }

        let route = routerState.root;

        while (route.firstChild) {
            route = route.firstChild;
        }

        const {
            url,
            root: { queryParams }
        } = routerState;
        const { params } = route;

        return { url, params, queryParams };
    }
}
