import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from './helper.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadApiService {
    private _url: string;
    private _urlCatalogue: string;
    private readonly _endpoint = '/upload';
    private readonly _endpointCatalogue = '/import-bulk-catalogues';

    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    uploadFormData(endpoint: string, formData: FormData): Observable<any> {
        // const headers = new HttpHeaders().append('Content-Type', undefined);
        // const headers = new HttpHeaders().append('Content-Type', 'multipart/form-data');

        return this.http.post(`${this._url}/${endpoint}`, formData, {
            reportProgress: true
        });
    }

    uploadCatalogueFormData(endpoint: string, formData: FormData, type: string): Observable<any> {

        if (type === 'update_catalogues') {
            this._urlCatalogue = this._$helper.handleApiRouter(this._endpointCatalogue) + '?type=update';
        } else {
            this._urlCatalogue = this._$helper.handleApiRouter(this._endpointCatalogue);
        }

        return this.http.post(`${this._urlCatalogue}`, formData, {
            reportProgress: true
        });
    }
}
