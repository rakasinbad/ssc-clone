import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';

import { fromAuth } from './store/reducers';
import { AuthSelectors } from './store/selectors';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private store: Store<fromAuth.FeatureState>) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // console.log('AUTH INTERCEPT 1', req.url);

        if (req.url.endsWith('/auth/login') && req.method === 'POST') {
            const token = btoa(`${req.body.username}:${req.body.password}`);

            if (token) {
                req = req.clone({
                    headers: req.headers.set('Authorization', `Basic ${token}`),
                    body: null
                });
            }

            return next.handle(req);
        } else {
            // console.log('AUTH INTERCEPT 2', req.url);

            if (req.url.endsWith('/ping')) {
                return next.handle(req);
            }

            return this.store.select(AuthSelectors.getUserState).pipe(
                take(1),
                exhaustMap(user => {
                    // console.log('AUTH INTERCEPTOR 3', user, req.url);

                    if (!user) {
                        return next.handle(req);
                    }
                    if (req.url.includes('sinbad.web.id') || req.url.includes('sinbad.co.id')){
                        req = req.clone({
                            headers: req.headers.set('Authorization', `Bearer ${user.token}`)
                        });
                    }

                    return next.handle(req);
                })
            );
        }
    }
}
