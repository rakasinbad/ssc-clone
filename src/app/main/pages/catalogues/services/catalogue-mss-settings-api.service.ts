import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogueMssSettingsApiService {
    private url: string;
    private readonly endpoint: string = '/mss-settings';
    private readonly segmentationEndpoint: string = '/mss-segmentation-recomendations';
    private readonly mssTypeEndpoint: string = '/mss-types';

    constructor(private readonly http: HttpClient, private readonly helperService: HelperService) {}

    getWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.endpoint); 
        const params = this.helperService.handleParams(this.url, queryParams);
        
        return this.http.get<T>(this.url, { params });
    }

    getSegmentationsWithQuery<T>(queryParams: IQueryParams): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.segmentationEndpoint);
        const params = this.helperService.handleParams(this.url, queryParams);

        return this.http.get<T>(this.url, { params });
    }

    getMssTypes<T>(): Observable<T> {
        this.url = this.helperService.handleApiRouter(this.mssTypeEndpoint);
        return this.http.get<T>(this.url);
    }
}
