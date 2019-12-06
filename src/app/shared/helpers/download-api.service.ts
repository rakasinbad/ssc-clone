import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class DownloadApiService {
    private _url: string;
    private readonly _endpoint = '/download';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    download(endpoint: string): Observable<any> {
        return this.http.get(`${this._url}/${endpoint}`, {
            reportProgress: true
        });
    }
}
