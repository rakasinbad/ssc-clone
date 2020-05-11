import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LogService } from '../helpers';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private _$log: LogService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                let errMsg: any = 'An Error Occurred!';

                if (err.error instanceof ErrorEvent) {
                    // A client-side or network error occurred. Handle it accordingly.
                    // client-side error
                    errMsg = `Error: ${err.error.message}`;

                    this._$log.generateGroup('[CLIENT SIDE ERROR]', {
                        request: {
                            type: 'log',
                            value: req
                        },
                        response: {
                            type: 'log',
                            value: err
                        }
                    });
                } else {
                    // The backend returned an unsuccessful response code.
                    // The response body may contain clues as to what went wrong,
                    // server-side error
                    if (err.error.code === 400) {
                        console.log('FORCE LOGOUT');
                    }

                    // errMsg = `Error Code: ${err.status}\nMessage: ${err.message}`;

                    this._$log.generateGroup('[SERVER SIDE ERROR]', {
                        request: {
                            type: 'log',
                            value: req
                        },
                        response: {
                            type: 'log',
                            value: err
                        }
                    });

                    errMsg = {
                        code: err.status,
                        url: err.url,
                        message: err.message,
                        error: err.error,
                        body: req.body,
                        httpError: err,
                    };
                }

                return throwError(errMsg);
            })
        );
    }
}
