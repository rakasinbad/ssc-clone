import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models';
import { Observable } from 'rxjs';

import {
    UpdateUser,
    User as PureUser
} from '../models';

interface IUserResponseUpdatePassword {
    success: boolean;
    message: string;
}

class User extends PureUser {
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccountsSettingsApiService {
    
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof CreditLimitBalanceApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof CreditLimitBalanceApiService
     */
    private readonly _userEndpoint = '/users/';
    private readonly _changePasswordEndpoint = '/auth/change-password/';

    /**
     * Creates an instance of CreditLimitBalanceApiService.
     * @param {HttpClient} http
     * @memberof CreditLimitBalanceApiService
     */
    constructor(
        private http: HttpClient,
        private _$helper: HelperService,
    ) {}

    getUser(userId: string): Observable<PureUser> {
        this._url = this._$helper.handleApiRouter(this._userEndpoint);
        return this.http.get<User>(String(this._url).concat(userId));
    }

    updateUser(userId: string, data: Partial<User>): Observable<PureUser> {
        this._url = this._$helper.handleApiRouter(this._userEndpoint);
        return this.http.patch<PureUser>(String(this._url).concat(userId), data);
    }

    updatePassword(userId: string, data: Partial<UpdateUser>): Observable<IUserResponseUpdatePassword> {
        this._url = this._$helper.handleApiRouter(this._userEndpoint);
        return this.http.patch<IUserResponseUpdatePassword>(String(this._url).concat(userId), data);
    }
}
