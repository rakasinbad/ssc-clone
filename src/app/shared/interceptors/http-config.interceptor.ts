import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
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
                !req.url.endsWith('mass-upload')
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
        }

        return next.handle(req);
    }
}
