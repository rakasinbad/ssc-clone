import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';

/**
 *
 *
 * @export
 * @class FlexiComboApiService
 */
@Injectable({
    providedIn: 'root',
})
export class FlexiComboApiService {
    /**
     *
     *
     * @private
     * @type {string}
     * @memberof FlexiComboApiService
     */
    private _url: string;

    /**
     *
     *
     * @private
     * @memberof FlexiComboApiService
     */
    private readonly _endpoint = '/flexi-combo';

    /**
     * Creates an instance of FlexiComboApiService.
     * @param {HttpClient} http
     * @param {HelperService} _$helper
     * @memberof FlexiComboApiService
     */
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }
}
