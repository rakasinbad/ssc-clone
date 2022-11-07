import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { exhaustMap, take } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(
        private store: Store<fromAuth.FeatureState>,
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('google.com') || req.url.endsWith('ping')) {
            // if (req.headers.has('Origin')) {
            //     req = req.clone({ headers: req.headers.delete('Origin') });
            // }
            // if (req.headers.has('Referer')) {
            //     req = req.clone({ headers: req.headers.delete('Referer') });
            // }
        } else {
            // Handle preflight cors
            // if (req.url.endsWith('/auth/login') && req.method === 'POST') {
            //     if (!req.headers.has('Content-Type')) {
            //         req = req.clone({
            //             headers: req.headers
            //                 .set('Content-Type', 'application/json')
            //                 .set('Accept', '*/*')
            //                 .set('Access-Control-Allow-Origin', '/'),
            //             withCredentials: true
            //         });
            //     }
            // } else {
            //     if (!req.headers.has('Content-Type')) {
            //         req = req.clone({
            //             headers: req.headers.set('Content-Type', 'application/json')
            //         });
            //     }
            // }
            
            if (
                !req.headers.has('Content-Type') &&
                !req.url.endsWith('import-order-parcels') &&
                !req.url.endsWith('import-catalogues') &&
                !req.url.endsWith('import-stores') &&
                !req.url.endsWith('import-supplier-stores') &&
                !req.url.endsWith('import-journey-plans') &&
                !req.url.endsWith('import-sales') &&
                !req.url.endsWith('import-portfolios') &&
                !req.url.endsWith('mass-upload')&&
                !req.url.includes('payment-approval') &&
                !req.url.includes('import-products') &&
                !req.url.includes('import-bulk-catalogues')
            ) {
                req = req.clone({
                    headers: req.headers.set('Content-Type', 'application/json')
                });

                // Alternative above of code
                // req = req.clone({
                //     setHeaders: {
                //         'Content-Type': 'application/json'
                //     }
                // });
            }

            if (!req.headers.has('X-Platform')) {
                req = req.clone({
                    headers: req.headers.set('X-Platform', 'SC')
                });
            }


            this.store.select(AuthSelectors.getUserState).pipe(
                take(1),
            ).subscribe(user => {
                if (!user) {
                    return next.handle(req);
                }

                req = req.clone({
                    headers: req.headers.set('x-user-id', user.user.id)
                });
                req = req.clone({
                    headers: req.headers.set('x-seller-id', user.user.userSuppliers[0].supplierId)
                });

            })
        }
        

        return next.handle(req);
    }
}
