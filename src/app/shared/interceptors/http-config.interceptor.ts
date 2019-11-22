import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpHeaders
} from '@angular/common/http';
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

            if (!req.headers.has('Content-Type')) {
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