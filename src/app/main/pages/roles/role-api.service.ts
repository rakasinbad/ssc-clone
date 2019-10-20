import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

import { IRoleResponse, Role } from './role.model';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
    private _url: string;
    private readonly _endpoint = '/roles';

    constructor(private http: HttpClient, private helperSvc: HelperService) {
        this._url = helperSvc.handleApiRouter(this._endpoint);
    }

    findAll(params: IQueryParams): Observable<IRoleResponse | Role[]> {
        const newParams = this.helperSvc.handleParams(this._url, params);

        return this.http.get<IRoleResponse | Role[]>(this._url, { params: newParams });
    }

    findByRoleType(id: string, params: IQueryParams): Observable<Role[]> {
        const newParams = this.helperSvc.handleParams(this._url, params).append('roleTypeId', id);

        return this.http.get<Role[]>(this._url, { params: newParams });
    }

    searchBy(params: IQueryParams): Observable<IRoleResponse | Role[]> {
        const newParams = this.helperSvc.handleParams(this._url, params);

        return this.http.get<IRoleResponse | Role[]>(this._url, { params: newParams });
    }
}
