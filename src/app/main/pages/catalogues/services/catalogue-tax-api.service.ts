import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogueTaxApiService {
    private url: string;
    private readonly endpoint: string = '/catalogue-taxes';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {
        this.url = this.helperService.handleApiRouter(this.endpoint);
    }

    getWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        const params = this.helperService.handleParams(this.url, queryParams);

        return this.http.get<T>(this.url, { params });
    }
}
