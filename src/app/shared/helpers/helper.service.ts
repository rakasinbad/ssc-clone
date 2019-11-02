import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IQueryParams } from '../models/query.model';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    private static _host = environment.host;
    // tslint:disable-next-line: max-line-length
    private static readonly _regexIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    private _currentHost: string;

    constructor(@Inject(DOCUMENT) private doc: Document, private http: HttpClient) {
        this._currentHost = this.doc.location.hostname;
    }

    handleApiRouter(endpoint: string): string {
        /* if (
            HelperService._regexIp.test(this._currentHost) ||
            this._currentHost === 'localhost'
        ) {
            return `${}`
        } */

        return `${HelperService._host}${endpoint}`;
    }

    handleParams(url: string, params: IQueryParams, ...args): HttpParams {
        let newParams = new HttpParams();

        if (params.paginate) {
            if (!newParams.has('$limit')) {
                newParams = !params.limit
                    ? newParams.set('$limit', '5')
                    : newParams.set('$limit', params.limit.toString());
            }

            // newParams = !params.limit
            //     ? newParams.set('$limit', '5')
            //     : newParams.set('$limit', params.limit.toString());

            if (!newParams.has('$skip')) {
                newParams = !params.skip
                    ? newParams.set('$skip', '0')
                    : newParams.set('$skip', params.skip.toString());
            }

            // newParams = !params.skip
            //     ? newParams.set('$skip', '0')
            //     : newParams.set('$skip', params.skip.toString());
        } else {
            newParams = !params.paginate
                ? newParams.set('paginate', 'false')
                : newParams.set('paginate', 'true');
        }

        if (!newParams.has('sort') && !newParams.has('sortby')) {
            if (params.sort && params.sortBy) {
                newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
            }
        }

        if (params.sort && params.sortBy) {
            newParams = newParams.set('sort', params.sort).set('sortby', params.sortBy);
        }

        if (params.search) {
            if (params.search.length) {
                for (const search of params.search) {
                    if (search.fieldName && search.fieldName === 'keyword') {
                        newParams = newParams.set(`${search.fieldName}`, `${search.keyword}`);
                    } else if (search.fieldName && search.fieldName !== 'id') {
                        newParams = newParams.append(
                            `search[${search.fieldName}]`,
                            `${search.keyword}`
                        );
                    }
                }
            }
        }

        if (args && args.length > 0) {
            args.forEach((arg, i) => {
                if (arg[i].key && arg[i].value) {
                    newParams = newParams.append(arg[i].key, arg[i].value);
                }
            });
        }

        console.log(params);
        console.log(newParams.toString());

        return newParams;

        /* const newUrl = [`${url}?$limit=${params.limit}&$skip=${params.skip}`];

        if (params.sort && params.sortBy) {
            newUrl[1] = `&sort=${params.sort}&sortBy=${params.sortBy}`;
        }

        if (params.search) {
            if (params.search.length) {
                const searchArr = [];

                for (const search of params.search) {
                    if (search.fieldName && search.fieldName !== 'id') {
                        searchArr.push(`search[${search.fieldName}]=${search.keyword}`);
                    }
                }

                if (searchArr.length > 0) {
                    newUrl[2] = `&${searchArr.join('&')}`;
                }
            }
        }

        return newUrl.join(''); */
    }

    isReachable(): Observable<boolean> {
        return this.http
            .head<boolean>('https://id.yahoo.com', {
                // headers: new HttpHeaders({
                //     Accept: '*/*'
                // }),
                observe: 'response'
            })
            .pipe(
                map(res => res && res.ok && res.status === 200),
                catchError(err => of(false))
            );
    }
}
