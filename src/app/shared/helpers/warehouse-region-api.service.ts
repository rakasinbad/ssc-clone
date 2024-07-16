import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PaginateResponseV2 } from '../models/global.model';
import { IQueryParams } from '../models/query.model';
import { HelperService } from './helper.service';
import { BranchWarehouse, IQueryParamsBranchWarehouseTeritory } from '../models/branch.model';

@Injectable({
    providedIn: 'root',
})
export class WarehouseRegionApiService {
    private _url: string;
    private readonly _endpoint = '/medeago/api/v1/ssc/warehouses/branches';
    constructor(private http: HttpClient, private _$helper: HelperService) {
        this._url = this._$helper.handleApiRouter(this._endpoint);
    }

    findByIds(
        params: Omit<IQueryParamsBranchWarehouseTeritory, 'branchIds'>,
        branchIds: number[]
    ): Observable<Array<BranchWarehouse> | PaginateResponseV2<BranchWarehouse>> {
        let newParams = this._$helper.handleParams(this._url, params);
        newParams = newParams.append('page', params.page ? params.page.toString() : (1).toString());
        newParams = newParams.append(
            'perPage',
            params.perPage ? params.perPage.toString() : (10).toString()
        );

        if (Boolean(branchIds.length)) {
            branchIds.forEach((i) => {
                newParams = newParams.append('branchIds[]', i.toString());
            });
        }
        return this.http.get<Array<BranchWarehouse> | PaginateResponseV2<BranchWarehouse>>(
            this._url,
            {
                params: newParams,
            }
        );
    }
}
