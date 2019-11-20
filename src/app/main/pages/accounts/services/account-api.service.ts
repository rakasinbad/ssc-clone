// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { HelperService } from 'app/shared/helpers';
// import { IQueryParams } from 'app/shared/models/query.model';
// import { Observable } from 'rxjs';

// import { Account, IAccount, IAccountResponse } from '../models/account.model';

// @Injectable({ providedIn: 'root' })
// export class AccountApiService {
//     private _url: string;
//     private readonly _endpoint = '/users';

//     constructor(private http: HttpClient, private _$helper: HelperService) {
//         this._url = this._$helper.handleApiRouter(this._endpoint);
//     }

//     findAll(params: IQueryParams): Observable<IAccountResponse> {
//         const newParams = this._$helper.handleParams(this._url, params);

//         return this.http.get<IAccountResponse>(this._url, { params: newParams });
//     }

//     findById(id: string): Observable<IAccount> {
//         return this.http.get<IAccount>(`${this._url}/${id}`);
//     }

//     searchBy(params: IQueryParams): Observable<IAccount[]> {
//         const newParams = this._$helper.handleParams(this._url, params);

//         return this.http.get<IAccount[]>(this._url, { params: newParams });
//     }

//     create(body: IAccount): Observable<any> {
//         return this.http.post(this._url, body);
//     }

//     delete(id: string): Observable<any> {
//         return this.http.delete(`${this._url}/${id}`);
//     }

//     updatePatch(body: Account, id: string): Observable<any> {
//         return this.http.patch(`${this._url}/${id}`, body);
//     }
// }
