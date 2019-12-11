import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { fromAuth } from './store/reducers';
import { AuthSelectors } from './store/selectors';
import { take, exhaustMap } from 'rxjs/operators';

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

                    req = req.clone({
                        headers: req.headers.set('Authorization', `Bearer ${user.token}`)
                    });

                    return next.handle(req);
                })
            );
        }
    }
}
