import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { HttpClient } from '@angular/common/http';
import { Association } from '../models/associations.model';
import { IQueryParams, IPaginatedResponse } from 'app/shared/models';
import { Observable } from 'rxjs';
import { Store } from 'app/main/pages/attendances/models';

@Injectable({
    providedIn: 'root'
})
export class AssociationsApiService {
    private _url: string;

    private readonly _endpoint = '/associations';
    private readonly _storeEndpoint = '/stores';
    private readonly _exportEndpoint = '/download/export-association';

    constructor(private http: HttpClient, private helper$: HelperService) {}
}
