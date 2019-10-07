import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import { IAttendance, IAttendanceResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AttendanceApiService {
    private _url: string;
    private readonly _endpoint = '/attendances';

    constructor(private http: HttpClient, private helperSvc: HelperService) {
        this._url = helperSvc.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams): Observable<IAttendanceResponse> {
        const newParams = this.helperSvc.handleParams(this._url, params);

        return this.http.get<IAttendanceResponse>(this._url, { params: newParams });
    }

    findById(id: string): Observable<IAttendance> {
        return this.http.get<IAttendance>(`${this._url}/${id}`);
    }

    create(body: IAttendance): Observable<any> {
        return this.http.post(this._url, body);
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this._url}/${id}`);
    }

    updatePatch(body: Account, id: string): Observable<any> {
        return this.http.patch(`${this._url}/${id}`, body);
    }
}
