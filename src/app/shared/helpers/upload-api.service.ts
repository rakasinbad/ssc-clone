import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadApiService {
    private _url: string;
    private readonly _endpoint = '/upload';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    uploadFormData(endpoint: string, formData: FormData): Observable<any> {
        // const headers = new HttpHeaders().append('Content-Type', undefined);
        const headers = new HttpHeaders().append('Content-Type', 'multipart/form-data');

        return this.http.post(`${this._url}/${endpoint}`, formData, {
            headers,
            reportProgress: true
        });
    }
}
