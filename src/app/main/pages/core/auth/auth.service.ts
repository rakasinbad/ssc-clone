import { DOCUMENT, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers/helper.service';
import { Observable } from 'rxjs';

import { IAuth } from './models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _url: string;
    private readonly _endpoint = '/auth/login';
    private _redirectUrl: string;

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private http: HttpClient,
        private loc: Location,
        private helperSvc: HelperService
    ) {
        this.redirectUrl = null;
        this._url = this.helperSvc.handleApiRouter(this._endpoint);
    }

    set redirectUrl(url: string) {
        this._redirectUrl = url;
    }

    get redirectUrl(): string {
        return this._redirectUrl;
    }

    login(username: string, password: string): Observable<IAuth> {
        return this.http.post<IAuth>(this._url, { username, password });
    }
}
