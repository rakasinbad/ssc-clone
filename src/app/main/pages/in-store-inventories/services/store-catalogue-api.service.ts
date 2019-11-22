import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Store as Merchant } from '../models';
import { Observable } from 'rxjs';

// import { StoreCatalogue } from '../models';

@Injectable({
    providedIn: 'root'
})
export class StoreCatalogueApiService {
    private _url: string;
    private readonly _endpoint = '/store-catalogues';
    private readonly _endpointCatalogueHistory = '/store-history-inventories';

    constructor(private http: HttpClient, private helperSvc: HelperService) {
        this._url = helperSvc.handleApiRouter(this._endpoint);
    }
    
    find<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['supplierId']) {
            newArgs.push({
                key: 'supplierId',
                value: params['supplierId']
            });
        }
        
        this._url = this.helperSvc.handleApiRouter(this._endpoint);
        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findCatalogueHistory<T>(params: IQueryParams): Observable<T> {
        const newArgs = [];

        if (params['catalogueId']) {
            newArgs.push({
                key: 'catalogueId',
                value: params['catalogueId']
            });
        }

        this._url = this.helperSvc.handleApiRouter(this._endpointCatalogueHistory);
        const newParams = this.helperSvc.handleParams(this._url, params, ...newArgs);

        return this.http.get<T>(this._url, { params: newParams });
    }

    findById<T>(id: string): Observable<T> {
        return this.http.get<T>(`${this._url}/${id}`);
    }

    // patch(id: string, data: Partial<Attendance>): Observable<Attendance> {
    //     return this.http.patch<Attendance>(`${this._url}/${id}`, data);
    // }

    // getStore(supplierId: string): Observable<Merchant> {
    //     this._url = this.helperSvc.handleApiRouter(this._endpoint);

    //     return this.http.get<Merchant>(`${this._url}/${supplierId}`, { params: { type: 'attendance' } });
    // }

    // create(body: IAttendance): Observable<any> {
    //     return this.http.post(this._url, body);
    // }

    // delete(id: string): Observable<any> {
    //     return this.http.delete(`${this._url}/${id}`);
    // }

    // updatePatch(body: Account, id: string): Observable<any> {
    //     return this.http.patch(`${this._url}/${id}`, body);
    // }
}
